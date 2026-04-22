package com.example.samplecredentialwallet.ovp.ui

import android.content.Intent
import android.util.Log
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import androidx.navigation.NavHostController
import com.example.samplecredentialwallet.R
import com.example.samplecredentialwallet.ovp.data.VCMetadata
import com.example.samplecredentialwallet.ovp.utils.OVPConstants
import com.example.samplecredentialwallet.ovp.utils.OpenID4VPManager
import com.example.samplecredentialwallet.ovp.viewmodel.OVPViewModel
import com.example.samplecredentialwallet.utils.CredentialDisplayNameResolver
import io.mosip.openID4VP.exceptions.OpenID4VPExceptions
import io.mosip.openID4VP.verifier.VerifierResponse
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull

@Composable
fun MatchingCredentialsScreen(
    ovpViewModel: OVPViewModel,
    navController: NavHostController,
    onSuccess: () -> Unit,
    onBackToShare: () -> Unit
) {
    val matchResult by ovpViewModel.matchingResult.collectAsState()
    val selectedItems = remember { mutableStateListOf<Pair<String, VCMetadata>>() }

    var showConsentDialog by remember { mutableStateOf(false) }
    var showDeclineConfirmationDialog by remember { mutableStateOf(false) }
    var isSharing by remember { mutableStateOf(false) }
    var shareErrorMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
        ) {
            IconButton(onClick = {
                if (isSharing) return@IconButton
                handleDecline(coroutineScope, navController) {
                    onBackToShare()
                }
            }, enabled = !isSharing) {
                Icon(Icons.Default.Close, contentDescription = "Close")
            }
        }

        Text(
            stringResource(R.string.requested_claims, matchResult?.requestedClaims ?: "N/A"),
            style = MaterialTheme.typography.bodyLarge
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Purpose: ${matchResult?.purpose ?: "N/A"}",
            style = MaterialTheme.typography.bodyMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = stringResource(R.string.matching_credentials),
            style = MaterialTheme.typography.titleLarge
        )
        Spacer(modifier = Modifier.height(8.dp))

        if (matchResult?.matchingVCs?.isNotEmpty() == true) {
            LazyColumn(modifier = Modifier.weight(1f)) {
                matchResult!!.matchingVCs.entries.forEach { entry ->
                    val key = entry.key
                    val vcList = entry.value

                    items(vcList) { vcMetadata ->
                        val vcItem = key to vcMetadata
                        val isSelected = selectedItems.contains(vcItem)

                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .clickable {
                                    if (isSelected) selectedItems.remove(vcItem)
                                    else selectedItems.add(vcItem)
                                }
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(8.dp)
                            ) {
                                Checkbox(
                                    checked = isSelected,
                                    onCheckedChange = {
                                        if (it) selectedItems.add(vcItem)
                                        else selectedItems.remove(vcItem)
                                    }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = getDisplayLabel(vcMetadata),
                                    style = MaterialTheme.typography.bodyLarge,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }
                }
            }
        } else {
            Text(
                text = stringResource(R.string.no_matching_credentials_found),
                style = MaterialTheme.typography.bodyMedium
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Button(
                onClick = { showConsentDialog = true },
                enabled = selectedItems.isNotEmpty() && !isSharing
            ) {
                Text(stringResource(R.string.share))
            }

            Spacer(modifier = Modifier.height(8.dp))

            TextButton(onClick = {
                if (isSharing) return@TextButton
                handleDecline(coroutineScope, navController) {
                    onBackToShare()
                }
            }, enabled = !isSharing) {
                Text(stringResource(R.string.reject), color = Color.Red)
            }
        }
    }

    if (showConsentDialog) {
        AlertDialog(
            onDismissRequest = { showConsentDialog = false },
            title = { Text(stringResource(R.string.consent_required)) },
            text = { Text(stringResource(R.string.do_you_want_to_share_selected_credentials)) },
            confirmButton = {
                TextButton(onClick = {
                    if (isSharing) return@TextButton
                    showConsentDialog = false
                    isSharing = true
                    Log.d("OVP_SHARE", "Share initiated with selectedCount=${selectedItems.size}")
                    OpenID4VPManager.shareVerifiablePresentation(
                        selectedItems = selectedItems,
                        onResult = { result ->
                            coroutineScope.launch {
                                isSharing = false
                                Log.d("OVP_SHARE", "Share completed. redirectUriPresent=${!result.redirectUri.isNullOrBlank()}")
                                handleVerifierResponse(result, navController) {
                                    selectedItems.clear()
                                    onSuccess()
                                }
                            }
                        },
                        onError = {
                            Log.e("MatchingCredentialsScreen", "VP share failed", it)
                            coroutineScope.launch {
                                isSharing = false
                                shareErrorMessage = it.message ?: "Unable to share credentials. Please try again."
                            }
                        }
                    )
                }) {
                    Text(stringResource(R.string.yes_proceed))
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showConsentDialog = false
                    showDeclineConfirmationDialog = true
                }) {
                    Text(stringResource(R.string.decline))
                }
            }
        )
    }

    if (showDeclineConfirmationDialog) {
        AlertDialog(
            onDismissRequest = { showDeclineConfirmationDialog = false },
            title = { Text(stringResource(R.string.are_you_sure)) },
            text = { Text(stringResource(R.string.do_you_want_to_go_back_to_scanning)) },
            confirmButton = {
                TextButton(onClick = {
                    if (isSharing) return@TextButton
                    handleDecline(coroutineScope, navController) {
                        showDeclineConfirmationDialog = false
                        onBackToShare()
                    }
                }) {
                    Text(stringResource(R.string.yes))
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    if (isSharing) return@TextButton
                    showDeclineConfirmationDialog = false
                    showConsentDialog = true
                }) {
                    Text(stringResource(R.string.go_back))
                }
            }
        )
    }

    if (isSharing) {
        AlertDialog(
            onDismissRequest = {},
            title = { Text("Sharing in progress") },
            text = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    CircularProgressIndicator(modifier = Modifier.width(20.dp).height(20.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("Please wait while we submit your VP response")
                }
            },
            confirmButton = {}
        )
    }

    if (!shareErrorMessage.isNullOrBlank()) {
        AlertDialog(
            onDismissRequest = { shareErrorMessage = null },
            title = { Text("Share failed") },
            text = { Text(shareErrorMessage ?: "Unable to share credentials.") },
            confirmButton = {
                TextButton(onClick = { shareErrorMessage = null }) {
                    Text(stringResource(R.string.ok))
                }
            }
        )
    }
}

private fun getDisplayLabel(vcMetadata: VCMetadata): String {
    return CredentialDisplayNameResolver.resolveFromJson(vcMetadata.vc)
        ?: CredentialDisplayNameResolver.toDisplayName("VerifiableCredential")
}

private fun handleDecline(
    coroutineScope: CoroutineScope,
    navController: NavHostController,
    onDeclineConfirmed: () -> Unit,
) {
    coroutineScope.launch(Dispatchers.IO) {
        val verifierResponse = try {
            withTimeoutOrNull(8_000L) {
                OpenID4VPManager.sendErrorToVerifier(
                    OpenID4VPExceptions.AccessDenied(
                        OVPConstants.ERR_DECLINED,
                        "MatchingCredentialsScreen"
                    )
                )
            }
        } catch (e: Exception) {
            Log.e("OVP_DECLINE", "sendErrorToVerifier failed; continuing decline flow", e)
            null
        }

        if (verifierResponse == null) {
            Log.w("OVP_DECLINE", "sendErrorToVerifier timed out or failed; continuing decline flow")
        }

        try {
            verifierResponse?.let { response ->
                handleVerifierResponse(response, navController) {
                    onDeclineConfirmed()
                }
            } ?: withContext(Dispatchers.Main) {
                onDeclineConfirmed()
            }
        } catch (e: Exception) {
            Log.e("OVP_DECLINE", "Decline callback handling failed; continuing decline flow", e)
            withContext(Dispatchers.Main) {
                onDeclineConfirmed()
            }
        }
    }
}

private suspend fun handleVerifierResponse(
    verifierResponse: VerifierResponse,
    navController: NavHostController,
    callback: () -> Unit = {}
) {
    val redirectUri = verifierResponse.redirectUri
    withContext(Dispatchers.Main) {
        redirectUri?.let {
            val intent = Intent(Intent.ACTION_VIEW, it.toUri())
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (redirectUri.startsWith("https://")) {
                navController.context.startActivity(intent)
            } else if (intent.resolveActivity(navController.context.packageManager) != null) {
                navController.context.startActivity(intent)
            }
        }
        callback()
    }
}
