package com.example.samplecredentialwallet.ovp.utils

import android.util.Log
import com.example.samplecredentialwallet.ovp.data.VCMetadata
import com.example.samplecredentialwallet.utils.CredentialStore
import com.google.gson.Gson
import com.google.gson.JsonObject
import io.mosip.openID4VP.constants.FormatType

object CredentialStoreOVPBridge {
    private val gson = Gson()

    fun getAllCredentialMetadata(): List<VCMetadata> {
        val allCredentials = CredentialStore.getAllCredentials()
        Log.d("OVP_STORE", "CredentialStore count=${allCredentials.size}")

        return allCredentials.mapIndexedNotNull { index, credentialJson ->
            toVCMetadata(credentialJson)?.also { metadata ->
                val typeSummary = metadata.vc.getAsJsonArray("type")
                    ?.joinToString(",") { it.asString }
                    ?: metadata.vc.getAsJsonObject("vc")
                        ?.getAsJsonArray("type")
                        ?.joinToString(",") { it.asString }
                        ?: "N/A"
                Log.d(
                    "OVP_STORE",
                    "Credential[$index] parsed format=${metadata.format}, types=$typeSummary"
                )
            } ?: run {
                Log.w("OVP_STORE", "Credential[$index] could not be parsed as VC metadata")
                null
            }
        }
    }

    private fun toVCMetadata(credentialJson: String): VCMetadata? {
        return try {
            val vcObject = gson.fromJson(credentialJson, JsonObject::class.java)
            val format = detectFormat(vcObject)
            VCMetadata(format = format, vc = vcObject)
        } catch (_: Exception) {
            null
        }
    }

    private fun detectFormat(vcObject: JsonObject): String {
        val explicitFormat = vcObject.get("format")?.asString?.trim().orEmpty()
        if (explicitFormat.isNotBlank()) {
            return explicitFormat
        }

        val looksLikeMdoc = vcObject.has("issuerSigned") && vcObject.has("docType")
        return if (looksLikeMdoc) FormatType.MSO_MDOC.value else FormatType.LDP_VC.value
    }
}
