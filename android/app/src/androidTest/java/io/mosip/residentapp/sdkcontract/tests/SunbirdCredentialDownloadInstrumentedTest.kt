package io.mosip.residentapp.sdkcontract

import android.util.Log
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import io.mosip.residentapp.sdkcontract.SdkContractTestSupport.TRACEABILITY_ID
import io.mosip.residentapp.sdkcontract.SdkContractTestSupport.logBanner
import io.mosip.vciclient.VCIClient
import io.mosip.vciclient.authorizationCodeFlow.AuthorizationMethod
import io.mosip.vciclient.authorizationCodeFlow.clientMetadata.ClientMetadata
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class SunbirdCredentialDownloadInstrumentedTest {

  @Test
  fun downloadsRealCredentialFromTrustedIssuer() {

    //Fetching metadata
    val runtimeConfig = MimotoIssuerConfigResolver.resolveOrFallback(
      issuerId = STAY_PROTECTED_ISSUER_ID,
      credentialConfigurationId = CREDENTIAL_CONFIGURATION_ID,
      fallback = IssuerRuntimeConfig(
        issuerId = STAY_PROTECTED_ISSUER_ID,
        credentialIssuer = CREDENTIAL_ISSUER,
        credentialConfigurationId = CREDENTIAL_CONFIGURATION_ID,
        tokenEndpointProxy = MIMOTO_TOKEN_PROXY,
        clientId = CLIENT_ID,
      ),
    )

    val vciClient = VCIClient(TRACEABILITY_ID)
    val callbacks = SdkDownloadCallbacks(
      tokenEndpointOverride = runtimeConfig.tokenEndpointProxy,
      clientId = runtimeConfig.clientId,
    )

    val authenticator = EsignetWebViewAuthenticator(
      instrumentation = InstrumentationRegistry.getInstrumentation(),
      authMethod = EsignetAuthMethod.Kbi(
        individualId = POLICY_NUMBER,
        fields = mapOf(
          "fullName" to POLICY_NAME,
          "dob" to DOB,
        ),
      ),
    )

    //Download VC
    val credentialResponse = runBlocking {
      vciClient.fetchCredentialsFromTrustedIssuer(
        credentialIssuer = runtimeConfig.credentialIssuer,
        credentialConfigurationId = runtimeConfig.credentialConfigurationId,
        clientMetadata = ClientMetadata(runtimeConfig.clientId, REDIRECT_URI),
        getTokenResponse = { tokenRequest -> callbacks.exchangeToken(tokenRequest) },
        authorizations = listOf(
          AuthorizationMethod.RedirectToWeb(
            openWebPage = { authorizationUrl ->
              Log.i(TAG, "authorizationUrl = $authorizationUrl")
              mapOf("code" to authenticator.obtainAuthorizationCode(authorizationUrl))
            },
          ),
        ),
        getProofs = { metadata -> callbacks.buildProofs(metadata) },
        downloadTimeoutInMillis = DOWNLOAD_TIMEOUT_MILLIS,
      )
    }

    logBanner(TAG, "DOWNLOADED CREDENTIAL")

    //validations
    val credentials = credentialResponse.credentials
    assertNotNull("CredentialResponse carried no credentials list", credentials)
    assertFalse("Issuer returned zero credentials", credentials!!.isEmpty())

    assertEquals(
      "Unexpected credentialConfigurationId",
      runtimeConfig.credentialConfigurationId,
      credentialResponse.credentialConfigurationId,
    )
    assertEquals(
      "Unexpected credentialIssuer",
      runtimeConfig.credentialIssuer,
      credentialResponse.credentialIssuer,
    )

    val credential = credentials.first().credential
    assertNotNull("CredentialItem carried no credential payload", credential)
    assertTrue("Credential payload is not a JSON object", credential!!.isJsonObject)

    //Storing VC and Algorithms used for signing which are later used in presentation
    val credentialJson = credential.toString()
    val credentialId = credential.asJsonObject.get("id")?.asString
        ?: "${java.util.UUID.randomUUID()}_injicertify-insurance"
    val credentialSubject = credential.asJsonObject.getAsJsonObject("credentialSubject")
    assertTrue("Validation of policy name",credentialSubject.asJsonObject.get("policyName")?.asString.equals(POLICY_NAME))
    assertTrue("Validation of policy number",credentialSubject.asJsonObject.get("policyNumber")?.asString.equals(POLICY_NUMBER))
    assertTrue("Validation of date of birth",credentialSubject.asJsonObject.get("dob")?.asString.equals(DOB))

    SdkContractTestSupport.lastDownloadedCredential =
        SdkContractTestSupport.DownloadedCredential(credentialJson, credentialId)
    SdkContractTestSupport.lastHolderPrivateKey = callbacks.lastUsedHolderEcPrivateKey
    Log.i(TAG, "stored credential id = $credentialId")
    Log.i(TAG, "PASS - downloaded a real verifiable credential bound to the test holder key")
  }

  private companion object {
    const val TAG = "SunbirdCredentialDownloadTest"
    const val STAY_PROTECTED_ISSUER_ID = "StayProtected"
    const val CREDENTIAL_CONFIGURATION_ID = "InsuranceCredential"

    // Fallbacks
    const val CREDENTIAL_ISSUER = "https://injicertify-insurance.released.mosip.net"
    const val MIMOTO_TOKEN_PROXY = "https://api.qainji.mosip.net/v1/mimoto/get-token/StayProtected"
    const val CLIENT_ID = "mpartner-default-mimoto-insurance-oidc"
    const val REDIRECT_URI = "io.mosip.residentapp.inji://oauthredirect"

    // Hardcoded for now, will be using api's to create dynamic policy. //TODO
    const val POLICY_NAME = "virat"
    const val POLICY_NUMBER = "1818"
    const val DOB = "2026-07-01" // yyyy-MM-dd
    const val DOWNLOAD_TIMEOUT_MILLIS = 60_000L
  }
}
