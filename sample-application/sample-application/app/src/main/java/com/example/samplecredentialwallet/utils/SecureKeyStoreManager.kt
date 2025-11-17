package com.example.samplecredentialwallet.utils


import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.reactnativesecurekeystore.*
import com.reactnativesecurekeystore.biometrics.Biometrics
import kotlinx.coroutines.*


class SecureKeystoreManager(private val context: Context) {
    companion object {
        private const val TAG = "SecureKeystoreManager"
        private const val PREFS_NAME = "keystore_prefs"
        private const val KEY_KEYS_GENERATED = "keys_generated"
        private const val KEY_ORDER_PREFERENCE = "keyPreference"

       
        @Volatile
        private var INSTANCE: SecureKeystoreManager? = null

        fun getInstance(context: Context): SecureKeystoreManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: SecureKeystoreManager(context.applicationContext).also { INSTANCE = it }
            }
        }
    }


    enum class KeyType(val value: String) {
        RS256("RS256"),
        ES256("ES256")
    }

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    // Initialize MOSIP components
    private val keyGenerator = KeyGeneratorImpl()
    private val cipherBox = CipherBoxImpl()
    private val biometrics = Biometrics()
    private val preferences = PreferencesImpl(context)
    private val keystore = SecureKeystoreImpl(keyGenerator, cipherBox, biometrics, preferences)
    private val deviceCapability = DeviceCapability(keystore, keyGenerator, biometrics)

    /**
     * Check if device supports hardware keystore
     */
    fun isHardwareKeystoreSupported(): Boolean {
        return deviceCapability.supportsHardwareKeyStore()
    }

    /**
     * Check if biometrics is enabled on device
     */
    fun isBiometricsEnabled(): Boolean {
        return deviceCapability.hasBiometricsEnabled(context)
    }

    /**
     * Check if keys have already been generated
     */
    fun areKeysGenerated(): Boolean {
        return prefs.getBoolean(KEY_KEYS_GENERATED, false)
    }

    /**
     * Initialize keystore - generate keys if not already done
     * Returns success/failure result
     */
    suspend fun initializeKeystore(): Result<String> = withContext(Dispatchers.IO) {
        if (areKeysGenerated()) {
            Log.i(TAG, "Keys already generated, skipping initialization")
            return@withContext Result.success("Keys already exist")
        }

        try {
            generateAndStoreKeyPairs()
            markKeysAsGenerated()
            Log.i(TAG, "Keystore initialization completed successfully")
            Result.success("Key pairs generated and stored successfully!")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize keystore", e)
            Result.failure(e)
        }
    }

    private suspend fun generateAndStoreKeyPairs() {
        val deviceBiometricsEnabled = isBiometricsEnabled()
        val isHardwareSupported = isHardwareKeystoreSupported()

        Log.i(TAG, "Hardware keystore supported: $isHardwareSupported")
        Log.i(TAG, "Biometrics enabled on device: $deviceBiometricsEnabled")
        val isBiometricsEnabledForKeys = false

        if (isHardwareSupported) {
            generateKeyPairRSA(isBiometricsEnabledForKeys)
            generateKeyPairECR1(isBiometricsEnabledForKeys)
        } else {
            Log.w(TAG, "Hardware keystore not supported, keys will be stored in software")
            throw Exception("Hardware keystore not supported on this device")
        }
        storeKeyPreferences()
    }

    /**
     * Generate RSA key pair (RS256)
     */
    private suspend fun generateKeyPairRSA(isBiometricsEnabled: Boolean) = withContext(Dispatchers.IO) {
        val alias = KeyType.RS256.value

        try {
            if (!keystore.hasAlias(alias)) {
                val publicKeyPem = keystore.generateKeyPair(
                    KeyType.RS256.value,
                    alias,
                    isBiometricsEnabled,
                    0
                )

                Log.i(TAG, "Generated RS256 key pair with alias: $alias")
                Log.d(TAG, "RS256 Public Key PEM: $publicKeyPem")
            } else {
                Log.i(TAG, "RS256 key pair already exists with alias: $alias")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to generate RS256 key pair", e)
            throw e
        }
    }

    /**
     * Generate EC key pair (ES256)
     */
    private suspend fun generateKeyPairECR1(isBiometricsEnabled: Boolean) = withContext(Dispatchers.IO) {
        val alias = KeyType.ES256.value

        try {
            if (!keystore.hasAlias(alias)) {
                val publicKeyPem = keystore.generateKeyPair(
                    KeyType.ES256.value,
                    alias,
                    isBiometricsEnabled,
                    0  // auth timeout
                )

                Log.i(TAG, "Generated ES256 key pair with alias: $alias")
                Log.d(TAG, "ES256 Public Key PEM: $publicKeyPem")
            } else {
                Log.i(TAG, "ES256 key pair already exists with alias: $alias")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to generate ES256 key pair", e)
            throw e
        }
    }

    /**
     * Store key order preferences similar to React Native
     */
    private fun storeKeyPreferences() {
        try {
            // Create key order map similar to React Native implementation
            val keyOrderJson = "{\"RS256\":\"RS256\",\"ES256\":\"ES256\"}"

            // Store using the preferences implementation
            preferences.savePreference(KEY_ORDER_PREFERENCE, keyOrderJson)

            Log.i(TAG, "Stored key preferences: $keyOrderJson")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to store key preferences", e)
        }
    }

    /**
     * Mark keys as generated in SharedPreferences
     */
    private fun markKeysAsGenerated() {
        prefs.edit().putBoolean(KEY_KEYS_GENERATED, true).apply()
    }

    /**
     * Retrieve public key for given alias
     */
    suspend fun getPublicKey(keyType: KeyType): Result<String> = withContext(Dispatchers.IO) {
        try {
            val alias = keyType.value
            if (!keystore.hasAlias(alias)) {
                throw Exception("Key not found for alias: $alias")
            }
            val publicKey = keystore.retrieveKey(alias)
            Result.success(publicKey)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Check if specific key exists
     */
    fun hasKey(keyType: KeyType): Boolean {
        return keystore.hasAlias(keyType.value)
    }

    /**
     * Clear all keys (use with caution)
     */
    suspend fun clearAllKeys(): Result<String> = withContext(Dispatchers.IO) {
        try {
            keystore.removeAllKeys()
            prefs.edit().clear().apply()
            Log.i(TAG, "All keys cleared")
            Result.success("All keys cleared successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to clear keys", e)
            Result.failure(e)
        }
    }

    /**
     * Get keystore status for debugging
     */
    fun getKeystoreStatus(): Map<String, Any> {
        return mapOf(
            "hardwareSupported" to isHardwareKeystoreSupported(),
            "biometricsEnabled" to isBiometricsEnabled(),
            "keysGenerated" to areKeysGenerated(),
            "hasRS256" to hasKey(KeyType.RS256),
            "hasES256" to hasKey(KeyType.ES256)
        )
    }
}