package io.mosip.residentapp.sdkcontract

import android.util.Log
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.google.gson.Gson
import io.mosip.residentapp.sdkcontract.SdkContractTestSupport.TRACEABILITY_ID
import io.mosip.residentapp.sdkcontract.SdkContractTestSupport.logBanner
import io.mosip.residentapp.sdkcontract.SdkContractTestSupport.logMultiline
import io.mosip.residentapp.sdkcontract.SdkContractTestSupport.prettyPrint
import io.mosip.openID4VP.OpenID4VP
import io.mosip.openID4VP.authorizationRequest.AuthorizationPresentationExchangeRequest
import io.mosip.openID4VP.authorizationRequest.AuthorizationRequest
import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.VPTokenSigningResult
import io.mosip.openID4VP.constants.FormatType
import io.mosip.openID4VP.wallet.Credential
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.junit.runner.RunWith
import java.net.URLEncoder
import java.security.Signature
import java.util.UUID
import java.util.concurrent.TimeUnit

/**
 *  SDK calls
 *  1.AuthenticateVerifier
 *  2.ConstructUnsignedVPToken
 *  3.ConstructVPResponse (local, no network) -> stored for the vc-verifier test
 *  4.SendVPResponseToVerifier
 */
@RunWith(AndroidJUnit4::class)
class CredentialPresentationInstrumentedTest {

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    @Test
    fun presentCredentialToVerifier() {
        val openid4vp = OpenID4VP(TRACEABILITY_ID)

        logBanner(TAG, "STEP 1 – AUTHENTICATE VERIFIER")
        val urlEncodedAuthorizationRequest = fetchUrlEncodedAuthorizationRequestForPEX()
        Log.i(TAG, "authorization request URL = $urlEncodedAuthorizationRequest")
        val authRequest : AuthorizationRequest = openid4vp.authenticateVerifier(urlEncodedAuthorizationRequest)
        logMultiline(TAG, prettyPrint(authRequest))

        //validations
        assertEquals("clientId", CLIENT_ID, authRequest.clientId)
        assertEquals("responseMode", "direct_post", authRequest.responseMode)
        assertEquals("responseType", "vp_token", authRequest.responseType)
        assertNotNull("responseUri", authRequest.responseUri)
        assertTrue("responseUri is https", authRequest.responseUri!!.startsWith("https://"))
        assertTrue("nonce is not blank", authRequest.nonce.isNotBlank())
        assertTrue("state is not blank", authRequest.state!!.isNotBlank())
        val peRequest = authRequest as AuthorizationPresentationExchangeRequest
        assertEquals("purpose", PRESENTATION_PURPOSE, peRequest.presentationDefinition.purpose)
        assertEquals(
            "inputDescriptor id",
            INPUT_DESCRIPTOR_ID,
            peRequest.presentationDefinition.inputDescriptors.first().id,
        )

        logBanner(TAG, "STEP 2 – CONSTRUCT UNSIGNED VP TOKEN")
        val live = SdkContractTestSupport.lastDownloadedCredential
        assumeTrue(
            "No live credential found. Run SunbirdDownloadThenPresentSuite to execute download -> present -> verify in one process.",
            live != null,
        )
        val resolvedJson = live!!.credentialJson
        val resolvedId  = live.credentialId
        Log.i(TAG, "using live downloaded credential id = ${live.credentialId}")
        @Suppress("UNCHECKED_CAST")
        val credentialData = Gson().fromJson(resolvedJson, Map::class.java) as Map<String, Any>
        val credential = Credential(FormatType.LDP_VC, credentialData, resolvedId)
        val selectedVCs = mapOf(INPUT_DESCRIPTOR_ID to listOf(credential))
        val unsignedTokens = openid4vp.constructUnsignedVPToken(selectedVCs)
        logMultiline(TAG, prettyPrint(unsignedTokens))

        //validations
        assertTrue("unsignedTokens is not empty", unsignedTokens.isNotEmpty())
        val token = unsignedTokens.first()
        assertTrue("token id is not blank", token.id.isNotBlank())
        assertTrue("signatureAlgorithm is not blank", token.signatureAlgorithm.isNotBlank())
        assertTrue("dataToSign is not empty", token.dataToSign.isNotEmpty())

        //signing data
        logBanner(TAG, "STEP 3–SIGN DATA")
        val signingResults = unsignedTokens.map { t ->
            VPTokenSigningResult(t.id, signBytes(t.dataToSign, t.signatureAlgorithm))
        }

        // construct vp_token for vc-verifier
        logBanner(TAG, "STEP 4–CONSTRUCT & STORE PRESENTATION")
        val authorizationResponse = openid4vp.constructVPResponse(signingResults)
        val vpToken = authorizationResponse["vp_token"]
          ?: error("constructVPResponse did not return a 'vp_token' entry: $authorizationResponse")
        val vpTokenJson = if (vpToken is String) vpToken else Gson().toJson(vpToken)
        logMultiline(TAG, vpTokenJson)
        SdkContractTestSupport.lastBuiltPresentation = vpTokenJson
        Log.i(TAG, "stored built presentation for vc-verifier test")

        //submitting presentation
        logBanner(TAG, "STEP 5–SUBMIT PRESENTATION")
        val verifierResponse = openid4vp.sendVPResponseToVerifier(signingResults)
        logMultiline(TAG, prettyPrint(verifierResponse))
        Log.i(TAG, "verifier status = ${verifierResponse.statusCode}")
        assertEquals("verifier statusCode", 200, verifierResponse.statusCode)
    }

    //Post to the verify-session-request end point to get a uri
    //Presentation exchange
    private fun fetchUrlEncodedAuthorizationRequestForPEX(): String {
        val nonce = android.util.Base64.encodeToString(
            System.currentTimeMillis().toString().toByteArray(),
            android.util.Base64.NO_WRAP,
        )
        val requestBody = mapOf(
            "clientId" to CLIENT_ID,
            "nonce" to nonce,
            "acceptVPWithoutHolderProof" to false,
            "presentationDefinition" to mapOf(
                "id" to UUID.randomUUID().toString(),
                "purpose" to PRESENTATION_PURPOSE,
                "input_descriptors" to listOf(
                    mapOf(
                        "id" to INPUT_DESCRIPTOR_ID,
                        "format" to mapOf(
                            "ldp_vc" to mapOf("proof_type" to listOf("Ed25519Signature2020")),
                        ),
                        "constraints" to mapOf(
                            "fields" to listOf(
                                mapOf(
                                    "path" to listOf("$.type"),
                                    "filter" to mapOf(
                                        "type" to "object",
                                        "pattern" to VC_TYPE_PATTERN,
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        )

        val request = Request.Builder()
            .url(VP_SESSION_REQUEST_URL)
            .post(Gson().toJson(requestBody).toRequestBody("application/json".toMediaType()))
            .build()

        httpClient.newCall(request).execute().use { response ->
            val responseBody = response.body?.string().orEmpty()
            check(response.isSuccessful) {
                "vp-session-request failed: HTTP ${response.code} $responseBody"
            }
            Log.i(TAG, "vp-session-request response = $responseBody")

            @Suppress("UNCHECKED_CAST")
            val json = Gson().fromJson(responseBody, Map::class.java)
            val requestUri = json["requestUri"] as String
            val transactionId = json["transactionId"] as String
            Log.i(TAG, "Transaction Id: $transactionId")
            val requestId = json["requestId"] as String
            Log.i(TAG, "Request Id: $requestId")

            return "openid4vp://authorize?" +
                "client_id=${URLEncoder.encode(CLIENT_ID, "UTF-8")}" +
                "&request_uri=${URLEncoder.encode(requestUri, "UTF-8")}"
        }
    }

    //TODO
    private fun fetchUrlEncodedAuthorizationRequestForDCQLQuery() :String {
        return "";
    }

    private fun signBytes(dataToSign: ByteArray, algorithm: String): ByteArray {
        Log.i(TAG, "signing – algorithm=$algorithm dataLen=${dataToSign.size}")
        val livePrivateKey = requireNotNull(SdkContractTestSupport.lastHolderPrivateKey) {
            "Missing holder EC private key for $algorithm signing. " +
                "Run SunbirdDownloadThenPresentSuite so the credential download step stores the holder key."
        }
        Log.i(TAG, "signing with live holder EC key from credential download")
        return signEcdsaRawRS(dataToSign, livePrivateKey)

    }

    private fun signEcdsaRawRS(dataToSign: ByteArray, privateKey: java.security.PrivateKey): ByteArray {
        val derSignature = Signature.getInstance("SHA256withECDSA").apply {
            initSign(privateKey)
            update(dataToSign)
        }.sign()
        return derToRawEcdsaSignature(derSignature, componentLength = 32)
    }

    //der to raw transformation
    private fun derToRawEcdsaSignature(derSignature: ByteArray, componentLength: Int): ByteArray {
        var index = 0
        require(derSignature[index] == 0x30.toByte()) { "Not a DER sequence" }
        index++
        index += derLengthByteCount(derSignature, index)

        require(derSignature[index] == 0x02.toByte()) { "Expected INTEGER for r" }
        index++
        val rLen = derSignature[index].toInt() and 0xFF
        index++
        val r = derSignature.copyOfRange(index, index + rLen)
        index += rLen

        require(derSignature[index] == 0x02.toByte()) { "Expected INTEGER for s" }
        index++
        val sLen = derSignature[index].toInt() and 0xFF
        index++
        val s = derSignature.copyOfRange(index, index + sLen)

        return toFixedLength(r, componentLength) + toFixedLength(s, componentLength)
    }

    private fun derLengthByteCount(der: ByteArray, lengthOffset: Int): Int {
        val first = der[lengthOffset].toInt() and 0xFF
        return if (first and 0x80 == 0) 1 else 1 + (first and 0x7F)
    }

    //convert to fixed 32 length
    private fun toFixedLength(bytes: ByteArray, length: Int): ByteArray {
        val trimmed = if (bytes.size > length && bytes[0] == 0x00.toByte()) {
            bytes.copyOfRange(1, bytes.size)
        } else {
            bytes
        }
        return when {
            trimmed.size == length -> trimmed
            trimmed.size < length -> ByteArray(length - trimmed.size) + trimmed
            else -> trimmed.copyOfRange(trimmed.size - length, trimmed.size)
        }
    }

    private companion object {
        const val TAG = "CredentialPresentationTest"

        const val VP_SESSION_REQUEST_URL = "https://injiverify.released.mosip.net/v1/verify/vp-session-request"
        const val CLIENT_ID = "did:web:injiverify.released.mosip.net:v1:verify"

        //PEX constants
        const val PRESENTATION_PURPOSE = "Relying party is requesting your digital ID for the purpose of Self-Authentication"
        const val VC_TYPE_PATTERN = "InsuranceCredential"

        const val INPUT_DESCRIPTOR_ID = "id card credential"
    }
}
