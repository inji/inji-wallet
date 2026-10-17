@file:OptIn(kotlin.time.ExperimentalTime::class)

package io.mosip.residentapp.mdoc

import android.content.Context
import android.os.PowerManager
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import kotlinx.io.bytestring.ByteString
import org.multipaz.asn1.OID
import org.multipaz.cbor.Bstr
import org.multipaz.cbor.Cbor
import org.multipaz.cbor.DataItem
import org.multipaz.cbor.MajorType
import org.multipaz.cbor.Simple
import org.multipaz.cbor.Tagged
import org.multipaz.cbor.addCborMap
import org.multipaz.cbor.buildCborArray
import org.multipaz.cbor.buildCborMap
import org.multipaz.cbor.putCborArray
import org.multipaz.cbor.putCborMap
import org.multipaz.cbor.toDataItemDateTimeString
import org.multipaz.crypto.Algorithm
import org.multipaz.crypto.EcCurve
import org.multipaz.crypto.EcPrivateKeyDoubleCoordinate
import org.multipaz.crypto.EcPublicKeyDoubleCoordinate
import org.multipaz.document.Document
import org.multipaz.document.buildDocumentStore
import org.multipaz.documenttype.DocumentType
import org.multipaz.documenttype.DocumentTypeRepository
import org.multipaz.mdoc.connectionmethod.MdocConnectionMethodBle
import org.multipaz.mdoc.connectionmethod.MdocConnectionMethodNfc
import org.multipaz.mdoc.credential.MdocCredential
import org.multipaz.mdoc.engagement.DeviceEngagement
import org.multipaz.mdoc.issuersigned.IssuerNamespaces
import org.multipaz.mdoc.mso.MobileSecurityObject
import org.multipaz.mdoc.request.DeviceRequest
import org.multipaz.mdoc.role.MdocRole
import org.multipaz.mdoc.sessionencryption.EReaderKey
import org.multipaz.mdoc.sessionencryption.SessionEncryption
import org.multipaz.mdoc.transport.MdocTransport
import org.multipaz.mdoc.transport.MdocTransportFactory
import org.multipaz.mdoc.transport.MdocTransportOptions
import org.multipaz.mdoc.transport.advertise
import org.multipaz.mdoc.transport.waitForConnection
import org.multipaz.presentment.CredentialPresentmentData
import org.multipaz.presentment.CredentialPresentmentSelection
import org.multipaz.presentment.Iso18013PresentmentTimeoutException
import org.multipaz.presentment.PresentmentCanceledException
import org.multipaz.presentment.PresentmentCannotSatisfyRequestException
import org.multipaz.presentment.SimplePresentmentSource
import org.multipaz.presentment.mdocPresentment
import org.multipaz.request.MdocRequestedClaim
import org.multipaz.request.Requester
import org.multipaz.securearea.SecureArea
import org.multipaz.securearea.SecureAreaRepository
import org.multipaz.securearea.software.SoftwareCreateKeySettings
import org.multipaz.securearea.software.SoftwareSecureArea
import org.multipaz.storage.ephemeral.EphemeralStorage
import org.multipaz.trustmanagement.TrustMetadata
import org.multipaz.util.Constants
import org.multipaz.util.fromBase64
import org.multipaz.util.fromBase64Url
import java.util.concurrent.atomic.AtomicInteger
import kotlin.coroutines.CoroutineContext
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds

/**
 * ISO/IEC 18013-5 proximity: BLE advertise the **same** service UUID as DeviceEngagement (key 10),
 * then [Iso18013Presentment]. Credence/Tap2iD: verifier connects to that GATT UUID — it must be advertising.
 */
class InjiIso18013ProximityPresenter(
    private val reactContext: ReactApplicationContext,
    parentContext: CoroutineContext,
) {
    private val scope = CoroutineScope(parentContext + SupervisorJob())
    private var sessionJob: Job? = null
    /** Which [runSession] owns the proximity foreground service (-1 = none). */
    private val foregroundSessionId = AtomicInteger(-1)

    private val consentLock = Any()
    @Volatile
    private var consentDeferred: CompletableDeferred<Boolean>? = null

    /**
     * Captured from the reader's [DeviceRequest.deviceRequestInfo] (ISO 18013-5 1.1) before
     * request filtering. Used to populate the RN consent overlay with purpose / purposeHints.
     */
    @Volatile
    private var consentContextPurpose: String = ""

    /** Numeric purposeHints code from ISO 18013-5 §10.2.5. */
    private var consentContextPurposeHintCode: Int? = null
    private var consentContextRequestInfoJson: String = ""
    private var consentContextPurposesJson: String? = null

    /** (namespace, element) pairs the user agreed to disclose; null discloses the whole selection. */
    @Volatile
    private var consentDisclosedElements: Set<Pair<String, String>>? = null

    /** One data element the reader asked for, and whether this credential can serve it. */
    private data class RequestedElement(
        val namespace: String,
        val element: String,
        val intentToRetain: Boolean,
        val servable: Boolean,
        /** Wallet element name when it differs from the reader's (synonym remap). */
        val servedAs: String?,
    )

    /**
     * The reader's *original* ask, captured in [filterDeviceRequestToSatisfiable] before the
     * request is narrowed. The consent event only ever carries the filtered set, so without this
     * snapshot JS cannot tell what the verifier requested but the wallet dropped.
     */
    @Volatile
    private var consentContextRequestedElements: List<RequestedElement> = emptyList()

    fun start(
        issuerSignedCompact: String,
        deviceEngagementCbor: ByteArray,
        ephemeralPrivateKey32: ByteArray,
        useSoftwareDeviceKey: Boolean,
        softwareDeviceKeyPrivate32: ByteArray?,
        onDone: (Throwable?) -> Unit,
    ) {
        cancel()
        sessionJob = scope.launch {
            try {
                runSession(
                    issuerSignedCompact = issuerSignedCompact,
                    deviceEngagementCbor = deviceEngagementCbor,
                    ephemeralPrivateKey32 = ephemeralPrivateKey32,
                    useSoftwareDeviceKey = useSoftwareDeviceKey,
                    softwareDeviceKeyPrivate32 = softwareDeviceKeyPrivate32,
                )
                onDone(null)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Throwable) {
                Log.e(TAG, "Proximity presentment failed", e)
                onDone(e as? Exception ?: Exception(e.message, e))
            }
        }
    }

    fun cancel() {
        Log.i(TAG, "cancel() — stopping BLE / waitForConnection / Iso18013Presentment if active")
        completePendingConsent(approved = false)
        clearConsentContext()
        emitConsentDismissed()
        val job = sessionJob
        sessionJob = null
        job?.cancel()
        // Never call MdocProximityPresentmentForegroundService.stop() here when a session job
        // exists: start() invokes cancel() then immediately startForegroundService(START) from
        // runSession. Queuing PROXIMITY_FG_STOP (or stopService) in the same window races START on
        // Android 14/15 and triggers ForegroundServiceDidNotStartInTimeException (Nothing Phone log).
        // Stopping FGS is handled by this cancelled job's finally { compareAndSet } or the next
        // session's lifecycle.
        if (job == null) {
            foregroundSessionId.set(-1)
            MdocProximityPresentmentForegroundService.stop(reactContext.applicationContext)
        }
    }

    fun destroy() {
        cancel()
        foregroundSessionId.set(-1)
        MdocProximityPresentmentForegroundService.stop(reactContext.applicationContext)
        scope.cancel()
    }

    /** RN Approve — resume [promptModelRnBridgedConsent] with the Multipaz credential selection. */
    fun approveConsent(purposesJson: String?, disclosedElementsJson: String?) {
        Log.i(
            TAG,
            "approveConsent() from JS with purposesJson: $purposesJson " +
                "disclosedElements: $disclosedElementsJson",
        )
        this.consentContextPurposesJson = purposesJson
        this.consentDisclosedElements = parseDisclosedElements(disclosedElementsJson)
        completePendingConsent(approved = true)
    }

    /**
     * Parses `[{namespace, element}]` from JS. Null input means no narrowing. Malformed input
     * yields an empty set, never null, so a bad payload cancels the share instead of disclosing
     * elements the user did not agree to.
     */
    private fun parseDisclosedElements(json: String?): Set<Pair<String, String>>? {
        if (json.isNullOrBlank()) {
            return null
        }
        return try {
            val array = org.json.JSONArray(json)
            val agreed = mutableSetOf<Pair<String, String>>()
            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                agreed.add(item.getString("namespace") to item.getString("element"))
            }
            agreed
        } catch (e: org.json.JSONException) {
            Log.e(TAG, "parseDisclosedElements: malformed disclosedElements JSON, sharing nothing", e)
            emptySet()
        }
    }

    /**
     * Drops every mdoc claim the user did not agree to. Returns null when nothing is left, since a
     * DeviceResponse with no elements is not a share.
     */
    private fun narrowSelection(
        selection: CredentialPresentmentSelection,
        agreed: Set<Pair<String, String>>,
    ): CredentialPresentmentSelection? {
        var kept = 0
        val matches = selection.matches.map { match ->
            val claims = match.claims.filterKeys { claim ->
                claim !is MdocRequestedClaim ||
                    (claim.namespaceName to claim.dataElementName) in agreed
            }
            kept += claims.keys.count { it is MdocRequestedClaim }
            match.copy(claims = claims)
        }
        return if (kept == 0) null else CredentialPresentmentSelection(matches)
    }

    /** RN Deny — resume consent with null selection → [PresentmentCanceledException]. */
    fun denyConsent() {
        Log.i(TAG, "denyConsent() from JS")
        this.consentContextPurposesJson = null
        this.consentDisclosedElements = null
        completePendingConsent(approved = false)
        emitConsentDismissed()
    }

    private fun completePendingConsent(approved: Boolean) {
        synchronized(consentLock) {
            val deferred = consentDeferred
            consentDeferred = null
            deferred?.complete(approved)
        }
    }

    /**
     * Multipaz [org.multipaz.prompt.ShowConsentPromptFn] that forwards requested mDOC elements,
     * verifier identity, and purpose to React Native and suspends until [approveConsent] /
     * [denyConsent] (or session [cancel]).
     */
    private suspend fun promptModelRnBridgedConsent(
        requester: Requester,
        trustMetadata: TrustMetadata?,
        credentialPresentmentData: CredentialPresentmentData,
        preselectedDocuments: List<Document>,
        onDocumentsInFocus: (documents: List<Document>) -> Unit,
    ): CredentialPresentmentSelection? {
        val selection = credentialPresentmentData.select(preselectedDocuments)
        // Multipaz requires onDocumentsInFocus even when UI is bridged / delayed.
        onDocumentsInFocus(selection.matches.map { it.credential.document })

        val elements: WritableArray = Arguments.createArray()
        val elementNames = mutableListOf<String>()
        var docType: String? = null
        for (credentialSet in credentialPresentmentData.credentialSets) {
            val option = credentialSet.options.firstOrNull() ?: continue
            for (member in option.members) {
                val match = member.matches.firstOrNull() ?: continue
                for ((claim, _) in match.claims) {
                    if (claim is MdocRequestedClaim) {
                        if (docType == null) {
                            docType = claim.docType
                        }
                        elementNames.add(claim.dataElementName)
                        val row = Arguments.createMap()
                        row.putString("namespace", claim.namespaceName)
                        row.putString("element", claim.dataElementName)
                        row.putBoolean("intentToRetain", claim.intentToRetain)
                        row.putBoolean("optional", credentialSet.optional)
                        elements.pushMap(row)
                    }
                }
            }
        }

        val verifierName = resolveVerifierDisplayName(requester, trustMetadata)
        val purpose = consentContextPurpose.takeIf { it.isNotBlank() }
            ?: purposeFromRequestedElements(elementNames)
        val purposeHintCode = consentContextPurposeHintCode
        val requestInfoJson = consentContextRequestInfoJson

        val deferred = CompletableDeferred<Boolean>()
        consentDisclosedElements = null
        synchronized(consentLock) {
            consentDeferred?.complete(false)
            consentDeferred = deferred
        }

        Log.i(
            TAG,
            "promptModelRnBridgedConsent: waiting for JS consent " +
                "(docType=${docType ?: "?"}, verifier=${verifierName.ifBlank { "?" }}, " +
                "purpose=$purpose, elements=${elements.size()})",
        )
        emitConsentRequired(
            docType = docType,
            credentialLabel = friendlyDocTypeLabel(docType),
            verifierName = verifierName,
            purpose = purpose,
            purposeHintCode = purposeHintCode,
            requestInfoJson = requestInfoJson,
            elements = elements,
        )

        return try {
            val approved = deferred.await()
            if (!approved) {
                Log.i(TAG, "promptModelRnBridgedConsent: user denied / cancelled")
                null
            } else {
                val agreed = consentDisclosedElements
                if (agreed == null) {
                    Log.i(TAG, "promptModelRnBridgedConsent: user approved — proceeding with DeviceResponse")
                    selection
                } else {
                    val narrowed = narrowSelection(selection, agreed)
                    Log.i(
                        TAG,
                        "promptModelRnBridgedConsent: user approved ${agreed.size} element(s) — " +
                            if (narrowed == null) "none servable, cancelling" else "proceeding with DeviceResponse",
                    )
                    narrowed
                }
            }
        } finally {
            synchronized(consentLock) {
                if (consentDeferred === deferred) {
                    consentDeferred = null
                }
            }
        }
    }

    private fun emitConsentRequired(
        docType: String?,
        credentialLabel: String?,
        verifierName: String,
        purpose: String,
        purposeHintCode: Int?,
        requestInfoJson: String,
        elements: WritableArray,
    ) {
        val payload = Arguments.createMap()
        payload.putString("docType", docType ?: "")
        payload.putString("credentialLabel", credentialLabel ?: "")
        payload.putString("verifierName", verifierName)
        payload.putString("purpose", purpose)
        payload.putString("requestInfoJson", requestInfoJson)
        if (purposeHintCode != null) {
            payload.putInt("purposeHintCode", purposeHintCode)
        } else {
            payload.putNull("purposeHintCode")
        }
        payload.putArray("elements", elements)
        payload.putArray("requestedElements", buildRequestedElementsArray())
        emitJsEvent(EVENT_CONSENT_REQUIRED, payload)
    }

    /**
     * The reader's original ask as captured before filtering. `elements` above is the narrowed set
     * the wallet will actually disclose; this is what was asked for, so JS can show both sides.
     */
    private fun buildRequestedElementsArray(): WritableArray {
        val array = Arguments.createArray()
        for (requested in consentContextRequestedElements) {
            val row = Arguments.createMap()
            row.putString("namespace", requested.namespace)
            row.putString("element", requested.element)
            row.putBoolean("intentToRetain", requested.intentToRetain)
            row.putBoolean("servable", requested.servable)
            if (requested.servedAs != null) {
                row.putString("servedAs", requested.servedAs)
            } else {
                row.putNull("servedAs")
            }
            array.pushMap(row)
        }
        return array
    }

    /**
     * Reads ISO 18013-5 `deviceRequestInfo.useCases[].purposeHints` (and optional free-text
     * `purpose` in otherInfo) from the reader's DeviceRequest before filtering drops that field.
     */
    private fun rememberConsentContextFromDeviceRequest(deviceRequest: DeviceRequest, encodedDeviceRequest: ByteArray?, walletDocType: String) {
        val hints = linkedMapOf<String, Int>()
        var freeTextPurpose: String? = null
        deviceRequest.deviceRequestInfo?.let { dri ->
            for (useCase in dri.useCases) {
                hints.putAll(useCase.purposeHints)
            }
            dri.otherInfo["purpose"]?.let { item ->
                runCatching { freeTextPurpose = item.asTstr }.onFailure { /* ignore non-tstr */ }
            }
        }
        val hintCode = hints["org.iso.18013.5"]
            ?: hints["org.iso.jtc1.sc17"]
            ?: hints.values.firstOrNull()
        consentContextPurposeHintCode = hintCode
        consentContextPurpose = freeTextPurpose?.takeIf { it.isNotBlank() }
            ?: purposeLabelFromHintCode(hintCode)
            ?: ""
            
        if (encodedDeviceRequest != null) {
            try {
                val deviceReqMap = org.multipaz.cbor.Cbor.decode(encodedDeviceRequest)
                val docReqs = deviceReqMap.getOrNull("docRequests")?.asArray
                var foundRequestInfo: String? = null
                docReqs?.forEach { docReq ->
                    val itemsReqTagged = docReq.getOrNull("itemsRequest")
                    val itemsReqDecoded = try {
                        itemsReqTagged?.asTaggedEncodedCbor
                    } catch (e: Exception) {
                        null
                    } ?: try {
                        val bstr = itemsReqTagged?.asTagged?.asBstr
                        if (bstr != null) org.multipaz.cbor.Cbor.decode(bstr) else null
                    } catch (e: Exception) {
                        null
                    }
                    val reqDocType = try { itemsReqDecoded?.getOrNull("docType")?.asTstr } catch (e: Exception) { null }
                    val reqInfo = itemsReqDecoded?.getOrNull("requestInfo")
                    if (reqInfo != null && (reqDocType == null || reqDocType == walletDocType)) {
                        foundRequestInfo = dataItemToJson(reqInfo)
                    }
                }
                consentContextRequestInfoJson = foundRequestInfo ?: "{}"
            } catch (e: Exception) {
                consentContextRequestInfoJson = "{\"error\": \"failed to parse\"}"
            }
        } else {
            consentContextRequestInfoJson = "{}"
        }
        
        Log.i(
            TAG,
            "consent context from DeviceRequest: purpose='${consentContextPurpose.ifBlank { "?" }}' " +
                "purposeHintCode=$hintCode hints=$hints",
        )
    }

    private fun dataItemToJson(item: org.multipaz.cbor.DataItem): String {
        return when (item.majorType) {
            org.multipaz.cbor.MajorType.UNSIGNED_INTEGER,
            org.multipaz.cbor.MajorType.NEGATIVE_INTEGER -> item.asNumber.toString()
            org.multipaz.cbor.MajorType.BYTE_STRING -> "\"_bstr_\""
            org.multipaz.cbor.MajorType.UNICODE_STRING -> "\"${item.asTstr.replace("\"", "\\\"")}\""
            org.multipaz.cbor.MajorType.ARRAY -> {
                val sb = java.lang.StringBuilder("[")
                item.asArray.forEachIndexed { i, child ->
                    if (i > 0) sb.append(",")
                    sb.append(dataItemToJson(child))
                }
                sb.append("]")
                sb.toString()
            }
            org.multipaz.cbor.MajorType.MAP -> {
                val sb = java.lang.StringBuilder("{")
                var first = true
                item.asMap.forEach { (k, v) ->
                    if (!first) sb.append(",")
                    first = false
                    sb.append(dataItemToJson(k)).append(":").append(dataItemToJson(v))
                }
                sb.append("}")
                sb.toString()
            }
            org.multipaz.cbor.MajorType.TAG -> dataItemToJson(item.asTagged)
            org.multipaz.cbor.MajorType.SPECIAL -> {
                try {
                    item.asBoolean.toString()
                } catch (e: Exception) {
                    "null"
                }
            }
            else -> "\"unknown\""
        }
    }

    private fun clearConsentContext() {
        consentContextPurpose = ""
        consentContextPurposeHintCode = null
        consentContextRequestInfoJson = ""
        consentContextPurposesJson = null
        consentDisclosedElements = null
        consentContextRequestedElements = emptyList()
    }

    /**
     * ISO/IEC 18013-5 Second Edition §10.2.5 purposeHints. Multipaz documents PurposeCode 3 as
     * Age verification (`org.iso.jtc1.sc17`); verifiers may also use `org.iso.18013.5`.
     */
    private fun purposeLabelFromHintCode(code: Int?): String? = when (code) {
        3 -> "Age verification"
        2 -> "Identity verification"
        1 -> "Identity verification"
        else -> null
    }

    private fun purposeFromRequestedElements(elementNames: List<String>): String {
        if (elementNames.isEmpty()) {
            return "Data verification"
        }
        val set = elementNames.map { it.lowercase() }.toSet()
        val identityKeys = setOf(
            "given_name", "family_name", "birth_date", "date_of_birth",
            "portrait", "sex", "gender",
        )
        val ageKeys = set.filter {
            it.startsWith("age_") || it == "birth_date" || it == "date_of_birth"
        }
        val nonAgeKeys = set - ageKeys.toSet() - setOf("portrait")
        if (ageKeys.isNotEmpty() && nonAgeKeys.isEmpty()) {
            return "Age verification"
        }
        if (set.any { it in identityKeys }) {
            return "Identity verification"
        }
        return "Data verification"
    }

    private fun resolveVerifierDisplayName(
        requester: Requester,
        trustMetadata: TrustMetadata?,
    ): String {
        trustMetadata?.displayName?.takeIf { it.isNotBlank() }?.let { return it }
        val subject = requester.certChain?.certificates?.firstOrNull()?.subject
        if (subject != null) {
            subject.components[OID.COMMON_NAME.oid]?.value?.takeIf { it.isNotBlank() }?.let {
                return it
            }
            subject.components[OID.ORGANIZATION_NAME.oid]?.value?.takeIf { it.isNotBlank() }?.let {
                return it
            }
        }
        requester.appId?.takeIf { it.isNotBlank() }?.let { return it }
        val origin = requester.origin
        if (!origin.isNullOrBlank() &&
            !origin.startsWith("android:apk-key-hash:") &&
            origin != "null"
        ) {
            return origin
        }
        return ""
    }

    private fun friendlyDocTypeLabel(docType: String?): String {
        if (docType.isNullOrBlank()) {
            return ""
        }
        val leaf = docType.substringAfterLast('.').ifBlank { docType }
        return leaf
            .replace(Regex("([a-z])([A-Z])"), "$1 $2")
            .replace('_', ' ')
            .trim()
    }

    private fun emitConsentDismissed() {
        emitJsEvent(EVENT_CONSENT_DISMISSED, Arguments.createMap())
    }

    private fun emitCannotSatisfyRequest(
        reason: String,
        requestedDocTypes: List<String>,
        walletDocType: String,
    ) {
        val payload = Arguments.createMap()
        payload.putString("reason", reason)
        payload.putString("walletDocType", walletDocType)
        val requested = Arguments.createArray()
        for (dt in requestedDocTypes) {
            requested.pushString(dt)
        }
        payload.putArray("requestedDocTypes", requested)
        emitJsEvent(EVENT_CANNOT_SATISFY, payload)
    }

    private fun emitJsEvent(eventName: String, payload: WritableMap) {
        try {
            if (!reactContext.hasActiveReactInstance()) {
                Log.w(TAG, "Skipping emit $eventName — no active React instance")
                return
            }
            reactContext.runOnUiQueueThread {
                try {
                    reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit(eventName, payload)
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to emit $eventName", e)
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to schedule emit $eventName", e)
        }
    }

    /**
     * Inji may store the issuer-signed mdoc as **base64url** (OpenID / Multipaz) or **standard base64**
     * (`+`, `/`) from some issuers. [fromBase64Url] rejects the latter and would abort presentment.
     */
    private fun decodeIssuerSignedCompact(compact: String): ByteArray {
        val t = compact.trim()
        return try {
            t.fromBase64Url()
        } catch (e: Throwable) {
            try {
                t.fromBase64()
            } catch (e2: Throwable) {
                throw IllegalArgumentException(
                    "issuerSignedCompact is not valid base64url or RFC4648 base64 (len=${t.length})",
                    e2,
                )
            }
        }
    }

    /**
     * OpenID4VCI / PixelPass may persist any of:
     * - bare **IssuerSigned** `{ nameSpaces, issuerAuth }` (what Multipaz [MdocCredential.certify] wants)
     * - ISO **Document** `{ docType, issuerSigned, … }` (Inji UI already reads `processedCredential.issuerSigned`)
     * - **DeviceResponse** `{ version, documents: [ Document, … ] }`
     *
     * Looking up top-level `issuerAuth` on a Document throws
     * `Key Tstr("issuerAuth") doesn't exist in map` — unwrap before certify.
     */
    private fun extractIssuerSignedBytes(credentialBytes: ByteArray): ByteArray {
        val root = Cbor.decode(credentialBytes)
        if (root.getOrNull("issuerAuth") != null) {
            Log.i(TAG, "credential CBOR is bare IssuerSigned (top-level issuerAuth)")
            return credentialBytes
        }
        val issuerSignedItem = when {
            root.getOrNull("issuerSigned") != null -> {
                Log.i(TAG, "credential CBOR is Document — using nested issuerSigned")
                root["issuerSigned"]
            }
            root.getOrNull("documents") != null -> {
                val docList = root["documents"].asArray
                require(docList.isNotEmpty()) {
                    "DeviceResponse has empty documents[] — cannot extract IssuerSigned"
                }
                Log.i(
                    TAG,
                    "credential CBOR is DeviceResponse — using documents[0].issuerSigned " +
                        "(${docList.size} document(s))",
                )
                docList[0]["issuerSigned"]
            }
            else -> {
                val keys = try {
                    root.asMap.keys.joinToString(", ") { it.toString() }
                } catch (_: Throwable) {
                    "(not a map)"
                }
                throw IllegalArgumentException(
                    "mso_mdoc credential CBOR is not IssuerSigned, Document, or DeviceResponse. " +
                        "Top-level keys: [$keys]. Expected issuerAuth, or issuerSigned, or documents[].",
                )
            }
        }
        require(issuerSignedItem.getOrNull("issuerAuth") != null) {
            "Extracted IssuerSigned map has no issuerAuth (keys=" +
                try {
                    issuerSignedItem.asMap.keys.joinToString(", ") { it.toString() }
                } catch (_: Throwable) {
                    "?"
                } + ")"
        }
        // Re-encode so certify() receives exactly IssuerSigned bytes (not outer Document wrapper).
        return Cbor.encode(issuerSignedItem)
    }

    /**
     * Multipaz [CoseSign1.fromDataItem] requires an **untagged** CBOR array of length 4.
     * ISO/COSE often encode IssuerAuth as `#6.18([protected, unprotected, payload, signature])`.
     * PixelPass `toJson` may flatten the tag for UI, so JS still shows `issuerAuth[0]/[2]`,
     * while native `asCoseSign1` throws opaque `Failed requirement.`
     */
    private fun parseIssuerAuthAsCoseSign1(issuerAuthItem: DataItem): org.multipaz.cose.CoseSign1 {
        val unwrapped = unwrapToCoseSign1Array(issuerAuthItem, depth = 0)
        return try {
            unwrapped.asCoseSign1
        } catch (e: IllegalArgumentException) {
            val detail = describeCborItem("issuerAuth", unwrapped)
            throw IllegalArgumentException(
                "issuerAuth is not a COSE_Sign1 array Multipaz can parse ($detail). " +
                    "Expected untagged array of 4 items, or #6.18(that array).",
                e,
            )
        }
    }

    private fun unwrapToCoseSign1Array(item: DataItem, depth: Int): DataItem {
        require(depth < 4) { "issuerAuth nesting too deep while unwrapping COSE_Sign1" }
        if (item is Tagged) {
            Log.i(
                TAG,
                "issuerAuth is CBOR tag ${item.tagNumber} — unwrapping " +
                    "(tag 18 = COSE_Sign1; Multipaz wants the inner 4-element array)",
            )
            return unwrapToCoseSign1Array(item.taggedItem, depth + 1)
        }
        if (item.majorType == MajorType.BYTE_STRING) {
            Log.i(TAG, "issuerAuth is bstr — decoding inner CBOR as COSE_Sign1")
            return unwrapToCoseSign1Array(Cbor.decode(item.asBstr), depth + 1)
        }
        return item
    }

    private fun describeCborItem(label: String, item: DataItem): String {
        return try {
            when (item.majorType) {
                MajorType.ARRAY -> "$label majorType=ARRAY size=${item.asArray.size}"
                MajorType.MAP -> {
                    val keys = item.asMap.keys.joinToString(", ") { it.toString() }
                    "$label majorType=MAP keys=[$keys]"
                }
                MajorType.TAG -> "$label majorType=TAG tagNumber=${(item as Tagged).tagNumber}"
                MajorType.BYTE_STRING -> "$label majorType=BSTR len=${item.asBstr.size}"
                else -> "$label majorType=${item.majorType}"
            }
        } catch (e: Throwable) {
            "$label (describe failed: ${e.message})"
        }
    }

    private fun logP256Jwk(tag: String, prefix: String, publicKey: EcPublicKeyDoubleCoordinate) {
        val x = android.util.Base64.encodeToString(
            publicKey.x,
            android.util.Base64.URL_SAFE or android.util.Base64.NO_WRAP or android.util.Base64.NO_PADDING,
        )
        val y = android.util.Base64.encodeToString(
            publicKey.y,
            android.util.Base64.URL_SAFE or android.util.Base64.NO_WRAP or android.util.Base64.NO_PADDING,
        )
        Log.i(tag, "$prefix: kty=EC, crv=P-256, x=$x, y=$y")
    }

    /**
     * ISO/IEC 18013-5: COSE_Sign1 payload of `issuerAuth` is **MobileSecurityObjectBytes** =
     * `#6.24(bstr .cbor MobileSecurityObject)`.
     *
     * Some OpenID4VCI issuers (including lab ngrok profiles) put a **bare MSO map**, a plain
     * `bstr`, or `#6.24(MSO map)` (missing the inner bstr) in the payload. Multipaz then throws
     * the opaque `Failed requirement.` from [DataItem.asTagged] / [DataItem.asTaggedEncodedCbor]
     * when [MdocCredential] lazily reads `mso`. Rewrite the payload to the ISO shape so
     * presentment can proceed; keep the original COSE signature bytes (verifiers that check
     * issuerAuth over the *original* payload may still reject — the issuer should emit ISO bytes).
     */
    private fun ensureIssuerSignedCompatibleWithMultipaz(issuerSignedBytes: ByteArray): ByteArray {
        val issuerSigned = Cbor.decode(issuerSignedBytes)
        val issuerAuthItem = issuerSigned["issuerAuth"]
        Log.i(TAG, describeCborItem("raw issuerAuth", issuerAuthItem))
        val issuerAuth = parseIssuerAuthAsCoseSign1(issuerAuthItem)
        val payload = issuerAuth.payload
            ?: throw IllegalArgumentException("issuerAuth COSE_Sign1 has null payload (no MSO)")

        val prefix = payload.take(12).joinToString("") { b -> "%02x".format(b) }
        Log.i(TAG, "issuerAuth COSE payload prefix hex=$prefix len=${payload.size}")

        val msoRaw = unwrapMobileSecurityObjectDataItem(Cbor.decode(payload), depth = 0)
        val (msoItem, msoNormalized) = normalizeMsoValidityInfoForMultipaz(msoRaw)
        val payloadShapeOk = isMultipazCompatibleMsoPayload(payload)

        if (payloadShapeOk && !msoNormalized) {
            Log.i(TAG, "issuerAuth payload already Multipaz-compatible (#6.24 + bstr, validityInfo OK)")
            // Still re-encode with untagged COSE_Sign1 so certify()/mso lazy never see tag 18.
            return Cbor.encode(
                buildCborMap {
                    val nameSpaces = issuerSigned.getOrNull("nameSpaces")
                    if (nameSpaces != null) {
                        put("nameSpaces", nameSpaces)
                    }
                    put("issuerAuth", issuerAuth.toDataItem())
                },
            )
        }

        val isoPayload = Cbor.encode(
            Tagged(Tagged.ENCODED_CBOR, Bstr(Cbor.encode(msoItem))),
        )
        Log.w(
            TAG,
            "Rewrote issuerAuth COSE payload for Multipaz " +
                "(payloadShapeOk=$payloadShapeOk msoNormalized=$msoNormalized; " +
                "docType=${msoItem.getOrNull("docType")}). " +
                "Strict issuerAuth signature verify may fail until the issuer emits compliant bytes.",
        )
        val fixedAuth = issuerAuth.copy(payload = isoPayload)
        return Cbor.encode(
            buildCborMap {
                val nameSpaces = issuerSigned.getOrNull("nameSpaces")
                if (nameSpaces != null) {
                    put("nameSpaces", nameSpaces)
                }
                put("issuerAuth", fixedAuth.toDataItem())
            },
        )
    }

    /**
     * Multipaz [MobileSecurityObject.fromDataItem] requires ISO ValidityInfo keys
     * `signed`, `validFrom`, `validUntil` as CBOR **tag 0** date-times (`tdate`).
     * This issuer omits `signed` and often stores dates as plain tstr / epoch ints —
     * reusing those values makes [DataItem.asDateTimeString] throw opaque `Failed requirement.`.
     */
    private fun normalizeMsoValidityInfoForMultipaz(msoItem: DataItem): Pair<DataItem, Boolean> {
        if (msoItem.majorType != MajorType.MAP) {
            return Pair(msoItem, false)
        }
        val validityRaw = msoItem.getOrNull("validityInfo")
            ?: throw IllegalArgumentException(
                "MSO missing validityInfo (" + describeCborItem("mso", msoItem) + ")",
            )
        val validity = unwrapPossiblyTaggedMap(validityRaw, "validityInfo")

        val signedExisting = validityFirst(validity, "signed", "signedAt", "Signed")
        val validFromExisting = validityFirst(validity, "validFrom", "valid_from", "ValidFrom")
        val validUntilExisting = validityFirst(validity, "validUntil", "valid_until", "ValidUntil")

        val nowDt: DataItem = System.currentTimeMillis().toDataItemDateTimeString()
        val farFuture: DataItem = 4_102_444_800_000L.toDataItemDateTimeString()
        val signedItem = coerceToMultipazDateTime(signedExisting, validFromExisting?.let {
            coerceToMultipazDateTime(it, nowDt)
        } ?: nowDt)
        val validFromItem = coerceToMultipazDateTime(validFromExisting, signedItem)
        val validUntilItem = coerceToMultipazDateTime(validUntilExisting, farFuture)

        val datesAlreadyOk =
            signedExisting != null &&
                validFromExisting != null &&
                validUntilExisting != null &&
                isMultipazDateTime(signedExisting) &&
                isMultipazDateTime(validFromExisting) &&
                isMultipazDateTime(validUntilExisting) &&
                validityRaw.majorType == MajorType.MAP &&
                validityRaw === validity
        if (datesAlreadyOk) {
            return Pair(msoItem, false)
        }

        val validityKeys = try {
            validity.asMap.keys.joinToString(", ") { it.toString() }
        } catch (_: Throwable) {
            "?"
        }
        Log.w(
            TAG,
            "MSO validityInfo needs Multipaz tdate coercion (keys=[$validityKeys]; " +
                "signed=${signedExisting != null} validFrom=${validFromExisting != null} " +
                "validUntil=${validUntilExisting != null}) — rewriting validityInfo",
        )

        val newValidity = buildCborMap {
            for ((k, v) in validity.asMap) {
                val keyText = tstrKeyOrNull(k)
                if (keyText == "signed" || keyText == "validFrom" || keyText == "validUntil" ||
                    keyText == "signedAt" || keyText == "valid_from" || keyText == "valid_until"
                ) {
                    // replaced below with coerced ISO tdates
                    continue
                }
                put(k, v)
            }
            put("signed", signedItem)
            put("validFrom", validFromItem)
            put("validUntil", validUntilItem)
        }
        val newMso = buildCborMap {
            var replacedValidity = false
            for ((k, v) in msoItem.asMap) {
                val keyText = tstrKeyOrNull(k)
                if (keyText == "validityInfo") {
                    put("validityInfo", newValidity)
                    replacedValidity = true
                } else {
                    put(k, v)
                }
            }
            if (!replacedValidity) {
                put("validityInfo", newValidity)
            }
        }
        return Pair(newMso, true)
    }

    private fun isMultipazDateTime(item: DataItem): Boolean {
        return try {
            item.asDateTimeString
            true
        } catch (_: Throwable) {
            false
        }
    }

    /**
     * Accepts Multipaz tag-0 tdate, plain ISO-8601 tstr, or epoch seconds/millis int.
     * Falls back to [fallback] when the issuer encoding is not convertible.
     */
    private fun coerceToMultipazDateTime(item: DataItem?, fallback: DataItem): DataItem {
        if (item == null) {
            return fallback
        }
        if (isMultipazDateTime(item)) {
            return item
        }
        try {
            when (item.majorType) {
                MajorType.UNICODE_STRING ->
                    return item.asTstr.toDataItemDateTimeString()
                MajorType.TAG -> {
                    val tagged = item as Tagged
                    val inner = tagged.taggedItem
                    if (inner.majorType == MajorType.UNICODE_STRING) {
                        return inner.asTstr.toDataItemDateTimeString()
                    }
                }
                MajorType.UNSIGNED_INTEGER, MajorType.NEGATIVE_INTEGER -> {
                    val n = item.asNumber
                    val millis = if (n < 1_000_000_000_000L) n * 1000L else n
                    return millis.toDataItemDateTimeString()
                }
                MajorType.BYTE_STRING -> {
                    val decoded = Cbor.decode(item.asBstr)
                    return coerceToMultipazDateTime(decoded, fallback)
                }
                else -> Unit
            }
        } catch (e: Throwable) {
            Log.w(TAG, "Could not coerce validity date (${describeCborItem("date", item)})", e)
        }
        Log.w(
            TAG,
            "Replacing non-tdate validity field with synthesized Multipaz tdate " +
                "(${describeCborItem("date", item)})",
        )
        return fallback
    }

    private fun unwrapPossiblyTaggedMap(item: DataItem, label: String): DataItem {
        if (item.majorType == MajorType.MAP) {
            return item
        }
        if (item is Tagged) {
            Log.i(TAG, "$label is CBOR tag ${item.tagNumber} — unwrapping to map")
            return try {
                item.asTaggedEncodedCbor
            } catch (_: IllegalArgumentException) {
                unwrapPossiblyTaggedMap(item.taggedItem, label)
            }.also {
                require(it.majorType == MajorType.MAP) {
                    "$label tagged value is not a map (${describeCborItem(label, it)})"
                }
            }
        }
        if (item.majorType == MajorType.BYTE_STRING) {
            return unwrapPossiblyTaggedMap(Cbor.decode(item.asBstr), label)
        }
        throw IllegalArgumentException(
            "$label must be a CBOR map (${describeCborItem(label, item)})",
        )
    }

    private fun validityFirst(validity: DataItem, vararg keys: String): DataItem? {
        for (key in keys) {
            validity.getOrNull(key)?.let { return it }
        }
        return null
    }

    private fun tstrKeyOrNull(key: DataItem): String? {
        return try {
            if (key.majorType == MajorType.UNICODE_STRING) key.asTstr else null
        } catch (_: Throwable) {
            null
        }
    }

    /** Same check Multipaz [MdocCredential] mso lazy uses: decode → tagged → bstr. */
    private fun isMultipazCompatibleMsoPayload(payload: ByteArray): Boolean {
        return try {
            Cbor.decode(payload).asTagged.asBstr
            true
        } catch (_: Throwable) {
            false
        }
    }

    private fun mobileSecurityObjectFromIssuerAuthPayload(payload: ByteArray): MobileSecurityObject {
        val decoded = Cbor.decode(payload)
        val msoRaw = unwrapMobileSecurityObjectDataItem(decoded, depth = 0)
        Log.i(TAG, describeCborItem("MSO before normalize", msoRaw))
        val (msoItem, normalized) = normalizeMsoValidityInfoForMultipaz(msoRaw)
        if (normalized) {
            Log.i(TAG, describeCborItem("MSO after normalize", msoItem))
        }
        return try {
            MobileSecurityObject.fromDataItem(msoItem)
        } catch (e: IllegalArgumentException) {
            // Dates or missing signed — force a clean validityInfo and retry once.
            Log.w(
                TAG,
                "MSO fromDataItem failed (${e.message}) — forcing Multipaz-compatible validityInfo",
                e,
            )
            val forced = forceMsoValidityInfo(msoItem)
            MobileSecurityObject.fromDataItem(forced)
        }
    }

    private fun forceMsoValidityInfo(msoItem: DataItem): DataItem {
        val nowDt: DataItem = System.currentTimeMillis().toDataItemDateTimeString()
        val farFuture: DataItem = 4_102_444_800_000L.toDataItemDateTimeString()
        val newValidity = buildCborMap {
            put("signed", nowDt)
            put("validFrom", nowDt)
            put("validUntil", farFuture)
        }
        return buildCborMap {
            for ((k, v) in msoItem.asMap) {
                if (tstrKeyOrNull(k) != "validityInfo") {
                    put(k, v)
                }
            }
            put("validityInfo", newValidity)
        }
    }

    private fun unwrapMobileSecurityObjectDataItem(item: DataItem, depth: Int): DataItem {
        require(depth < 4) {
            "issuerAuth COSE payload nesting too deep while looking for MobileSecurityObject"
        }
        // Standard path: tag 24 → bstr → MSO map
        if (item is Tagged && item.tagNumber == Tagged.ENCODED_CBOR) {
            return try {
                item.asTaggedEncodedCbor
            } catch (e: IllegalArgumentException) {
                // Tag 24 present but tagged item was not a bstr (e.g. bare MSO map under tag 24)
                Log.w(TAG, "tag-24 MSO unwrap failed (${e.message}); trying taggedItem directly", e)
                unwrapMobileSecurityObjectDataItem(item.taggedItem, depth + 1)
            }
        }
        // Bare MSO map (missing tag 24) — common non-compliant issuer encoding
        if (item.majorType == MajorType.MAP &&
            item.getOrNull("docType") != null &&
            item.getOrNull("valueDigests") != null
        ) {
            Log.w(
                TAG,
                "issuerAuth payload is a bare MSO map (docType=${item.getOrNull("docType")}) — " +
                    "ISO requires #6.24(bstr .cbor MSO); accepting for presentment",
            )
            return item
        }
        // Plain bstr containing MSO CBOR (with or without an inner tag 24)
        if (item.majorType == MajorType.BYTE_STRING) {
            return unwrapMobileSecurityObjectDataItem(Cbor.decode(item.asBstr), depth + 1)
        }
        val detail = when (item.majorType) {
            MajorType.MAP -> {
                val keys = try {
                    item.asMap.keys.joinToString(", ") { it.toString() }
                } catch (_: Throwable) {
                    "?"
                }
                "map keys=[$keys]"
            }
            MajorType.TAG -> "tagNumber=${(item as Tagged).tagNumber}"
            MajorType.ARRAY -> "array size=${item.asArray.size}"
            else -> item.majorType.toString()
        }
        throw IllegalArgumentException(
            "issuerAuth COSE payload is not MobileSecurityObjectBytes (#6.24(bstr .cbor MSO)). $detail",
        )
    }

    private suspend fun runSession(
        issuerSignedCompact: String,
        deviceEngagementCbor: ByteArray,
        ephemeralPrivateKey32: ByteArray,
        useSoftwareDeviceKey: Boolean,
        softwareDeviceKeyPrivate32: ByteArray?,
    ) {
        MdocMultipazBootstrap.initFrom(reactContext)

        val sid = sessionSeq.incrementAndGet()
        Log.i(TAG, "runSession#$sid start (useSoftwareDeviceKey=$useSoftwareDeviceKey)")

        // Short wake lock: same intent as keeping presentation active in Multipaz samples — avoid CPU
        // sleep during long waitForConnection / Iso18013Presentment on some devices.
        val wakeLock = (reactContext.applicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager)
            .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "$TAG:proximity-$sid")
            .apply {
                setReferenceCounted(false)
                acquire(15 * 60 * 1000L)
            }
        try {
            foregroundSessionId.set(sid)
            MdocProximityPresentmentForegroundService.start(reactContext.applicationContext)
            Log.i(TAG, "runSession#$sid proximity foreground service started (BLE may continue in background)")
            // Preserve the originally issued IssuerSigned bytes for certify()/presentment so verifier
            // trust checks run against the issuer's exact COSE payload, not a wallet-normalized copy.
            val issuerSignedBytes = extractIssuerSignedBytes(decodeIssuerSignedCompact(issuerSignedCompact))
            val issuerSigned = Cbor.decode(issuerSignedBytes)
            val issuerAuth = parseIssuerAuthAsCoseSign1(issuerSigned["issuerAuth"])
            val payload = issuerAuth.payload
                ?: throw IllegalArgumentException("issuerAuth COSE_Sign1 has null payload (no MSO)")
            val mso = mobileSecurityObjectFromIssuerAuthPayload(payload)
            val docType = mso.docType
            Log.i(TAG, "runSession#$sid parsed MSO docType=`$docType`")
            val devicePublic = mso.deviceKey as? EcPublicKeyDoubleCoordinate
                ?: throw IllegalArgumentException(
                    "MSO deviceKey is ${mso.deviceKey::class.java.simpleName}, expected P-256 EcPublicKeyDoubleCoordinate",
                )
            // TEMP debug: MSO-bound deviceKey (what verifier will verify DeviceAuth against).
            logP256Jwk(TAG, "Wallet presentation MSO deviceKey", devicePublic)

            // Diagnostic for `Iso18015ResponseException: No matching credentials for first DocRequest`.
            // Multipaz's `DeviceRequest.execute` matches the certified credential against the reader's
            // request strictly by `docType` (line 595 of DeviceRequest.kt) and then by every requested
            // `(namespace, dataElement)` (Claim.findMatchingClaim). Capturing the certified element
            // names lets `iso18013PresentmentTolerantReaderAuth` compute the diff against what the
            // reader actually asked for instead of staring at raw CBOR.
            var certifiedNamespaceSummary: Map<String, List<String>> = emptyMap()
            val nameSpacesItem = issuerSigned.getOrNull("nameSpaces")
            if (nameSpacesItem == null) {
                Log.w(
                    TAG,
                    "runSession#$sid issuerSigned has no `nameSpaces` map — getClaims() will return empty, " +
                        "so Multipaz will throw `No matching credentials for first DocRequest` regardless of docType. " +
                        "Confirm OpenID4VCI download stored full IssuerSigned (nameSpaces + issuerAuth), not just issuerAuth.",
                )
            } else {
                try {
                    val parsedNamespaces = IssuerNamespaces.fromDataItem(nameSpacesItem)
                    certifiedNamespaceSummary = parsedNamespaces.data.mapValues { (_, els) -> els.keys.sorted() }
                    val summary = certifiedNamespaceSummary.entries.joinToString("; ") { (ns, els) ->
                        "$ns: [${els.joinToString(",")}]"
                    }
                    Log.i(
                        TAG,
                        "runSession#$sid MSO docType=`$docType`; certified nameSpaces { $summary }. " +
                            "DeviceRequest.execute() throws `No matching credentials for first DocRequest` if " +
                            "the reader asks for a `(namespace,dataElement)` pair that isn't listed above.",
                    )
                } catch (e: Throwable) {
                    Log.w(
                        TAG,
                        "runSession#$sid failed to parse IssuerNamespaces — credential is not standard 18013-5 IssuerSigned. " +
                            "MdocCredential.getClaims() will return empty and the reader request cannot match.",
                        e,
                    )
                }
            }

            val (secureArea: SecureArea, keyAlias: String) = if (useSoftwareDeviceKey) {
                val d = softwareDeviceKeyPrivate32
                    ?: throw IllegalArgumentException("deviceKeyPrivate32 required for software path")
                val software = SoftwareSecureArea.create(EphemeralStorage())
                val devicePriv = EcPrivateKeyDoubleCoordinate(EcCurve.P256, d, devicePublic.x, devicePublic.y)
                val keyInfo = software.createKey(
                    null,
                    SoftwareCreateKeySettings.Builder()
                        .setAlgorithm(Algorithm.ESP256)
                        .setPrivateKey(devicePriv)
                        .build(),
                )
                check(keyInfo.publicKey == devicePublic) {
                    "Imported device private key does not match MSO deviceKey"
                }
                Log.i(
                    TAG,
                    "Wallet key source for presentation: alias=${keyInfo.alias}, keyId=${keyInfo.alias}, source=software-secure-area",
                )
                Pair(software, keyInfo.alias)
            } else {
                val keystorePublic =
                    try {
                        InjiSecureKeystoreSecureArea.retrieveEs256PublicKey(reactContext)
                    } catch (e: Throwable) {
                        Log.e(
                            TAG,
                            "Failed to load Android Keystore ES256 public key for DeviceAuth compare",
                            e,
                        )
                        null
                    }
                if (keystorePublic != null) {
                    // TEMP debug: public key of the private key that will sign DeviceAuth.
                    logP256Jwk(TAG, "Wallet presentation device-auth key", keystorePublic)
                    logP256Jwk(TAG, "Wallet presentation keystore ES256 pubkey", keystorePublic)
                    val match =
                        keystorePublic.x.contentEquals(devicePublic.x) &&
                            keystorePublic.y.contentEquals(devicePublic.y)
                    Log.i(
                        TAG,
                        "Wallet presentation device-auth key MATCH vs MSO: $match " +
                            "(alias=${InjiSecureKeystoreSecureArea.INJI_ES256_ALIAS})",
                    )
                    if (!match) {
                        Log.e(
                            TAG,
                            "DeviceAuth will FAIL verifier checks: Android Keystore ES256 public key " +
                                "does not equal MSO deviceKey. Re-issue credential with current ES256 key, " +
                                "or restore the original keystore key used at issuance.",
                        )
                    }
                } else {
                    Log.w(
                        TAG,
                        "Wallet presentation device-auth key: unavailable (could not read keystore ES256 pubkey)",
                    )
                }
                val area = InjiSecureKeystoreSecureArea(reactContext, devicePublic)
                Log.i(
                    TAG,
                    "Wallet key source for presentation: alias=${InjiSecureKeystoreSecureArea.INJI_ES256_ALIAS}, " +
                        "keyId=${InjiSecureKeystoreSecureArea.INJI_ES256_ALIAS}, source=android-keystore",
                )
                Pair(area, InjiSecureKeystoreSecureArea.INJI_ES256_ALIAS)
            }

            val repository = SecureAreaRepository.Builder()
                .add(secureArea)
                .build()

            val documentStore = buildDocumentStore(
                storage = EphemeralStorage(),
                secureAreaRepository = repository,
            ) {}

            val documentTypeRepository = DocumentTypeRepository().apply {
                // Register whatever docType the MSO declares (mDL, PID, custom mdoc, …).
                addDocumentType(
                    DocumentType.Builder(docType)
                        .addMdocDocumentType(docType)
                        .build(),
                )
            }

            val document = documentStore.createDocument(displayName = docType)
            MdocCredential.createForExistingAlias(
                document = document,
                asReplacementForIdentifier = null,
                domain = "mdoc",
                secureArea = secureArea,
                docType = docType,
                existingKeyAlias = keyAlias,
            ).also {
                it.certify(ByteString(issuerSignedBytes, 0, issuerSignedBytes.size))
            }

            val presentmentSource = SimplePresentmentSource(
                documentStore = documentStore,
                documentTypeRepository = documentTypeRepository,
                showConsentPromptFn = ::promptModelRnBridgedConsent,
                preferSignatureToKeyAgreement = true,
                domainsMdocSignature = listOf("mdoc"),
                domainsMdocKeyAgreement = emptyList(),
                domainsKeylessSdJwt = emptyList(),
                domainsKeyBoundSdJwt = emptyList(),
            )

            val de = DeviceEngagement.fromDataItem(Cbor.decode(deviceEngagementCbor))
            val eDevicePrivate = buildEphemeralPrivate(de, ephemeralPrivateKey32)

        // If engagement lists a BLE PSM, mirror Multipaz testapp (`bleUseL2CAPInEngagement = true` when PSM present).
        // Tap2iD-style QR from JS (no PSM in BleOptions) → false so peripheral setup matches scanned CBOR.
        val bleMethods = de.connectionMethods.filterIsInstance<MdocConnectionMethodBle>()
        /**
         * Multipaz maps BLE map key **21** to [MdocConnectionMethodBle.peripheralServerModePsm].
         * Tap2iD / Inji proximity QRs put **128** or **130** there as **interop pairing hints**, not an L2CAP PSM
         * (see `shared/mdoc/deviceEngagement.ts`, `BLE_OPT_INTEROP_PAIRING_HINT_21`).
         * Treating 128/130 as PSM sets [MdocTransportOptions.bleUseL2CAPInEngagement], which opens an insecure L2CAP
         * socket on Android — unnecessary for GATT-only verifiers and can prevent successful connections.
         */
        val rawKey21 = bleMethods.firstNotNullOfOrNull { it.peripheralServerModePsm }
        val bleUseL2capFromEngagement = when (rawKey21) {
            null -> false
            in TAP2ID_PAIRING_HINT_KEY21 -> false
            else -> true
        }
        if (rawKey21 != null && rawKey21 in TAP2ID_PAIRING_HINT_KEY21) {
            Log.i(
                TAG,
                "runSession#$sid BLE map key 21 value=$rawKey21 is a Tap2iD/Multipaz **pairing hint**, not L2CAP — " +
                    "using GATT-only peripheral (bleUseL2CAPInEngagement=false)",
            )
        }
        val transportOptions = MdocTransportOptions(
            bleUseL2CAP = false,
            bleUseL2CAPInEngagement = bleUseL2capFromEngagement,
        )

        for (cm in de.connectionMethods) {
            when (cm) {
                is MdocConnectionMethodBle ->
                    Log.i(
                        TAG,
                        "runSession#$sid engagement BLE: peripheral=${cm.supportsPeripheralServerMode} " +
                            "central=${cm.supportsCentralClientMode} uuidPeripheral=${cm.peripheralServerModeUuid} " +
                            "uuidCentral=${cm.centralClientModeUuid} psm=${cm.peripheralServerModePsm}",
                    )
                is MdocConnectionMethodNfc ->
                    Log.i(TAG, "runSession#$sid engagement includes NFC (advertise is no-op; BLE reader still uses BLE row)")
                else ->
                    Log.i(TAG, "runSession#$sid engagement connection method: $cm")
            }
        }

        // Android BLE advertiser / GATT setup must run on the main looper on several OEMs; doing this
        // from Dispatchers.Default caused native crashes when opening the mDL QR screen.
        val transports = withContext(Dispatchers.Main) {
            Log.i(TAG, "runSession#$sid calling advertise() on Main (factory=Default)…")
            de.connectionMethods.advertise(
                MdocRole.MDOC,
                MdocTransportFactory.Default,
                transportOptions,
            )
        }
        Log.i(TAG, "runSession#$sid advertising active; waitForConnection (blocks until reader attaches)…")
        val transport = transports.waitForConnection(eDevicePrivate.publicKey)
        Log.i(TAG, "runSession#$sid BLE transport connected; starting Iso18013Presentment…")
        emitJsEvent(EVENT_READER_CONNECTED, Arguments.createMap())
        try {
            // Local replacement for `org.multipaz.presentment.Iso18013Presentment`.
            //
            // Tap2iD's reader sends COSE `x5chain` (label 33) as a single CBOR `bstr` containing
            // multiple DER-encoded X.509 certificates concatenated together (`leaf || issuer || …`).
            // Multipaz wraps that entire blob in one `X509Cert` and calls `ASN1.decode(encoded)`,
            // which strictly forbids trailing bytes (see `ASN1.kt:179-183`). The result is
            // `IllegalArgumentException: "-N bytes leftover after decoding"` thrown from
            // `verifyReaderAuthentication` (`DeviceRequest.kt:164`), which `Iso18013Presentment`
            // does not catch. The session is then torn down with no `DeviceResponse`, and Credence
            // Tap2iD shows its internal **216 / Please provide consent** screen.
            //
            // ISO/IEC 18013-5:2021 §9.1.4 explicitly makes reader authentication optional, so we
            // run the same loop as `Iso18013Presentment` but treat `verifyReaderAuthentication`
            // failures as a warning instead of a fatal error. All other behaviour (session
            // encryption, `mdocPresentment`, session termination) is unchanged.
            iso18013PresentmentTolerantReaderAuth(
                sid = sid,
                transport = transport,
                eDeviceKey = eDevicePrivate,
                deviceEngagement = Cbor.decode(deviceEngagementCbor),
                handover = Simple.NULL,
                source = presentmentSource,
                keyAgreementPossible = listOf(eDevicePrivate.curve),
                walletDocType = docType,
                walletNamespaces = certifiedNamespaceSummary,
            )
            Log.i(TAG, "runSession#$sid Iso18013Presentment finished OK")
        } catch (e: PresentmentCanceledException) {
            Log.i(TAG, "runSession#$sid user denied / cancelled consent — ending session cleanly", e)
            emitConsentDismissed()
        } catch (e: PresentmentCannotSatisfyRequestException) {
            // Multipaz throws this from DeviceRequest.execute() when no certified credential satisfies
            // the reader's first DocRequest. The exception itself only carries a generic message; the
            // useful information is the request CBOR Multipaz already logged under `Iso180135Presentment`.
            // When we already detected a docType mismatch we emit EVENT_CANNOT_SATISFY before throwing.
            Log.e(
                TAG,
                "runSession#$sid Multipaz cannot satisfy reader request — usually docType or nameSpaces " +
                    "in the certified credential (docType=`$docType` above) do not match what the reader asked " +
                    "for. Re-run with `adb logcat -s Iso180135Presentment:V` and look for the `DeviceRequest` " +
                    "line: compare its `docType` and `nameSpaces` keys against the wallet's `MSO docType` / " +
                    "`certified nameSpaces` lines above. If the reader asks for a different docType than this " +
                    "mdoc (e.g. reader wants `org.iso.18013.5.1.mDL` but wallet has `$docType`), the verifier " +
                    "profile does not match this credential type.",
                e,
            )
            throw e
        } finally {
            try {
                transport.close()
                Log.i(TAG, "runSession#$sid transport closed")
            } catch (_: Exception) {
            }
        }
        Log.i(TAG, "runSession#$sid end")
        } finally {
            if (foregroundSessionId.compareAndSet(sid, -1)) {
                MdocProximityPresentmentForegroundService.stop(reactContext.applicationContext)
            }
            if (wakeLock.isHeld) {
                try {
                    wakeLock.release()
                } catch (_: RuntimeException) {
                }
            }
        }
    }

    /**
     * Compares the parsed reader [DeviceRequest] against the certified credential's
     * `(docType, namespace, dataElement)` set and logs both sides plus the diff. This is the
     * single most useful piece of diagnostic info when [DeviceRequest.execute] throws
     * `Iso18015ResponseException: No matching credentials for first DocRequest`: matching is a
     * strict per-element lookup in `Claim.findMatchingClaim`, so the *first* requested element
     * the credential cannot serve aborts the entire match for that document.
     */
    private fun logDocRequestDiffAgainstCredential(
        sid: Int,
        deviceRequest: DeviceRequest,
        walletDocType: String,
        walletNamespaces: Map<String, List<String>>,
    ) {
        if (deviceRequest.docRequests.isEmpty()) {
            Log.w(TAG, "runSession#$sid reader sent DeviceRequest with zero DocRequests")
            return
        }
        deviceRequest.docRequests.forEachIndexed { index, docRequest ->
            val requested = docRequest.nameSpaces.entries.joinToString("; ") { (ns, els) ->
                "$ns: [${els.keys.sorted().joinToString(",")}]"
            }
            Log.i(
                TAG,
                "runSession#$sid reader DocRequest[$index] docType=`${docRequest.docType}` " +
                    "nameSpaces { $requested }",
            )
            if (docRequest.docType != walletDocType) {
                Log.e(
                    TAG,
                    "runSession#$sid docType mismatch: reader=`${docRequest.docType}` " +
                        "wallet=`$walletDocType` — no candidates will pass " +
                        "DeviceRequest.findMatchesForDocRequest (`DeviceRequest.kt:594`).",
                )
                return@forEachIndexed
            }
            val missing = docRequest.nameSpaces.entries.flatMap { (ns, els) ->
                val haveInNs = walletNamespaces[ns]?.toSet().orEmpty()
                els.keys.filter { it !in haveInNs }.map { "$ns/$it" }
            }
            if (missing.isEmpty()) {
                Log.i(
                    TAG,
                    "runSession#$sid DocRequest[$index] every requested element is present in the " +
                        "certified credential; presentment should succeed.",
                )
            } else {
                Log.e(
                    TAG,
                    "runSession#$sid DocRequest[$index] missing in credential: $missing. " +
                        "Multipaz's `Claim.findMatchingClaim` requires every requested " +
                        "`(namespace,dataElement)` to be present; the first miss aborts the match. " +
                        "Fix either: (1) issue a credential that includes the missing elements, or " +
                        "(2) configure the reader to ask only for elements the issuer provides.",
                )
            }
        }
    }

    /**
     * Multipaz [DeviceRequest.fromDataItem] always leaves [DeviceRequest.readerAuthAllVerified]
     * false until [DeviceRequest.verifyReaderAuthentication] runs. After we rewrite CBOR to drop
     * unsupported elements, there is no valid reader signature over the new bytes — we must not
     * call verify — but [mdocPresentment] still touches [DeviceRequest.getRequester], which reads
     * [DeviceRequest.readerAuthAll] and requires the verified flag. [DeviceRequest.Builder.build]
     * sets these flags true for holder-built requests; we mirror that for our filtered parse.
     */
    private fun markMultipazDeviceRequestReaderAuthFlagsAfterInjiRewrite(request: DeviceRequest) {
        try {
            val drClass = Class.forName("org.multipaz.mdoc.request.DeviceRequest")
            drClass.getDeclaredField("readerAuthAllVerified").apply {
                isAccessible = true
                setBoolean(request, true)
            }
        } catch (e: Throwable) {
            Log.w(TAG, "markMultipazDeviceRequestReaderAuthFlags: DeviceRequest field failed", e)
        }
        try {
            val docClass = Class.forName("org.multipaz.mdoc.request.DocRequest")
            val f = docClass.getDeclaredField("readerAuthVerified").apply { isAccessible = true }
            for (doc in request.docRequests) {
                f.setBoolean(doc, true)
            }
        } catch (e: Throwable) {
            Log.w(TAG, "markMultipazDeviceRequestReaderAuthFlags: DocRequest field failed", e)
        }
    }

    /**
     * Maps common ISO mDL / PhotoID / PID reader element ids onto issuer-specific names used by
     * lab credentials (e.g. Inji `AuthorizedInjiCertificate`: `dob` instead of `birth_date`).
     * Only applied when the wallet already has the synonym under the same namespace — digests stay
     * valid because we ask Multipaz for the **issued** identifier, not a renamed claim.
     */
    private fun resolveWalletElementName(
        requestedElement: String,
        haveInNamespace: Set<String>,
    ): String? {
        if (requestedElement in haveInNamespace) {
            return requestedElement
        }
        val synonym = READER_TO_WALLET_ELEMENT_SYNONYMS[requestedElement] ?: return null
        return synonym.takeIf { it in haveInNamespace }
    }

    /**
     * Rebuilds [deviceRequest] keeping only DocRequests whose `docType` equals [walletDocType]
     * and only `(namespace,dataElement)` entries the certified credential can serve.
     *
     * DocType is matched strictly — we never rewrite `org.iso.18013.5.1.mDL` (or any other
     * requested type) into a different wallet credential (e.g. `AuthorizedInjiCertificate`).
     * A mismatch means the requested credential is not present.
     *
     * For a matching docType, ISO/IEC 18013-5 §8.3.2.1.2 lets the wallet return data for
     * elements it has and omit the rest; this filter is that idea, implemented as a
     * pre-`mdocPresentment` rewrite because [org.multipaz.mdoc.request.DocRequest] uses an
     * `internal` constructor we cannot instantiate. The new [DeviceRequest] is round-tripped
     * through CBOR + `fromDataItem` so the downstream matcher sees a real Multipaz object.
     *
     * `readerAuth` and `readerAuthAll` are dropped because they were signed over the original
     * `itemsRequestBytes`; the tolerant presentment loop already swallows reader-auth failures
     * (see [iso18013PresentmentTolerantReaderAuth]), so omitting them here is consistent and
     * keeps Multipaz from re-running the same DER parse on the same broken `x5chain`.
     *
     * The round-tripped [DeviceRequest] must then have Multipaz's internal "verified" flags set
     * (via [markMultipazDeviceRequestReaderAuthFlagsAfterInjiRewrite]) or [mdocPresentment] throws
     * `readerAuthAll not verified` when building [Requester].
     *
     * @return `null` when no DocRequest matches [walletDocType] or none have overlapping elements.
     */
    private fun filterDeviceRequestToSatisfiable(
        sid: Int,
        deviceRequest: DeviceRequest,
        walletDocType: String,
        walletNamespaces: Map<String, List<String>>,
    ): DeviceRequest? {
        val haveByNs = walletNamespaces.mapValues { (_, els) -> els.toSet() }
        val droppedAll = mutableListOf<String>()
        val keptAny = mutableListOf<String>()
        val synonymRemaps = mutableListOf<String>()
        val docTypeMismatches = mutableListOf<String>()
        val requestedSnapshot = mutableListOf<RequestedElement>()

        val filteredCbor = buildCborMap {
            put("version", deviceRequest.version)
            putCborArray("docRequests") {
                deviceRequest.docRequests.forEachIndexed { docIndex, docRequest ->
                    if (docRequest.docType != walletDocType) {
                        docTypeMismatches.add(docRequest.docType)
                        Log.w(
                            TAG,
                            "runSession#$sid DocRequest[$docIndex] skipped: requested docType " +
                                "`${docRequest.docType}` ≠ wallet credential `$walletDocType` " +
                                "(credential not present for this request).",
                        )
                        return@forEachIndexed
                    }

                    val filteredNamespaces = LinkedHashMap<String, MutableMap<String, Boolean>>()
                    docRequest.nameSpaces.forEach { (ns, els) ->
                        val have = haveByNs[ns] ?: emptySet()
                        val kept = LinkedHashMap<String, Boolean>()
                        els.forEach { (requestedName, intentToRetain) ->
                            val walletName = resolveWalletElementName(requestedName, have)
                            requestedSnapshot.add(
                                RequestedElement(
                                    namespace = ns,
                                    element = requestedName,
                                    intentToRetain = intentToRetain,
                                    servable = walletName != null,
                                    servedAs = walletName?.takeIf { it != requestedName },
                                ),
                            )
                            if (walletName == null) {
                                droppedAll.add("DocRequest[$docIndex] $ns/$requestedName")
                            } else {
                                if (walletName != requestedName) {
                                    synonymRemaps.add(
                                        "DocRequest[$docIndex] $ns/$requestedName→$walletName",
                                    )
                                }
                                kept[walletName] = intentToRetain
                                keptAny.add("DocRequest[$docIndex] $ns/$walletName")
                            }
                        }
                        if (kept.isNotEmpty()) {
                            filteredNamespaces[ns] = kept
                        }
                    }

                    if (filteredNamespaces.isEmpty()) {
                        Log.w(
                            TAG,
                            "runSession#$sid DocRequest[$docIndex] dropped: credential serves none " +
                                "of the requested elements; skipping this DocRequest.",
                        )
                        return@forEachIndexed
                    }

                    val itemsRequest = buildCborMap {
                        // Keep the reader's (and wallet's) docType — never substitute another type.
                        put("docType", docRequest.docType)
                        putCborMap("nameSpaces") {
                            for ((namespaceName, dataElementMap) in filteredNamespaces) {
                                putCborMap(namespaceName) {
                                    for ((dataElementName, intentToRetain) in dataElementMap) {
                                        put(dataElementName, intentToRetain)
                                    }
                                }
                            }
                        }
                    }
                    addCborMap {
                        put(
                            "itemsRequest",
                            Tagged(Tagged.ENCODED_CBOR, Bstr(Cbor.encode(itemsRequest))),
                        )
                        // readerAuth intentionally omitted; original signature would no longer
                        // match the rewritten itemsRequestBytes anyway.
                    }
                }
            }
            // deviceRequestInfo / readerAuthAll intentionally omitted — both are ISO 18013-5
            // Second-Edition features and their `internal` toDataItem helpers aren't visible
            // outside Multipaz. Tap2iD-style readers don't depend on them.
        }

        // Publish the reader's original ask before any early return, so the consent event can
        // report requested-but-dropped elements even when the filter narrows things heavily.
        consentContextRequestedElements = requestedSnapshot

        if (docTypeMismatches.isNotEmpty() && keptAny.isEmpty()) {
            Log.e(
                TAG,
                "runSession#$sid no matching credential: reader asked for " +
                    "${docTypeMismatches.distinct()} but wallet has `$walletDocType`.",
            )
            return null
        }

        if (synonymRemaps.isNotEmpty()) {
            Log.i(
                TAG,
                "runSession#$sid remapped reader element ids to wallet names: $synonymRemaps",
            )
        }

        if (droppedAll.isNotEmpty()) {
            Log.w(
                TAG,
                "runSession#$sid filtered reader request — kept: $keptAny; dropped (not in MSO): " +
                    "$droppedAll. The DeviceResponse will return only the kept elements; the " +
                    "verifier will see the dropped elements as missing.",
            )
        }
        if (keptAny.isEmpty()) {
            Log.w(
                TAG,
                "runSession#$sid no DocRequest elements overlap the certified credential; " +
                    "cannot rewrite request for mdocPresentment.",
            )
            return null
        }

        return try {
            DeviceRequest.fromDataItem(filteredCbor).also { rewritten ->
                // fromDataItem() leaves readerAuthAllVerified=false; mdocPresentment() then calls
                // getRequester() → readerAuthAll getter → IllegalStateException. We intentionally
                // dropped readerAuth* because itemsRequest bytes changed (§8.3.2.1.2 subset response);
                // mirror Multipaz DeviceRequest.Builder.build() which sets verified=true for
                // locally-built requests with no reader signatures to verify.
                markMultipazDeviceRequestReaderAuthFlagsAfterInjiRewrite(rewritten)
            }
        } catch (e: Throwable) {
            if (e is CancellationException) {
                throw e
            }
            Log.w(
                TAG,
                "runSession#$sid failed to re-parse filtered DeviceRequest; falling back to " +
                    "original request (mdocPresentment may still throw).",
                e,
            )
            null
        }
    }

    /**
     * Mirror of [org.multipaz.presentment.Iso18013Presentment] (`Iso18013Presentment.kt`) with one
     * change: [DeviceRequest.verifyReaderAuthentication] is wrapped in a try/catch so a malformed
     * COSE `x5chain` from the reader (Tap2iD encodes the whole DER chain in a single `bstr`)
     * downgrades to a warning instead of terminating the session. The rest of the loop —
     * `SessionEncryption`, [mdocPresentment], encrypted reply, session termination — is the same as
     * upstream so we keep parity with Multipaz behaviour everywhere else.
     */
    private suspend fun iso18013PresentmentTolerantReaderAuth(
        sid: Int,
        transport: MdocTransport,
        eDeviceKey: EcPrivateKeyDoubleCoordinate,
        deviceEngagement: DataItem,
        handover: DataItem,
        source: SimplePresentmentSource,
        keyAgreementPossible: List<EcCurve>,
        walletDocType: String,
        walletNamespaces: Map<String, List<String>>,
        timeout: Duration? = 10.seconds,
        timeoutSubsequentRequests: Duration? = 30.seconds,
    ) {
        transport.state.first {
            it == MdocTransport.State.CONNECTED ||
                it == MdocTransport.State.FAILED ||
                it == MdocTransport.State.CLOSED
        }
        if (transport.state.value != MdocTransport.State.CONNECTED) {
            throw IllegalStateException(
                "Expected state CONNECTED but found ${transport.state.value}",
            )
        }
        var numRequestsServed = 0
        var sendSessionTermination = true
        try {
            var sessionEncryption: SessionEncryption? = null
            lateinit var eReaderKey: EReaderKey
            lateinit var sessionTranscript: DataItem
            while (true) {
                Log.i(TAG, "runSession#$sid Iso18013Presentment: waiting for DeviceRequest…")
                val timeoutToUse = if (numRequestsServed == 0) timeout else timeoutSubsequentRequests
                val sessionData = if (timeoutToUse == null) {
                    transport.waitForMessage()
                } else {
                    try {
                        withTimeout(timeoutToUse) { transport.waitForMessage() }
                    } catch (e: TimeoutCancellationException) {
                        throw Iso18013PresentmentTimeoutException(
                            "Timed out waiting for message from remote reader",
                            e,
                        )
                    }
                }
                if (sessionData.isEmpty()) {
                    Log.i(TAG, "runSession#$sid received transport-specific session termination from reader")
                    sendSessionTermination = false
                    break
                }
                if (sessionEncryption == null) {
                    eReaderKey = SessionEncryption.getEReaderKey(sessionData)
                    sessionTranscript = buildCborArray {
                        add(Tagged(Tagged.ENCODED_CBOR, Bstr(Cbor.encode(deviceEngagement))))
                        add(Tagged(Tagged.ENCODED_CBOR, Bstr(eReaderKey.encodedCoseKey)))
                        add(handover)
                    }
                    sessionEncryption = SessionEncryption(
                        MdocRole.MDOC,
                        eDeviceKey,
                        eReaderKey.publicKey,
                        Cbor.encode(sessionTranscript),
                    )
                }
                val (encodedDeviceRequest, status) = sessionEncryption.decryptMessage(sessionData)
                if (status == Constants.SESSION_DATA_STATUS_SESSION_TERMINATION) {
                    Log.i(TAG, "runSession#$sid received session termination from reader")
                    sendSessionTermination = false
                    break
                }
                val originalDeviceRequest =
                    DeviceRequest.fromDataItem(Cbor.decode(encodedDeviceRequest!!))
                rememberConsentContextFromDeviceRequest(originalDeviceRequest, encodedDeviceRequest, walletDocType)
                logDocRequestDiffAgainstCredential(
                    sid = sid,
                    deviceRequest = originalDeviceRequest,
                    walletDocType = walletDocType,
                    walletNamespaces = walletNamespaces,
                )
                try {
                    originalDeviceRequest.verifyReaderAuthentication(sessionTranscript)
                    Log.i(TAG, "runSession#$sid reader authentication OK")
                } catch (e: Throwable) {
                    if (e is CancellationException) {
                        throw e
                    }
                    // Tap2iD-style concatenated DER `x5chain` lands here as
                    // `SignatureVerificationException` caused by
                    // `IllegalArgumentException: "-N bytes leftover after decoding"`. ISO/IEC
                    // 18013-5 §9.1.4 makes reader auth optional, so we serve the request anyway.
                    // If a deployment needs strict reader auth, re-throw here and the verifier
                    // will be cut off exactly as `Iso18013Presentment` does upstream.
                    Log.w(
                        TAG,
                        "runSession#$sid skipping reader authentication failure (Tap2iD-style " +
                            "non-standard COSE x5chain). Returning DeviceResponse without verifying " +
                            "the reader certificate chain; reader app may still flag this.",
                        e,
                    )
                }
                // Keep only DocRequests that match this credential's docType, and within those
                // only elements the MSO can serve (§8.3.2.1.2 subset). Never rewrite docType to a
                // different credential (e.g. mDL → AuthorizedInjiCertificate).
                val deviceRequest =
                    filterDeviceRequestToSatisfiable(
                        sid = sid,
                        deviceRequest = originalDeviceRequest,
                        walletDocType = walletDocType,
                        walletNamespaces = walletNamespaces,
                    )
                if (deviceRequest == null) {
                    val requestedDocTypes =
                        originalDeviceRequest.docRequests.map { it.docType }.distinct()
                    val docTypeMismatch = requestedDocTypes.none { it == walletDocType }
                    val reason = if (docTypeMismatch) {
                        "credential_not_present"
                    } else {
                        "no_overlapping_elements"
                    }
                    val message = if (docTypeMismatch) {
                        "Requested credential type(s) $requestedDocTypes not present " +
                            "(wallet has `$walletDocType`)"
                    } else {
                        "No overlapping elements between reader request and certified credential " +
                            "(`$walletDocType`)"
                    }
                    Log.e(TAG, "runSession#$sid $message")
                    emitCannotSatisfyRequest(
                        reason = reason,
                        requestedDocTypes = requestedDocTypes,
                        walletDocType = walletDocType,
                    )
                    throw PresentmentCannotSatisfyRequestException(
                        message,
                        IllegalStateException(message),
                    )
                }
                Log.i(TAG, "runSession#$sid Iso18013Presentment: building DeviceResponse / consent…")
                val responseObject = mdocPresentment(
                    deviceRequest = deviceRequest,
                    eReaderKey = eReaderKey.publicKey,
                    sessionTranscript = sessionTranscript,
                    source = source,
                    keyAgreementPossible = keyAgreementPossible,
                    requesterAppId = null,
                    requesterOrigin = null,
                    onWaitingForUserInput = {
                        Log.i(
                            TAG,
                            "runSession#$sid Iso18013Presentment: waiting for user input / consent…",
                        )
                    },
                    onDocumentsInFocus = {},
                )
                Log.i(TAG, "runSession#$sid Iso18013Presentment: sending DeviceResponse…")
                
                // Intercept and inject custom purposes into the DeviceResponse CBOR
                var finalDeviceResponseDataItem = responseObject.deviceResponse.toDataItem()
                if (consentContextPurposesJson != null) {
                    try {
                        val originalMap = finalDeviceResponseDataItem.asMap
                        val newBuilder = org.multipaz.cbor.CborMap.builder()
                        for ((key, value) in originalMap) {
                            newBuilder.put(key, value)
                        }
                        
                        val purposesArray = org.json.JSONArray(consentContextPurposesJson)
                        val cborPurposes = org.multipaz.cbor.CborArray.builder()
                        for (i in 0 until purposesArray.length()) {
                            val purposeObj = purposesArray.getJSONObject(i)
                            val mapBuilder = org.multipaz.cbor.CborMap.builder()
                            mapBuilder.put("id", purposeObj.optString("id", purposeObj.getString("name")))
                            mapBuilder.put("name", purposeObj.getString("name"))
                            mapBuilder.put("accepted", purposeObj.getBoolean("accepted"))
                            cborPurposes.add(mapBuilder.end().build())
                        }
                        newBuilder.put("purposes", cborPurposes.end().build())
                        finalDeviceResponseDataItem = newBuilder.end().build()
                        Log.i(TAG, "runSession#$sid [DEBUG] Injected purposes into DeviceResponse!")
                    } catch (e: Exception) {
                        Log.e(TAG, "runSession#$sid Failed to inject purposes into DeviceResponse", e)
                    }
                }

                // Log the final outgoing payload
                try {
                    val finalJson = dataItemToJson(finalDeviceResponseDataItem)
                    val prettified = org.json.JSONObject(finalJson).toString(2)
                    Log.i(TAG, "[DEBUG] Outgoing DeviceResponse:\n$prettified")
                } catch (e: Exception) {
                    Log.i(TAG, "[DEBUG] Outgoing DeviceResponse (Failed to format as JSON)")
                }

                transport.sendMessage(
                    sessionEncryption.encryptMessage(
                        messagePlaintext = org.multipaz.cbor.Cbor.encode(finalDeviceResponseDataItem),
                        statusCode = null,
                    ),
                )
                numRequestsServed += 1
                Log.i(TAG, "runSession#$sid response sent, keeping connection open")
                emitJsEvent(EVENT_RESPONSE_SENT, Arguments.createMap())
                emitConsentDismissed()
            }
        } finally {
            if (sendSessionTermination) {
                Log.i(TAG, "runSession#$sid sending session-termination")
                try {
                    transport.sendMessage(
                        SessionEncryption.encodeStatus(Constants.SESSION_DATA_STATUS_SESSION_TERMINATION),
                    )
                } catch (e: Exception) {
                    if (e is CancellationException) {
                        throw e
                    }
                    Log.w(TAG, "runSession#$sid error while sending session-termination", e)
                }
            }
            emitConsentDismissed()
        }
    }

    private fun buildEphemeralPrivate(
        de: DeviceEngagement,
        d32: ByteArray,
    ): EcPrivateKeyDoubleCoordinate {
        require(d32.size == 32) { "ephemeral P-256 private key must be 32 bytes" }
        val pub = de.eDeviceKey as EcPublicKeyDoubleCoordinate
        return EcPrivateKeyDoubleCoordinate(EcCurve.P256, d32.copyOf(32), pub.x, pub.y)
    }

    companion object {
        private const val TAG = "InjiIso18013Proximity"
        const val EVENT_CONSENT_REQUIRED = "MdocPresentmentConsentRequired"
        const val EVENT_CONSENT_DISMISSED = "MdocPresentmentConsentDismissed"
        const val EVENT_CANNOT_SATISFY = "MdocPresentmentCannotSatisfy"
        const val EVENT_READER_CONNECTED = "MdocPresentmentReaderConnected"

        /**
         * Emitted only once the encrypted DeviceResponse has actually been handed to the
         * transport — i.e. after DeviceAuth signing (and therefore after the keystore
         * biometric prompt) succeeded. EVENT_CONSENT_DISMISSED fires on both the success
         * and the teardown paths, so JS cannot use it alone to tell a completed share from
         * a cancelled/failed one; this event is that missing signal.
         */
        const val EVENT_RESPONSE_SENT = "MdocPresentmentResponseSent"
        private val sessionSeq = AtomicInteger(0)

        /** Values commonly encoded at BLE option key 21 for QR interop (not Bluetooth L2CAP PSM). */
        private val TAP2ID_PAIRING_HINT_KEY21 = setOf(128, 130)

        /**
         * Stock Multipaz Verifier / ISO mDL element ids → common Inji / custom-issuer names under
         * the same `org.iso.18013.5.1` namespace (AuthorizedInjiCertificate and similar).
         */
        private val READER_TO_WALLET_ELEMENT_SYNONYMS: Map<String, String> = mapOf(
            "birth_date" to "dob",
            "family_name" to "sur_name",
            "given_name" to "other_names",
            "document_number" to "id_number",
            "expiry_date" to "date_of_expiry",
            "issue_date" to "doi",
            "portrait" to "photo",
        )
    }
}
