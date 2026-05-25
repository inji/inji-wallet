package io.mosip.residentapp

import android.content.Context
import android.util.Base64
import androidx.biometric.BiometricPrompt.CryptoObject
import com.reactnativesecurekeystore.CipherBoxImpl
import com.reactnativesecurekeystore.SecureKeystoreImpl
import com.reactnativesecurekeystore.biometrics.Biometrics
import kotlinx.coroutines.runBlocking
import java.security.PrivateKey

object BinarySigner {
    fun signBase64(
        keystore: SecureKeystoreImpl,
        cipherBox: CipherBoxImpl,
        biometrics: Biometrics,
        signAlgorithm: String,
        alias: String,
        base64Data: String,
        onSuccess: (String) -> Unit,
        onFailure: (Int, String) -> Unit,
        context: Context,
    ) {
        try {
            val key = keystore.getKeyOrThrow(alias) as PrivateKey
            val payload = Base64.decode(base64Data, Base64.NO_WRAP)

            runBlocking {
                val createCryptoObject = { CryptoObject(cipherBox.createSignature(key, signAlgorithm)) }
                val action: (CryptoObject) -> Unit = { cryptoObject ->
                    val signature = cryptoObject.signature!!
                    signature.update(payload)
                    onSuccess(Base64.encodeToString(signature.sign(), Base64.DEFAULT))
                }
                biometrics.authenticateAndPerform(createCryptoObject, action, onFailure, context)
            }
        } catch (e: Exception) {
            onFailure(e.hashCode(), e.message ?: e.toString())
        }
    }
}
