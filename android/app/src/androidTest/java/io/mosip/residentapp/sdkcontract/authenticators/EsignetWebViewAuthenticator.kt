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
        val state = Uri.parse(authorizationUrl).getQueryParameter("state") ?: error("Authorization URL [$authorizationUrl] carries no state parameter")
        val trustedOrigin = canonicalHttpsOrigin(authorizationUrl)

        instrumentation.runOnMainSync {
            webView = WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true

                webViewClient = object : WebViewClient() {

                    override fun shouldOverrideUrlLoading(
                        view: WebView,
                        request: WebResourceRequest,
                    ): Boolean = handleUrl(request.url.toString(), state, codeRef, latch, request.isForMainFrame)

                    @Suppress("DEPRECATION")
                    override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean =
                        handleUrl(url, state, codeRef, latch)

                    override fun onPageFinished(view: WebView, url: String) {
                        Log.i(TAG, "Page finished: $url")
                        if (trustedOrigin == null || canonicalHttpsOrigin(url) != trustedOrigin) {
                            Log.w(TAG, "Skipping form fill: page is not on the trusted origin")
                            return
                        }
                        Log.i(TAG, "Injecting form fill JS")
                        injectFormFill(view, trustedOrigin)
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
        expectedState : String,
        codeRef: AtomicReference<String?>,
        latch: CountDownLatch,
        isMainFrame: Boolean = true, // the legacy String overload carries no frame info
    ): Boolean {
        val callback = Uri.parse(url)
        if (!isRegisteredCallback(callback)) return false
        if (!isMainFrame) {
            Log.w(TAG, "Ignoring callback-like navigation from a subframe")
            return true
        }
        if (callback.getQueryParameter("state") != expectedState) {
          Log.w(TAG, "Ignoring redirect whose state does not match the active authorization request")
          return true
        }
        val code = callback.getQueryParameter("code")
        Log.i(TAG, "Redirect intercepted; code present=${!code.isNullOrBlank()}")
        codeRef.set(code)
        latch.countDown()
        return true
    }

    // Exact scheme/authority/path match; the query (code, state) is intentionally not compared.
    private fun isRegisteredCallback(uri: Uri): Boolean {
        val registered = Uri.parse(REDIRECT_URI)
        return registered.scheme.equals(uri.scheme, ignoreCase = true) &&
            registered.authority == uri.authority &&
            (registered.path ?: "").trimEnd('/') == (uri.path ?: "").trimEnd('/')
    }

    //js injections for ui automation
    private fun injectFormFill(view: WebView, trustedOrigin: String) {
        when (authMethod) {
            is EsignetAuthMethod.Kbi -> injectKbiFill(view, authMethod, trustedOrigin)
            is EsignetAuthMethod.Otp -> injectOtpFill(view, authMethod, trustedOrigin)
            is EsignetAuthMethod.NationalIdOtp -> {} //TODO
        }
    }

    // Inject js for kbi flow
    private fun injectKbiFill(view: WebView, kbi: EsignetAuthMethod.Kbi, trustedOrigin: String) {
        val fullName = kbi.fields["fullName"] ?: error("KBI fields missing 'fullName'")
        val dob      = kbi.fields["dob"]      ?: error("KBI fields missing 'dob'")
        Log.i(TAG, "KBI fill: policy=${kbi.individualId}  name=$fullName  dob=$dob")

        val js = loadAssetText(KBI_JS_ASSET_PATH)
            .replace("__EXPECTED_ORIGIN__", escapeJsString(trustedOrigin))
            .replace("__POLICY_NUMBER__", escapeJsString(kbi.individualId))
            .replace("__FULL_NAME__", escapeJsString(fullName))
            .replace("__DOB__", escapeJsString(dob))

        view.evaluateJavascript(js, null)
    }

    private fun canonicalHttpsOrigin(url: String?): String? {
        if (url == null) return null
        val uri = Uri.parse(url)
        val host = uri.host?.lowercase() ?: return null
        if (!"https".equals(uri.scheme, ignoreCase = true) || uri.userInfo != null) return null
        return if (uri.port == -1 || uri.port == 443) "https://$host" else "https://$host:${uri.port}"
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
    private fun injectOtpFill(view: WebView, otp: EsignetAuthMethod.Otp, trustedOrigin: String) {
        Log.i(TAG, "OTP form JS injection not yet implemented")
    }


    private companion object {
        const val TAG                 = "EsignetWebViewAuth"
        const val REDIRECT_URI        = "io.mosip.residentapp.inji://oauthredirect"
        const val REDIRECT_TIMEOUT_SECS = 90L
        const val KBI_JS_ASSET_PATH = "sdkcontract/kbi-fill.js"
    }
}
