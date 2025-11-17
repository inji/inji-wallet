package com.example.samplecredentialwallet.ui.auth

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.net.Uri
import android.util.Log
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavController
import com.example.samplecredentialwallet.navigation.Screen
import com.example.samplecredentialwallet.utils.AuthCodeHolder

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AuthWebViewScreen(
    authorizationUrl: String,
    redirectUri: String,
    navController: NavController
) {
    var isLoading by remember { mutableStateOf(true) }
    var isDownloading by remember { mutableStateOf(false) }
    var currentUrl by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Header with loading indicator
            if (isLoading) {
                LinearProgressIndicator(
                    modifier = Modifier.fillMaxWidth(),
                    color = androidx.compose.ui.graphics.Color(0xFFF2680C)
                )
            }

            Text(
                text = "Authenticating...",
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                maxLines = 1
            )

        // WebView
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.loadWithOverviewMode = true
                    settings.useWideViewPort = true

                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                            super.onPageStarted(view, url, favicon)
                            Log.d("AuthWebView", "Page started: $url")
                            currentUrl = url ?: ""
                            isLoading = true
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            super.onPageFinished(view, url)
                            Log.d("AuthWebView", "Page finished: $url")
                            isLoading = false
                        }

                        override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                            Log.d("AuthWebView", "shouldOverrideUrlLoading: $url")

                            if (url != null && url.startsWith(redirectUri)) {
                                Log.d("AuthWebView", "Redirect URI matched: $url")

                                val uri = Uri.parse(url)
                                val code = uri.getQueryParameter("code")
                                val error = uri.getQueryParameter("error")

                                Log.d("AuthWebView", "Auth code present: ${code != null}, Error: $error")

                                if (code != null) {
                                    Log.d("AuthWebView", "Completing auth flow with code")
                                    AuthCodeHolder.complete(code)
                                    isLoading = true
                                    isDownloading = true
                                    errorMessage = null
                                } else if (error != null) {
                                    Log.e("AuthWebView", "Auth error: $error")
                                    isLoading = false
                                    isDownloading = false
                                    errorMessage = "Authentication failed: $error"
                                    AuthCodeHolder.complete(null)
                                } else {
                                    Log.w("AuthWebView", "No code or error in redirect")
                                    isLoading = false
                                    isDownloading = false
                                    errorMessage = "Authentication failed: No authorization code received"
                                    AuthCodeHolder.complete(null)
                                }

                                // Don't navigate back - stay on this screen with loader
                                // The download will complete in background and navigate when done
                                return true
                            }

                            return false
                        }

                        override fun onReceivedError(
                            view: WebView?,
                            errorCode: Int,
                            description: String?,
                            failingUrl: String?
                        ) {
                            super.onReceivedError(view, errorCode, description, failingUrl)
                            Log.e("AuthWebView", "WebView error: $errorCode - $description for $failingUrl")
                            isLoading = false
                            isDownloading = false
                            errorMessage = "Failed to load page: ${description ?: "Unknown error"}"
                        }
                    }

                    Log.d("AuthWebView", "Loading authorization URL: $authorizationUrl")
                    loadUrl(authorizationUrl)
                }
            },
            modifier = Modifier.fillMaxSize()
        )
        }
        
        // Loading overlay when page is loading or downloading
        if (isLoading || isDownloading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White.copy(alpha = 0.95f)),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(56.dp),
                            color = Color(0xFFF2680C)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = if (isDownloading) "Downloading Credential..." else "Loading Authentication...",
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
        
        // Error overlay when there's an error
        errorMessage?.let { message ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White.copy(alpha = 0.95f)),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Error",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Color.Red
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = message,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.Gray
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Button(
                            onClick = { 
                                errorMessage = null
                                navController.popBackStack()
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFF2680C)
                            )
                        ) {
                            Text("Go Back")
                        }
                    }
                }
            }
        }
    }
}
