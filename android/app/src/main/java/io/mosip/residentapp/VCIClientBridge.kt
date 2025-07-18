package io.mosip.residentapp

import com.facebook.react.bridge.ReactApplicationContext
import io.mosip.vciclient.VCIClient
import io.mosip.vciclient.authorizationCodeFlow.clientMetadata.ClientMetadata
import io.mosip.vciclient.credential.response.CredentialResponse
import io.mosip.vciclient.token.TokenRequest
import io.mosip.vciclient.token.TokenResponse
import io.mosip.vciclient.types.AuthorizeUserCallback
import io.mosip.vciclient.types.ProofJwtCallback
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
            getTxCode = { inputMode, description, length ->
                VCIClientCallbackBridge.createTxCodeDeferred()
                VCIClientCallbackBridge.emitRequestTxCode(
                    reactContext,
                    inputMode,
                    description,
                    length
                )
                VCIClientCallbackBridge.awaitTxCode()
            },
            authorizeUser = authorizeUserCallback(),
            getTokenResponse = getTokenResponseCallback(),
            getProofJwt = getProofJwtCallback(),
            onCheckIssuerTrust = { credentialIssuer: String, issuerDisplay: List<Map<String, Any>> ->
                VCIClientCallbackBridge.createIssuerTrustResponseDeferred()
                VCIClientCallbackBridge.emitRequestIssuerTrust(
                    reactContext,
                    credentialIssuer,
                    issuerDisplay
                )
                VCIClientCallbackBridge.awaitIssuerTrustResponse()
            }
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

    private fun authorizeUserCallback(): AuthorizeUserCallback =
        { endpoint ->
            VCIClientCallbackBridge.createAuthCodeDeferred()
            VCIClientCallbackBridge.emitRequestAuthCode(reactContext, endpoint)
            VCIClientCallbackBridge.awaitAuthCode()
        }

    private fun getProofJwtCallback(): ProofJwtCallback =
        { credentialIssuer: String,
          cNonce: String?,
          proofSigningAlgorithmsSupported: List<String> ->
            println("getProofJwtCallback called with issuer: $credentialIssuer, cNonce: $cNonce, proofSigningAlgorithmsSupported: $proofSigningAlgorithmsSupported")
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
            val payload: Map<String, Any?> = mapOf(
                "grantType" to tokenRequest.grantType.value,
                "tokenEndpoint" to tokenRequest.tokenEndpoint,
                "authCode" to tokenRequest.authCode,
                "preAuthorizedCode" to tokenRequest.preAuthCode,
                "txCode" to tokenRequest.txCode,
                "clientId" to tokenRequest.clientId,
                "redirectUri" to tokenRequest.redirectUri,
                "codeVerifier" to tokenRequest.codeVerifier
            )
            VCIClientCallbackBridge.createTokenResponseDeferred()
            VCIClientCallbackBridge.emitTokenRequest(
                reactContext,
                payload
            )
            VCIClientCallbackBridge.awaitTokenResponse()
        }
}
