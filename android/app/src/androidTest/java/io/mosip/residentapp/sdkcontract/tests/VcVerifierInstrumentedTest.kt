package io.mosip.residentapp.sdkcontract

import android.util.Log
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Test
import org.junit.Assert.assertTrue
import org.junit.runner.RunWith
import io.mosip.vercred.vcverifier.CredentialsVerifier;
import io.mosip.vercred.vcverifier.PresentationVerifier;
import io.mosip.residentapp.sdkcontract.SdkContractTestSupport.prettyPrint
import io.mosip.vercred.vcverifier.constants.CredentialFormat

@RunWith(AndroidJUnit4::class)
class VcVerifierInstrumentedTest {
  @Test
  fun verifyCredential() {
    val credentialsVerifier = CredentialsVerifier();
    val liveCredential = SdkContractTestSupport.lastDownloadedCredential?.credentialJson
    assertTrue(
      "No live credential found.",
      !liveCredential.isNullOrBlank(),
    )
    Log.i(TAG, prettyPrint(liveCredential))
    Log.i(TAG, "using live credential")
    val result = credentialsVerifier.verify(credential = liveCredential!!, credentialFormat = CredentialFormat.LDP_VC)
    Log.i(TAG, prettyPrint(result))
  }

  @Test
  fun verifyPresentation() {
    val presentationVerifier = PresentationVerifier()
    val livePresentation = SdkContractTestSupport.lastBuiltPresentation
    assertTrue(
      "No live presentation found.",
      !livePresentation.isNullOrBlank(),
    )
    Log.i(TAG, prettyPrint(livePresentation))
    Log.i(TAG, "using live built presentation")
    //verify
    val result = presentationVerifier.verifyV2(livePresentation!!)
    Log.i(TAG, prettyPrint(result))
  }

  private companion object {
    const val TAG = "VcVerifierInstrumentedTest"
   }
}
