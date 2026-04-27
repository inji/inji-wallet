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


suspend fun downloadCredentialFromTrustedIssuer(
  selectedIssuer: IssuerConfigurationV2,
  selectedCredentialType: String,
  loadingMessage: MutableState<String>,
  navController: NavController,
  context: Context
): CredentialResponse {
  Log.d(
    "VCI_FLOW",
    "downloadCredentialFromTrustedIssuer start issuer=${selectedIssuer.id}, host=${selectedIssuer.credentialIssuerHost}, credentialType=$selectedCredentialType"
  )

  val credentialResponse = OpenID4VCI.client.fetchCredentialFromTrustedIssuer(
    credentialIssuer = selectedIssuer.credentialIssuerHost, // issuer host - used for discovery of issuer metadata
    credentialConfigurationId = selectedCredentialType, // The relevant credential type which is required for download
    clientMetadata = ClientMetadata(
      clientId = selectedIssuer.clientId, // client Identifier associated with the wallet for initiating the download
      redirectUri = selectedIssuer.redirectUri
    ),
//    supported authorizations of the Wallet for the download flow.
    authorizations = listOf(
      // Redirect the user to the authorization endpoint (authorization server) in a web view or browser,
      // and get the authorization response parameters back after successful authorization.
      AuthorizationMethod.RedirectToWeb(
        // Callback function to open the authorization endpoint in a web view or browser,
        // and return the authorization response parameters (e.g., code, state) after successful authorization.
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
    downloadTimeoutInMillis = 120000
  )

  return credentialResponse
}

suspend fun downloadCredentialFromCredentialOffer( credentialOfferUri: String,
                                                   loadingMessage: MutableState<String>,
                                                   navController: NavController,
                                                   context: Context) : CredentialResponse {
  Log.d("VCI_FLOW", "downloadCredentialFromCredentialOffer start offerUriLength=${credentialOfferUri.length}")
  val credentialResponse = OpenID4VCI.client.fetchCredentialUsingCredentialOffer(
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
    // Callback function to get user trust with the Credential Issuer
    onCheckIssuerTrust = { credentialIssuer, issuerDisplay ->
      Log.d("CHECK_ISSUER_TRUST", "Checking trust for issuer: $credentialIssuer")
// check if the issuer is in the trusted list of issuers.
// You can also use the issuerDisplay information to show user friendly name/logo of the issuer to users when asking them to confirm if they trust the issuer
      true
    },
//    Imagine you want to pick up a package from a friend.
//    Your friend gives you a special number so only you can get it
//    A transaction code is a one-time code that
//    ensures only the right wallet can download a specific credential.
    getTxCode = {inputMode, description, length -> getTransactionCode(inputMode, description, length)},
    downloadTimeoutInMillis = 120000
  )

  Log.d("VCI_FLOW", "downloadCredentialFromCredentialOffer completed")

  return credentialResponse
}

/**
 * inputMode - input character set. text / numeric
 * length - length of the transaction code expected. This is just a hint.
 * description - A user friendly description on how to obtain the Transaction Code, e.g., describing over which communication channel it is delivered.
 *
 */
private suspend fun getTransactionCode(inputMode: String?, description: String?, length: Int?): String {
  Log.d(
    "TX_CODE",
    "Requesting transaction code with inputMode=$inputMode, description=$description, length=$length"
  )

  // Store metadata for the dialog to use
  TransactionCodeHolder.inputMode = inputMode
  TransactionCodeHolder.description = description
  TransactionCodeHolder.length = length

  // Wait for user to enter the transaction code via the dialog
  return TransactionCodeHolder.waitForTransactionCode()
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
  Log.d("AUTH_FLOW", "Waiting for authorization result from AuthCodeHolder")
  val result = AuthCodeHolder.waitForAuthorizationResult()
  Log.d("AUTH_FLOW", "Authorization result received with keys=${result.keys}")
  return result
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
  val clientId: String = if (isTrustedIssuerFlow) {
    selectedIssuer?.clientId
      ?: throw IllegalStateException("clientId is not configured for issuer: ${Constants.selectedIssuer}")
  } else {
    Constants.credentialOfferClientId
  }

  Log.d("PROOF_JWT", "Constructing proof JWT - supported algorithms: $supportedProofAlgorithms")

  // Validate required dynamic inputs
  val nonNullNonce = cNonce?.trim()?.takeIf { it.isNotEmpty() }
    ?: throw IllegalStateException("c_nonce missing from token response; cannot build proof JWT")

  val now = System.currentTimeMillis()

  val claimsSet = JWTClaimsSet.Builder()
    .issuer(clientId)
    .audience(issuer)
    .claim("nonce", nonNullNonce)
    .issueTime(Date(now))
    .expirationTime(Date(now + 3 * 60 * 1000))
    .build()

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
  Log.d(
    "VCI_TOKEN",
    "Sending token request to backend endpoint=$backendTokenEndpoint grantType=${tokenRequest.grantType.value}"
  )
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

  Log.d(
    "VCI_TOKEN",
    "Token request payload flags: hasAuthCode=${tokenRequest.authCode != null}, hasPreAuthCode=${tokenRequest.preAuthCode != null}, hasTxCode=${tokenRequest.txCode != null}, hasCodeVerifier=${tokenRequest.codeVerifier != null}"
  )

  try {
    conn.outputStream.use { os ->
      os.write(formBody.toByteArray())
    }

    val responseCode = conn.responseCode
    Log.d("VCI_TOKEN", "Token endpoint HTTP status=$responseCode")

    if (responseCode == HttpURLConnection.HTTP_OK) {
      val responseText = conn.inputStream.bufferedReader().readText()
      val response = JSONObject(responseText)
      Log.d(
        "VCI_TOKEN",
        "Token response received: tokenType=${response.optString("token_type")}, hasAccessToken=${response.optString("access_token").isNotEmpty()}, hasCNonce=${response.optString("c_nonce").isNotEmpty()}"
      )

      return TokenResponse(
        accessToken = response.getString("access_token"),
        tokenType = response.getString("token_type"),
        expiresIn = response.optInt("expires_in"),
        cNonce = response.optString("c_nonce"),
        cNonceExpiresIn = response.optInt("c_nonce_expires_in")
      )
    } else {
      val errorText = conn.errorStream?.bufferedReader()?.readText() ?: "Unknown error"
      Log.e("VCI_TOKEN", "Token endpoint error $responseCode: $errorText")
      throw Exception("HTTP error $responseCode: $errorText")
    }
  } catch (e: Exception) {
    Log.e("VCI_TOKEN", "Token request exception: ${e.message}", e)
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
