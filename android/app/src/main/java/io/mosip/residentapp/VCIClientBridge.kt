package io.mosip.residentapp

import com.facebook.react.bridge.ReactApplicationContext
import io.mosip.openID4VP.authorizationRequest.AuthorizationRequest
import io.mosip.openID4VP.authorizationResponse.unsignedVPToken.UnsignedVPToken
import io.mosip.openID4VP.constants.FormatType
import io.mosip.vciclient.VCIClient
import io.mosip.vciclient.authorizationCodeFlow.AuthorizationMethod
import io.mosip.vciclient.authorizationCodeFlow.clientMetadata.ClientMetadata
import io.mosip.vciclient.constants.SelectCredentialsForPresentationCallback
import io.mosip.vciclient.constants.OpenWebPageCallback
import io.mosip.vciclient.constants.ProofJwtCallback
import io.mosip.vciclient.constants.SignVerifiablePresentationCallback
import io.mosip.vciclient.credential.response.CredentialResponse
import io.mosip.vciclient.token.TokenRequest
import io.mosip.vciclient.token.TokenResponse
import kotlinx.coroutines.runBlocking

object VCIClientBridge {

    lateinit var reactContext: ReactApplicationContext



    @JvmStatic
    fun requestCredentialByOfferSync(
            client: VCIClient,
            offer: String,
            clientMetaData: ClientMetadata,
            signatureSuite: String?
    ): CredentialResponse = runBlocking {
        client.fetchCredentialByCredentialOffer(
                credentialOffer = offer,
                clientMetadata = clientMetaData,
                getTxCode = getTxCodeCallback(),
                authorizations = authorizationMethods(signatureSuite),
                getTokenResponse = getTokenResponseCallback(),
                getProofJwt = getProofJwtCallback(),
                onCheckIssuerTrust = onCheckIssuerTrustCallback()
        )
    }



    @JvmStatic
    fun requestCredentialFromTrustedIssuerSync(
            client: VCIClient,
            credentialIssuer: String,
            credentialConfigurationId: String,
            clientMetaData: ClientMetadata,
            signatureSuite: String?
    ): CredentialResponse = runBlocking {
        client.fetchCredentialFromTrustedIssuer(
                credentialIssuer = credentialIssuer,
                credentialConfigurationId = credentialConfigurationId,
                clientMetadata = clientMetaData,
                getTokenResponse = getTokenResponseCallback(),
                authorizations = authorizationMethods(signatureSuite),
                getProofJwt = getProofJwtCallback(),
        )
    }

    private fun authorizationMethods(signatureSuite: String?): List<AuthorizationMethod> =
            listOf(
                    AuthorizationMethod.PresentationDuringIssuance(
                            selectCredentialsForPresentation =
                                    selectCredentialsForPresentationCallback(),
                            signVerifiablePresentation = signVerifiablePresentationCallback(),
                            signatureSuite = signatureSuite
                    ),
                    // Uncomment when you want redirect-to-web to be enabled in V2 flow
                    AuthorizationMethod.RedirectToWeb(openWebPage = openWebPageCallback())
            )

    private fun selectCredentialsForPresentationCallback(): SelectCredentialsForPresentationCallback =
            { authorizationRequest: AuthorizationRequest ->
                VCIClientCallbackBridge.createPresentationRequestDeferred()
                VCIClientCallbackBridge.emitPresentationRequest(reactContext, authorizationRequest)
                VCIClientCallbackBridge.awaitSelectedCredentialsForPresentationRequest()
            }

    private fun signVerifiablePresentationCallback(): SignVerifiablePresentationCallback =
            { payload: Map<FormatType, UnsignedVPToken> ->
                VCIClientCallbackBridge.createSignedVPTokenDeferred()
                VCIClientCallbackBridge.emitSignedVPTokenRequest(reactContext, payload)
                VCIClientCallbackBridge.awaitSignedVPToken()
            }

    private fun openWebPageCallback(): OpenWebPageCallback =
    openWeb@{ endpoint: String ->

        VCIClientCallbackBridge.createAuthCodeDeferred()
        VCIClientCallbackBridge.emitRequestAuthCode(reactContext, endpoint)

        val authCode = try {
            VCIClientCallbackBridge.awaitAuthCode()
        } catch (ex: Exception) {
            return@openWeb mapOf(
                "error" to "authorization_failed",
                "errorDescription" to
                    (ex.message ?: "Failed to receive authorization code")
            )
        }

        if (authCode.isBlank()) {
            return@openWeb mapOf(
                "error" to "access_denied",
                "errorDescription" to "Authorization code not received"
            )
        }

        mapOf(
            "code" to authCode
        )
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

    private fun getTokenResponseCallback(): suspend (TokenRequest) -> TokenResponse =
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
