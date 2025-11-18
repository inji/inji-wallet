package com.example.samplecredentialwallet.utils

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.snapshots.SnapshotStateList

object CredentialStore {
    val credentials: SnapshotStateList<String> = mutableStateListOf()

    fun addCredential(credentialJson: String) {
        credentials.add(credentialJson)
    }

    fun getAllCredentials(): List<String> = credentials

    fun clearCredentials() {
        credentials.clear()
    }
}