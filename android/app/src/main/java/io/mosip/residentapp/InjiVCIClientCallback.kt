package io.mosip.residentapp

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.Gson
import kotlinx.coroutines.CompletableDeferred

object VCIClientCallbackBridge {
    private var deferredProof: CompletableDeferred<String>? = null
    private var deferredAuthCode: CompletableDeferred<String>? = null
    private var deferredTxCode: CompletableDeferred<String>? = null
    private var deferredIssuerTrustResponse: CompletableDeferred<Boolean>? = null

    fun createProofDeferred(): CompletableDeferred<String> {
        deferredProof = CompletableDeferred()
        return deferredProof!!
    }

    fun createAuthCodeDeferred(): CompletableDeferred<String> {
        deferredAuthCode = CompletableDeferred()
        return deferredAuthCode!!
    }

    fun createTxCodeDeferred(): CompletableDeferred<String> {
        deferredTxCode = CompletableDeferred()
        return deferredTxCode!!
    }

    fun createIsuerTrustResponseDeferred(): CompletableDeferred<Boolean> {
        deferredIssuerTrustResponse = CompletableDeferred()
        return deferredIssuerTrustResponse!!
    }

    fun emitRequestProof(
            context: ReactApplicationContext,
            accessToken: String,
            cNonce: String?,
            issuerMetadata: Map<String, *>? = null,
            credentialConfigurationId: String? = null
    ) {
        val params =
                Arguments.createMap().apply {
                    putString("accessToken", accessToken)
                    if (cNonce != null) putString("cNonce", cNonce)
                    if (issuerMetadata != null) {
                        val json = Gson().toJson(issuerMetadata)
                        putString("issuerMetadata", json)
                    }
                    if (credentialConfigurationId != null) {
                        putString("credentialConfigurationId", credentialConfigurationId)
                    }
                }
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onRequestProof", params)
    }

    fun emitRequestAuthCode(context: ReactApplicationContext, authorizationEndpoint: String) {
        val params =
                Arguments.createMap().apply {
                    putString("authorizationEndpoint", authorizationEndpoint)
                }
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onRequestAuthCode", params)
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
                    if( length != null)
                    putInt("length", length)
                }
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onRequestTxCode", params)
    }
    fun emitRequestIssuerTrust(context: ReactApplicationContext, issuerMetadata: Map<String, *>) {
        val params =
                Arguments.createMap().apply {
                    putString("issuerMetadata", Gson().toJson(issuerMetadata))
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
    fun completeAuthCode(code: String) {
        deferredAuthCode?.complete(code)
        deferredAuthCode = null
    }
    @JvmStatic
    fun completeTxCode(code: String) {
        deferredTxCode?.complete(code)
        deferredTxCode = null
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

    suspend fun awaitTxCode(): String {
        return deferredTxCode?.await() ?: throw IllegalStateException("No tx code callback was set")
    }

    suspend fun awaitIssuerTrustResponse(): Boolean {
        return deferredIssuerTrustResponse?.await()
                ?: throw IllegalStateException("No issuer trust response callback was set")
    }
}
