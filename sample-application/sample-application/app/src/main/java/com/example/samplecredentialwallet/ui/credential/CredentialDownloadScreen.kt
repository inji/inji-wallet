package com.example.samplecredentialwallet.ui.credential

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.samplecredentialwallet.navigation.Screen
import com.example.samplecredentialwallet.utils.AuthCodeHolder
import com.example.samplecredentialwallet.utils.Constants
import com.example.samplecredentialwallet.utils.CredentialStore
import com.example.samplecredentialwallet.utils.CredentialVerifier
import com.example.samplecredentialwallet.utils.SecureKeystoreManager
import com.example.samplecredentialwallet.utils.EndpointConfig
import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.RSASSASigner
import com.nimbusds.jose.crypto.ECDSASigner
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jose.jwk.ECKey
import com.nimbusds.jose.jwk.Curve
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import io.mosip.vciclient.VCIClient
import io.mosip.vciclient.authorizationCodeFlow.clientMetadata.ClientMetadata
import io.mosip.vciclient.token.TokenRequest
import io.mosip.vciclient.token.TokenResponse
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withTimeout
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.net.UnknownHostException
import java.util.Base64
import java.util.Date
import java.security.KeyStore
import java.security.PrivateKey
import java.security.interfaces.RSAPublicKey
import java.security.interfaces.ECPrivateKey
import java.security.interfaces.ECPublicKey


@Composable
fun CredentialDownloadScreen(
    navController: NavController,
    authCode: String? = null
) {
    val context = LocalContext.current
    // Initialize and ensure keys exist (hardware-backed when available)
    val keystoreManager = remember { SecureKeystoreManager.getInstance(context) }
    LaunchedEffect(Unit) {
        try {
            keystoreManager.initializeKeystore()
        } catch (e: Exception) {
            Log.e("CredentialDownload", "Keystore initialization failed: ${e.message}", e)
        }
    }
    val client = VCIClient("demo-123")
    val clientMetadata = ClientMetadata(
        clientId = Constants.clientId.toString(),
        redirectUri = Constants.redirectUri.toString()
    )

    var tokenResponseJson by remember { mutableStateOf<String?>(null) }
    val isLoading = remember { mutableStateOf(false) }
    val loadingMessage = remember { mutableStateOf("Downloading Credential...") }
    val errorMessage = remember { mutableStateOf<String?>(null) }
    val showError = remember { mutableStateOf(false) }

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.Top
        ) {
            Text(
                text = "Download Credential",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))

            Text(
                "OpenID4VCI Flow",
                style = MaterialTheme.typography.titleMedium,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "Credential Type: ${Constants.credentialDisplayName ?: Constants.credentialTypeId}",
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    GlobalScope.launch(Dispatchers.IO) {
                        try {
                            withContext(Dispatchers.Main) {
                                isLoading.value = true
                                loadingMessage.value = "Starting credential download..."
                            }

                        withTimeout(600000L) { 
                            
                            val credential = client.requestCredentialFromTrustedIssuer(
                                credentialIssuer = Constants.credentialIssuerHost.toString(),
                                credentialConfigurationId = Constants.credentialTypeId.toString(),
                                clientMetadata = clientMetadata,
                                
                                authorizeUser = { url ->
                                    Log.d("AUTH_FLOW", "Authorization flow started")
                                    Log.d("AUTH_FLOW", "Authorization URL: $url")
                                    withContext(Dispatchers.Main) {
                                        loadingMessage.value = "Authenticating..."
                                    }
                                    val code = handleAuthorizationFlow(navController, url)
                                    Log.d("AUTH_FLOW", "Authorization code received")
                                    code
                                },
                                
                                getTokenResponse = { tokenRequest ->
                                    Log.d("TOKEN_EXCHANGE", "Token exchange started")
                                    Log.d("TOKEN_EXCHANGE", "Token endpoint: ${tokenRequest.tokenEndpoint}")
                                    withContext(Dispatchers.Main) {
                                        loadingMessage.value = "Exchanging tokens..."
                                    }

                                    // Resolve token endpoint using configuration
                                    val endpoint = EndpointConfig.resolveTokenEndpoint(
                                        tokenRequest.tokenEndpoint,
                                        Constants.credentialIssuerHost
                                    )
                                    Log.d("TOKEN_EXCHANGE", "Using custom endpoint: $endpoint")

                                    val response = sendTokenRequest(tokenRequest, endpoint)
                                    Log.d("TOKEN_EXCHANGE", "Access token received")
                                    Log.d("TOKEN_EXCHANGE", "c_nonce received")

                                    TokenResponse(
                                        accessToken = response.getString("access_token"),
                                        tokenType = response.getString("token_type"),
                                        expiresIn = response.optInt("expires_in"),
                                        cNonce = response.optString("c_nonce"),
                                        cNonceExpiresIn = response.optInt("c_nonce_expires_in")
                                    )
                                },
                                
                                getProofJwt = { issuer, cNonce, _ ->
                                    Log.d("PROOF_JWT", "Proof JWT generation started")
                                    Log.d("PROOF_JWT", "Issuer: $issuer")
                                    Log.d("PROOF_JWT", "c_nonce: $cNonce")
                                    withContext(Dispatchers.Main) {
                                        loadingMessage.value = "Generating proof..."
                                    }
                                    val proofJwt = signProofJWT(cNonce, issuer, isTrusted = true, context = context)
                                    proofJwt
                                }
                            )

                            Log.d("VC_DOWNLOAD", "Credential download completed")
                            Log.d("VC_DOWNLOAD", "Credential object received: ${credential?.javaClass?.simpleName}")

                            withContext(Dispatchers.Main) {
                                loadingMessage.value = "Processing credential..."
                                
                                if (credential == null) {
                                    Log.e("VC_DOWNLOAD", "Credential is null")
                                    isLoading.value = false
                                    showError.value = true
                                    errorMessage.value = "Something went wrong!"
                                    return@withContext
                                }
                                
                                credential.let { credObj ->
                                    // Extract credential string from response object
                                    val credentialStr = try {
                                        Log.d("VC_EXTRACT", "Extracting credential from response object")
                                        var credField: String? = null
                                        try {
                                            val method = credObj.javaClass.getMethod("getCredential")
                                            credField = method.invoke(credObj) as? String
                                            Log.d("VC_EXTRACT", "Method  successful: getCredential()")
                                        } catch (e: Exception) {
                                            Log.d("VC_EXTRACT", "Method  failed: ${e.message}")
        
                                        }

                                        if (credField == null) {
                                            try {
                                                val field = credObj.javaClass.getDeclaredField("credential")
                                                field.isAccessible = true
                                                credField = field.get(credObj) as? String
                                                Log.d("VC_EXTRACT", "Method  successful: field access")
                                            } catch (e: Exception) {
                                                Log.d("VC_EXTRACT", "Method  failed: ${e.message}")
                                            }
                                        }
                                        
                                        if (credField == null) {
                                            Log.d("VC_EXTRACT", "Trying Method : regex parsing")
                                            val str = credObj.toString()
                                            val credentialMatch = Regex("""credential=(\{.*\})(?:,|\))""").find(str)
                                            if (credentialMatch != null) {
                                                credField = credentialMatch.groupValues[1]
                                                Log.d("VC_EXTRACT", "Method  successful: regex parsing")
                                            }
                                        }
                                        
                                        credField ?: credObj.toString()
                                    } catch (e: Exception) {
                                        Log.e("VC_EXTRACT", "Failed to extract credential: ${e.message}")
                                        e.printStackTrace()
                                        credObj.toString()
                                    }
                                    
                                    Log.d("VC_EXTRACT", "Credential extracted successfully")
                                    Log.d("VC_EXTRACT", "Credential length: ${credentialStr.length} characters")
                                    tokenResponseJson = credentialStr

                                    Log.d("VC_VERIFY", "Starting credential verification")
                                    val verified = CredentialVerifier.verifyCredential(credentialStr, demoMode = true)
                                    Log.d("VC_VERIFY", "Verification result: $verified")
                                    
                                    // Add display name to credential before storing
                                    val credentialWithDisplayName = try {
                                        val credJson = org.json.JSONObject(credentialStr)
                                        Constants.credentialDisplayName?.let { displayName ->
                                            credJson.put("credentialName", displayName)
                                            Log.d("VC_STORE", "Added display name: $displayName")
                                        }
                                        credJson.toString()
                                    } catch (e: Exception) {
                                        Log.e("VC_STORE", "Failed to add display name: ${e.message}")
                                        credentialStr 
                                    }
                                    
                                    // Store credential 
                                    Log.d("VC_STORE", "Storing credential in credential store")
                                    CredentialStore.addCredential(credentialWithDisplayName)
                                    Log.d("VC_STORE", "Credential stored successfully")
                                    isLoading.value = false
                                    
                                    // Navigate back to home screen
                                    navController.navigate(Screen.Home.route) {
                                        // Pop everything including auth_webview and credential_detail
                                        popUpTo(Screen.Home.route) { inclusive = true }
                                    }
                                }
                            }
                        }

                    } catch (e: Exception) {
                        Log.e("CredentialDownload", "Download failed: ${e.message}", e)
                        
                        // CRITICAL: Must switch to Main dispatcher to update UI state
                        withContext(Dispatchers.Main) {
                            isLoading.value = false
                            showError.value = true
                            
                            // Different error messages based on error type
                            errorMessage.value = when {
                                e is UnknownHostException -> "No internet connection"
                                e is java.net.SocketTimeoutException -> "No internet connection"
                                e is java.net.ConnectException -> "No internet connection"
                                e.message?.contains("Unable to resolve host", ignoreCase = true) == true -> "No internet connection"
                                e.message?.contains("timeout", ignoreCase = true) == true -> "No internet connection"
                                else -> "Something went wrong!"
                            }
                            
                            Log.e("CredentialDownload", "Error UI shown: ${errorMessage.value}")

                            // Also navigate away from AuthWebView so user doesn't get stuck on its loader
                            try {
                                navController.navigate(Screen.Home.route) {
                                    popUpTo(Screen.Home.route) { inclusive = true }
                                }
                            } catch (navE: Exception) {
                                Log.w("CredentialDownload", "Navigation after error failed: ${navE.message}")
                            }
                        }
                    } finally {
                        // Safety net: Must run on Main dispatcher
                        withContext(Dispatchers.Main) {
                            if (isLoading.value) {
                                isLoading.value = false
                                showError.value = true
                                errorMessage.value = "Something went wrong!"
                                Log.e("CredentialDownload", "Finally block: Error UI forced")
                            }
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading.value,
            colors = ButtonDefaults.buttonColors(
                containerColor = com.example.samplecredentialwallet.ui.theme.InjiOrange
            )
        ) {
            if (isLoading.value) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = Color.White
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Downloading...")
            } else {
                Text("Download Credential")
            }
        }
        }

        // Loading overlay
        if (isLoading.value) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.5f)),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(48.dp),
                            color = com.example.samplecredentialwallet.ui.theme.InjiOrange
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = loadingMessage.value,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Please wait...",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )
                    }
                }
            }
        }
        
        // Error Screen Overlay
        if (showError.value && errorMessage.value != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFFFF3E0) // Light orange background
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Error Icon
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = "Error",
                            tint = Color(0xFFF57C00), // Orange color
                            modifier = Modifier.size(72.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        Text(
                            text = errorMessage.value ?: "Something went wrong!",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(
                            text = if (errorMessage.value == "No internet connection") {
                                "Please check your internet connection and try again."
                            } else {
                                "We are having some trouble with your request. Please try again."
                            },
                            style = MaterialTheme.typography.bodyLarge,
                            color = Color.Gray,
                            modifier = Modifier.fillMaxWidth()
                        )
                        
                        Spacer(modifier = Modifier.height(32.dp))
                        
                        Button(
                            onClick = {
                                showError.value = false
                                errorMessage.value = null
                                navController.navigate(Screen.Home.route) {
                                    popUpTo(Screen.Home.route) { inclusive = true }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = com.example.samplecredentialwallet.ui.theme.InjiOrange
                            )
                        ) {
                            Text("Try again", fontSize = 16.sp)
                        }
                    }
                }
            }
        }
    }
}

suspend fun handleAuthorizationFlow(
    navController: NavController,
    url: String
): String {
    withContext(Dispatchers.Main) {
        navController.navigate(Screen.AuthWebView.createRoute(url))
    }
    val code = AuthCodeHolder.waitForCode()
    return code
}

private fun signProofJWT(
    cNonce: String?,
    issuer: String,
    isTrusted: Boolean,
    context: android.content.Context
): String {
    // Validate required dynamic inputs
    val nonNullNonce = cNonce?.trim()?.takeIf { it.isNotEmpty() }
        ?: throw IllegalStateException("c_nonce missing from token response; cannot build proof JWT")
    val clientId = Constants.clientId?.takeIf { it.isNotBlank() }
        ?: throw IllegalStateException("clientId not initialized in Constants; call the appropriate ViewModel setup before starting download")

    val manager = SecureKeystoreManager.getInstance(context)
    val useEc = manager.hasKey(SecureKeystoreManager.KeyType.ES256)
    val useRsa = manager.hasKey(SecureKeystoreManager.KeyType.RS256)

    if (!useEc && !useRsa) {
        throw IllegalStateException("No keystore key available. Initialize keystore before signing.")
    }

    
    val (alg, publicJwk) = if (useRsa) {
        JWSAlgorithm.RS256 to buildPublicRsaJwkFromAndroid(SecureKeystoreManager.KeyType.RS256.value)
    } else {
        JWSAlgorithm.ES256 to buildPublicEcJwkFromAndroid(SecureKeystoreManager.KeyType.ES256.value)
    }

    Log.d("PROOF_JWT", "Algorithm: $alg")
    Log.d("PROOF_JWT", "Public key type: ${publicJwk.keyType}")

    val header = JWSHeader.Builder(alg)
        .type(JOSEObjectType("openid4vci-proof+jwt"))
        .jwk(publicJwk)
        .build()

    Log.d("PROOF_JWT", "JWT Header created with type: openid4vci-proof+jwt")

    val audience = (Constants.credentialIssuerHost ?: issuer)

    val now = System.currentTimeMillis()
    val claimsSet = JWTClaimsSet.Builder()
        .issuer(clientId)
        .audience(audience)
        .claim("nonce", nonNullNonce)
        .issueTime(Date(now))
        .expirationTime(Date(now + 3 * 60 * 1000))
        .build()

    // Note: JWT claims contain sensitive data (nonce, etc.) - avoid logging in production

    Log.d("PROOF_JWT", "Signing JWT with algorithm: $alg")
    val signedJWT = SignedJWT(header, claimsSet).apply {
        if (alg == JWSAlgorithm.RS256) {
            val privateKey = loadPrivateKey(SecureKeystoreManager.KeyType.RS256.value)
            sign(RSASSASigner(privateKey))
            Log.d("PROOF_JWT", "Signed with RS256 private key")
        } else {
            val privateKey = loadPrivateKey(SecureKeystoreManager.KeyType.ES256.value) as ECPrivateKey
            sign(ECDSASigner(privateKey))
            Log.d("PROOF_JWT", "Signed with ES256 private key")
        }
    }

    // Note: Serialized JWT contains sensitive proof - avoid logging in production

    return signedJWT.serialize()
}

private fun String.base64Url(): String {
    return Base64.getUrlEncoder().withoutPadding().encodeToString(toByteArray())
}
private fun buildPublicRsaJwkFromAndroid(alias: String): RSAKey {
    val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    val cert = ks.getCertificate(alias)
        ?: throw IllegalStateException("No certificate for alias: $alias")
    val publicKey = cert.publicKey as? RSAPublicKey
        ?: throw IllegalStateException("Alias $alias is not an RSA key")
    return RSAKey.Builder(publicKey)
        .keyID(alias)
        .build()
}

private fun buildPublicEcJwkFromAndroid(alias: String): ECKey {
    val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    val cert = ks.getCertificate(alias)
        ?: throw IllegalStateException("No certificate for alias: $alias")
    val publicKey = cert.publicKey as? ECPublicKey
        ?: throw IllegalStateException("Alias $alias is not an EC key")
    return ECKey.Builder(Curve.P_256, publicKey)
        .keyID(alias)
        .build()
}

private fun loadPrivateKey(alias: String): PrivateKey {
    val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    return ks.getKey(alias, null) as? PrivateKey
        ?: throw IllegalStateException("Private key not found for alias: $alias")
}

suspend fun sendTokenRequest(
    tokenRequest: TokenRequest,
    tokenEndpoint: String
): JSONObject {
    val url = URL(tokenEndpoint)
    val conn = url.openConnection() as HttpURLConnection
    conn.requestMethod = "POST"
    conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
    conn.doOutput = true
    conn.connectTimeout = 15000
    conn.readTimeout = 15000

    // Helper function to URL-encode parameter values
    fun enc(value: String): String = URLEncoder.encode(value, "UTF-8")

    val formBody = buildString {
        append("grant_type=${enc(tokenRequest.grantType.value)}")
        tokenRequest.authCode?.let { append("&code=${enc(it)}") }
        tokenRequest.preAuthCode?.let { append("&pre-authorized_code=${enc(it)}") }
        tokenRequest.txCode?.let { append("&tx_code=${enc(it)}") }
        tokenRequest.clientId?.let { append("&client_id=${enc(it)}") }
        tokenRequest.redirectUri?.let { append("&redirect_uri=${enc(it)}") }
        tokenRequest.codeVerifier?.let { append("&code_verifier=${enc(it)}") }
    }

    try {
        conn.outputStream.use { os ->
            os.write(formBody.toByteArray())
        }

        val responseCode = conn.responseCode

        if (responseCode == HttpURLConnection.HTTP_OK) {
            val responseText = conn.inputStream.bufferedReader().readText()
            return JSONObject(responseText)
        } else {
            val errorText = conn.errorStream?.bufferedReader()?.readText() ?: "Unknown error"
            throw Exception("HTTP error $responseCode: $errorText")
        }
    } catch (e: Exception) {
        throw e
    } finally {
        conn.disconnect()
    }
}
