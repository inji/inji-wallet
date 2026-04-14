package com.example.samplecredentialwallet.ovp.utils

import android.util.Log
import androidx.compose.runtime.snapshots.SnapshotStateList
import com.nimbusds.jose.jwk.OctetKeyPair
import com.example.samplecredentialwallet.ovp.data.OVPData
import com.example.samplecredentialwallet.ovp.data.VCMetadata
import io.mosip.openID4VP.OpenID4VP
import io.mosip.openID4VP.authorizationRequest.AuthorizationRequest
import io.mosip.openID4VP.authorizationResponse.unsignedVPToken.UnsignedVPToken
import io.mosip.openID4VP.authorizationResponse.unsignedVPToken.types.ldp.UnsignedLdpVPToken
import io.mosip.openID4VP.authorizationResponse.unsignedVPToken.types.mdoc.UnsignedMdocVPToken
import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.types.ldp.LdpVPTokenSigningResult
import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.types.mdoc.DeviceAuthentication
import io.mosip.openID4VP.authorizationResponse.vpTokenSigningResult.types.mdoc.MdocVPTokenSigningResult
import io.mosip.openID4VP.constants.FormatType
import io.mosip.openID4VP.exceptions.OpenID4VPExceptions
import io.mosip.openID4VP.verifier.VerifierResponse
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.security.KeyPair

object OpenID4VPManager {
    private var instance: OpenID4VP? = null

    fun init(traceabilityId: String) {
        instance = OpenID4VP(traceabilityId, OVPData.getWalletMetadata())
    }

    fun authenticateVerifier(urlEncodedAuthRequest: String): AuthorizationRequest {
        return manager().authenticateVerifier(
            urlEncodedAuthorizationRequest = urlEncodedAuthRequest,
            trustedVerifiers = OVPData.getTrustedVerifiers(),
            shouldValidateClient = false
        )
    }

    fun shareVerifiablePresentation(
        selectedItems: SnapshotStateList<Pair<String, VCMetadata>>,
        onResult: (VerifierResponse) -> Unit,
        onError: (Throwable) -> Unit
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                Log.d("OpenID4VPManager", "shareVerifiablePresentation started selectedItems=${selectedItems.size}")
                val result = withTimeout(45_000L) {
                    sendVP(selectedItems)
                }
                Log.d(
                    "OpenID4VPManager",
                    "shareVerifiablePresentation success redirectUriPresent=${!result.redirectUri.isNullOrBlank()}"
                )
                onResult(result)
            } catch (e: TimeoutCancellationException) {
                Log.e("OpenID4VPManager", "VP share timed out after 45s", e)
                onError(IllegalStateException("VP share timed out. Please try again."))
            } catch (e: Throwable) {
                Log.e("OpenID4VPManager", "Error sharing VP", e)
                onError(e)
            }
        }
    }

    fun sendErrorToVerifier(ovpException: OpenID4VPExceptions): VerifierResponse {
        return manager().sendErrorInfoToVerifier(ovpException)
    }

    private fun manager(): OpenID4VP {
        return instance ?: throw IllegalStateException("OpenID4VP is not initialized")
    }

    private fun constructUnsignedVpToken(
        selectedCredentials: Map<String, Map<FormatType, List<Any>>>,
        holderId: String,
        signatureSuite: String
    ): Map<FormatType, UnsignedVPToken> {
        return manager().constructUnsignedVPToken(selectedCredentials, holderId, signatureSuite)
    }

    private suspend fun sendVP(
        selectedItems: SnapshotStateList<Pair<String, VCMetadata>>
    ): VerifierResponse = withContext(Dispatchers.IO) {
        val parsedSelectedItems = MatchingVcsHelper().buildSelectedVCsMapPlain(selectedItems)
        Log.d(
            "OpenID4VPManager",
            "sendVP parsedSelectedItems descriptors=${parsedSelectedItems.keys} formats=${parsedSelectedItems.values.flatMap { it.keys }.toSet()}"
        )

        val ldpKeyType = OVPKeyType.Ed25519
        val ldpKeyPair = OVPKeyManager.generateKeyPair(ldpKeyType)
        val holderId = OVPKeyManager.generateHolderId(ldpKeyPair as OctetKeyPair)

        val unsignedVpTokenMap = constructUnsignedVpToken(
            parsedSelectedItems,
            holderId,
            OVPKeyManager.SIGNATURE_SUITE
        )

        val ldpSigningResult = unsignedVpTokenMap[FormatType.LDP_VC]?.let { payload ->
            val result = OVPKeyManager.signVpToken(
                ldpKeyType,
                (payload as UnsignedLdpVPToken).dataToSign,
                ldpKeyPair
            )

            LdpVPTokenSigningResult(
                jws = result.jws,
                signatureAlgorithm = result.signatureAlgorithm
            )
        }

        val mdocKeyType = OVPKeyType.ES256
        val mdocKeyPair = OVPKeyManager.generateKeyPair(mdocKeyType)

        val mdocSigningResult = unsignedVpTokenMap[FormatType.MSO_MDOC]?.let { payload ->
            val mdocPayload = payload as UnsignedMdocVPToken
            val docTypeToDeviceAuthenticationBytes = mdocPayload.docTypeToDeviceAuthenticationBytes

            val docTypeToDeviceAuthentication =
                docTypeToDeviceAuthenticationBytes.mapValues { (_, deviceAuthBytes) ->
                    val bytes = if (deviceAuthBytes is String) {
                        deviceAuthBytes.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
                    } else {
                        deviceAuthBytes as ByteArray
                    }
                    val signed = OVPKeyManager.signDeviceAuthentication(
                        mdocKeyPair as KeyPair,
                        mdocKeyType,
                        bytes
                    )
                    val jwsParts = signed.jws.split(".")
                    val signaturePart = if (jwsParts.size == 3) jwsParts[2] else signed.jws
                    DeviceAuthentication(
                        signature = signaturePart,
                        algorithm = signed.signatureAlgorithm
                    )
                }

            MdocVPTokenSigningResult(docTypeToDeviceAuthentication)
        }

        val vpTokenSigningResultMap = buildMap {
            ldpSigningResult?.let { put(FormatType.LDP_VC, it) }
            mdocSigningResult?.let { put(FormatType.MSO_MDOC, it) }
        }

        Log.d(
            "OpenID4VPManager",
            "sendVP submitting response formats=${vpTokenSigningResultMap.keys}"
        )

        val response = manager().sendVPResponseToVerifier(vpTokenSigningResultMap)
        Log.d(
            "OpenID4VPManager",
            "sendVP verifier response received redirectUriPresent=${!response.redirectUri.isNullOrBlank()}"
        )
        response
    }
}
