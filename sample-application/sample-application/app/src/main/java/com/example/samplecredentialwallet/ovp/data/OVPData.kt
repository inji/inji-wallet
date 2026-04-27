package com.example.samplecredentialwallet.ovp.data

import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.mosip.openID4VP.authorizationRequest.VPFormatSupported
import io.mosip.openID4VP.authorizationRequest.Verifier
import io.mosip.openID4VP.authorizationRequest.WalletMetadata
import io.mosip.openID4VP.constants.ClientIdScheme
import io.mosip.openID4VP.constants.ContentEncryptionAlgorithm
import io.mosip.openID4VP.constants.KeyManagementAlgorithm
import io.mosip.openID4VP.constants.RequestSigningAlgorithm
import io.mosip.openID4VP.constants.VPFormatType

object OVPData {
    fun getWalletMetadata(): WalletMetadata {
        return WalletMetadata(
            presentationDefinitionURISupported = true,
            vpFormatsSupported = mapOf(
                VPFormatType.LDP_VC to VPFormatSupported(
                    algValuesSupported = listOf("Ed25519Signature2018", "Ed25519Signature2020", "RSASignature2018")
                ),
                VPFormatType.MSO_MDOC to VPFormatSupported(
                    algValuesSupported = listOf("ES256")
                )
            ),
            clientIdSchemesSupported = listOf(
                ClientIdScheme.REDIRECT_URI,
                ClientIdScheme.DID,
                ClientIdScheme.PRE_REGISTERED
            ),
            requestObjectSigningAlgValuesSupported = listOf(RequestSigningAlgorithm.EdDSA),
            authorizationEncryptionAlgValuesSupported = listOf(KeyManagementAlgorithm.ECDH_ES),
            authorizationEncryptionEncValuesSupported = listOf(ContentEncryptionAlgorithm.A256GCM)
        )
    }

    fun getTrustedVerifiers(): List<Verifier> {
        // Replace with your verifier configuration for non-demo usage.
        val verifierJson = """
        [
            {
              "client_id": "mock-client",
              "response_uris": [
                "https://localhost:3000/verifier/vp-response"
              ],
              "jwks_uri": "https://localhost:3000/.well-known/jwks.json"
            }
        ]
        """.trimIndent()

        val objectMapper = jacksonObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)

        return objectMapper.readValue(verifierJson)
    }
}
