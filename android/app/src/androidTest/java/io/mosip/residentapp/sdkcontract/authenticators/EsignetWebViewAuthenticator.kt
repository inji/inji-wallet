package io.mosip.residentapp.sdkcontract

import android.app.Instrumentation
import android.net.Uri
import android.util.Log
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import java.nio.charset.StandardCharsets
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

sealed class EsignetAuthMethod {
  abstract val defaultAcrValues: String

  data class Otp(
    val individualId: String,
    val otp: String,
    override val defaultAcrValues: String = "mosip:idp:acr:generated-code",
  ) : EsignetAuthMethod()

  data class Kbi(
    val individualId: String,
    val fields: Map<String, String>,
    override val defaultAcrValues: String = "mosip:idp:acr:knowledge",
  ) : EsignetAuthMethod()

  data class NationalIdOtp(
    val individualId: String,
    override val defaultAcrValues: String = "mosip:idp:nationalid:generated-code",
  ) : EsignetAuthMethod()
}


class EsignetWebViewAuthenticator(
    private val instrumentation: Instrumentation,
    private val authMethod: EsignetAuthMethod,
) {
    fun obtainAuthorizationCode(authorizationUrl: String): String {
        Log.i(TAG, "Starting WebView auth [${authMethod::class.simpleName}]")
        Log.i(TAG, "Authorization URL: $authorizationUrl")

        val latch = CountDownLatch(1)
        val codeRef = AtomicReference<String?>(null)
        var webView: WebView? = null
        val context = instrumentation.targetContext

        instrumentation.runOnMainSync {
            webView = WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true

                webViewClient = object : WebViewClient() {

                    override fun shouldOverrideUrlLoading(
                        view: WebView,
                        request: WebResourceRequest,
                    ): Boolean = handleUrl(request.url.toString(), codeRef, latch)

                    @Suppress("DEPRECATION")
                    override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean =
                        handleUrl(url, codeRef, latch)

                    override fun onPageFinished(view: WebView, url: String) {
                        Log.i(TAG, "Page finished: $url")
                        Log.i(TAG, "Injecting form fill JS")
                        injectFormFill(view)
                    }

                    override fun onReceivedError(
                        view: WebView,
                        request: WebResourceRequest,
                        error: WebResourceError,
                    ) {
                        if (request.isForMainFrame) {
                            Log.e(TAG, "Main frame error ${error.errorCode}: ${error.description} at ${request.url}")
                        }
                    }
                }
            }
            webView!!.loadUrl(authorizationUrl)
        }

        try {
            check(latch.await(REDIRECT_TIMEOUT_SECS, TimeUnit.SECONDS)) {
                "OAuth redirect not received within ${REDIRECT_TIMEOUT_SECS}s. " +
                    "Check logcat for 'Page finished:' lines to see where the flow stalled."
            }
            return codeRef.get()
                ?: error("Redirect received but carried no 'code' parameter.")
        } finally {
            instrumentation.runOnMainSync { webView?.destroy() }
        }
    }

    // handles redirect
    private fun handleUrl(
        url: String,
        codeRef: AtomicReference<String?>,
        latch: CountDownLatch,
    ): Boolean {
        if (!url.startsWith(REDIRECT_PREFIX)) return false
        val code = Uri.parse(url).getQueryParameter("code")
        Log.i(TAG, "Redirect intercepted — code=${code}")
        codeRef.set(code)
        latch.countDown()
        return true
    }

    //js injections for ui automation
    private fun injectFormFill(view: WebView) {
        when (authMethod) {
            is EsignetAuthMethod.Kbi -> injectKbiFill(view, authMethod)
            is EsignetAuthMethod.Otp -> injectOtpFill(view, authMethod)
            is EsignetAuthMethod.NationalIdOtp -> {} //TODO
        }
    }

    // Inject js for kbi flow
    private fun injectKbiFill(view: WebView, kbi: EsignetAuthMethod.Kbi) {
        val fullName = kbi.fields["fullName"] ?: error("KBI fields missing 'fullName'")
        val dob      = kbi.fields["dob"]      ?: error("KBI fields missing 'dob'")
        Log.i(TAG, "KBI fill: policy=${kbi.individualId}  name=$fullName  dob=$dob")

        val js = loadAssetText(KBI_JS_ASSET_PATH)
            .replace("__POLICY_NUMBER__", escapeJsString(kbi.individualId))
            .replace("__FULL_NAME__", escapeJsString(fullName))
            .replace("__DOB__", escapeJsString(dob))

        view.evaluateJavascript(js, null)
    }

    private fun loadAssetText(assetPath: String): String =
        instrumentation.context.assets.open(assetPath).use { input ->
            String(input.readBytes(), StandardCharsets.UTF_8)
        }

    private fun escapeJsString(value: String): String =
        value
            .replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\n", "\\n")
            .replace("\r", "\\r")

    //inject js for otp flow
    private fun injectOtpFill(view: WebView, otp: EsignetAuthMethod.Otp) {
        Log.i(TAG, "OTP form JS injection not yet implemented")
    }


    private companion object {
        const val TAG                 = "EsignetWebViewAuth"
        const val REDIRECT_PREFIX     = "io.mosip.residentapp.inji://oauthredirect"
        const val REDIRECT_TIMEOUT_SECS = 90L
        const val KBI_JS_ASSET_PATH = "sdkcontract/kbi-fill.js"
    }
}
