package com.example.samplecredentialwallet.utils

import android.util.Log
import kotlinx.coroutines.CompletableDeferred

object AuthCodeHolder {
    private var deferred: CompletableDeferred<String?>? = null
    private var deferredV2: CompletableDeferred<Map<String, String>?>? = null
    private var lastCode: String? = null
    private var authorizationResult: Map<String, String>? = null

    @Synchronized
    fun prepare(): CompletableDeferred<String?> {
        if (deferred == null || deferred?.isCompleted == true) {
            deferred = CompletableDeferred()
            Log.d("AuthCodeHolder", "New deferred created")

            // If we have a buffered code, complete immediately
            if (lastCode != null) {
                Log.d("AuthCodeHolder", "Fulfilling deferred with buffered code")
                deferred?.complete(lastCode)
                lastCode = null
            }
        } else {
            Log.d("AuthCodeHolder", "Reusing existing deferred")
        }
        return deferred!!
    }

    @Synchronized
    fun prepareV2(): CompletableDeferred<Map<String, String>?> {
        if (deferredV2 == null || deferredV2?.isCompleted == true) {
            deferredV2 = CompletableDeferred()
            Log.d("AuthCodeHolder", "New deferred created")

            // If we have a buffered code, complete immediately
            if (authorizationResult != null) {
                Log.d("AuthCodeHolder", "Fulfilling deferred with buffered code")
                deferredV2?.complete(authorizationResult)
                authorizationResult = null
                lastCode = null
            }
        } else {
            Log.d("AuthCodeHolder", "Reusing existing deferred")
        }
        return deferredV2!!
    }

    @Synchronized
    fun complete(code: String?) {
        Log.d("AuthCodeHolder", "Completing auth code")
        val currentDeferred = deferred
        if (currentDeferred != null && !currentDeferred.isCompleted) {
            currentDeferred.complete(code)
            Log.d("AuthCodeHolder", "Deferred completed successfully")
        } else {
            // Buffer the code for future prepare() call
            lastCode = code
            Log.d("AuthCodeHolder", "Code buffered for future deferred")
        }
    }

    @Synchronized
    fun completeV2(authorizationResult: Map<String, String>?) {
        Log.d("AuthCodeHolder", "Completing auth code")
        val currentDeferred = deferredV2
        if (currentDeferred != null && !currentDeferred.isCompleted) {
            currentDeferred.complete(authorizationResult)
            Log.d("AuthCodeHolder", "Deferred completed successfully")
        } else {
            // Buffer the code for future prepare() call
            this.authorizationResult = authorizationResult
            Log.d("AuthCodeHolder", "Code buffered for future deferred")
        }
    }

    // This is what authorizeUser will call
    suspend fun waitForCode(): String {
        Log.d("AuthCodeHolder", "Waiting for auth code...")
        val d = prepare()
        val result = d.await()
        Log.d("AuthCodeHolder", "Auth code received")
        return result ?: throw Exception("Auth canceled or failed")
    }

    suspend fun waitForAuthorizationResult(): Map<String, String> {
        Log.d("AuthCodeHolder", "Waiting for auth code...")
        val d = prepareV2()
        val result = d.await()
        Log.d("AuthCodeHolder", "Auth code received")
        return result ?: throw Exception("Auth canceled or failed")
    }

    @Synchronized
    fun reset() {
        Log.d("AuthCodeHolder", "Resetting AuthCodeHolder")
        deferred?.cancel()
        deferred = null
        lastCode = null
    }
}
