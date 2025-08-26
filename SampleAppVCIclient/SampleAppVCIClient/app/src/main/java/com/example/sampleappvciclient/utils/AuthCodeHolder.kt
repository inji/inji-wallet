package com.example.sampleappvciclient.utils

import android.util.Log
import kotlinx.coroutines.CompletableDeferred

object AuthCodeHolder {
    private var deferred: CompletableDeferred<String?>? = null

    @Synchronized
    fun prepare(): CompletableDeferred<String?> {
        if (deferred == null || deferred?.isCompleted == true) {
            deferred = CompletableDeferred()
            Log.d("AuthCodeHolder", "✨ New deferred created")
        } else {
            Log.d("AuthCodeHolder", "♻️ Reusing existing deferred")
        }
        return deferred!!
    }

    @Synchronized
    fun complete(code: String?) {
        Log.d("AuthCodeHolder", "🎯 Completing with code: ${code?.take(10)}...")
        val currentDeferred = deferred
        if (currentDeferred != null && !currentDeferred.isCompleted) {
            currentDeferred.complete(code)
            Log.d("AuthCodeHolder", "✅ Deferred completed successfully")
        } else {
            Log.w("AuthCodeHolder", "⚠️ No active deferred to complete or already completed")
        }
    }

    // This is what authorizeUser will call
    suspend fun waitForCode(): String {
        Log.d("AuthCodeHolder", "⏳ Waiting for auth code...")
        val d = prepare()
        val result = d.await()
        Log.d("AuthCodeHolder", "📨 Received result: ${result?.take(10)}...")
        return result ?: throw Exception("Auth canceled or failed")
    }

    @Synchronized
    fun reset() {
        Log.d("AuthCodeHolder", "🔄 Resetting AuthCodeHolder")
        deferred?.cancel()
        deferred = null
    }
}
