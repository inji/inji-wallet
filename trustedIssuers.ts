export const trustedIssuers = {
  "response": {
    "issuers": [
      {
        "issuer_id": "localInji",
        "protocol": "OpenId4VCI",
        "display": [
          {
            "name": "Local Inji certify",
            "logo": {
              "url": "https://mosip.github.io/inji-config/logos/mosipid-logo.png",
              "alt_text": "mosip-logo"
            },
            "title": "Local Inji certify",
            "description": "Download MOSIP National / Foundational Identity Credential",
            "language": "en"
          },
        ],
        "client_id": "0VnKGbm4wF1iRVTJAJ-NbAlKNDU77vJ1ue1UUAsKRtA",
        "wellknown_endpoint": "https://cb57d36b1ff7.ngrok-free.app/v1/certify/issuance/.well-known/openid-credential-issuer",
        "redirect_uri": "io.mosip.residentapp.inji://oauthredirect",
        "authorization_audience": "https://esignet-mosipid.released.mosip.net/v1/esignet/oauth/v2/token",
        "token_endpoint": "https://cb57d36b1ff7.ngrok-free.app/v1/certify/oauth/token",
        "proxy_token_endpoint": "https://esignet-mosipid.released.mosip.net/v1/esignet/oauth/v2/token",
        "client_alias": "mpartner-default-mimoto-mosipid-oidc",
        "qr_code_type": "OnlineSharing",
        "enabled": "true",
        "credential_issuer": "localInji",
        "credential_issuer_host": "https://cb57d36b1ff7.ngrok-free.app/v1/certify/issuance"
      }
    ]
  },
  "errors": []
}
