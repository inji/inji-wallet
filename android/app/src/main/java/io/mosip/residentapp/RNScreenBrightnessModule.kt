package io.mosip.residentapp

import android.database.ContentObserver
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.Window
import android.view.WindowManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.common.LifecycleState
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.lang.ref.WeakReference

class RNScreenBrightnessModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    private var brightnessWindow: WeakReference<Window>? = null
    private var previousBrightness: Float? = null
    private var hasExternalBrightnessChange = false
    private var isBoostApplied = false
    private var isObservingSettings = false
    private var listenerCount = 0
    private val settingsObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
        override fun onChange(selfChange: Boolean, uri: Uri?) {
            // Window overrides never write Settings. Yield to external brightness/auto-mode changes.
            if (previousBrightness != null && uri?.lastPathSegment?.contains("brightness", ignoreCase = true) == true) {
                hasExternalBrightnessChange = true
                brightnessWindow?.get()?.let { window ->
                    window.attributes = window.attributes.apply {
                        screenBrightness = WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE
                    }
                }
                setBoostApplied(false)
            }
        }
    }

    init {
        reactContext.addLifecycleEventListener(this)
    }

    @ReactMethod
    fun setBoostEnabled(enabled: Boolean, promise: Promise) {
        reactContext.runOnUiQueueThread {
            try {
                val window = currentActivity?.window
                if (enabled && window != null && reactContext.lifecycleState == LifecycleState.RESUMED) {
                    if (brightnessWindow?.get() !== window) {
                        endBoost()
                        brightnessWindow = WeakReference(window)
                        previousBrightness = window.attributes.screenBrightness
                        reactContext.contentResolver.registerContentObserver(Settings.System.CONTENT_URI, true, settingsObserver)
                        isObservingSettings = true
                    }
                    if (hasExternalBrightnessChange) {
                        promise.resolve(false)
                    } else {
                        window.attributes = window.attributes.apply { screenBrightness = 1f }
                        setBoostApplied(true)
                        promise.resolve(true)
                    }
                } else {
                    suspendBoost()
                    promise.resolve(false)
                }
            } catch (exception: Exception) {
                promise.reject("SCREEN_BRIGHTNESS_ERROR", exception.message, exception)
            }
        }
    }

    @ReactMethod
    fun releaseBoost(promise: Promise) {
        reactContext.runOnUiQueueThread {
            try {
                endBoost()
                promise.resolve(null)
            } catch (exception: Exception) {
                promise.reject("SCREEN_BRIGHTNESS_ERROR", exception.message, exception)
            }
        }
    }

    private fun suspendBoost() {
        val window = brightnessWindow?.get()
        val previous = previousBrightness
        if (isBoostApplied && !hasExternalBrightnessChange && window != null && previous != null) {
            window.attributes = window.attributes.apply { screenBrightness = previous }
        }
        setBoostApplied(false)
    }

    private fun endBoost() {
        if (isObservingSettings) {
            reactContext.contentResolver.unregisterContentObserver(settingsObserver)
            isObservingSettings = false
        }
        suspendBoost()
        brightnessWindow = null
        previousBrightness = null
        hasExternalBrightnessChange = false
    }

    private fun setBoostApplied(applied: Boolean) {
        if (isBoostApplied == applied) return
        isBoostApplied = applied
        if (listenerCount > 0) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(
                "onBrightnessBoostChanged",
                Arguments.createMap().apply { putBoolean("isBoostApplied", applied) }
            )
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        reactContext.runOnUiQueueThread { listenerCount += 1 }
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        reactContext.runOnUiQueueThread { listenerCount = (listenerCount - count).coerceAtLeast(0) }
    }

    override fun onHostResume() = Unit
    override fun onHostPause() = suspendBoost()
    override fun onHostDestroy() = endBoost()

    override fun invalidate() {
        reactContext.runOnUiQueueThread {
            listenerCount = 0
            endBoost()
        }
        reactContext.removeLifecycleEventListener(this)
        super.invalidate()
    }

    override fun getName() = "ScreenBrightness"
}
