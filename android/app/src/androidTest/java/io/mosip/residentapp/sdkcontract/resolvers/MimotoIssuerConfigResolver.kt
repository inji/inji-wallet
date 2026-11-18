package io.mosip.residentapp.sdkcontract

import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.concurrent.TimeUnit

data class IssuerRuntimeConfig(
    val issuerId: String,
    val credentialIssuer: String,
    val credentialConfigurationId: String,
    val tokenEndpointProxy: String,
    val clientId: String,
    val authorizationServer: String? = null,
)

object MimotoIssuerConfigResolver {
    private const val API_BASE_URL = "https://api.qainji.mosip.net"
    private const val ISSUERS_LIST_ENDPOINT = "$API_BASE_URL/v1/mimoto/issuers"

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    fun resolve(
        issuerId: String,
        credentialConfigurationId: String,
    ): IssuerRuntimeConfig {

        val issuerConfig = fetchIssuerConfigById(issuerId)

        val credentialIssuer = readString(issuerConfig, "credential_issuer_host")
          ?: throw IllegalStateException( "Missing credential issuer fields for issuerId=$issuerId" )

        val clientId = readString(issuerConfig, "client_id")
          ?: throw IllegalStateException("Missing client_id for issuerId=$issuerId")

        val authorizationServer =  run {
          val wellKnown = fetchIssuerWellKnown(credentialIssuer)
          extractAuthorizationServerFromWellKnown(wellKnown)
        }

        return IssuerRuntimeConfig(
            issuerId = issuerId,
            credentialIssuer = credentialIssuer,
            credentialConfigurationId = credentialConfigurationId,
            tokenEndpointProxy = "$API_BASE_URL/v1/mimoto/get-token/$issuerId",
            clientId = clientId,
            authorizationServer = authorizationServer,
        )
    }

    fun resolveOrFallback(
        issuerId: String,
        credentialConfigurationId: String,
        fallback: IssuerRuntimeConfig,
    ): IssuerRuntimeConfig = try {
        resolve(issuerId, credentialConfigurationId)
    } catch (_: Throwable) {
        fallback
    }


    private fun fetchIssuerConfigById(issuerId: String): JsonObject {
        val root = httpGetJson("$ISSUERS_LIST_ENDPOINT/$issuerId")
        return root.getAsJsonObject("response")
            ?: root.getAsJsonObject("issuer")
            ?: root
    }

    private fun fetchIssuerWellKnown(credentialIssuer: String): JsonObject {
        val url = "$credentialIssuer/.well-known/openid-credential-issuer"
        return httpGetJson(url)
    }

    private fun extractAuthorizationServerFromWellKnown(wellKnown: JsonObject): String? {
        val authorizationServers = wellKnown.getAsJsonArray("authorization_servers")
            ?: return null
        if (authorizationServers.size() == 0) {
            return null
        }
        return authorizationServers[0].asStringOrNull()
    }

    private fun httpGetJson(url: String): JsonObject {
        val request = Request.Builder()
            .url(url)
            .get()
            .build()

        httpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("HTTP ${response.code} for $url")
            }
            val body = response.body?.string()
                ?: throw IOException("Empty response body for $url")
            return JsonParser.parseString(body).asJsonObjectOrNull()
                ?: throw IOException("Expected JSON object response for $url")
        }
    }

    private fun readString(json: JsonObject, key: String): String? {
        if (!json.has(key) || json.get(key).isJsonNull) {
            return null
        }
        return json.get(key).asString?.takeIf { it.isNotBlank() }
    }

    private fun JsonElement.asJsonObjectOrNull(): JsonObject? =
        if (isJsonObject) asJsonObject else null

    private fun JsonElement.asStringOrNull(): String? =
        runCatching { asString }.getOrNull()?.takeIf { it.isNotBlank() }
}
