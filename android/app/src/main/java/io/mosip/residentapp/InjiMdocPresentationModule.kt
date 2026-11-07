package io.mosip.residentapp

import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.mosip.openID4VP.mdoc.MdocProximity
import io.mosip.openID4VP.mdoc.MdocSigningInput
import io.mosip.tuvali.iso.MdocCallbacks
import io.mosip.tuvali.iso.MdocFailure
import io.mosip.tuvali.iso.MdocPresentationOptions
import io.mosip.tuvali.iso.MdocPresenter
import io.mosip.tuvali.iso.MdocProgress
import io.mosip.tuvali.iso.MdocRequest
import io.mosip.tuvali.iso.MdocResult
import io.mosip.tuvali.iso.MdocSharingDecision
import io.mosip.tuvali.iso.ReaderTrustStatus
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import kotlin.time.Duration.Companion.seconds

private const val ERROR_CODE = "MDOC_PRESENTATION_ERROR"
private const val BASE64URL = Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING

/**
 * In-person (ISO 18013-5 proximity) mdoc presentation for JS: Tuvali's MdocPresenter runs the
 * session with the reader, OpenID4VP's MdocProximity builds the signed DeviceResponse. JS shows the
 * QR code, decides on each request (sendMdocDecisionFromJS) and signs (sendMdocSignatureFromJS).
 * The session transcript never leaves native code.
 */
class InjiMdocPresentationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    // created on first use: creating Tuvali's Bluetooth objects needs nothing from JS
    private val presenter by lazy { MdocPresenter(reactContext) }
    @Volatile private var pendingDecision: CompletableDeferred<JSONObject>? = null
    @Volatile private var pendingSignature: CompletableDeferred<JSONObject>? = null

    override fun getName() = "InjiMdocPresentation"

    /** Runs one presentation; resolves with the result as JSON, rejects if it cannot start. */
    @ReactMethod
    fun present(optionsJson: String, promise: Promise) {
        scope.launch {
            try {
                val result = presenter.present(parseOptions(JSONObject(optionsJson)), callbacks)
                promise.resolve(resultJson(result).toString())
            } catch (exception: Exception) {
                promise.reject(ERROR_CODE, exception.message, exception)
            } finally {
                pendingDecision = null
                pendingSignature = null
            }
        }
    }

    @ReactMethod
    fun cancel() {
        presenter.cancel()
    }

    @ReactMethod
    fun sendMdocDecisionFromJS(decisionJson: String) {
        pendingDecision?.complete(JSONObject(decisionJson))
    }

    @ReactMethod
    fun sendMdocSignatureFromJS(signatureJson: String) {
        pendingSignature?.complete(JSONObject(signatureJson))
    }

    // required by NativeEventEmitter on Android
    @ReactMethod
    fun addListener(eventName: String) = Unit

    @ReactMethod
    fun removeListeners(count: Int) = Unit

    private val callbacks = object : MdocCallbacks {
        override suspend fun onQrReady(qrText: String) {
            emit("onMdocQrReady", Arguments.createMap().apply { putString("qrText", qrText) })
        }

        override fun onProgress(progress: MdocProgress) {
            emit("onMdocProgress", Arguments.createMap().apply { putString("progress", camelCase(progress.name)) })
        }

        override suspend fun onRequest(request: MdocRequest): MdocSharingDecision {
            val decision = CompletableDeferred<JSONObject>().also { pendingDecision = it }
            emit("onMdocRequest", Arguments.createMap().apply { putString("request", requestJson(request).toString()) })
            val answer = decision.await()
            return when {
                answer.has("error") -> throw IllegalStateException(answer.getString("error"))
                answer.optBoolean("decline") -> MdocSharingDecision.Decline
                else -> MdocSharingDecision.Send(
                    MdocProximity.buildDeviceResponse(request.sessionTranscript, stringsOf(answer.getJSONArray("share")), ::sign)
                )
            }
        }
    }

    /** Asks JS to sign with the wallet's key; returns the raw signature. */
    private suspend fun sign(input: MdocSigningInput): ByteArray {
        val signature = CompletableDeferred<JSONObject>().also { pendingSignature = it }
        emit("onMdocSignRequest", Arguments.createMap().apply {
            putString("dataToSign", Base64.encodeToString(input.dataToSign, BASE64URL))
            putString("signatureAlgorithm", input.signatureAlgorithm)
            putString("holderKeyReference", input.holderKeyReference)
        })
        val answer = signature.await()
        if (answer.has("error")) throw IllegalStateException(answer.getString("error"))
        return Base64.decode(answer.getString("signature"), BASE64URL)
    }

    private fun emit(eventName: String, params: WritableMap) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(eventName, params)
    }

    private fun parseOptions(json: JSONObject): MdocPresentationOptions {
        val defaults = MdocPresentationOptions()
        val roots = json.optJSONArray("trustedReaderRoots")?.let(::stringsOf).orEmpty()
        return MdocPresentationOptions(
            trustedReaderRoots = roots.map { Base64.decode(it, Base64.DEFAULT) },
            engagementTimeout = json.optLongOrNull("engagementTimeoutSeconds")?.seconds ?: defaults.engagementTimeout,
            inactivityTimeout = json.optLongOrNull("inactivityTimeoutSeconds")?.seconds ?: defaults.inactivityTimeout,
        )
    }

    private fun requestJson(request: MdocRequest) = JSONObject().apply {
        put("requestNumber", request.requestNumber)
        put("documents", JSONArray(request.documents.map { document ->
            JSONObject().apply {
                put("docType", document.docType)
                put("nameSpaces", JSONObject(document.nameSpaces.mapValues { (_, elements) -> JSONObject(elements) }))
                put("readerTrust", trustJson(document.readerTrust))
            }
        }))
    }

    private fun trustJson(trust: ReaderTrustStatus) = JSONObject().apply {
        when (trust) {
            ReaderTrustStatus.NotSigned -> put("status", "notSigned")
            is ReaderTrustStatus.Verified -> put("status", "verified").put("readerName", trust.readerName)
            is ReaderTrustStatus.Unverified ->
                put("status", "unverified").put("readerName", trust.readerName).put("reason", trust.reason)
            is ReaderTrustStatus.Invalid -> put("status", "invalid").put("reason", trust.reason)
        }
    }

    private fun resultJson(result: MdocResult) = JSONObject().apply {
        when (result) {
            is MdocResult.Completed -> put("status", "completed").put("confirmedByReader", result.confirmedByReader)
            MdocResult.Declined -> put("status", "declined")
            MdocResult.Cancelled -> put("status", "cancelled")
            is MdocResult.Failed -> put("status", "failed").put("failure", failureName(result.failure)).put("detail", result.detail)
        }
    }

    private fun failureName(failure: MdocFailure) = camelCase(failure.name)

    /** NO_READER_FOUND → noReaderFound, matching the iOS names. */
    private fun camelCase(name: String): String {
        val words = name.lowercase().split('_')
        return words.first() + words.drop(1).joinToString("") { word -> word.replaceFirstChar(Char::uppercase) }
    }

    private fun stringsOf(array: JSONArray) = (0 until array.length()).map { array.getString(it) }

    private fun JSONObject.optLongOrNull(key: String): Long? = if (has(key) && !isNull(key)) getLong(key) else null
}
