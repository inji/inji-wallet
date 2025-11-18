package  com.example.samplecredentialwallet.utils

import android.util.Log
import io.mosip.vercred.vcverifier.CredentialsVerifier
import io.mosip.vercred.vcverifier.constants.CredentialFormat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

object CredentialVerifier {

    private val verifier = CredentialsVerifier()
    private const val LOG_TAG = "CredentialVerifier"

    suspend fun verifyCredential(credentialJson: String, demoMode: Boolean = false): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                Log.d(LOG_TAG, "Starting credential verification (demoMode: $demoMode)")
                val credentialHash = credentialJson.hashCode().toString(16)
                Log.d(LOG_TAG, "Credential hash: $credentialHash, length: ${credentialJson.length}")
                

                val cleanCredential = if (credentialJson.startsWith("CredentialResponse(")) {
                    Log.d(LOG_TAG, "Extracting credential from response wrapper")
                    val credMatch = Regex("""credential=(\{.*\})(?:,|\))""").find(credentialJson)
                    credMatch?.groupValues?.get(1) ?: credentialJson
                } else {
                    credentialJson
                }
                
                // Validate JSON structure
                try {
                    JSONObject(cleanCredential)
                    Log.d(LOG_TAG, "JSON structure valid")
                } catch (e: Exception) {
                    Log.e(LOG_TAG, "Invalid JSON structure: ${e.message}")
                    return@withContext false
                }

                // Perform cryptographic verification
                Log.d(LOG_TAG, "Performing cryptographic verification with LDP_VC format")

                try {
                    val result = verifier.verify(cleanCredential, CredentialFormat.LDP_VC)

                    if (result.verificationStatus) {
                        Log.i(LOG_TAG, "✓ Credential verified successfully")
                        Log.d(LOG_TAG, "Verification message: ${result.verificationMessage}")
                        return@withContext true
                    } else {
                        Log.w(LOG_TAG, "✗ Credential verification failed")
                        Log.w(LOG_TAG, "Error code: ${result.verificationErrorCode}")
                        Log.w(LOG_TAG, "Error message: ${result.verificationMessage}")
                        
                        if (demoMode) {
                            Log.i(LOG_TAG, "Demo mode: accepting despite verification failure")
                            return@withContext true
                        } else {
                            Log.e(LOG_TAG, "Production mode: rejecting unverified credential")
                            return@withContext false
                        }
                    }
                } catch (verifyError: NoClassDefFoundError) {
                    Log.w(LOG_TAG, "Verification library class not found: ${verifyError.message}")
                    if (demoMode) {
                        Log.i(LOG_TAG, "Demo mode: accepting despite library error")
                        return@withContext true
                    } else {
                        Log.e(LOG_TAG, "Production mode: cannot verify without library")
                        return@withContext false
                    }
                } catch (verifyError: ClassNotFoundException) {
                    Log.w(LOG_TAG, "Verification library dependencies missing: ${verifyError.message}")
                    if (demoMode) {
                        Log.i(LOG_TAG, "Demo mode: accepting despite missing dependencies")
                        return@withContext true
                    } else {
                        Log.e(LOG_TAG, "Production mode: cannot verify without dependencies")
                        return@withContext false
                    }
                } catch (verifyError: UnsatisfiedLinkError) {
                    Log.w(LOG_TAG, "Native library error: ${verifyError.message}")
                    if (demoMode) {
                        Log.i(LOG_TAG, "Demo mode: accepting despite native library error")
                        return@withContext true
                    } else {
                        Log.e(LOG_TAG, "Production mode: cannot verify without native library")
                        return@withContext false
                    }
                } catch (verifyError: Exception) {
                    Log.e(LOG_TAG, "Verification exception: ${verifyError.javaClass.simpleName} - ${verifyError.message}")
                    if (demoMode) {
                        Log.i(LOG_TAG, "Demo mode: accepting despite verification exception")
                        return@withContext true
                    } else {
                        Log.e(LOG_TAG, "Production mode: rejecting due to verification exception")
                        return@withContext false
                    }
                }
            } catch (e: Exception) {
                Log.e(LOG_TAG, "Unexpected error during verification: ${e.javaClass.simpleName} - ${e.message}")
                if (demoMode) {
                    Log.w(LOG_TAG, "Demo mode: attempting fallback validation")
                    // In demo mode, at least validate it's parseable JSON
                    return@withContext try {
                        val cleanCredential = if (credentialJson.startsWith("CredentialResponse(")) {
                            val credMatch = Regex("""credential=(\{.*\})(?:,|\))""").find(credentialJson)
                            credMatch?.groupValues?.get(1) ?: credentialJson
                        } else {
                            credentialJson
                        }
                        JSONObject(cleanCredential)
                        Log.i(LOG_TAG, "Demo mode: valid JSON structure, accepting")
                        true
                    } catch (jsonError: Exception) {
                        Log.e(LOG_TAG, "Demo mode: invalid JSON, rejecting")
                        false
                    }
                } else {
                    Log.e(LOG_TAG, "Production mode: rejecting due to unexpected error")
                    return@withContext false
                }
            }
        }
    }
}
