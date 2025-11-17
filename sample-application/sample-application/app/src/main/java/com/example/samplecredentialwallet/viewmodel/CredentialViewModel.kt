package com.example.samplecredentialwallet.viewmodel

import androidx.lifecycle.ViewModel
import com.example.samplecredentialwallet.utils.Constants

class CredentialViewModel : ViewModel() {

    fun setNationalIdentityConstants() {
        Constants.credentialIssuerHost = "https://injicertify-mosipid.released.mosip.net"
        Constants.credentialTypeId = "MOSIPVerifiableCredential"
        Constants.clientId = "0VnKGbm4wF1iRVTJAJ-NbAlKNDU77vJ1ue1UUAsKRtA"
        Constants.redirectUri = "io.mosip.residentapp.inji://oauthredirect"
    }

    fun setLifeInsuranceConstants() {
        Constants.credentialIssuerHost = "https://injicertify-insurance.released.mosip.net"
        Constants.credentialTypeId = "LifeInsuranceCredential"
        Constants.clientId = "mpartner-default-mimoto-insurance-oidc"
        Constants.redirectUri = "io.mosip.residentapp.inji://oauthredirect"
    }
}
