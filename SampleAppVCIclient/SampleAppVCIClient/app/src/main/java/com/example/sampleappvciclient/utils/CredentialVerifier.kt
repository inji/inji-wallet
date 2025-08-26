package  com.example.sampleappvciclient.utils

import android.util.Log
import io.mosip.vercred.vcverifier.CredentialsVerifier
import io.mosip.vercred.vcverifier.constants.CredentialFormat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object CredentialVerifier {

    private val verifier = CredentialsVerifier()
    private const val LOG_TAG = "CredentialVerifier"

    suspend fun verifyCredential(credentialJson: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                Log.d(LOG_TAG, "Starting credential verification...")

                val result = verifier.verify(credentialJson, CredentialFormat.LDP_VC)

                if (result.verificationStatus) {
                    Log.i(LOG_TAG, "✅ Credential Verified Successfully!")
                    Log.d(LOG_TAG, "Verification Message: ${result.verificationMessage}")
                    true
                } else {
                    Log.w(LOG_TAG, "❌ Credential Verification Failed! Code=${result.verificationErrorCode}, Msg=${result.verificationMessage}")
                    false
                }
            } catch (e: Exception) {
                Log.e(LOG_TAG, "❌ Verification Error: ${e.message}", e)
                false
            }
        }
    }
}
