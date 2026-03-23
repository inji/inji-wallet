package com.example.samplecredentialwallet.utils

import kotlinx.coroutines.CompletableDeferred

/**
 * Holds transaction code input from user
 */
object TransactionCodeHolder {
    private var deferred: CompletableDeferred<String>? = null

    var inputMode: String? = null
    var description: String? = null
    var length: Int? = null

    suspend fun waitForTransactionCode(): String {
        deferred = CompletableDeferred()
        return deferred!!.await()
    }

    fun submitTransactionCode(code: String) {
        deferred?.complete(code)
        deferred = null
        // Clear the metadata
        inputMode = null
        description = null
        length = null
    }

    fun cancelTransactionCode() {
        deferred?.completeExceptionally(Exception("Transaction code input cancelled"))
        deferred = null
        inputMode = null
        description = null
        length = null
    }
}
