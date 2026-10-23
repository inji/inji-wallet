package io.mosip.residentapp

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityServiceException
import com.google.android.play.core.integrity.IntegrityTokenRequest

/**
 * Requests Play Integrity classic tokens so mimoto can verify that a device key is registered
 * from a genuine, Play-installed app on a genuine device.
 */
class RNPlayIntegrityModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "RNPlayIntegrityModule"

    /**
     * @param nonce web-safe base64 value the verdict is bound to (16 to 500 characters)
     * @param cloudProjectNumber Google Cloud project linked to the app in Play Console; blank to let Play infer it
     */
    @ReactMethod
    fun requestIntegrityToken(nonce: String, cloudProjectNumber: String?, promise: Promise) {
        val builder = IntegrityTokenRequest.builder().setNonce(nonce)
        cloudProjectNumber?.trim()?.toLongOrNull()?.let { builder.setCloudProjectNumber(it) }

        IntegrityManagerFactory.create(reactApplicationContext)
            .requestIntegrityToken(builder.build())
            .addOnSuccessListener { response -> promise.resolve(response.token()) }
            .addOnFailureListener { error ->
                val code = (error as? IntegrityServiceException)?.errorCode?.toString() ?: "PLAY_INTEGRITY_ERROR"
                promise.reject(code, error.message, error)
            }
    }
}
