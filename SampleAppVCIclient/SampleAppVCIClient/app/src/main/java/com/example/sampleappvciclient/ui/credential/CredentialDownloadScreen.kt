package com.example.sampleappvciclient.ui.credential

import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavController
import com.example.sampleappvciclient.utils.AuthCodeHolder
import com.example.sampleappvciclient.utils.Constants
import com.example.sampleappvciclient.navigation.Screen
import com.example.sampleappvciclient.utils.CredentialStore
import com.example.sampleappvciclient.utils.CredentialVerifier
import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.Ed25519Signer
import com.nimbusds.jose.jwk.Curve
import com.nimbusds.jose.jwk.OctetKeyPair
import com.nimbusds.jose.jwk.gen.OctetKeyPairGenerator
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import io.mosip.vciclient.VCIClient
import io.mosip.vciclient.authorizationCodeFlow.clientMetadata.ClientMetadata
import io.mosip.vciclient.token.TokenRequest
import io.mosip.vciclient.token.TokenResponse
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Base64
import java.util.Date

private val signerJwk: OctetKeyPair by lazy {
    OctetKeyPairGenerator(Curve.Ed25519).keyID("0").generate()
}

@Composable
fun CredentialDownloadScreen(
    navController: NavController,
    authCode: String? = null
) {
    val context = LocalContext.current
    val client = VCIClient("demo-123")
    val clientMetadata = ClientMetadata(
        clientId = Constants.clientId.toString(),
        redirectUri = Constants.redirectUri.toString()
    )

    val lifecycleOwner = LocalLifecycleOwner.current
    val coroutineScope = remember(lifecycleOwner) { lifecycleOwner.lifecycleScope }

    var statusMessage by remember { mutableStateOf<String?>(null) }
    var tokenResponseJson by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Top
    ) {
        // 🔹 App Header
        Text(
            text = "Example App",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))

        // 🔹 Only show Credential Type ID
        Text("Credential Type ID: ${Constants.credentialTypeId}")
        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                coroutineScope.launch {
                    try {
                        statusMessage = "Initiating credential flow..."

                        val credential = client.requestCredentialFromTrustedIssuer(
                            credentialIssuer = Constants.credentialIssuerHost.toString(),
                            credentialConfigurationId = Constants.credentialTypeId.toString(),
                            clientMetadata = clientMetadata,
                            authorizeUser = { url ->
                                Log.d("CredentialDetailScreen", "⚡ authorizeUser called with url=$url")
                                val code = handleAuthorizationFlow(navController, url)
                                Toast.makeText(context, "AuthCode Received", Toast.LENGTH_SHORT).show()
                                code
                            },
                            getTokenResponse = { tokenRequest ->
                                Log.d("CredentialDetailScreen", "Received tokenRequest: $tokenRequest")

                                val endpoint = when {
                                    tokenRequest.tokenEndpoint.contains("esignet-mosipid") ->
                                        "https://api.released.mosip.net/v1/mimoto/get-token/Mosip"
                                    tokenRequest.tokenEndpoint.contains("esignet-insurance") ->
                                        "https://api.released.mosip.net/v1/mimoto/get-token/StayProtected"
                                    else -> throw Exception("Unknown token endpoint")
                                }

                                try {
                                    val response = sendTokenRequest(tokenRequest, endpoint)
                                    Log.d("getTokenResponse", "The request is successful to the token endpoint $response")

                                    TokenResponse(
                                        accessToken = response.getString("access_token"),
                                        tokenType = response.getString("token_type"),
                                        expiresIn = response.optInt("expires_in"),
                                        cNonce = response.optString("c_nonce"),
                                        cNonceExpiresIn = response.optInt("c_nonce_expires_in")
                                    )
                                } catch (e: Exception) {
                                    Log.e("CredentialDetailScreen", "Token request failed", e)
                                    statusMessage = "❌ Token request failed: ${e.message}"
                                    throw e
                                }
                            },
                            getProofJwt = { issuer, cNonce, _ ->
                                signProofJWT(cNonce, issuer, isTrusted = true)
                            }
                        )

                        credential?.let { credObj ->
                            val credentialStr = credObj.toString()
                            tokenResponseJson = credentialStr
                            statusMessage = "🔍 Verifying credential..."

                            val verified = CredentialVerifier.verifyCredential(credentialStr)
                            if (verified) {
                                CredentialStore.addCredential(credentialStr)
                                statusMessage = "✅ Credential Verified & Stored"
                            } else {
                                statusMessage = "❌ Credential Verification Failed"
                            }
                        } ?: run {
                            statusMessage = "❌ No credential received"
                        }

                    } catch (e: Exception) {
                        Log.e("CredentialDetailScreen", "Flow stopped", e)
                        if (!e.message.orEmpty().contains("Stop library flow")) {
                            statusMessage = "Error: ${e.message}"
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Initiate Flow")
        }

        Spacer(modifier = Modifier.height(24.dp))

        // 🔹 Show flow status (errors, success)
        statusMessage?.let {
            Text(
                it,
                style = MaterialTheme.typography.bodyMedium,
                color = if (it.startsWith("Error") || it.startsWith("❌")) {
                    MaterialTheme.colorScheme.error
                } else {
                    MaterialTheme.colorScheme.primary
                }
            )
        }

        // 🔹 Show Token Response JSON
        tokenResponseJson?.let {
            Spacer(modifier = Modifier.height(16.dp))
            Text("Token Response JSON:", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                it,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

suspend fun handleAuthorizationFlow(
    navController: NavController,
    url: String
): String {
    navController.navigate(Screen.AuthWebView.createRoute(url))
    val code = AuthCodeHolder.waitForCode()
    Log.d("CredentialDetailScreen", "✅ Got AuthCode=$code")
    return code
}

private fun signProofJWT(
    cNonce: String?,
    issuer: String,
    isTrusted: Boolean
): String {
    val kid = "did:jwk:" + signerJwk.toPublicJWK().toJSONString().base64Url() + "#0"

    val header = JWSHeader.Builder(JWSAlgorithm.Ed25519)
        .keyID(kid)
        .type(JOSEObjectType("openid4vci-proof+jwt"))
        .build()

    val claimsSet = JWTClaimsSet.Builder()
        .audience(issuer)
        .claim("nonce", cNonce)
        .issueTime(Date())
        .expirationTime(Date(System.currentTimeMillis() + 5 * 60 * 60 * 1000))
        .build()

    val signedJWT = SignedJWT(header, claimsSet)
    signedJWT.sign(Ed25519Signer(signerJwk))

    Log.d("ProofJWT", "Signed JWT: ${signedJWT.serialize()}")
    return signedJWT.serialize()
}

private fun String.base64Url(): String {
    return Base64.getUrlEncoder().withoutPadding().encodeToString(toByteArray())
}

suspend fun sendTokenRequest(
    tokenRequest: TokenRequest,
    tokenEndpoint: String
): JSONObject {
    Log.d("sendTokenRequest", "Function called")
    val url = URL(tokenEndpoint)
    val conn = url.openConnection() as HttpURLConnection
    conn.requestMethod = "POST"
    conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
    conn.doOutput = true
    conn.connectTimeout = 10000
    conn.readTimeout = 10000

    val formBody = buildString {
        append("grant_type=${tokenRequest.grantType.value}")
        tokenRequest.authCode?.let { append("&code=$it") }
        tokenRequest.preAuthCode?.let { append("&pre-authorized_code=$it") }
        tokenRequest.txCode?.let { append("&tx_code=$it") }
        tokenRequest.clientId?.let { append("&client_id=$it") }
        tokenRequest.redirectUri?.let { append("&redirect_uri=$it") }
        tokenRequest.codeVerifier?.let { append("&code_verifier=$it") }
    }

    Log.d("sendTokenRequest", "Form body: $formBody")

    try {
        conn.outputStream.use { os ->
            os.write(formBody.toByteArray())
        }

        val responseCode = conn.responseCode
        Log.d("sendTokenRequest", "Response code: $responseCode")

        if (responseCode == HttpURLConnection.HTTP_OK) {
            val responseText = conn.inputStream.bufferedReader().readText()
            Log.d("sendTokenRequest", "Received response: $responseText")
            return JSONObject(responseText)
        } else {
            val errorText = conn.errorStream?.bufferedReader()?.readText() ?: "Unknown error"
            Log.e("sendTokenRequest", "Error response: $errorText")
            throw Exception("HTTP error $responseCode: $errorText")
        }
    } catch (e: Exception) {
        Log.e("sendTokenRequest", "Network request failed", e)
        throw e
    } finally {
        conn.disconnect()
    }
}
