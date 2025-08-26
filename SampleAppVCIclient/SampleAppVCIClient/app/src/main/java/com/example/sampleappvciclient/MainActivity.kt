package com.example.sampleappvciclient

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.LaunchedEffect
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController
import com.example.sampleappvciclient.navigation.AppNavHost
import com.example.sampleappvciclient.utils.SecureKeystoreManager
import com.example.sampleappvciclient.utils.AuthCodeHolder
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    companion object {
        private const val TAG = "MainActivity"
    }

    private lateinit var keystoreManager: SecureKeystoreManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize keystore manager
        keystoreManager = SecureKeystoreManager.getInstance(this)

        // Check and initialize keystore
        initializeKeystoreIfNeeded()

        setContent {
            val navController = rememberNavController()

            // Set up your NavHost
            AppNavHost(navController = navController)

            // Handle deeplink when activity is created
            LaunchedEffect(Unit) {
                handleDeeplink(intent, navController)
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
        lifecycleScope.launch {
            try {
                showToast("Generating secure key pairs...")

                val result = keystoreManager.initializeKeystore()

                if (result.isSuccess) {
                    val message = result.getOrNull() ?: "Key pairs generated successfully!"
                    Log.i(TAG, message)
                    showToast("✅ $message")

                    // Log keystore status
                    val status = keystoreManager.getKeystoreStatus()
                    Log.d(TAG, "Keystore Status: $status")

                } else {
                    val error = result.exceptionOrNull()
                    Log.e(TAG, "Keystore initialization failed", error)
                    showToast("❌ Failed to generate keys: ${error?.message}")
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error during keystore initialization", e)
                showToast("❌ Keystore error: ${e.message}")
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
        setIntent(intent) // update intent reference so LaunchedEffect can pick it up
    }

    private fun handleDeeplink(
        intent: Intent?,
        navController: NavHostController
    ) {
        intent?.data?.let { uri: Uri ->
            if (uri.toString().startsWith("io.mosip.residentapp.inji://oauthredirect")) {
                val code = uri.getQueryParameter("code")
                Log.d(TAG, "⚡ handleDeeplink triggered with code=$code")
                AuthCodeHolder.complete(code)
            }
        }
    }
}
