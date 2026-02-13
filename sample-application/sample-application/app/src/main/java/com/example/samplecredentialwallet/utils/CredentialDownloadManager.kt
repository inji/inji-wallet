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
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.security.KeyStore
import java.security.PrivateKey
import java.security.interfaces.ECPrivateKey
import java.security.interfaces.ECPublicKey
import java.security.interfaces.RSAPublicKey
import java.util.Base64
import java.util.Date


suspend fun downloadCredential(
  client: VCIClient,
  selectedIssuer: IssuerConfigurationV2,
  clientMetadata: ClientMetadata,
  loadingMessage: MutableState<String>,
  navController: NavController,
  context: Context
): CredentialResponse {

  val credential = client.fetchCredentialFromTrustedIssuer(
    credentialIssuer = selectedIssuer.credentialIssuerHost,
    credentialConfigurationId = "FarmerCredential_VCDM2.0",
    clientMetadata = clientMetadata,

    authorizations = listOf(
      AuthorizationMethod.RedirectToWeb(
        { url ->
          Log.d("AUTH_FLOW", "Authorization flow started")
          Log.d("AUTH_FLOW", "Authorization URL: $url")
          withContext(Dispatchers.Main) {
            loadingMessage.value = "Authenticating..."
          }
          //Handle authorization flow
          val authorizationResult = handleAuthorizationFlow(navController, url)
          Log.d("AUTH_FLOW", "Authorization result received")
          // return authorizationResult
          authorizationResult
        }
      )
    ),
    getTokenResponse = { tokenRequest ->
      Log.d("TOKEN_EXCHANGE", "Token exchange started")
      Log.d("TOKEN_EXCHANGE", "Token endpoint: ${tokenRequest.tokenEndpoint}")
      withContext(Dispatchers.Main) {
        loadingMessage.value = "Exchanging tokens..."
      }

      Log.d("TOKEN_EXCHANGE", "Using custom endpoint: ${selectedIssuer.backendTokenEndpoint}")

      val response = sendTokenRequest(tokenRequest, selectedIssuer.backendTokenEndpoint)
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
      val proofJwt = signProofJWT(cNonce, issuer, context = context)
      proofJwt
    }
  )
  return credential
}


private suspend fun handleAuthorizationFlow(
  navController: NavController,
  url: String
): Map<String, String> {
  Log.d("AUTH_FLOW", "Authorization flow started")
  Log.d("AUTH_FLOW", "Authorization URL: $url")
  withContext(Dispatchers.Main) {
    navController.navigate(Screen.AuthWebView.createRoute(url))
  }
  return AuthCodeHolder.waitForAuthorizationResult()
}


private fun signProofJWT(
  cNonce: String?,
  issuer: String,
  context: Context
): String {
  val selectedIssuer = IssuerRepositoryV2.getConfiguration(Constants.selectedIssuer ?: "")
  if (selectedIssuer == null) {
    throw IllegalStateException("Issuer configuration not found for selected issuer: ${Constants.selectedIssuer}")
  }
  // Validate required dynamic inputs
  val nonNullNonce = cNonce?.trim()?.takeIf { it.isNotEmpty() }
    ?: throw IllegalStateException("c_nonce missing from token response; cannot build proof JWT")
  val clientId = selectedIssuer.clientId

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
