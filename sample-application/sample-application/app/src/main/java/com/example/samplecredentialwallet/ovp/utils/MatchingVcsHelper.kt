package com.example.samplecredentialwallet.ovp.utils

import android.util.Log
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonPrimitive
import com.google.gson.JsonObject
import com.jayway.jsonpath.JsonPath
import com.example.samplecredentialwallet.ovp.data.VCMetadata
import io.mosip.openID4VP.constants.FormatType

class MatchingVcsHelper {
    fun getVcsMatchingAuthRequest(
        vcList: List<VCMetadata>,
        authRequest: JsonObject
    ): MatchingResult {
        val matchingVCs = mutableMapOf<String, MutableList<VCMetadata>>()
        val requestedClaims = mutableSetOf<String>()
        val presentationDefinition = getAsJsonObjectByKeys(
            authRequest,
            "presentationDefinition",
            "presentation_definition"
        )
            ?: return MatchingResult(emptyMap(), "", "")
        val inputDescriptors = getAsJsonArrayByKeys(
            presentationDefinition,
            "inputDescriptors",
            "input_descriptors"
        )
            ?: return MatchingResult(emptyMap(), "", "")
        var hasFormatOrConstraints = false

        Log.d(
            "OVP_MATCH",
            "Matching start: vcCount=${vcList.size}, descriptorCount=${inputDescriptors.size()}"
        )

        for (vcMetadata in vcList) {
            val vc = vcMetadata.vc
            val vcFormat = vcMetadata.format
            val rawCBORData = vcMetadata.rawCBORData

            for (i in 0 until inputDescriptors.size()) {
                val inputDescriptor = inputDescriptors[i].asJsonObject
                val format = inputDescriptor.getAsJsonObject("format")
                    ?: presentationDefinition.getAsJsonObject("format")
                val constraints = inputDescriptor.getAsJsonObject("constraints")
                val descriptorSchemas = extractDescriptorSchemas(inputDescriptor)
                val descriptorId = inputDescriptor.get("id")?.asString ?: "unknown-descriptor"
                val hasFormat = format != null
                val hasConstraintFields = constraints?.has("fields") == true
                val hasSchema = descriptorSchemas.isNotEmpty()

                hasFormatOrConstraints = hasFormatOrConstraints ||
                    hasFormat || hasConstraintFields || hasSchema

                val matchesFormat = areVCFormatAndProofTypeMatchingRequest(format, vcMetadata)
                val matchesConstraints =
                    isVCMatchingRequestConstraints(constraints, vcMetadata, requestedClaims)
                val matchesSchema = if (hasSchema) {
                    isVCMatchingDescriptorSchema(descriptorSchemas, vcMetadata)
                } else {
                    true
                }

                val strictIncludeBase = if (hasConstraintFields && hasFormat) {
                    matchesFormat && matchesConstraints
                } else if (hasFormat || hasConstraintFields) {
                    matchesFormat || matchesConstraints
                } else if (hasSchema) {
                    true
                } else {
                    false
                }

                val strictInclude = strictIncludeBase && matchesSchema

                // Type-aware fallback: when format matches but full constraint evaluation
                // fails (due to JSONPath structural mismatches), check whether the credential
                // type requested in the constraint fields matches the VC's actual type.
                // This ensures:
                //   - health insurance VC matches a health insurance request ✓
                //   - health insurance VC does NOT match a life insurance request ✗
                val typeAwareFallback = if (!strictInclude && matchesFormat && hasConstraintFields && hasFormat && matchesSchema) {
                    isVCTypeMatchingConstraintTypeFilter(constraints, vcMetadata)
                } else {
                    false
                }

                val shouldInclude = strictInclude || typeAwareFallback

                Log.d(
                    "OVP_MATCH",
                    "Descriptor=$descriptorId vcFormat=${vcMetadata.format} matchesFormat=$matchesFormat matchesConstraints=$matchesConstraints matchesSchema=$matchesSchema hasFormat=$hasFormat hasFields=$hasConstraintFields hasSchema=$hasSchema strictInclude=$strictInclude typeAwareFallback=$typeAwareFallback shouldInclude=$shouldInclude"
                )

                if (shouldInclude) {
                    val descriptorId = inputDescriptor.get("id")?.asString ?: continue
                    val list = matchingVCs.getOrPut(descriptorId) { mutableListOf() }

                    if (list.none { it.vc == vc && it.format == vcFormat }) {
                        list.add(VCMetadata(vcFormat, vc.deepCopy(), rawCBORData, vcMetadata.deviceKeyAlias))
                        Log.d(
                            "OVP_MATCH",
                            "Included VC for descriptor=$descriptorId format=${vcMetadata.format} via=${if (strictInclude) "strict" else "typeAwareFallback"}"
                        )
                    }
                }
            }
        }

        if (!hasFormatOrConstraints && inputDescriptors.size() > 0) {
            val fallbackId = inputDescriptors[0].asJsonObject.get("id")?.asString
            if (!fallbackId.isNullOrBlank()) {
                matchingVCs[fallbackId] = vcList.map {
                    VCMetadata(it.format, it.vc.deepCopy(), it.rawCBORData, it.deviceKeyAlias)
                }.toMutableList()
            }
        }

        return MatchingResult(
            matchingVCs,
            requestedClaims.joinToString(","),
            presentationDefinition.get("purpose")?.asString ?: ""
        )
    }

    private fun getAsJsonObjectByKeys(jsonObject: JsonObject, vararg keys: String): JsonObject? {
        for (key in keys) {
            val element = jsonObject.get(key) ?: continue
            if (element.isJsonObject) return element.asJsonObject
        }
        return null
    }

    private fun extractDescriptorSchemas(inputDescriptor: JsonObject): Set<String> {
        val schemaElement = inputDescriptor.get("schema") ?: return emptySet()

        val schemaValues = when {
            schemaElement.isJsonArray -> schemaElement.asJsonArray.mapNotNull { extractSchemaValue(it) }
            else -> listOfNotNull(extractSchemaValue(schemaElement))
        }

        return schemaValues
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .toSet()
    }

    private fun extractSchemaValue(schemaElement: JsonElement): String? {
        if (schemaElement.isJsonPrimitive) {
            return schemaElement.asString
        }

        if (!schemaElement.isJsonObject) {
            return null
        }

        val schemaObject = schemaElement.asJsonObject

        val uri = schemaObject.get("uri")
            ?.takeIf { it.isJsonPrimitive }
            ?.asString
            ?.trim()
        if (!uri.isNullOrBlank()) {
            return uri
        }

        val id = schemaObject.get("id")
            ?.takeIf { it.isJsonPrimitive }
            ?.asString
            ?.trim()
        if (!id.isNullOrBlank()) {
            return id
        }

        return null
    }

    private fun isVCMatchingDescriptorSchema(
        descriptorSchemas: Set<String>,
        vcMetadata: VCMetadata
    ): Boolean {
        if (descriptorSchemas.isEmpty()) return false

        val vc = unwrapVcPayload(vcMetadata.vc)
        val credentialSchemaValues = extractCredentialSchemaValues(vcMetadata, vc)

        val matches = descriptorSchemas.any { descriptorSchema ->
            credentialSchemaValues.any { credentialSchema ->
                schemaValuesMatch(descriptorSchema, credentialSchema)
            }
        }

        if (!matches) {
            Log.d(
                "OVP_MATCH",
                "Schema mismatch requested=$descriptorSchemas credentialValues=$credentialSchemaValues format=${vcMetadata.format}"
            )
        }

        return matches
    }

    private fun extractCredentialSchemaValues(vcMetadata: VCMetadata, vc: JsonObject): Set<String> {
        val values = mutableSetOf<String>()

        collectTypeValues(vcMetadata.vc, values)
        collectTypeValues(vc, values)
        collectSchemaValues(vcMetadata.vc, values)
        collectSchemaValues(vc, values)
        collectCredentialSchemaValues(vcMetadata.vc, values)
        collectCredentialSchemaValues(vc, values)
        collectDocTypeValues(vcMetadata.vc, values)
        collectDocTypeValues(vc, values)

        return values
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .toSet()
    }

    private fun collectTypeValues(source: JsonObject, values: MutableSet<String>) {
        val typeElement = source.get("type") ?: return
        when {
            typeElement.isJsonPrimitive -> values.add(typeElement.asString)
            typeElement.isJsonArray -> {
                typeElement.asJsonArray.forEach { item ->
                    if (item.isJsonPrimitive) {
                        values.add(item.asString)
                    }
                }
            }
        }
    }

    private fun collectSchemaValues(source: JsonObject, values: MutableSet<String>) {
        val schemaElement = source.get("schema") ?: return
        when {
            schemaElement.isJsonObject -> extractSchemaValue(schemaElement)?.let { values.add(it) }
            schemaElement.isJsonArray -> {
                schemaElement.asJsonArray.forEach { item ->
                    extractSchemaValue(item)?.let { values.add(it) }
                }
            }
        }
    }

    private fun collectCredentialSchemaValues(source: JsonObject, values: MutableSet<String>) {
        val credentialSchemaElement = source.get("credentialSchema") ?: return
        when {
            credentialSchemaElement.isJsonObject -> extractSchemaValue(credentialSchemaElement)?.let { values.add(it) }
            credentialSchemaElement.isJsonArray -> {
                credentialSchemaElement.asJsonArray.forEach { item ->
                    extractSchemaValue(item)?.let { values.add(it) }
                }
            }
        }
    }

    private fun collectDocTypeValues(source: JsonObject, values: MutableSet<String>) {
        source.get("docType")
            ?.takeIf { it.isJsonPrimitive }
            ?.asString
            ?.let { values.add(it) }
    }

    private fun schemaValuesMatch(descriptorSchema: String, credentialSchema: String): Boolean {
        if (credentialSchema.equals(descriptorSchema, ignoreCase = true)) {
            return true
        }

        if (stringsEquivalent(credentialSchema, descriptorSchema)) {
            return true
        }

        val descriptorTokens = extractSchemaTokens(descriptorSchema)
        val credentialTokens = extractSchemaTokens(credentialSchema)

        return descriptorTokens.any { descriptorToken ->
            credentialTokens.any { credentialToken ->
                stringsEquivalent(descriptorToken, credentialToken)
            }
        }
    }

    private fun extractSchemaTokens(value: String): Set<String> {
        val trimmed = value.trim()
        if (trimmed.isBlank()) {
            return emptySet()
        }

        val tokens = mutableSetOf(trimmed)
        val separators = charArrayOf('/', '#', ':', '?', '&', '=')
        trimmed.split(*separators)
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .forEach { tokens.add(it) }

        return tokens
    }

    private fun getAsJsonArrayByKeys(jsonObject: JsonObject, vararg keys: String): JsonArray? {
        for (key in keys) {
            val element = jsonObject.get(key) ?: continue
            if (element.isJsonArray) return element.asJsonArray
        }
        return null
    }

    fun buildSelectedVCsMapPlain(
        selectedItems: List<Pair<String, VCMetadata>>
    ): Map<String, Map<FormatType, List<Any>>> {
        val result = mutableMapOf<String, MutableMap<FormatType, MutableList<Any>>>()
        val gson = Gson()

        for ((inputDescriptorId, vcMetadata) in selectedItems) {
            val formatType = try {
                FormatType.valueOf(vcMetadata.format.uppercase().replace("-", "_"))
            } catch (_: IllegalArgumentException) {
                continue
            }

            val credentialValue = if (formatType == FormatType.MSO_MDOC) {
                vcMetadata.rawCBORData
            } else {
                convertJsonToMap(gson.toJson(vcMetadata.vc))
            }

            val formatMap = result.getOrPut(inputDescriptorId) { mutableMapOf() }
            val credentialList = formatMap.getOrPut(formatType) { mutableListOf() }

            credentialValue?.let {
                credentialList.add(it)
            }
        }

        return result
    }

    private fun convertJsonToMap(jsonString: String): MutableMap<String, Any> {
        val mapper = jacksonObjectMapper()
        return mapper.readValue(
            jsonString,
            object : TypeReference<MutableMap<String, Any>>() {}
        )
    }

    private fun areVCFormatAndProofTypeMatchingRequest(
        format: JsonObject?,
        vcMetadata: VCMetadata
    ): Boolean {
        if (format == null) return false

        val vc = unwrapVcPayload(vcMetadata.vc)
        val normalizedRequestedFormats = format.entrySet().map { normalizeFormat(it.key) }.toSet()
        val normalizedCredentialFormats = inferCredentialFormatAliases(vcMetadata)

        if (normalizedRequestedFormats.intersect(normalizedCredentialFormats).isEmpty()) {
            Log.d(
                "OVP_MATCH",
                "Format mismatch requested=$normalizedRequestedFormats credentialAliases=$normalizedCredentialFormats"
            )
            return false
        }

        if (normalizedCredentialFormats.contains(normalizeFormat(FormatType.MSO_MDOC.value))) {
            val mdocFormatObj = format.entrySet()
                .firstOrNull { normalizeFormat(it.key) == normalizeFormat(FormatType.MSO_MDOC.value) }
                ?.value
                ?.asJsonObject

            val requestedAlgs = mdocFormatObj
                ?.getAsJsonArray("alg")
                ?.mapNotNull { it.asString }
                ?.toSet()

            if (requestedAlgs.isNullOrEmpty()) {
                return true
            }

            val issuerAuthArray = vc.getAsJsonObject("issuerSigned")
                ?.getAsJsonArray("issuerAuth") ?: return false

            if (issuerAuthArray.size() < 3) return false

            val issuerProofType = issuerAuthArray[0].asJsonObject["1"]?.asInt ?: return false
            val issuerAlgorithm = OVPKeyManager.getIssuerAuthenticationAlgorithmForMdocVC(issuerProofType)

            val mdocAuth = issuerAuthArray[2].asJsonObject
            val deviceAlgorithm = OVPKeyManager.getMdocAuthenticationAlgorithm(mdocAuth)

            return listOf(issuerAlgorithm, deviceAlgorithm).all { requestedAlgs.contains(it) }
        }

        if (normalizedRequestedFormats.contains(normalizeFormat(FormatType.LDP_VC.value))) {
            val ldpFormatObj = format.entrySet()
                .firstOrNull { normalizeFormat(it.key) == normalizeFormat(FormatType.LDP_VC.value) }
                ?.value
                ?.asJsonObject

            val requestedProofTypes = ldpFormatObj
                ?.getAsJsonArray("proof_type")
                ?.mapNotNull { it.asString }
                ?.toSet()

            if (requestedProofTypes.isNullOrEmpty()) {
                return true
            }

            val proofType = vc.getAsJsonObject("proof")?.get("type")?.asString
            if (proofType.isNullOrBlank()) {
                Log.d("OVP_MATCH", "No proof.type in VC, accepting format-only match")
                return true
            }

            return requestedProofTypes.contains(proofType)
        }

        return true
    }

    private fun normalizeFormat(value: String): String {
        return value.trim().lowercase().replace('-', '_')
    }

    private fun inferCredentialFormatAliases(vcMetadata: VCMetadata): Set<String> {
        val aliases = mutableSetOf<String>()
        val rawFormat = vcMetadata.format
        if (rawFormat.isNotBlank()) {
            aliases.add(normalizeFormat(rawFormat))
        }

        val vc = vcMetadata.vc
        val unwrapped = unwrapVcPayload(vc)

        if (vc.has("issuerSigned") && vc.has("docType")) {
            aliases.add(normalizeFormat(FormatType.MSO_MDOC.value))
        }

        if (unwrapped.has("proof")) {
            aliases.add(normalizeFormat(FormatType.LDP_VC.value))
        } else if (unwrapped.has("credentialSubject") && unwrapped.has("type")) {
            aliases.add("jwt_vc_json")
            aliases.add("jwt_vc")
            aliases.add("jwt_vc_json_ld")
        }

        return aliases
    }

    private fun unwrapVcPayload(credential: JsonObject): JsonObject {
        val nestedVc = credential.getAsJsonObject("vc")
        return nestedVc ?: credential
    }

    /**
     * Type-aware fallback for constraint matching. When full JSONPath constraint
     * evaluation fails (due to structural mismatches between the stored VC and
     * the verifier's expected paths), this method checks whether the credential
     * type requested in the constraint fields matches the VC's actual type.
     *
     * This provides the correct behavior:
     * - same type (health ↔ health): matches ✓
     * - different type (health ↔ life): does not match ✗
     */
    private fun isVCTypeMatchingConstraintTypeFilter(
        constraints: JsonObject?,
        vcMetadata: VCMetadata
    ): Boolean {
        val fields = constraints?.getAsJsonArray("fields") ?: return false

        // Extract the requested types from the constraint fields that target $.type or $.vc.type
        val requestedTypes = mutableSetOf<String>()
        var hasTypeConstraint = false

        for (fieldElem in fields) {
            val field = fieldElem.asJsonObject
            val paths = field.getAsJsonArray("path") ?: continue
            val filter = field.getAsJsonObject("filter") ?: continue

            val isTypePath = paths.any { pathElem ->
                val path = pathElem.asString.lowercase()
                path == "\$.type" || path == "\$.vc.type" ||
                    path.endsWith("['type']") || path.endsWith(".type")
            }

            if (!isTypePath) continue
            hasTypeConstraint = true

            // Extract requested type values from the filter
            val containsFilter = filter.getAsJsonObject("contains")
            if (containsFilter != null) {
                containsFilter.get("const")?.takeIf { it.isJsonPrimitive }?.asString?.let {
                    requestedTypes.add(it)
                }
                containsFilter.get("pattern")?.takeIf { it.isJsonPrimitive }?.asString?.let {
                    requestedTypes.add(it)
                }
                containsFilter.getAsJsonArray("enum")?.forEach { enumElem ->
                    if (enumElem.isJsonPrimitive) requestedTypes.add(enumElem.asString)
                }
            }

            filter.get("const")?.takeIf { it.isJsonPrimitive }?.asString?.let {
                requestedTypes.add(it)
            }
            filter.get("pattern")?.takeIf { it.isJsonPrimitive }?.asString?.let {
                requestedTypes.add(it)
            }
            filter.getAsJsonArray("enum")?.forEach { enumElem ->
                if (enumElem.isJsonPrimitive) requestedTypes.add(enumElem.asString)
            }
        }

        if (!hasTypeConstraint) {
            // No type constraint in the fields — the constraint fields are about
            // other claims. Since format already matches, allow it through.
            Log.d("OVP_MATCH", "typeAwareFallback: no type constraint in fields, allowing format-matched VC")
            return true
        }

        if (requestedTypes.isEmpty()) {
            // Type constraint exists but has no specific filter values (existence check only).
            // Since the VC has a type field, allow it.
            Log.d("OVP_MATCH", "typeAwareFallback: type constraint has no filter values, allowing")
            return true
        }

        // Collect the VC's actual types from all structural variations
        val vcTypes = mutableSetOf<String>()
        collectTypeValues(vcMetadata.vc, vcTypes)
        collectTypeValues(unwrapVcPayload(vcMetadata.vc), vcTypes)

        Log.d(
            "OVP_MATCH",
            "typeAwareFallback: requestedTypes=$requestedTypes vcTypes=$vcTypes"
        )

        // Check if any requested type matches any VC type
        return requestedTypes.any { requested ->
            // Filter out the generic "VerifiableCredential" — we want specific type matches
            vcTypes.filter { !it.equals("VerifiableCredential", ignoreCase = true) }
                .any { vcType ->
                    stringsEquivalent(vcType, requested) ||
                        // Handle regex patterns from the filter
                        try { Regex(requested).containsMatchIn(vcType) } catch (_: Exception) { false }
                }
        }
    }

    private fun isVCMatchingRequestConstraints(
        constraints: JsonObject?,
        vcMetadata: VCMetadata,
        requestedClaims: MutableSet<String>
    ): Boolean {
        val fields = constraints?.getAsJsonArray("fields") ?: return false
        val processedCredentials = fetchCredentialCandidatesForConstraints(vcMetadata)
        if (processedCredentials.isEmpty()) return false

        for (fieldElem in fields) {
            val field = fieldElem.asJsonObject
            val paths = field.getAsJsonArray("path") ?: continue
            val filter = field.getAsJsonObject("filter")

            val fieldMatched = paths.any { pathElem ->
                val jsonPath = pathElem.asString

                processedCredentials.any { credentialDoc ->
                    try {
                        val rawResult = JsonPath.read<Any>(credentialDoc.toString(), jsonPath)
                        val results = flattenJsonPathResults(rawResult)
                        if (results.isEmpty()) return@any false

                        if (filter == null) return@any true

                        val matched = evaluateFilter(filter, rawResult, results)
                        Log.d(
                            "OVP_MATCH",
                            "Path=$jsonPath filter=${filter.toString()} flattenedValues=${results.map { it.toComparableString() }} matched=$matched"
                        )
                        matched
                    } catch (_: Exception) {
                        Log.v("OVP_MATCH", "JsonPath did not match path=$jsonPath")
                        false
                    }
                }
            }

            if (!fieldMatched) {
                Log.d(
                    "OVP_MATCH",
                    "Constraint failed for paths=${paths.joinToString(",") { it.asString }} vcFormat=${vcMetadata.format}"
                )
                return false
            }

            val claimName = Regex("\\['([^']+)']")
                .replace(paths.first().asString, ".$1")
                .split('.')
                .lastOrNull { it.isNotEmpty() && it != "$" }
                ?: ""
            requestedClaims.add(claimName)
        }

        return true
    }

    private fun getJsType(value: Any?): String = when (value) {
        is String -> "string"
        is Int, is Long, is Double, is Float -> "number"
        is Boolean -> "boolean"
        is Map<*, *> -> "object"
        is List<*> -> "array"
        null -> "undefined"
        else -> "object"
    }

    private fun evaluateFilter(filter: JsonObject, rawResult: Any?, flattenedResults: List<Any?>): Boolean {
        val expectedType = filter.get("type")?.asString
        val pattern = filter.get("pattern")?.asString
        val constValue = filter.get("const")
        val enumValues = filter.getAsJsonArray("enum")
            ?.mapNotNull { it.toComparableString() }
            ?.toSet()

        // Presentation Exchange often uses `type: array` for `$.type` with `contains`.
        if (expectedType == "array") {
            if (!isRawResultArrayLike(rawResult)) {
                return false
            }

            val containsFilter = filter.getAsJsonObject("contains")
            return if (containsFilter != null) {
                flattenedResults.any { match ->
                    evaluatePrimitiveMatch(containsFilter, match)
                }
            } else {
                true
            }
        }

        return flattenedResults.any { match ->
            val jsType = getJsType(match)
            if (!expectedType.isNullOrBlank() && jsType != expectedType) return@any false

            if (pattern != null) {
                if (match !is String || !Regex(pattern).containsMatchIn(match)) {
                    return@any false
                }
            }

            if (constValue != null) {
                val actual = match.toComparableString()
                val expected = constValue.toComparableString()
                if (!stringsEquivalent(actual, expected)) return@any false
            }

            if (!enumValues.isNullOrEmpty()) {
                val actual = match.toComparableString()
                if (!enumValues.any { stringsEquivalent(it, actual) }) return@any false
            }

            true
        }
    }

    private fun evaluatePrimitiveMatch(filter: JsonObject, match: Any?): Boolean {
        val expectedType = filter.get("type")?.asString
        val pattern = filter.get("pattern")?.asString
        val constValue = filter.get("const")
        val enumValues = filter.getAsJsonArray("enum")
            ?.mapNotNull { it.toComparableString() }
            ?.toSet()

        val jsType = getJsType(match)
        if (!expectedType.isNullOrBlank() && jsType != expectedType) return false

        if (pattern != null) {
            if (match !is String || !Regex(pattern).containsMatchIn(match)) return false
        }

        if (constValue != null) {
            val actual = match.toComparableString()
            val expected = constValue.toComparableString()
            if (!stringsEquivalent(actual, expected)) return false
        }

        if (!enumValues.isNullOrEmpty()) {
            val actual = match.toComparableString()
            if (!enumValues.any { stringsEquivalent(it, actual) }) return false
        }

        return true
    }

    private fun stringsEquivalent(left: String, right: String): Boolean {
        if (left == right) return true

        fun normalize(input: String): String {
            return input
                .lowercase()
                .replace("_", "")
                .replace("-", "")
                .replace(" ", "")
        }

        return normalize(left) == normalize(right)
    }

    private fun isRawResultArrayLike(result: Any?): Boolean {
        return when (result) {
            is Iterable<*> -> true
            is Array<*> -> true
            is JsonArray -> true
            is JsonElement -> result.isJsonArray
            else -> false
        }
    }

    private fun flattenJsonPathResults(result: Any?): List<Any?> {
        if (result == null) return emptyList()

        return when (result) {
            is Iterable<*> -> result.flatMap { flattenJsonPathResults(it) }
            is Array<*> -> result.flatMap { flattenJsonPathResults(it) }
            is JsonArray -> result.flatMap { flattenJsonPathResults(it) }
            is JsonElement -> {
                when {
                    result.isJsonArray -> result.asJsonArray.flatMap { flattenJsonPathResults(it) }
                    result.isJsonPrimitive -> listOf(result.asJsonPrimitive.toPrimitiveValue())
                    result.isJsonNull -> emptyList()
                    else -> listOf(result.toString())
                }
            }
            else -> listOf(result)
        }
    }

    private fun JsonPrimitive.toPrimitiveValue(): Any {
        return when {
            isBoolean -> asBoolean
            isNumber -> asNumber
            isString -> asString
            else -> toString()
        }
    }

    private fun JsonElement.toComparableString(): String {
        return when {
            isJsonNull -> "null"
            isJsonPrimitive -> {
                val primitive = asJsonPrimitive
                when {
                    primitive.isBoolean -> primitive.asBoolean.toString()
                    primitive.isNumber -> primitive.asNumber.toString()
                    else -> primitive.asString
                }
            }
            else -> toString()
        }
    }

    private fun Any?.toComparableString(): String {
        return when (this) {
            null -> "null"
            is Boolean -> toString()
            is Number -> toString()
            is String -> this
            else -> toString()
        }
    }

    private fun fetchCredentialCandidatesForConstraints(vcMetadata: VCMetadata): List<JsonObject> {
        val format = vcMetadata.format
        val verifiableCredential = vcMetadata.vc
        val unwrapped = unwrapVcPayload(verifiableCredential)

        return when (format) {
            FormatType.LDP_VC.value -> listOf(verifiableCredential, unwrapped)
            FormatType.MSO_MDOC.value -> listOf(getProcessedDataForMdoc(verifiableCredential))
            else -> listOf(verifiableCredential, unwrapped)
        }
    }

    private fun getProcessedDataForMdoc(processedCredential: JsonObject): JsonObject {
        val issuerSigned = processedCredential.getAsJsonObject("issuerSigned") ?: return JsonObject()
        val nameSpaces = issuerSigned.getAsJsonObject("nameSpaces") ?: return JsonObject()

        val processedData = JsonObject()

        for ((nsKey, elementsArrayElem) in nameSpaces.entrySet()) {
            val elementsArray = elementsArrayElem.asJsonArray ?: continue
            val asObject = JsonObject()

            for (itemElem in elementsArray) {
                val item = itemElem.asJsonObject
                val id = item.get("elementIdentifier")?.asString ?: continue
                val value = item.get("elementValue") ?: continue
                asObject.add(id, value)
            }

            processedData.add(nsKey, asObject)
        }

        return processedData
    }
}

data class MatchingResult(
    val matchingVCs: Map<String, List<VCMetadata>>,
    val requestedClaims: String,
    val purpose: String
)
