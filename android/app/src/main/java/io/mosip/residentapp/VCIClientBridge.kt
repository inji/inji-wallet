package io.mosip.residentapp

import com.facebook.react.bridge.ReactApplicationContext
import io.mosip.openID4VP.authorizationRequest.AuthorizationRequest
import io.mosip.openID4VP.authorizationResponse.unsignedVPToken.UnsignedVPToken
import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.VPTokenSigningResult
import io.mosip.openID4VP.constants.FormatType
import io.mosip.vciclient.VCIClient
import io.mosip.vciclient.authorizationCodeFlow.clientMetadata.ClientMetadata
import io.mosip.vciclient.authorizationCodeFlow.interactiveAuth.AuthorizationHandler
import io.mosip.vciclient.authorizationCodeFlow.interactiveAuth.AuthorizationResponse
import io.mosip.vciclient.authorizationCodeFlow.interactiveAuth.PresentationAuthorizationHandler
import io.mosip.vciclient.authorizationCodeFlow.interactiveAuth.WebAuthorizationHandler
import io.mosip.vciclient.credential.response.CredentialResponse
import io.mosip.vciclient.token.TokenRequest
import io.mosip.vciclient.token.TokenResponse
import io.mosip.vciclient.constants.AuthorizeUserCallback
import io.mosip.vciclient.constants.ProofJwtCallback
import kotlinx.coroutines.runBlocking

object VCIClientBridge {

    // Must be set by the Java side (InjiVciClientModule) to emit events to JS
    lateinit var reactContext: ReactApplicationContext

    @JvmStatic
    fun requestCredentialByOfferSync(
            client: VCIClient,
            offer: String,
            clientMetaData: ClientMetadata
    ): CredentialResponse = runBlocking {
        client.requestCredentialByCredentialOffer(
                credentialOffer = offer,
                clientMetadata = clientMetaData,
                getTxCode = getTxCodeCallback(),
                authorizeUser = authorizeUserCallback(),
                getTokenResponse = getTokenResponseCallback(),
                getProofJwt = getProofJwtCallback(),
                onCheckIssuerTrust = onCheckIssuerTrustCallback()
        )
    }

    @JvmStatic
    fun requestCredentialByOfferSyncV2(
        client: VCIClient,
        offer: String,
        clientMetaData: ClientMetadata
    ): CredentialResponse = runBlocking {
        client.fetchCredentialByCredentialOfferV2(
            credentialOffer = offer,
            clientMetadata = clientMetaData,
            getTxCode = getTxCodeCallback(),
            authorizations = authorizations(),
            getTokenResponse = getTokenResponseCallback(),
            getProofJwt = getProofJwtCallback(),
            onCheckIssuerTrust = onCheckIssuerTrustCallback()
        )
    }

    //TODO: Move all private functions to the end of the class (Ordering)
    private fun authorizations(): List<AuthorizationHandler> {
//        val webAuthorizationHandler =
//            WebAuthorizationHandler(openWebPageCallback() as (String) -> AuthorizationResponse)
        val presentationAuthorizationHandler = PresentationAuthorizationHandler(
            handlePresentationRequest = getHandlePresentationRequestCallback(),
            signVerifiablePresentation = getSignVerifiablePresentationCallback(),
            trustedVerifiers = listOf(),
            holderId = "did:jwk:e...Q==#0",
            signatureSuite = "JsonWebSignature2020",
            shouldValidateClient = false,
//            openId4vp = TODO(),
            handlePresentationTimeoutMs = 3 * 60 * 1000L,
            signVPTokensTimeoutMs = 3 * 60 * 1000L
        )
        val authorizations = listOf<AuthorizationHandler>(
            presentationAuthorizationHandler,
//            webAuthorizationHandler
        )

        return authorizations
    }

    private fun getHandlePresentationRequestCallback() : suspend (AuthorizationRequest) -> Map<String, Map<FormatType, List<Any>>> = { authorizationRequest ->
        VCIClientCallbackBridge.createPresentationRequestDeferred()
        VCIClientCallbackBridge.emitPresentationRequest(reactContext, authorizationRequest)
        VCIClientCallbackBridge.awaitSelectedCredentialsForPresentationRequest()
    }

    private fun getSignVerifiablePresentationCallback() : suspend (Map<FormatType, UnsignedVPToken>) -> Map<FormatType, VPTokenSigningResult> = { payload ->
        VCIClientCallbackBridge.createSignedVPTokenDeferred()
        VCIClientCallbackBridge.emitSignedVPTokenRequest(reactContext, payload)
        VCIClientCallbackBridge.awaitSignedVPToken()
    }

    private fun openWebPageCallback(): suspend (String) -> AuthorizationResponse = { endpoint ->
        VCIClientCallbackBridge.createAuthCodeDeferredV2()
        VCIClientCallbackBridge.emitRequestAuthCode(reactContext, endpoint)
        val authCode = VCIClientCallbackBridge.awaitAuthCodeV2()
        AuthorizationResponse(
            authorizationCode = authCode["code"] as String?,
            status = authCode["status"] as String?,
            error = authCode["error"] as String?,
            errorDescription = authCode["errorDescription"] as String?
        )
    }

    @JvmStatic
    fun requestCredentialFromTrustedIssuerSync(
            client: VCIClient,
            credentialIssuer: String,
            credentialConfigurationId: String,
            clientMetaData: ClientMetadata
    ): CredentialResponse = runBlocking {
        client.requestCredentialFromTrustedIssuer(
                credentialIssuer,
                credentialConfigurationId,
                clientMetaData,
                authorizeUser = authorizeUserCallback(),
                getTokenResponse = getTokenResponseCallback(),
                getProofJwt = getProofJwtCallback(),
        )
    }

    private fun authorizeUserCallback(): AuthorizeUserCallback = { endpoint ->
        VCIClientCallbackBridge.createAuthCodeDeferred()
        VCIClientCallbackBridge.emitRequestAuthCode(reactContext, endpoint)
        VCIClientCallbackBridge.awaitAuthCode()
    }

    private fun getProofJwtCallback(): ProofJwtCallback =
            {
                    credentialIssuer: String,
                    cNonce: String?,
                    proofSigningAlgorithmsSupported: List<String> ->
                VCIClientCallbackBridge.createProofDeferred()
                VCIClientCallbackBridge.emitRequestProof(
                        reactContext,
                        credentialIssuer,
                        cNonce,
                        proofSigningAlgorithmsSupported
                )
                VCIClientCallbackBridge.awaitProof()
            }

    private fun getTokenResponseCallback(): suspend (tokenRequest: TokenRequest) -> TokenResponse =
            { tokenRequest ->
                val payload: Map<String, Any?> =
                        mapOf(
                                "grantType" to tokenRequest.grantType.value,
                                "tokenEndpoint" to tokenRequest.tokenEndpoint,
                                "authCode" to tokenRequest.authCode,
                                "preAuthCode" to tokenRequest.preAuthCode,
                                "txCode" to tokenRequest.txCode,
                                "clientId" to tokenRequest.clientId,
                                "redirectUri" to tokenRequest.redirectUri,
                                "codeVerifier" to tokenRequest.codeVerifier
                        )
                VCIClientCallbackBridge.createTokenResponseDeferred()
                VCIClientCallbackBridge.emitTokenRequest(reactContext, payload)
                VCIClientCallbackBridge.awaitTokenResponse()
            }

    private fun getTxCodeCallback(): suspend (String?, String?, Int?) -> String =
            { inputMode, description, length ->
                VCIClientCallbackBridge.createTxCodeDeferred()
                VCIClientCallbackBridge.emitRequestTxCode(
                        reactContext,
                        inputMode,
                        description,
                        length
                )
                VCIClientCallbackBridge.awaitTxCode()
            }

    private fun onCheckIssuerTrustCallback(): suspend (String, List<Map<String, Any>>) -> Boolean =
            { credentialIssuer, issuerDisplay ->
                VCIClientCallbackBridge.createIssuerTrustResponseDeferred()
                VCIClientCallbackBridge.emitRequestIssuerTrust(
                        reactContext,
                        credentialIssuer,
                        issuerDisplay
                )
                VCIClientCallbackBridge.awaitIssuerTrustResponse()
            }
}
