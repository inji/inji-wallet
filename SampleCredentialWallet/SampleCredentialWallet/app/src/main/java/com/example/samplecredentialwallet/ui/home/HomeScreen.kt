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
import com.example.samplecredentialwallet.utils.CredentialStore
import org.json.JSONArray
import org.json.JSONObject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigate: () -> Unit,
    onViewCredential: (Int) -> Unit = {}
) {
    val credentials = remember { mutableStateOf(CredentialStore.getAllCredentials()) }
    
    LaunchedEffect(Unit) {
        credentials.value = CredentialStore.getAllCredentials()
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
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
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
    val result = mutableMapOf<String, String>()
    
    try {
        val cleanCredential = if (credentialJson.startsWith("CredentialResponse(")) {
            val credMatch = Regex("""credential=(\{.*\})(?:,|\))""").find(credentialJson)
            credMatch?.groupValues?.get(1) ?: credentialJson
        } else {
            credentialJson
        }
        
        val json = JSONObject(cleanCredential)
        
        val credentialName = json.optString("credentialName")
        if (credentialName.isNotEmpty()) {
            result["credentialName"] = credentialName
        }
        
        val types = json.optJSONArray("type")
        if (types != null && types.length() > 0) {
            result["type"] = types.getString(types.length() - 1)
        }
        
        val credentialSubject = json.optJSONObject("credentialSubject")
        if (credentialSubject != null) {
            credentialSubject.keys().forEach { key ->
                val value = credentialSubject.opt(key)
                when (value) {
                    is String -> {
                        if (key == "face" && value.startsWith("data:image/")) {
                            val base64Data = value.substringAfter(",")
                            result["faceImage"] = base64Data
                        } else {
                            result[key] = value
                        }
                    }
                    is JSONObject -> {
                        val actualValue = value.optString("value", "")
                        if (actualValue.isNotEmpty()) {
                            result[key] = actualValue
                        }
                    }
                    is JSONArray -> {
                        val arrayValues = mutableListOf<String>()
                        for (i in 0 until value.length()) {
                            val item = value.opt(i)
                            if (item is JSONObject) {
                                item.optString("value")?.let { arrayValues.add(it) }
                            } else {
                                arrayValues.add(item.toString())
                            }
                        }
                        result[key] = arrayValues.joinToString(", ")
                    }
                    else -> result[key] = value.toString()
                }
            }
        }
    } catch (e: Exception) {
        result["error"] = "Failed to parse credential"
    }
    
    return result
}
