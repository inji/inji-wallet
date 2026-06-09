package com.example.samplecredentialwallet.ovp.utils

import com.google.crypto.tink.subtle.Base64
import com.google.gson.JsonObject
import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.JWSObject
import com.nimbusds.jose.JWSSigner
import com.nimbusds.jose.Payload
import com.nimbusds.jose.crypto.ECDSASigner
import com.nimbusds.jose.crypto.Ed25519Signer
import com.nimbusds.jose.crypto.RSASSASigner
import com.nimbusds.jose.jwk.Curve
import com.nimbusds.jose.jwk.ECKey
import com.nimbusds.jose.jwk.JWK
import com.nimbusds.jose.jwk.OctetKeyPair
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jose.jwk.gen.OctetKeyPairGenerator
import com.nimbusds.jose.util.Base64URL
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import java.nio.charset.StandardCharsets
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.interfaces.ECPrivateKey
import java.security.interfaces.ECPublicKey
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.util.Date
import java.util.UUID

enum class OVPKeyType {
    RSA, ES256, Ed25519
}

data class SignedVPJWT(
    val jws: String,
    val proofValue: String? = null,
    val signatureAlgorithm: String
)

object OVPKeyManager {
    const val SIGNATURE_SUITE = "JsonWebSignature2020"

    fun getKeyPairByAlias(alias: String): KeyPair? {
        return try {
            val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
            val certificate = keyStore.getCertificate(alias) ?: return null
            val privateKey = keyStore.getKey(alias, null) as? PrivateKey ?: return null
            KeyPair(certificate.publicKey, privateKey)
        } catch (_: Exception) {
            null
        }
    }

    fun generateKeyPair(keyType: OVPKeyType): Any {
        return when (keyType) {
            OVPKeyType.RSA -> {
                val keyGen = KeyPairGenerator.getInstance("RSA")
                keyGen.initialize(2048)
                keyGen.generateKeyPair()
            }
            OVPKeyType.ES256 -> {
                val keyGen = KeyPairGenerator.getInstance("EC")
                keyGen.initialize(Curve.P_256.toECParameterSpec())
                keyGen.generateKeyPair()
            }
            OVPKeyType.Ed25519 -> {
                OctetKeyPairGenerator(Curve.Ed25519)
                    .keyIDFromThumbprint(true)
                    .generate()
            }
        }
    }

    fun generateHolderId(jwk: OctetKeyPair): String {
        val publicJwkJson = jwk.toPublicJWK().toJSONString()
        val encoded = Base64URL.encode(publicJwkJson.toByteArray(StandardCharsets.UTF_8)).toString()
        return "did:jwk:$encoded#0"
    }

    fun signVpToken(
        keyType: OVPKeyType,
        vpPayload: String,
        keyPair: Any
    ): SignedVPJWT {
        return when (keyType) {
            OVPKeyType.RSA, OVPKeyType.ES256 -> {
                signVPTokenWithRSAorEC(keyType, vpPayload, keyPair as KeyPair)
            }
            OVPKeyType.Ed25519 -> {
                signDetachedVpJWT(vpPayload, keyPair as OctetKeyPair)
            }
        }
    }

    fun signDeviceAuthentication(
        keyPair: KeyPair,
        keyType: OVPKeyType,
        deviceAuthBytes: ByteArray
    ): SignedVPJWT {
        val algorithm = when (keyType) {
            OVPKeyType.ES256 -> JWSAlgorithm.ES256
            OVPKeyType.RSA -> JWSAlgorithm.RS256
            OVPKeyType.Ed25519 -> throw IllegalArgumentException("Unsupported key type for device auth")
        }

        val header = JWSHeader.Builder(algorithm).type(JOSEObjectType.JWT).build()
        val payload = Payload(deviceAuthBytes)
        val jwsObject = JWSObject(header, payload)

        val signer = when (keyType) {
            OVPKeyType.ES256 -> ECDSASigner(keyPair.private as ECPrivateKey)
            OVPKeyType.RSA -> RSASSASigner(keyPair.private)
            OVPKeyType.Ed25519 -> throw IllegalArgumentException("Unsupported key type for device auth")
        }
        jwsObject.sign(signer)

        return SignedVPJWT(
            jws = jwsObject.serialize(),
            signatureAlgorithm = algorithm.name
        )
    }

    fun getIssuerAuthenticationAlgorithmForMdocVC(proofType: Int): String {
        return when (proofType) {
            -7 -> "ES256"
            else -> ""
        }
    }

    fun getMdocAuthenticationAlgorithm(issuerAuth: JsonObject): String {
        val deviceKey = issuerAuth.getAsJsonObject("deviceKeyInfo")?.getAsJsonObject("deviceKey") ?: return ""
        val keyType = deviceKey["1"]?.asInt
        val curve = deviceKey["-1"]?.asInt

        return if (keyType == ProtectedAlgorithm.EC2 && curve == ProtectedCurve.P256) "ES256" else ""
    }

    private fun signVPTokenWithRSAorEC(
        keyType: OVPKeyType,
        vpPayload: String,
        keyPair: KeyPair
    ): SignedVPJWT {
        val jwk: JWK
        val signer: JWSSigner
        val alg: JWSAlgorithm

        when (keyType) {
            OVPKeyType.RSA -> {
                val rsaKey = RSAKey.Builder(keyPair.public as RSAPublicKey)
                    .privateKey(keyPair.private as RSAPrivateKey)
                    .keyID(UUID.randomUUID().toString())
                    .build()
                jwk = rsaKey
                signer = RSASSASigner(rsaKey)
                alg = JWSAlgorithm.RS256
            }
            OVPKeyType.ES256 -> {
                val ecKey = ECKey.Builder(Curve.P_256, keyPair.public as ECPublicKey)
                    .privateKey(keyPair.private as ECPrivateKey)
                    .keyID(UUID.randomUUID().toString())
                    .build()
                jwk = ecKey
                signer = ECDSASigner(ecKey)
                alg = JWSAlgorithm.ES256
            }
            OVPKeyType.Ed25519 -> throw IllegalArgumentException("Unsupported key type: $keyType")
        }

        val claimsSet = JWTClaimsSet.Builder()
            .issuer("did:jwk")
            .issueTime(Date())
            .claim("vp", vpPayload)
            .build()

        val signedJWT = SignedJWT(
            JWSHeader.Builder(alg).keyID(jwk.keyID).type(JOSEObjectType.JWT).build(),
            claimsSet
        )
        signedJWT.sign(signer)

        return SignedVPJWT(signedJWT.serialize(), jwk.toPublicJWK().toJSONString(), alg.name)
    }

    private fun signDetachedVpJWT(payloadMap: String, keyPair: OctetKeyPair): SignedVPJWT {
        val proof = constructDetachedJWS(keyPair, payloadMap)
        return SignedVPJWT(
            jws = proof,
            signatureAlgorithm = "EdDSA"
        )
    }

    private fun constructDetachedJWS(jwk: OctetKeyPair, payloadMap: String): String {
        val header = JWSHeader.Builder(JWSAlgorithm.EdDSA)
            .base64URLEncodePayload(false)
            .criticalParams(setOf("b64"))
            .build()
        val headerB64 = header.toBase64URL().toString()
        val encodedHeader: ByteArray = headerB64.toByteArray(Charsets.UTF_8)

        val payloadBytes = Base64.urlSafeDecode(payloadMap)
        val signingInput = encodedHeader + byteArrayOf(46) + payloadBytes

        val signer = Ed25519Signer(jwk)
        val signatureB64Url = signer.sign(header, signingInput)

        return "$headerB64..$signatureB64Url"
    }

    private object ProtectedAlgorithm {
        const val EC2 = 2
    }

    private object ProtectedCurve {
        const val P256 = 1
    }
}
