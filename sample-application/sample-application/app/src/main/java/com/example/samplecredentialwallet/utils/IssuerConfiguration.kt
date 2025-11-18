package com.example.samplecredentialwallet.utils

data class IssuerConfiguration(
    val credentialIssuerHost: String,
    val credentialTypeId: String,
    val clientId: String,
    val redirectUri: String,
    val credentialDisplayName: String
)

object IssuerRepository {
    private val configurations = mapOf(
        "Mosip" to IssuerConfiguration(
            credentialIssuerHost = "https://injicertify-mosipid.collab.mosip.net",
            credentialTypeId = "MosipVerifiableCredential",
            clientId = "mpartner-default-mimoto-mosipid-oidc",
            redirectUri = "io.mosip.residentapp.inji://oauthredirect",
            credentialDisplayName = "Veridonia National ID"
        ),
        "StayProtected" to IssuerConfiguration(
            credentialIssuerHost = "https://injicertify-insurance.collab.mosip.net",
            credentialTypeId = "InsuranceCredential",
            clientId = "esignet-sunbird-partner",
            redirectUri = "io.mosip.residentapp.inji://oauthredirect",
            credentialDisplayName = "Life Insurance"
        ),
        "MosipTAN" to IssuerConfiguration(
            credentialIssuerHost = "https://injicertify-tan.collab.mosip.net/v1/certify/issuance",
            credentialTypeId = "IncomeTaxAccountCredential",
            clientId = "mpartner-default-mimoto-mosipid-oidc",
            redirectUri = "io.mosip.residentapp.inji://oauthredirect",
            credentialDisplayName = "Income Tax Account"
        ),
        "Land" to IssuerConfiguration(
            credentialIssuerHost = "https://injicertify-landregistry.collab.mosip.net",
            credentialTypeId = "LandStatementCredential",
            clientId = "mpartner-default-mimoto-land-oidc",
            redirectUri = "io.mosip.residentapp.inji://oauthredirect",
            credentialDisplayName = "Land Records Statement"
        )
    )

    fun getConfiguration(issuerType: String): IssuerConfiguration? {
        return configurations[issuerType]
    }

    fun applyConfiguration(issuerType: String): Boolean {
        val config = getConfiguration(issuerType) ?: return false
        
        Constants.credentialIssuerHost = config.credentialIssuerHost
        Constants.credentialTypeId = config.credentialTypeId
        Constants.clientId = config.clientId
        Constants.redirectUri = config.redirectUri
        Constants.credentialDisplayName = config.credentialDisplayName
        
        return true
    }
}
