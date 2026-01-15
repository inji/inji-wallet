package io.mosip.residentapp

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import io.mosip.openID4VP.authorizationRequest.AuthorizationRequest
import io.mosip.openID4VP.authorizationResponse.toJsonString
import io.mosip.openID4VP.authorizationResponse.unsignedVPToken.UnsignedVPToken
import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.VPTokenSigningResult
import io.mosip.openID4VP.constants.FormatType
import io.mosip.residentapp.utils.JsonConverter
import io.mosip.vciclient.token.TokenResponse
import kotlinx.coroutines.CompletableDeferred

object VCIClientCallbackBridge {
    private const val TAG = "VCIClientCallbackBridge"
    private val gson = Gson()
    private var deferredProof: CompletableDeferred<String>? = null
    private var deferredAuthCode: CompletableDeferred<String>? = null
    private var deferredTxCode: CompletableDeferred<String>? = null
    private var deferredAuthCodeResult: CompletableDeferred<Map<String, Any>>? = null
    private var deferredPresentationRequest:
            CompletableDeferred<Map<String, Map<FormatType, List<Any>>>>? =
            null
    private var deferredSignedVPToken: CompletableDeferred<Map<FormatType, VPTokenSigningResult>>? =
            null
    private var deferredIssuerTrustResponse: CompletableDeferred<Boolean>? = null
    private var deferredTokenResponse: CompletableDeferred<TokenResponse>? = null

    fun createPresentationRequestDeferred():
            CompletableDeferred<Map<String, Map<FormatType, List<Any>>>> {
        deferredPresentationRequest = CompletableDeferred()
        return deferredPresentationRequest!!
    }

    @JvmStatic
    fun abortPresentationFlow(exception: Throwable) {
        deferredPresentationRequest?.completeExceptionally(exception)
        deferredSignedVPToken?.completeExceptionally(exception)

        deferredPresentationRequest = null
        deferredSignedVPToken = null
    }

    fun emitPresentationRequest(
            context: ReactApplicationContext,
            presentationRequest: AuthorizationRequest
    ) {
        val presentationRequestJson: String? = JsonConverter.toJson(presentationRequest)
        val params: WritableMap? =
                Arguments.createMap().apply {
                    putString("presentationRequest", presentationRequestJson)
                }
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onPresentationRequest", params)
    }

    suspend fun awaitSelectedCredentialsForPresentationRequest():
            Map<String, Map<FormatType, List<Any>>> {
        return deferredPresentationRequest?.await()
                ?: throw IllegalStateException("No selected credentials callback was set")
    }

    fun createSignedVPTokenDeferred(): CompletableDeferred<Map<FormatType, VPTokenSigningResult>> {
        deferredSignedVPToken = CompletableDeferred()
        return deferredSignedVPToken!!
    }

    fun emitSignedVPTokenRequest(
            context: ReactApplicationContext,
            payload: Map<FormatType, UnsignedVPToken>
    ) {
        val params =
                Arguments.createMap().apply {
                    putString("vpTokenSigningRequest", payload.toJsonString())
                }
        android.util.Log.d(TAG, "Emitting signed VP token request to JS")
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onRequestSignedVPToken", params)
    }

    suspend fun awaitSignedVPToken(): Map<FormatType, VPTokenSigningResult> {
        return deferredSignedVPToken?.await()
                ?: throw IllegalStateException("No signed VP token callback was set")
    }

    fun createAuthCodeResultDeferred(): CompletableDeferred<Map<String, Any>> {
        deferredAuthCodeResult = CompletableDeferred()
        return deferredAuthCodeResult!!
    }

    suspend fun awaitAuthCodeResult(): Map<String, Any?> {
        return deferredAuthCodeResult?.await()
                ?: throw IllegalStateException("No auth code callback was set")
    }

    fun createProofDeferred(): CompletableDeferred<String> {
        deferredProof = CompletableDeferred()
        return deferredProof!!
    }

    fun createAuthCodeDeferred(): CompletableDeferred<String> {
        deferredAuthCode = CompletableDeferred()
        return deferredAuthCode!!
    }

    fun createTokenResponseDeferred(): CompletableDeferred<TokenResponse> {
        deferredTokenResponse = CompletableDeferred()
        return deferredTokenResponse!!
    }

    fun createTxCodeDeferred(): CompletableDeferred<String> {
        deferredTxCode = CompletableDeferred()
        return deferredTxCode!!
    }

    fun createIssuerTrustResponseDeferred(): CompletableDeferred<Boolean> {
        deferredIssuerTrustResponse = CompletableDeferred()
        return deferredIssuerTrustResponse!!
    }

    fun emitRequestProof(
            context: ReactApplicationContext,
            credentialIssuer: String,
            cNonce: String?,
            proofSigningAlgorithmsSupported: List<String>,
    ) {
        val params =
                Arguments.createMap().apply {
                    putString("credentialIssuer", credentialIssuer)
                    if (cNonce != null) putString("cNonce", cNonce)
                    val json = gson.toJson(proofSigningAlgorithmsSupported)
                    putString("proofSigningAlgorithmsSupported", json)
                }
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onRequestProof", params)
    }

    fun emitRequestAuthCode(context: ReactApplicationContext, authorizationEndpoint: String) {
        val params =
                Arguments.createMap().apply { putString("authorizationUrl", authorizationEndpoint) }
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onRequestAuthCode", params)
    }

    fun emitTokenRequest(context: ReactApplicationContext, payload: Map<String, Any?>) {
        val params = Arguments.createMap().apply { putString("tokenRequest", gson.toJson(payload)) }
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onRequestTokenResponse", params)
    }

    fun emitRequestTxCode(
            context: ReactApplicationContext,
            inputMode: String?,
            description: String?,
            length: Int?
    ) {
        val params =
                Arguments.createMap().apply {
                    putString("inputMode", inputMode)
                    putString("description", description)
                    if (length != null) putInt("length", length)
                }
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onRequestTxCode", params)
    }

    fun emitRequestIssuerTrust(
            context: ReactApplicationContext,
            credentialIssuer: String,
            issuerDisplay: List<Map<String, Any>>
    ) {
        val params =
                Arguments.createMap().apply {
                    putString("credentialIssuer", credentialIssuer)
                    putString("issuerDisplay", gson.toJson(issuerDisplay))
                }

        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onCheckIssuerTrust", params)
    }

    @JvmStatic
    fun completeProof(jwt: String) {
        deferredProof?.complete(jwt)
        deferredProof = null
    }

    @JvmStatic
    fun completePresentationRequest(selectedVCs: Map<String, Map<FormatType, List<Object>>>) {
        deferredPresentationRequest?.complete(selectedVCs)
        android.util.Log.d(TAG, "Completed presentation request")
        deferredPresentationRequest = null
    }

    @JvmStatic
    fun completeSignDataForVP(vpTokenSigningResult: MutableMap<FormatType, VPTokenSigningResult>) {
        deferredSignedVPToken?.complete(vpTokenSigningResult)
        android.util.Log.d(TAG, "Completed signed VP token")
        deferredSignedVPToken = null
    }

    @JvmStatic
    fun completeAuthCode(code: String) {
        deferredAuthCode?.complete(code)
        deferredAuthCode = null
    }

    @JvmStatic
    fun completeAuthCodeResult(result: Map<String, Any>) {
        deferredAuthCodeResult?.complete(result)
        deferredAuthCodeResult = null
    }

    @JvmStatic
    fun completeTxCode(code: String) {
        deferredTxCode?.complete(code)
        deferredTxCode = null
    }

    @JvmStatic
    fun completeTokenResponse(tokenResponse: TokenResponse) {
        deferredTokenResponse?.complete(tokenResponse)
        deferredTokenResponse = null
    }

    @JvmStatic
    fun completeIssuerTrustResponse(trusted: Boolean) {
        deferredIssuerTrustResponse?.complete(trusted)
        deferredIssuerTrustResponse = null
    }

    suspend fun awaitProof(): String {
        return deferredProof?.await() ?: throw IllegalStateException("No proof callback was set")
    }

    suspend fun awaitAuthCode(): String {
        return deferredAuthCode?.await()
                ?: throw IllegalStateException("No auth code callback was set")
    }

    suspend fun awaitTokenResponse(): TokenResponse {
        return deferredTokenResponse?.await()
                ?: throw IllegalStateException("No TokenResponse callback was set")
    }

    suspend fun awaitTxCode(): String {
        return deferredTxCode?.await() ?: throw IllegalStateException("No tx code callback was set")
    }

    suspend fun awaitIssuerTrustResponse(): Boolean {
        return deferredIssuerTrustResponse?.await()
                ?: throw IllegalStateException("No issuer trust response callback was set")
    }
}
