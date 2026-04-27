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
  val backendTokenEndpoint: String // Backend token endpoint which communicates with AS token endpoint
)

object IssuerRepositoryV2 {
  private val configurations = mapOf(
    "Mosip" to IssuerConfigurationV2(
      id = "Mosip",
      credentialIssuerHost = "https://injicertify-mosipid-dp.collab.mosip.net",
      clientId = "mpartner-default-mimoto-mosipid-oidc",
      redirectUri = "io.mosip.residentapp.inji://oauthredirect",
      display = IssuerDisplay(
        name = "Republic of Veridonia National ID Department",
        logo = IssuerDisplayLogo(
          url = R.drawable.veridonia_logo,
          altText = "a square logo of veridonia"
        ),
        title = "Republic of Veridonia National ID Department",
        description = "Download National ID credential",
        language = "en"
      ),
      backendTokenEndpoint = "https://api.collab.mosip.net/v1/mimoto/get-token/Mosip"
    ),
    "Land" to IssuerConfigurationV2(
      id = "Land",
      credentialIssuerHost = "https://injicertify-landregistry.collab.mosip.net",
      clientId = "mpartner-default-mimoto-land-oidc",
      redirectUri = "io.mosip.residentapp.inji://oauthredirect",
      display = IssuerDisplay(
        name = "Republic of Veridonia Land Registry Department",
        logo = IssuerDisplayLogo(
          url = R.drawable.agro_vertias_logo,
          altText = "land registry logo"
        ),
        title = "Republic of Veridonia Land Registry Department",
        description = "Download Land Records Statement credential",
        language = "en"
      ),
      backendTokenEndpoint = "https://api.collab.mosip.net/v1/mimoto/get-token/Land"
    ),
    "StayProtected" to IssuerConfigurationV2(
      id = "StayProtected",
      credentialIssuerHost = "https://injicertify-insurance.collab.mosip.net",
      clientId = "esignet-sunbird-partner",
      redirectUri = "io.mosip.residentapp.inji://oauthredirect",
      display = IssuerDisplay(
        name = "StayProtected Insurance",
        logo = IssuerDisplayLogo(
          url = R.drawable.stay_protected_logo,
          altText = "stay protected logo"
        ),
        title = "StayProtected Insurance",
        description = "Download Life Insurance credential",
        language = "en"
      ),
      backendTokenEndpoint = "https://api.collab.mosip.net/residentmobileapp/get-token/StayProtected"
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
    "MosipTAN" to IssuerConfiguration(
      credentialIssuerHost = "https://injicertify-tan.collab.mosip.net/v1/certify/issuance",
      credentialTypeId = "IncomeTaxAccountCredential",
      clientId = "mpartner-default-mimoto-mosipid-oidc",
      redirectUri = "io.mosip.residentapp.inji://oauthredirect",
      credentialDisplayName = "Income Tax Account"
    ),
    "StayProtected" to IssuerConfiguration(
      credentialIssuerHost = "https://injicertify-insurance.collab.mosip.net",
      credentialTypeId = "InsuranceCredential",
      clientId = "esignet-sunbird-partner",
      redirectUri = "io.mosip.residentapp.inji://oauthredirect",
      credentialDisplayName = "Life Insurance"
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
