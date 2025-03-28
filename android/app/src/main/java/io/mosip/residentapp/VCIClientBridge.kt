package io.mosip.residentapp

import com.facebook.react.bridge.ReactApplicationContext
import io.mosip.vciclient.VCIClient
import io.mosip.vciclient.clientMetadata.ClientMetadata
import io.mosip.vciclient.credentialResponse.CredentialResponse
import io.mosip.vciclient.issuerMetadata.IssuerMetadata
import io.mosip.residentapp.VCIClientBridge
import kotlinx.coroutines.runBlocking

object VCIClientBridge {

    // Must be set by the Java side (InjiVciClientModule) to emit events to JS
    lateinit var reactContext: ReactApplicationContext

    @JvmStatic
    fun requestCredentialByOfferSync(
            client: VCIClient,
            offer: String,
            clientMetaData: ClientMetadata
    ): CredentialResponse? = runBlocking {
        client.requestCredentialByCredentialOffer(
                credentialOffer = offer,
                clientMetadata = clientMetaData,
                getTxCode = { inputMode, description, length ->
                    VCIClientCallbackBridge.createTxCodeDeferred()
                    VCIClientCallbackBridge.emitRequestTxCode(VCIClientBridge.reactContext,
                            inputMode,
                            description,
                            length
                    )
                    VCIClientCallbackBridge.awaitTxCode()
                },
                getProofJwt = { accessToken, cNonce, issuerMetadata, credentialConfigurationId ->
                    VCIClientCallbackBridge.createProofDeferred()
                    VCIClientCallbackBridge.emitRequestProof(
                            VCIClientBridge.reactContext,
                            accessToken,
                            cNonce,
                            issuerMetadata,
                            credentialConfigurationId
                    )
                    VCIClientCallbackBridge.awaitProof()
                },
                getAuthCode = { endpoint ->
                    VCIClientCallbackBridge.createAuthCodeDeferred()
                    VCIClientCallbackBridge.emitRequestAuthCode(VCIClientBridge.reactContext, endpoint)
                    VCIClientCallbackBridge.awaitAuthCode()
                },
                onCheckIssuerTrust = { issuerMetadata ->
                    VCIClientCallbackBridge.createIsuerTrustResponseDeferred()
                    VCIClientCallbackBridge.emitRequestIssuerTrust(reactContext, issuerMetadata)
                    VCIClientCallbackBridge.awaitIssuerTrustResponse()
                }
        )
    }

    @JvmStatic
    fun requestCredentialFromTrustedIssuerSync(
            client: VCIClient,
            resolvedIssuerMetaData: IssuerMetadata,
            clientMetaData: ClientMetadata
    ): CredentialResponse? = runBlocking {
        client.requestCredentialFromTrustedIssuer(
            issuerMetadata = resolvedIssuerMetaData,
                clientMetadata = clientMetaData,
                getProofJwt = { accessToken, cNonce, _, _ ->
                    VCIClientCallbackBridge.createProofDeferred()
                    VCIClientCallbackBridge.emitRequestProof(reactContext, accessToken, cNonce)
                    VCIClientCallbackBridge.awaitProof()
                },
                getAuthCode = { authorizationEndpoint ->
                    VCIClientCallbackBridge.createAuthCodeDeferred()
                    VCIClientCallbackBridge.emitRequestAuthCode(reactContext, authorizationEndpoint)
                    VCIClientCallbackBridge.awaitAuthCode()
                }
        )
    }
}
