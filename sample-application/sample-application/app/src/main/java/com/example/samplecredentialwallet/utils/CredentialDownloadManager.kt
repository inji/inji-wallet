package com.example.samplecredentialwallet.utils

import android.content.Context
import android.util.Log
import androidx.compose.runtime.MutableState
import androidx.navigation.NavController
import com.example.samplecredentialwallet.navigation.Screen
import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.ECDSASigner
import com.nimbusds.jose.crypto.RSASSASigner
import com.nimbusds.jose.jwk.Curve
import com.nimbusds.jose.jwk.ECKey
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import io.mosip.vciclient.VCIClient
import io.mosip.vciclient.authorizationCodeFlow.AuthorizationMethod
import io.mosip.vciclient.authorizationCodeFlow.clientMetadata.ClientMetadata
import io.mosip.vciclient.credential.response.CredentialResponse
import io.mosip.vciclient.token.TokenRequest
import io.mosip.vciclient.token.TokenResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.lang.RuntimeException
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.security.KeyStore
import java.security.PrivateKey
import java.security.interfaces.ECPublicKey
import java.security.interfaces.RSAPublicKey
import java.util.Date

val client = VCIClient("demo-123")

suspend fun downloadCredentialFromTrustedIssuer(
  selectedIssuer: IssuerConfigurationV2,
  loadingMessage: MutableState<String>,
  navController: NavController,
  context: Context
): CredentialResponse {

  val credentialResponse = client.fetchCredentialFromTrustedIssuer(
    credentialIssuer = selectedIssuer.credentialIssuerHost, // issuer host - used for discovery of issuer metadata
    credentialConfigurationId = Constants.selectedCredentialType, // The relevant credential type which is required for download
    clientMetadata = ClientMetadata(
      clientId = selectedIssuer.clientId, // client Identifier associated with the wallet for initiating the download
      redirectUri = selectedIssuer.redirectUri
    ),
    authorizations = listOf(
      AuthorizationMethod.RedirectToWeb(
        openWebPage = { url -> handleAuthorizationFlow(navController, url, loadingMessage) }
      )
    ),
    getTokenResponse = { tokenRequest ->
      sendTokenRequest(
        tokenRequest,
        loadingMessage,
        selectedIssuer
      )
    },
    getProofJwt = { credentialIssuer, cNonce, proofSigningAlgorithmsSupported ->
      constructProofJWT(
        cNonce = cNonce,
        issuer = credentialIssuer,
        supportedProofAlgorithms = proofSigningAlgorithmsSupported,
        context = context,
        loadingMessage = loadingMessage,
        isTrustedIssuerFlow = true
      )
    },
    downloadTimeoutInMillis = 5000
  )

  return credentialResponse
}

suspend fun downloadCredentialFromCredentialOffer( credentialOfferUri: String,
                                                   loadingMessage: MutableState<String>,
                                                   navController: NavController,
                                                   context: Context) : CredentialResponse {
  val credentialResponse = client.fetchCredentialByCredentialOffer(
    credentialOffer = credentialOfferUri,// The data extracted from the QR code
    clientMetadata = ClientMetadata(
      clientId = Constants.credentialOfferClientId,
      redirectUri = "io.mosip.residentapp.inji://oauthredirect"
    ),
    authorizations = listOf(
      AuthorizationMethod.RedirectToWeb(
        openWebPage = { url -> handleAuthorizationFlow(navController, url, loadingMessage) }
      )
    ),
    getTokenResponse = { tokenRequest ->
      sendTokenRequest(
        tokenRequest,
        loadingMessage,
      )
    },
    getProofJwt = { credentialIssuer, cNonce, proofSigningAlgorithmsSupported ->
      constructProofJWT(
        cNonce = cNonce,
        issuer = credentialIssuer,
        supportedProofAlgorithms = proofSigningAlgorithmsSupported,
        context = context,
        loadingMessage = loadingMessage,
      )
    },
    getTxCode = {inputMode, description, length -> getTransactionCode(inputMode, description, length)},
    downloadTimeoutInMillis = 5000
  )

  return credentialResponse
}

private suspend fun getTransactionCode(inputMode: String?, description: String?, length: Int?): String {
  // For demo purposes, we return a dummy tx code. In real implementation, you would show UI to user to get this input.
  Log.d(
    "TX_CODE",
    "Requesting transaction code with inputMode=$inputMode, description=$description, length=$length"
  )
  // Show UI to user for entering the transaction code and use the user entered transaction code
  return "123456" // Dummy tx code
}

private suspend fun handleAuthorizationFlow(
  navController: NavController,
  url: String,
  loadingMessage: MutableState<String>,
): Map<String, String> {
  // update loader
  withContext(Dispatchers.Main) {
    loadingMessage.value = "Authenticating..."
  }
  Log.d("AUTH_FLOW", "Authorization flow started")
  Log.d("AUTH_FLOW", "Authorization URL: $url")
  // Open the webview of the authorization url provided by the vci client library
  withContext(Dispatchers.Main) {
    navController.navigate(Screen.AuthWebView.createRoute(url))
  }
  return AuthCodeHolder.waitForAuthorizationResult()
}


private suspend fun constructProofJWT(
  cNonce: String?,
  issuer: String,
  supportedProofAlgorithms: List<String>,
  loadingMessage: MutableState<String>,
  context: Context,
  isTrustedIssuerFlow: Boolean = false
): String {
  withContext(Dispatchers.Main) {
    loadingMessage.value = "Generating proof..."
  }
  val selectedIssuer = IssuerRepositoryV2.getConfiguration(Constants.selectedIssuer ?: "")
  if (isTrustedIssuerFlow && selectedIssuer == null) {
    throw IllegalStateException("Issuer configuration not found for selected issuer: ${Constants.selectedIssuer}")
  }
  val clientId: String = (if (isTrustedIssuerFlow) selectedIssuer?.clientId else Constants.credentialOfferClientId).toString()

  Log.d("PROOF_JWT", "Constructing proof JWT - supported algorithms: $supportedProofAlgorithms")

  // Validate required dynamic inputs
  val nonNullNonce = cNonce?.trim()?.takeIf { it.isNotEmpty() }
    ?: throw IllegalStateException("c_nonce missing from token response; cannot build proof JWT")

  val manager = SecureKeystoreManager.getInstance(context)

  // App supports RSA and ES types
  if(!supportedProofAlgorithms.contains(SecureKeystoreManager.KeyType.ES256.value) &&
    !supportedProofAlgorithms.contains(SecureKeystoreManager.KeyType.RS256.value)) {
      throw RuntimeException("None of the supported algo of wallet is available in proof supported algorithms")
  }

  val useEc = manager.hasKey(SecureKeystoreManager.KeyType.ES256) && supportedProofAlgorithms.contains("ES256")
  val useRsa = manager.hasKey(SecureKeystoreManager.KeyType.RS256) && supportedProofAlgorithms.contains("RS256")


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

  val now = System.currentTimeMillis()

  val claimsSet = JWTClaimsSet.Builder()
    .issuer(clientId)
    .audience(issuer)
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
      // For EC keys, create an ECKey (JWK) with both public and private parts
      val privateKey = loadPrivateKey(SecureKeystoreManager.KeyType.ES256.value)
      val ecJwk = buildEcJwkWithPrivateKey(SecureKeystoreManager.KeyType.ES256.value, privateKey)
      sign(ECDSASigner(ecJwk))
      Log.d("PROOF_JWT", "Signed with ES256 private key")
    }
  }

  // Note: Serialized JWT contains sensitive proof - avoid logging in production

  return signedJWT.serialize()
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

private fun buildEcJwkWithPrivateKey(alias: String, privateKey: PrivateKey): ECKey {
  val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
  val cert = ks.getCertificate(alias)
    ?: throw IllegalStateException("No certificate for alias: $alias")
  val publicKey = cert.publicKey as? ECPublicKey
    ?: throw IllegalStateException("Alias $alias is not an EC key")

  // Build ECKey with both public and private key for signing
  // The private key from Android Keystore can be used directly without casting
  return ECKey.Builder(Curve.P_256, publicKey)
    .privateKey(privateKey)
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
  loadingMessage: MutableState<String>,
): TokenResponse {
  return handleTokenRequest(loadingMessage, tokenRequest.tokenEndpoint, tokenRequest)
}

suspend fun sendTokenRequest(
  tokenRequest: TokenRequest,
  loadingMessage: MutableState<String>,
  selectedIssuer: IssuerConfigurationV2
): TokenResponse {
  return handleTokenRequest(loadingMessage, selectedIssuer.backendTokenEndpoint, tokenRequest)
}

private suspend fun handleTokenRequest(
  loadingMessage: MutableState<String>,
  backendTokenEndpoint: String,
  tokenRequest: TokenRequest
): TokenResponse {
  withContext(Dispatchers.Main) {
    loadingMessage.value = "Exchanging tokens..."
  }
  val url = URL(backendTokenEndpoint)
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
      val response = JSONObject(responseText)

      return TokenResponse(
        accessToken = response.getString("access_token"),
        tokenType = response.getString("token_type"),
        expiresIn = response.optInt("expires_in"),
        cNonce = response.optString("c_nonce"),
        cNonceExpiresIn = response.optInt("c_nonce_expires_in")
      )
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

//Download via credential offer
/**
 *client.fetchCredentialByCredentialOffer(
 *     credentialOffer = TODO(),
 *     clientMetadata = TODO(),
 *     getTxCode = TODO(),
 *     authorizations = TODO(),
 *     getTokenResponse = TODO(),
 *     getProofJwt = TODO(),
 *     onCheckIssuerTrust = TODO(),
 *     downloadTimeoutInMillis = TODO()
 *   )
 */
