package com.example.sampleappvciclient.ui.auth

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.net.Uri
import android.util.Log
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavController
import com.example.sampleappvciclient.navigation.Screen
import com.example.sampleappvciclient.utils.AuthCodeHolder

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AuthWebViewScreen(
    authorizationUrl: String,
    redirectUri: String,
    navController: NavController
) {
    var isLoading by remember { mutableStateOf(true) }
    var currentUrl by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Header with loading indicator and current URL
        if (isLoading) {
            LinearProgressIndicator(
                modifier = Modifier.fillMaxWidth()
            )
        }

        Text(
            text = "Loading: $currentUrl",
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
                                Log.d("AuthWebView", "🎯 Redirect URI matched: $url")

                                val uri = Uri.parse(url)
                                val code = uri.getQueryParameter("code")
                                val error = uri.getQueryParameter("error")

                                Log.d("AuthWebView", "📝 Auth code: $code, Error: $error")

                                if (code != null) {
                                    Log.d("AuthWebView", "✅ Completing auth flow with code: $code")
                                    AuthCodeHolder.complete(code)
                                } else if (error != null) {
                                    Log.e("AuthWebView", "❌ Auth error: $error")
                                    AuthCodeHolder.complete(null)
                                } else {
                                    Log.w("AuthWebView", "⚠️ No code or error in redirect")
                                    AuthCodeHolder.complete(null)
                                }

                                navController.navigate(Screen.CredentialDetail.createRoute(code)) {
                                    popUpTo(Screen.CredentialDetail.route) { inclusive = true }
                                }
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
                        }
                    }

                    Log.d("AuthWebView", "🚀 Loading authorization URL: $authorizationUrl")
                    loadUrl(authorizationUrl)
                }
            },
            modifier = Modifier.fillMaxSize()
        )
    }
}
