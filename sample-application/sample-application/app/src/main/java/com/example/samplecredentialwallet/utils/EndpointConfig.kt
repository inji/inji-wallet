package com.example.samplecredentialwallet.utils

import io.mosip.vciclient.token.TokenRequest

object EndpointConfig {
    private val tokenEndpointMappings = mapOf(
        "tan" to "https://api.collab.mosip.net/v1/mimoto/get-token/MosipTAN",
        "esignet-mosipid" to "https://api.collab.mosip.net/residentmobileapp/get-token/Mosip",
        "esignet-insurance" to "https://api.collab.mosip.net/residentmobileapp/get-token/StayProtected",
        "esignet-mock" to "https://api.collab.mosip.net/v1/mimoto/get-token/Land"
    )
    
    fun resolveTokenEndpoint(tokenEndpoint: String, credentialIssuerHost: String?): String {
        return when {
            credentialIssuerHost?.contains("tan") == true -> tokenEndpointMappings["tan"]
            tokenEndpoint.contains("esignet-mosipid") -> tokenEndpointMappings["esignet-mosipid"]
            tokenEndpoint.contains("esignet-insurance") -> tokenEndpointMappings["esignet-insurance"]
            tokenEndpoint.contains("esignet-mock") -> tokenEndpointMappings["esignet-mock"]
            else -> throw Exception("Unknown token endpoint: $tokenEndpoint")
        } ?: throw Exception("No mapping found")
    }
}
