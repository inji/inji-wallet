package com.example.samplecredentialwallet.utils

import com.example.samplecredentialwallet.R

data class IssuerDisplayLogo(
  val url: Int,
  val altText: String
)

data class IssuerDisplay(
  val name: String,
  val logo: IssuerDisplayLogo,
  val title: String,
  val description: String,
  val language: String
)

data class IssuerConfigurationV2(
  val id: String,
  val credentialIssuerHost: String,
  val clientId: String,
  val redirectUri: String,
  val display: IssuerDisplay,
  val proxyTokenEndpoint: String
)

object IssuerRepositoryV2 {
  private val configurations = mapOf(
    "Farmer" to IssuerConfigurationV2(
      id = "Farmer",
      credentialIssuerHost = "https://injicertify-farmer.collab.mosip.net/",
      clientId = "mpartner-default-mimoto-land-oidc",
      redirectUri = "io.mosip.residentapp.inji://oauthredirect",
      display = IssuerDisplay(
        name = "Farmer ID Card",
        logo = IssuerDisplayLogo(
          url = R.drawable.agro_vertias_logo,
          altText = "mosip-logo"
        ),
        title = "Farmer ID Card",
        description = "Download Farmer ID Card",
        language = "en"
      ),
      proxyTokenEndpoint = "https://esignet-mock.collab.mosip.net/v1/esignet/oauth/v2/token"
    )
  )

  fun getAllConfigurations(): List<IssuerConfigurationV2> {
    return configurations.values.toList()
  }

  fun getConfiguration(issuerType: String): IssuerConfigurationV2? {
    return configurations[issuerType]
  }

  fun applyConfiguration(issuerType: String): Boolean {
    if (getConfiguration(issuerType) == null) {
      return false
    }

    Constants.selectedIssuer = issuerType

    return true
  }
}

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
