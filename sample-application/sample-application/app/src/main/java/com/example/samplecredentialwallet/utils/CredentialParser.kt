package com.example.samplecredentialwallet.utils

import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import org.json.JSONArray
import org.json.JSONObject

object CredentialParser {
    
    fun parseCredential(credentialJson: String): Map<String, String> {
        val result = mutableMapOf<String, String>()
        val addedKeys = mutableSetOf<String>()
        
        try {
            val cleanCredential = if (credentialJson.startsWith("CredentialResponse(")) {
                val credMatch = Regex("""credential=(\{.*\})(?:,|\))""").find(credentialJson)
                credMatch?.groupValues?.get(1) ?: credentialJson
            } else {
                credentialJson
            }
            
            val json = JSONObject(cleanCredential)

            fun shouldSkipValue(value: String): Boolean {
                return value.isEmpty() ||
                       value == "N/A" ||
                       value.length > 100 ||
                       value.startsWith("http://") ||
                       value.startsWith("https://") ||
                       value.startsWith("did:") ||
                       value.contains("eyJ") ||
                       value.matches(Regex("^[A-Za-z0-9+/=]{50,}$"))
            }
            
            fun addField(key: String, value: String) {
                val keyLower = key.lowercase()
                if (keyLower !in addedKeys && !shouldSkipValue(value)) {
                    result[key] = value
                    addedKeys.add(keyLower)
                }
            }

            val displayName = CredentialDisplayNameResolver.resolveFromJson(json)
            if (!displayName.isNullOrBlank()) {
                addField("credentialName", displayName)
            }

            val types = json.optJSONArray("type")
                ?: json.optJSONObject("vc")?.optJSONArray("type")
            if (types != null && types.length() > 0) {
                val rawType = types.getString(types.length() - 1)
                addField("type", CredentialDisplayNameResolver.toDisplayName(rawType))
            }
            
            val credentialSubject = json.optJSONObject("credentialSubject")
                ?: json.optJSONObject("vc")?.optJSONObject("credentialSubject")
            if (credentialSubject != null) {
                credentialSubject.keys().forEach { key ->
                    val value = credentialSubject.opt(key)
                    when (value) {
                        is String -> {
                            if (key == "face" && value.startsWith("data:image/")) {
                                result["faceImage"] = value.substringAfter(",")
                            } else if (value.trim().startsWith("{") && value.contains("\"language\"") && value.contains("\"value\"")) {
                                try {
                                    val langObj = JSONObject(value)
                                    addField(key, langObj.optString("value", ""))
                                } catch (e: Exception) {
                                    addField(key, value)
                                }
                            } else {
                                addField(key, value)
                            }
                        }
                        is JSONObject -> {
                            val actualValue = value.optString("value", "")
                            if (actualValue.isNotEmpty()) {
                                val cleanedValue = actualValue.replace(Regex("(eng|hin|ara|fra|deu|spa|por|rus|zho|jpn|kor)$"), "")
                                addField(key, cleanedValue)
                            } else {
                                addField(key, value.toString())
                            }
                        }
                        is JSONArray -> {
                            val arrayValues = mutableListOf<String>()
                            for (i in 0 until value.length()) {
                                when (val item = value.opt(i)) {
                                    is JSONObject -> {
                                        val langValue = item.optString("value", "")
                                        if (langValue.isNotEmpty()) {
                                            arrayValues.add(langValue.replace(Regex("(eng|hin|ara|fra|deu|spa|por|rus|zho|jpn|kor)$"), ""))
                                        } else {
                                            arrayValues.add(item.toString())
                                        }
                                    }
                                    is String -> arrayValues.add(item)
                                    else -> arrayValues.add(item.toString())
                                }
                            }
                            addField(key, arrayValues.joinToString(", "))
                        }
                        else -> addField(key, value.toString())
                    }
                }
            }
            
        } catch (e: Exception) {
            result["error"] = "Failed to parse credential"
            result["raw"] = credentialJson.take(100) + "..."
        }
        
        return result
    }
}

object CredentialDisplayNameResolver {
    private val aliases = mapOf(
        "MosipVerifiableCredential" to "Veridonia National ID",
        "IncomeTaxAccountCredential" to "Income Tax Account",
        "InsuranceCredential" to "Life Insurance",
        "LandStatementCredential" to "Land Records Statement",
        "org.iso.18013.5.1.mDL" to "Mobile Driving License",
        "mso_mdoc" to "Mobile Driving License"
    )

    fun resolveCredentialConfigurationName(configurationId: String): String {
        val cleanId = configurationId.trim()
        if (cleanId.isEmpty()) return "Verifiable Credential"
        return aliases[cleanId] ?: toDisplayName(cleanId)
    }

    fun resolveFromJson(credentialJson: JSONObject): String? {
        val direct = extractCredentialNameFromContainer(credentialJson)
        if (direct.isNotEmpty()) return direct

        val nestedVc = credentialJson.optJSONObject("vc")
        val nestedDirect = extractCredentialNameFromContainer(nestedVc)
        if (nestedDirect.isNotEmpty()) return nestedDirect

        val subjectName = extractCredentialNameFromSubject(credentialJson.optJSONObject("credentialSubject"))
            ?: extractCredentialNameFromSubject(nestedVc?.optJSONObject("credentialSubject"))
        if (!subjectName.isNullOrBlank()) return subjectName

        val bestType = extractPreferredType(
            credentialJson.optJSONArray("type"),
            nestedVc?.optJSONArray("type")
        )
        if (!bestType.isNullOrBlank()) return aliases[bestType] ?: toDisplayName(bestType)

        val docType = credentialJson.optString("docType").takeIf { it.isNotBlank() }
            ?: nestedVc?.optString("docType")?.takeIf { it.isNotBlank() }
        if (!docType.isNullOrBlank()) return aliases[docType] ?: toDisplayName(docType)

        return null
    }

    fun resolveFromJson(vcObject: JsonObject): String? {
        val direct = vcObject.getAsSafeString("credentialName")
        if (!direct.isNullOrBlank()) return direct

        val nestedVc = vcObject.getAsSafeObject("vc")
        val nestedDirect = nestedVc?.getAsSafeString("credentialName")
        if (!nestedDirect.isNullOrBlank()) return nestedDirect

        val subjectName = extractCredentialNameFromSubject(vcObject.getAsSafeObject("credentialSubject"))
            ?: extractCredentialNameFromSubject(nestedVc?.getAsSafeObject("credentialSubject"))
        if (!subjectName.isNullOrBlank()) return subjectName

        val bestType = extractPreferredType(
            vcObject.getAsSafeArray("type"),
            nestedVc?.getAsSafeArray("type")
        )
        if (!bestType.isNullOrBlank()) return aliases[bestType] ?: toDisplayName(bestType)

        val docType = vcObject.getAsSafeString("docType")
            ?: nestedVc?.getAsSafeString("docType")
        if (!docType.isNullOrBlank()) return aliases[docType] ?: toDisplayName(docType)

        return null
    }

    fun toDisplayName(rawIdentifier: String): String {
        val trimmed = rawIdentifier.trim()
        if (trimmed.isEmpty()) return "Verifiable Credential"

        aliases[trimmed]?.let { return it }

        val token = trimmed
            .substringAfterLast('/')
            .substringAfterLast('#')
            .substringAfterLast('.')

        return token
            .replace("_", " ")
            .replace("-", " ")
            .replace(Regex("([a-z0-9])([A-Z])"), "$1 $2")
            .replace("VerifiableCredential", "Verifiable Credential")
            .replace("Mso Mdoc", "Mobile Driving License")
            .replace(Regex("\\s+"), " ")
            .trim()
            .ifEmpty { "Verifiable Credential" }
    }

    private fun extractPreferredType(vararg typeArrays: JSONArray?): String? {
        for (typeArray in typeArrays) {
            val candidate = extractPreferredType(typeArray)
            if (!candidate.isNullOrBlank()) return candidate
        }
        return null
    }

    private fun extractPreferredType(typeArray: JSONArray?): String? {
        if (typeArray == null || typeArray.length() == 0) return null

        var lastType: String? = null
        for (i in 0 until typeArray.length()) {
            val current = typeArray.optString(i).trim()
            if (current.isEmpty()) continue
            if (!current.equals("VerifiableCredential", ignoreCase = true)) {
                return current
            }
            lastType = current
        }
        return lastType
    }

    private fun extractPreferredType(vararg typeArrays: JsonArray?): String? {
        for (typeArray in typeArrays) {
            val candidate = extractPreferredType(typeArray)
            if (!candidate.isNullOrBlank()) return candidate
        }
        return null
    }

    private fun extractPreferredType(typeArray: JsonArray?): String? {
        if (typeArray == null || typeArray.size() == 0) return null

        var lastType: String? = null
        typeArray.forEach { element ->
            val current = element.asStringOrNull()?.trim().orEmpty()
            if (current.isEmpty()) return@forEach
            if (!current.equals("VerifiableCredential", ignoreCase = true)) {
                return current
            }
            lastType = current
        }
        return lastType
    }

    private fun extractCredentialNameFromSubject(subject: JSONObject?): String? {
        if (subject == null) return null
        val credentialName = subject.opt("credentialName")
        return when (credentialName) {
            is String -> credentialName.trim().ifEmpty { null }
            is JSONObject -> credentialName.optString("value")?.trim()?.ifEmpty { null }
            else -> null
        }
    }

    private fun extractCredentialNameFromContainer(source: JSONObject?): String {
        if (source == null) return ""

        // Reuse subject extractor so top-level and nested vc credentialName
        // both support plain strings and localized-object shapes.
        val wrapper = JSONObject()
        if (source.has("credentialName")) {
            wrapper.put("credentialName", source.opt("credentialName"))
        }
        return extractCredentialNameFromSubject(wrapper).orEmpty()
    }

    private fun extractCredentialNameFromSubject(subject: JsonObject?): String? {
        if (subject == null) return null
        val direct = subject.getAsSafeString("credentialName")
        if (!direct.isNullOrBlank()) return direct

        val valueObject = subject.getAsSafeObject("credentialName")
        val localized = valueObject?.getAsSafeString("value")
        return localized?.takeIf { it.isNotBlank() }
    }

    private fun JsonObject.getAsSafeString(key: String): String? {
        val value = this.get(key) ?: return null
        if (!value.isJsonPrimitive || !value.asJsonPrimitive.isString) return null
        val text = value.asString.trim()
        return text.ifEmpty { null }
    }

    private fun JsonObject.getAsSafeObject(key: String): JsonObject? {
        val value = this.get(key) ?: return null
        return if (value.isJsonObject) value.asJsonObject else null
    }

    private fun JsonObject.getAsSafeArray(key: String): JsonArray? {
        val value = this.get(key) ?: return null
        return if (value.isJsonArray) value.asJsonArray else null
    }

    private fun JsonElement.asStringOrNull(): String? {
        if (!this.isJsonPrimitive || !this.asJsonPrimitive.isString) return null
        return this.asString
    }
}
