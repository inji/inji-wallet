package io.mosip.residentapp

import com.facebook.react.bridge.ReactApplicationContext
import io.mosip.vciclient.VCIClient
import io.mosip.vciclient.authorizationCodeFlow.AuthorizationMethod
import io.mosip.vciclient.authorizationCodeFlow.clientMetadata.ClientMetadata
import com.google.gson.JsonObject
import io.mosip.vciclient.constants.OpenWebPageCallback
import io.mosip.vciclient.constants.ProofsCallback
import io.mosip.vciclient.credential.response.CredentialResponse
import io.mosip.vciclient.exception.DownloadFailedException
import io.mosip.vciclient.proof.CredentialRequestProofs
import io.mosip.vciclient.token.TokenRequest
import io.mosip.vciclient.token.TokenResponse
import kotlinx.coroutines.runBlocking

object VCIClientBridge {

    lateinit var reactContext: ReactApplicationContext



    @JvmStatic
    fun getIssuerMetadataSync(
            client: VCIClient,
            credentialIssuer: String
    ): Map<String, Any?> = runBlocking {
        client.getIssuerMetadata(credentialIssuer)
    }

    @JvmStatic
    fun requestCredentialByOfferSync(
            client: VCIClient,
            offer: String,
            clientMetaData: ClientMetadata,
            signatureSuite: String?
    ): String = runBlocking {
       val response = client.fetchCredentialsUsingCredentialOffer(
                credentialOffer = offer,
                clientMetadata = clientMetaData,
                getTxCode = getTxCodeCallback(),
                authorizations = authorizationMethods(signatureSuite),
                getTokenResponse = getTokenResponseCallback(),
                getProofs = getProofsCallback(),
                onCheckIssuerTrust = onCheckIssuerTrustCallback()
        )
        response.toSingleCredentialResponseJson()
    }



    @JvmStatic
    fun requestCredentialFromTrustedIssuerSync(
            client: VCIClient,
            credentialIssuer: String,
            credentialConfigurationId: String,
            clientMetaData: ClientMetadata,
            signatureSuite: String?
    ): String = runBlocking {
        client.fetchCredentialsFromTrustedIssuer(
                credentialIssuer = credentialIssuer,
                credentialConfigurationId = credentialConfigurationId,
                clientMetadata = clientMetaData,
                getTokenResponse = getTokenResponseCallback(),
                authorizations = authorizationMethods(signatureSuite),
                getProofs = getProofsCallback(),
        ).toSingleCredentialResponseJson()
    }

    private fun authorizationMethods(signatureSuite: String?): List<AuthorizationMethod> =
            listOf(
                    AuthorizationMethod.RedirectToWeb(openWebPage = openWebPageCallback())
            )

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


    private fun getProofsCallback(): ProofsCallback =
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
                CredentialRequestProofs(proofs = listOf(VCIClientCallbackBridge.awaitProof()))
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

        private fun CredentialResponse.toSingleCredentialResponseJson(): String {

        val firstItem = credentials?.firstOrNull()
                ?: throw DownloadFailedException("No credential returned from issuer")

        val json = JsonObject().apply {
            add("credential", firstItem)
            credentialIssuer?.let { addProperty("credentialIssuer", it) }
            credentialConfigurationId?.let { addProperty("credentialConfigurationId", it) }
        }
        return json.toString()
    }
}
