package com.example.samplecredentialwallet.ui.home

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.samplecredentialwallet.R
import com.example.samplecredentialwallet.ui.theme.CardBlue
import com.example.samplecredentialwallet.ui.theme.InjiOrange
import com.example.samplecredentialwallet.utils.CredentialParser
import com.example.samplecredentialwallet.utils.CredentialStore
import com.example.samplecredentialwallet.utils.CredentialVerifier
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigate: () -> Unit,
    onViewCredential: (Int) -> Unit = {}
) {
    val credentials = remember { mutableStateOf(CredentialStore.getAllCredentials()) }
    val verificationStatus = remember { mutableStateMapOf<Int, Boolean?>() }
    val coroutineScope = rememberCoroutineScope()
    
    LaunchedEffect(Unit) {
        credentials.value = CredentialStore.getAllCredentials()
    }
    
    // Verify credentials when they change
    LaunchedEffect(credentials.value) {
        credentials.value.forEachIndexed { index, credential ->
            if (!verificationStatus.containsKey(index)) {
                verificationStatus[index] = null // Start as unverified
                coroutineScope.launch {
                    val isValid = CredentialVerifier.verifyCredential(credential, demoMode = true)
                    verificationStatus[index] = isValid
                }
            }
        }
    }
    
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigate,
                containerColor = InjiOrange,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier
                    .size(56.dp)
                    .offset(y = (-40).dp) 
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Add New Card",
                    modifier = Modifier.size(28.dp)
                )
            }
        },
        floatingActionButtonPosition = androidx.compose.material3.FabPosition.End
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Background
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF5F5F5))
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
            ) {
                // Header with Title
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White)
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Sample Credential Wallet",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.Gray,
                        fontSize = 20.sp
                    )
                    
                    // Clear All button (only show if there are credentials)
                    if (credentials.value.isNotEmpty()) {
                        TextButton(
                            onClick = {
                                CredentialStore.clearCredentials()
                                credentials.value = CredentialStore.getAllCredentials()
                            },
                            modifier = Modifier.align(Alignment.TopEnd)
                        ) {
                            Text(
                                text = "Clear All",
                                color = InjiOrange,
                                fontWeight = FontWeight.Medium,
                                fontSize = 14.sp
                            )
                        }
                    }
                }

                // Credential count
                Text(
                    text = "${credentials.value.size} card${if (credentials.value.size != 1) "s" else ""}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )

                // Credentials list
                if (credentials.value.isEmpty()) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "No cards yet",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Medium,
                            color = Color.Gray
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Tap + to add a new card",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.Gray
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        itemsIndexed(credentials.value) { index, credential ->
                            CredentialHomeCard(
                                credential = credential,
                                isValid = verificationStatus[index],
                                onClick = { onViewCredential(index) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CredentialHomeCard(
    credential: String,
    isValid: Boolean? = null,
    onClick: () -> Unit
) {
    val parsedData = remember(credential) { parseCredential(credential) }
    
    val vcTypeName = parsedData["credentialName"] ?: parsedData["type"]?.replace("VerifiableCredential", "Verifiable Credential") ?: "Verifiable Credential"

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(110.dp) 
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = CardBlue
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val faceImage = parsedData["faceImage"]
            if (faceImage != null) {
                val bitmap = remember(faceImage) {
                    try {
                        val imageBytes = Base64.decode(faceImage, Base64.DEFAULT)
                        BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                    } catch (e: Exception) {
                        null
                    }
                }
                
                bitmap?.let {
                    Image(
                        bitmap = it.asImageBitmap(),
                        contentDescription = "Profile Photo",
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape),
                        contentScale = ContentScale.Crop
                    )
                } ?: run {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.3f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Profile Icon",
                            modifier = Modifier.size(36.dp),
                            tint = Color.White
                        )
                    }
                }
            } else {
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.3f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Profile Icon",
                        modifier = Modifier.size(36.dp),
                        tint = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.width(10.dp))

            // Credential Info
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.SpaceEvenly
            ) {
                Text(
                    text = vcTypeName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 14.sp,
                    maxLines = 1
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                // Verification status badge
                Row(verticalAlignment = Alignment.CenterVertically) {
                    when (isValid) {
                        true -> {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Verified",
                                tint = Color(0xFF4CAF50),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Valid",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.White,
                                fontSize = 11.sp
                            )
                        }
                        false -> {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = "Not Verified",
                                tint = Color(0xFFFF9800),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Unverified",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.White,
                                fontSize = 11.sp
                            )
                        }
                        null -> {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = "Checking",
                                tint = Color(0xFFBDBDBD),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Checking...",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.White,
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }

            parsedData["activationPending"]?.let {
                Surface(
                    color = Color(0xFFFFA726),
                    shape = CircleShape,
                    modifier = Modifier.size(24.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = "!",
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

private fun parseCredential(credentialJson: String): Map<String, String> {
    return CredentialParser.parseCredential(credentialJson)
}
