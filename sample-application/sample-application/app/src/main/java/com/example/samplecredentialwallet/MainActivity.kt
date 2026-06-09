package com.example.samplecredentialwallet

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.LaunchedEffect
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.rememberNavController
import com.example.samplecredentialwallet.navigation.AppNavHost
import com.example.samplecredentialwallet.ovp.utils.OpenID4VPManager
import com.example.samplecredentialwallet.utils.SecureKeystoreManager
import com.example.samplecredentialwallet.utils.AuthCodeHolder
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    companion object {
        private const val TAG = "MainActivity"
    }

    private lateinit var keystoreManager: SecureKeystoreManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        OpenID4VPManager.init("sample-credential-wallet")

        // Initialize keystore manager
        keystoreManager = SecureKeystoreManager.getInstance(this)

        // On app launch, initialize the keystore and generate keys.
        initializeKeystoreIfNeeded()

        setContent {
            val navController = rememberNavController()

            // Set up your NavHost
            AppNavHost(navController = navController)

            // Handle deeplink when activity is created
            LaunchedEffect(Unit) {
                handleDeeplink(intent)
            }
        }
    }

    private fun initializeKeystoreIfNeeded() {
        // Check if keys are already generated
        if (keystoreManager.areKeysGenerated()) {
            Log.i(TAG, "Keys already exist, skipping generation")
            return
        }

        // Generate keys for first time
      /**
       * On app launch, the Secure Keystore library is used to generate cryptographic keys,
       * which are later used for signing purposes during credential download.
       *
       */
        lifecycleScope.launch {
            try {
                val result = keystoreManager.initializeKeystore()

                if (result.isSuccess) {
                    val message = result.getOrNull() ?: "Key pairs generated successfully!"
                    Log.i(TAG, message)

                    // Log keystore status
                    val status = keystoreManager.getKeystoreStatus()
                    Log.d(TAG, "Keystore Status: $status")

                } else {
                    val error = result.exceptionOrNull()
                    Log.e(TAG, "Keystore initialization failed", error)
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error during keystore initialization", e)
            }
        }
    }

    private fun showToast(message: String) {
        runOnUiThread {
            Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        Log.d(TAG, "onNewIntent received: data=${intent.data}")
        setIntent(intent)
        handleDeeplink(intent)
    }

    private fun handleDeeplink(intent: Intent?) {
        intent?.data?.let { uri: Uri ->
            Log.d(TAG, "handleDeeplink called with uri=$uri")
            if (uri.toString().startsWith("io.mosip.residentapp.inji://oauthredirect")) {
                val code = uri.getQueryParameter("code")
                val error = uri.getQueryParameter("error")
                val queryParams = mutableMapOf<String, String>()
                uri.queryParameterNames.forEach { name ->
                    queryParams[name] = uri.getQueryParameter(name) ?: ""
                }

                Log.d(
                    TAG,
                    "OAuth redirect received. codePresent=${code != null}, error=$error, params=${queryParams.keys}"
                )

                // Complete both holders because different flows wait on different deferred types.
                AuthCodeHolder.complete(code)
                AuthCodeHolder.completeV2(queryParams)
            }
        }
    }
}
