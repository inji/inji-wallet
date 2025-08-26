package com.example.sampleappvciclient.utils

object CredentialStore {
    private val credentials = mutableListOf<String>()

    fun addCredential(credentialJson: String) {
        credentials.add(credentialJson)
    }

    fun getAllCredentials(): List<String> = credentials

    fun clearCredentials() {
        credentials.clear()
    }
}