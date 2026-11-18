package io.mosip.residentapp.sdkcontract

import android.util.Log
import com.google.gson.JsonParser
import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.ECDSASigner
import com.nimbusds.jose.crypto.Ed25519Signer
import com.nimbusds.jose.jwk.Curve
import com.nimbusds.jose.jwk.ECKey
import com.nimbusds.jose.jwk.OctetKeyPair
import com.nimbusds.jose.jwk.gen.ECKeyGenerator
import com.nimbusds.jose.jwk.gen.OctetKeyPairGenerator
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import io.mosip.vciclient.proof.CredentialRequestProofMetadata
import io.mosip.vciclient.proof.CredentialRequestProofs
import io.mosip.vciclient.token.TokenRequest
import io.mosip.vciclient.token.TokenResponse
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.Date
import java.util.concurrent.TimeUnit


class SdkDownloadCallbacks(
    private val tokenEndpointOverride: String?,
    private val clientId: String,
) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    //ECCK1
    private val holderEcKey: ECKey = ECKeyGenerator(Curve.P_256)
        .keyID("instrumented-test-holder-key")
        .generate()

    @Volatile
    var lastUsedHolderEcPrivateKey: java.security.PrivateKey? = null
        private set


    fun exchangeToken(tokenRequest: TokenRequest): TokenResponse {
        val endpoint = tokenEndpointOverride ?: tokenRequest.tokenEndpoint

        val form = FormBody.Builder()
            .add("grant_type", tokenRequest.grantType.value)
            .apply {
                tokenRequest.authCode?.let { add("code", it) }
                tokenRequest.clientId?.let { add("client_id", it) }
                tokenRequest.redirectUri?.let { add("redirect_uri", it) }
                tokenRequest.codeVerifier?.let { add("code_verifier", it) }
            }
            .build()

        val builder = Request.Builder().url(endpoint).post(form)
        tokenRequest.dpopProof?.takeIf { it.isNotBlank() }?.let { builder.addHeader("DPoP", it) }

        client.newCall(builder.build()).execute().use { response ->
            val body = response.body?.string().orEmpty()
            check(response.isSuccessful) {
                "Token request to $endpoint failed: HTTP ${response.code} $body"
            }

            val json = JsonParser.parseString(body).asJsonObject
            Log.i(
                TAG,
                "token_type=${json.get("token_type")?.asString} " +
                    "expires_in=${json.get("expires_in")?.asInt} " +
                    "c_nonce=${json.get("c_nonce")?.asString} "+
                    "TOKEN=${json.get("access_token")?.asString}",
            )


            return TokenResponse(
                accessToken = json.get("access_token").asString,
                tokenType = json.get("token_type")?.asString ?: "Bearer",
                expiresIn = json.get("expires_in")?.asInt,
                cNonce = json.get("c_nonce")?.asString,
                cNonceExpiresIn = json.get("c_nonce_expires_in")?.asInt,
            )
        }
    }

    //Builds an openid4vci-proof+jwt signed with holder key
    fun buildProofs(metadata: CredentialRequestProofMetadata): CredentialRequestProofs {
        Log.i(
            TAG,
            "proof request: issuer=${metadata.credentialIssuer} nonce=${metadata.nonce} " +
                "algs=${metadata.proofSigningAlgorithmsSupported} " +
                "bindings=${metadata.cryptographicBindingMethodsSupported} " +
                "selectedAlg=${JWSAlgorithm.ES256.name}",
        )

        val header = JWSHeader.Builder(JWSAlgorithm.ES256)
            .type(JOSEObjectType(PROOF_JWT_TYPE))
            .jwk(holderEcKey.toPublicJWK())
            .build()

        val claims = JWTClaimsSet.Builder()
            .issuer(clientId)
            .audience(metadata.credentialIssuer)
            .issueTime(Date())
            .apply { metadata.nonce?.let { claim("nonce", it) } }
            .build()

        val jwt = SignedJWT(header, claims).apply {
              sign(ECDSASigner(holderEcKey))
              lastUsedHolderEcPrivateKey = holderEcKey.toECPrivateKey()
        }

        return CredentialRequestProofs(proofType = "jwt", proofs = listOf(jwt.serialize()))
    }

    private companion object {
        const val TAG = "SdkDownloadCallbacks"
        const val PROOF_JWT_TYPE = "openid4vci-proof+jwt"
    }
}
