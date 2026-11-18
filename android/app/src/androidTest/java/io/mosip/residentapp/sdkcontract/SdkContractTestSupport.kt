package io.mosip.residentapp.sdkcontract

import android.util.Log
import com.google.gson.GsonBuilder
import com.nimbusds.jose.jwk.OctetKeyPair

object SdkContractTestSupport {
    const val TEST_CREDENTIAL_ISSUER = "https://injicertify-mock.qainji.mosip.net"

    const val TRACEABILITY_ID = "inji-sdk-poc-test"

    data class DownloadedCredential(val credentialJson: String, val credentialId: String)

    @Volatile
    var lastDownloadedCredential: DownloadedCredential? = null

    @Volatile
    var lastBuiltPresentation: String? = null

   //for es256
    @Volatile
    var lastHolderPrivateKey: java.security.PrivateKey? = null

    private const val MAX_LOG_CHUNK = 3500

    private val PRETTY_GSON = GsonBuilder().setPrettyPrinting().create()

    fun prettyPrint(value: Any?): String = PRETTY_GSON.toJson(value)

    fun logMultiline(tag: String, payload: String) {
        payload.lineSequence().forEach { line ->
            if (line.length <= MAX_LOG_CHUNK) {
                Log.i(tag, line)
            } else {
                line.chunked(MAX_LOG_CHUNK).forEach { Log.i(tag, it) }
            }
        }
    }

    fun logBanner(tag: String, title: String) {
        Log.i(tag, "===== $title =====")
    }
}
