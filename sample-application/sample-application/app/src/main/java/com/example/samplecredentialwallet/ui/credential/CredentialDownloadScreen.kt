package com.example.samplecredentialwallet.ui.credential

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.samplecredentialwallet.navigation.Screen
import com.example.samplecredentialwallet.ui.theme.InjiOrange
import com.example.samplecredentialwallet.utils.Constants
import com.example.samplecredentialwallet.utils.CredentialStore
import com.example.samplecredentialwallet.utils.CredentialVerifier
import com.example.samplecredentialwallet.utils.SecureKeystoreManager
import com.example.samplecredentialwallet.utils.IssuerRepositoryV2
import com.example.samplecredentialwallet.utils.downloadCredentialFromCredentialOffer
import com.example.samplecredentialwallet.utils.downloadCredentialFromTrustedIssuer
import io.mosip.vciclient.credential.response.CredentialResponse
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withTimeout
import org.json.JSONObject
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException


@Composable
fun CredentialDownloadScreen(
  navController: NavController,
  authCode: String? = null,
  credentialOfferUri: String? = null
) {
  val context = LocalContext.current
  // Initialize and ensure keys exist (hardware-backed when available)
  val keystoreManager = remember { SecureKeystoreManager.getInstance(context) }
  LaunchedEffect(Unit) {
    try {
      keystoreManager.initializeKeystore()
    } catch (e: Exception) {
      Log.e("CredentialDownload", "Keystore initialization failed: ${e.message}", e)
    }
  }

  val isLoading = remember { mutableStateOf(false) }
  val loadingMessage = remember { mutableStateOf("Downloading Credential...") }
  val errorMessage = remember { mutableStateOf<String?>(null) }
  val showError = remember { mutableStateOf(false) }



  Box(
    modifier = Modifier.fillMaxSize()
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(24.dp)
        .verticalScroll(rememberScrollState()),
      verticalArrangement = Arrangement.Top
    ) {
      Spacer(modifier = Modifier.height(40.dp))
      Text(
        text = if (credentialOfferUri != null) "QR scanned successfully" else "Download Credential",
        style = MaterialTheme.typography.headlineMedium,
        color = MaterialTheme.colorScheme.primary,
        fontWeight = FontWeight.Bold
      )
      Spacer(modifier = Modifier.height(16.dp))

     if(credentialOfferUri == null) {
       Text(
         "OpenID4VCI Flow",
         style = MaterialTheme.typography.titleMedium,
         color = Color.Gray
       )
       Spacer(modifier = Modifier.height(8.dp))
       Text(
         "Credential Type: ${"FarmerVerifiableCredential"}",
         style = MaterialTheme.typography.bodyMedium
       )
       Spacer(modifier = Modifier.height(24.dp))
     }

      Button(
        onClick = {
          GlobalScope.launch(Dispatchers.IO) {
            try {
              withContext(Dispatchers.Main) {
                isLoading.value = true
                loadingMessage.value = "Starting credential download..."
              }

              withTimeout(600000L) {
                val selectedIssuer =
                  IssuerRepositoryV2.getConfiguration(Constants.selectedIssuer ?: "")
                if (credentialOfferUri == null && selectedIssuer == null) {
                  withContext(Dispatchers.Main) {
                    isLoading.value = false
                    showError.value = true
                    errorMessage.value = "Issuer configuration not found!"
                  }
                  return@withTimeout
                }


                val credential = if (credentialOfferUri != null) {
                  downloadCredentialFromCredentialOffer(
                    credentialOfferUri = credentialOfferUri,
                    loadingMessage = loadingMessage,
                    navController = navController,
                    context = context
                  )
                } else {
                  downloadCredentialFromTrustedIssuer(
                    selectedIssuer!!,
                    loadingMessage,
                    navController,
                    context
                  )
                }

                Log.d("VC_DOWNLOAD", "Credential download completed")
                Log.d(
                  "VC_DOWNLOAD",
                  "Credential object received: ${credential?.javaClass?.simpleName}"
                )

                withContext(Dispatchers.Main) {
                  loadingMessage.value = "Processing credential..."

                  if (credential == null) {
                    Log.e("VC_DOWNLOAD", "Credential is null")
                    isLoading.value = false
                    showError.value = true
                    errorMessage.value = "Something went wrong!"
                    return@withContext
                  }

                  credential.let { credObj ->
                    // Extract credential string from response object
                    val credentialStr = extractCredentialFromResponse(credObj)

                    Log.d("VC_VERIFY", "Starting credential verification")
                    val verified =
                      CredentialVerifier.verifyCredential(credentialStr, demoMode = true)
                    Log.d("VC_VERIFY", "Verification result: $verified")

                    // Add display name to credential before storing
                    val credentialWithDisplayName = try {
                      val credJson = JSONObject(credentialStr)
                      Constants.credentialDisplayName?.let { displayName ->
                        credJson.put("credentialName", displayName)
                        Log.d("VC_STORE", "Added display name: $displayName")
                      }
                      credJson.toString()
                    } catch (e: Exception) {
                      Log.e("VC_STORE", "Failed to add display name: ${e.message}")
                      credentialStr
                    }

                    // Store credential
                    Log.d("VC_STORE", "Storing credential in credential store")
                    CredentialStore.addCredential(credentialWithDisplayName)
                    Log.d("VC_STORE", "Credential stored successfully")
                    isLoading.value = false

                    // Navigate back to home screen
                    navController.navigate(Screen.Home.route) {
                      // Pop everything including auth_webview and credential_detail
                      popUpTo(Screen.Home.route) { inclusive = true }
                    }
                  }
                }
              }

            } catch (e: Exception) {
              Log.e("CredentialDownload", "Download failed: ${e.message}", e)

              // CRITICAL: Must switch to Main dispatcher to update UI state
              withContext(Dispatchers.Main) {
                isLoading.value = false
                showError.value = true

                // Different error messages based on error type
                errorMessage.value = when {
                  e is UnknownHostException -> "No internet connection"
                  e is SocketTimeoutException -> "No internet connection"
                  e is ConnectException -> "No internet connection"
                  e.message?.contains(
                    "Unable to resolve host",
                    ignoreCase = true
                  ) == true -> "No internet connection"

                  e.message?.contains(
                    "timeout",
                    ignoreCase = true
                  ) == true -> "No internet connection"

                  else -> "Something went wrong!"
                }

                Log.e("CredentialDownload", "Error UI shown: ${errorMessage.value}")

                // Also navigate away from AuthWebView so user doesn't get stuck on its loader
                try {
                  navController.navigate(Screen.Home.route) {
                    popUpTo(Screen.Home.route) { inclusive = true }
                  }
                } catch (navE: Exception) {
                  Log.w("CredentialDownload", "Navigation after error failed: ${navE.message}")
                }
              }
            } finally {
              // Safety net: Must run on Main dispatcher
              withContext(Dispatchers.Main) {
                if (isLoading.value) {
                  isLoading.value = false
                  showError.value = true
                  errorMessage.value = "Something went wrong!"
                  Log.e("CredentialDownload", "Finally block: Error UI forced")
                }
              }
            }
          }
        },
        modifier = Modifier.fillMaxWidth(),
        enabled = !isLoading.value,
        colors = ButtonDefaults.buttonColors(
          containerColor = InjiOrange
        )
      ) {
        if (isLoading.value) {
          CircularProgressIndicator(
            modifier = Modifier.size(24.dp),
            color = Color.White
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text("Downloading...")
        } else {
          Text(if (credentialOfferUri != null) "Proceed" else "Download Credential")
        }
      }
    }

    // Loading overlay
    if (isLoading.value) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .background(Color.Black.copy(alpha = 0.5f)),
        contentAlignment = Alignment.Center
      ) {
        Card(
          colors = CardDefaults.cardColors(
            containerColor = Color.White
          ),
          elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
          Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            CircularProgressIndicator(
              modifier = Modifier.size(48.dp),
              color = InjiOrange
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
              text = loadingMessage.value,
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
              text = "Please wait...",
              style = MaterialTheme.typography.bodySmall,
              color = Color.Gray
            )
          }
        }
      }
    }

    // Error Screen Overlay
    if (showError.value && errorMessage.value != null) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .background(Color.White),
        contentAlignment = Alignment.Center
      ) {
        Card(
          modifier = Modifier
            .fillMaxWidth()
            .padding(32.dp),
          colors = CardDefaults.cardColors(
            containerColor = Color(0xFFFFF3E0) // Light orange background
          ),
          elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            // Error Icon
            Icon(
              imageVector = Icons.Default.Info,
              contentDescription = "Error",
              tint = Color(0xFFF57C00), // Orange color
              modifier = Modifier.size(72.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text(
              text = errorMessage.value ?: "Something went wrong!",
              style = MaterialTheme.typography.headlineMedium,
              fontWeight = FontWeight.Bold,
              color = Color.Black
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
              text = if (errorMessage.value == "No internet connection") {
                "Please check your internet connection and try again."
              } else {
                "We are having some trouble with your request. Please try again."
              },
              style = MaterialTheme.typography.bodyLarge,
              color = Color.Gray,
              modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
              onClick = {
                showError.value = false
                errorMessage.value = null
                navController.navigate(Screen.Home.route) {
                  popUpTo(Screen.Home.route) { inclusive = true }
                }
              },
              modifier = Modifier.fillMaxWidth(),
              colors = ButtonDefaults.buttonColors(
                containerColor = InjiOrange
              )
            ) {
              Text("Try again", fontSize = 16.sp)
            }
          }
        }
      }
    }
  }
}

private fun extractCredentialFromResponse(credObj: CredentialResponse): String {
  val credentialStr = try {
    Log.d("VC_EXTRACT", "Extracting credential from response object")
    var credField: String? = null
    try {
      val method = credObj.javaClass.getMethod("getCredential")
      credField = method.invoke(credObj) as? String
      Log.d("VC_EXTRACT", "Method  successful: getCredential()")
    } catch (e: Exception) {
      Log.d("VC_EXTRACT", "Method  failed: ${e.message}")

    }

    if (credField == null) {
      try {
        val field = credObj.javaClass.getDeclaredField("credential")
        field.isAccessible = true
        credField = field.get(credObj) as? String
        Log.d("VC_EXTRACT", "Method  successful: field access")
      } catch (e: Exception) {
        Log.d("VC_EXTRACT", "Method  failed: ${e.message}")
      }
    }

    if (credField == null) {
      Log.d("VC_EXTRACT", "Trying Method : regex parsing")
      val str = credObj.toString()
      val credentialMatch = Regex("""credential=(\{.*\})(?:,|\))""").find(str)
      if (credentialMatch != null) {
        credField = credentialMatch.groupValues[1]
        Log.d("VC_EXTRACT", "Method  successful: regex parsing")
      }
    }

    credField ?: credObj.toString()
  } catch (e: Exception) {
    Log.e("VC_EXTRACT", "Failed to extract credential: ${e.message}")
    e.printStackTrace()
    credObj.toString()
  }

  Log.d("VC_EXTRACT", "Credential extracted successfully")
  Log.d("VC_EXTRACT", "Credential length: ${credentialStr.length} characters")
  return credentialStr
}

