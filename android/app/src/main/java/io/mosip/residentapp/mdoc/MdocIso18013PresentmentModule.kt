package io.mosip.residentapp.mdoc

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import kotlinx.coroutines.Dispatchers

/**
 * RN bridge: Multipaz ISO 18013-5 proximity — **BLE must advertise** the GATT service UUID from
 * DeviceEngagement (key 10) while this session runs, or Tap2iD / Multipaz Verifier cannot connect
 * (Credence engineering note).
 *
 * Do not call Multipaz [initializeApplication] or construct [InjiIso18013ProximityPresenter] in
 * this class's init: RN instantiates native modules at bridge startup and that led to app crashes
 * on launch. [MdocMultipazBootstrap.initFrom] runs from the presenter coroutine; the presenter is
 * created lazily on first [startPresentment].
 */
class MdocIso18013PresentmentModule(
    private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

    @Volatile
    private var presenter: InjiIso18013ProximityPresenter? = null

    private fun getPresenter(): InjiIso18013ProximityPresenter {
        presenter?.let { return it }
        synchronized(this) {
            presenter?.let { return it }
            // Default: Multipaz presentment calls into hardware keystore signing (DeviceAuth) while
            // holding a suspend continuation. Running the whole session on Main deadlocks when the
            // keystore callback is scheduled on the main looper (app ANR / process death after consent).
            return InjiIso18013ProximityPresenter(reactContext, Dispatchers.Default).also {
                presenter = it
            }
        }
    }

    override fun getName(): String = "MdocIso18013Presentment"

    private fun completePromise(promise: Promise, error: Throwable?) {
        reactContext.runOnUiQueueThread {
            if (!reactContext.hasActiveReactInstance()) {
                Log.w(TAG, "Skipping promise completion: no active React instance")
                return@runOnUiQueueThread
            }
            try {
                if (error != null) {
                    val detail = buildString {
                        append(error.message ?: error.javaClass.simpleName)
                        var c = error.cause
                        var n = 0
                        while (c != null && n < 3) {
                            append(" | cause: ")
                            append(c.message ?: c.javaClass.simpleName)
                            c = c.cause
                            n++
                        }
                    }
                    Log.e(TAG, "Presentment failed: $detail", error)
                    promise.reject("E_MDOC_PROXIMITY", detail, error)
                } else {
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                Log.w(TAG, "Promise completion failed", e)
            }
        }
    }

    private fun missingBlePermissionsForMdocAdvertising(): String? {
        if (Build.VERSION.SDK_INT < 31) {
            return null
        }
        if (reactContext.checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            return Manifest.permission.BLUETOOTH_CONNECT
        }
        if (reactContext.checkSelfPermission(Manifest.permission.BLUETOOTH_ADVERTISE) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            return Manifest.permission.BLUETOOTH_ADVERTISE
        }
        // Multipaz dual-row engagement may use central-client mode (wallet scans for reader).
        if (reactContext.checkSelfPermission(Manifest.permission.BLUETOOTH_SCAN) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            return Manifest.permission.BLUETOOTH_SCAN
        }
        return null
    }

    @ReactMethod
    fun startPresentment(config: ReadableMap, promise: Promise) {
        try {
            val issuerSigned = config.getString("issuerSignedCompact")
                ?: throw IllegalArgumentException("issuerSignedCompact required")
            val engagementB64 = config.getString("deviceEngagementCborBase64")
                ?: throw IllegalArgumentException("deviceEngagementCborBase64 required")
            val ephemeralB64 = config.getString("ephemeralPrivateKeyBase64")
                ?: throw IllegalArgumentException("ephemeralPrivateKeyBase64 required")
            val useSoftware = config.hasKey("useSoftwareDeviceKey") && config.getBoolean("useSoftwareDeviceKey")
            val softwareD32: ByteArray? = if (config.hasKey("deviceKeyPrivateBase64")) {
                Base64.decode(config.getString("deviceKeyPrivateBase64"), Base64.DEFAULT)
            } else {
                null
            }

            val engagementCbor = Base64.decode(engagementB64, Base64.DEFAULT)
            val ephemeralD32 = Base64.decode(ephemeralB64, Base64.DEFAULT)

            missingBlePermissionsForMdocAdvertising()?.let { perm ->
                Log.w(TAG, "startPresentment blocked: missing permission $perm")
                completePromise(
                    promise,
                    SecurityException(
                        "Grant $perm (and related BLE permissions) for mdoc proximity; refusing start to avoid a native crash.",
                    ),
                )
                return
            }

            Log.i(
                TAG,
                "startPresentment from JS (issuerSigned chars=${issuerSigned.length}, engagement bytes=${engagementCbor.size}, softwareKey=$useSoftware)",
            )

            // Serialize with Multipaz-style main-thread BLE + avoid cancel/start races with the FG service.
            reactContext.runOnUiQueueThread {
                try {
                    getPresenter().start(
                        issuerSignedCompact = issuerSigned,
                        deviceEngagementCbor = engagementCbor,
                        ephemeralPrivateKey32 = ephemeralD32,
                        useSoftwareDeviceKey = useSoftware,
                        softwareDeviceKeyPrivate32 = softwareD32,
                    ) { err ->
                        completePromise(promise, err)
                    }
                } catch (e: Exception) {
                    completePromise(promise, e)
                }
            }
        } catch (e: Exception) {
            completePromise(promise, e)
        }
    }

    @ReactMethod
    fun stopPresentment() {
        reactContext.runOnUiQueueThread {
            presenter?.cancel()
        }
    }

    /**
     * User approved sharing requested mDOC elements — resumes native presentment.
     * [disclosedElementsJson] is `[{namespace, element}]`, the subset agreed to; null shares all.
     */
    @ReactMethod
    fun approvePresentment(
        purposesJson: String?,
        disclosedElementsJson: String?,
        promise: Promise,
    ) {
        try {
            getPresenter().approveConsent(purposesJson, disclosedElementsJson)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_MDOC_CONSENT", e.message, e)
        }
    }

    /** User denied sharing — cancels DeviceResponse and ends the session cleanly. */
    @ReactMethod
    fun denyPresentment(promise: Promise) {
        try {
            getPresenter().denyConsent()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("E_MDOC_CONSENT", e.message, e)
        }
    }

    /** Required for RN NativeEventEmitter subscription (no-op on Android). */
    @ReactMethod
    fun addListener(eventName: String) {
        // no-op
    }

    /** Required for RN NativeEventEmitter subscription (no-op on Android). */
    @ReactMethod
    fun removeListeners(count: Int) {
        // no-op
    }

    override fun invalidate() {
        reactContext.runOnUiQueueThread {
            synchronized(this) {
                presenter?.destroy()
                presenter = null
            }
        }
        super.invalidate()
    }

    companion object {
        private const val TAG = "MdocIso18013Presentment"
    }
}
