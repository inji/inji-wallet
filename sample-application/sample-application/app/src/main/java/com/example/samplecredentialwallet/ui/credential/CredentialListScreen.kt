package com.example.samplecredentialwallet.ui.credential

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.samplecredentialwallet.utils.CredentialStore
import com.example.samplecredentialwallet.utils.CredentialParser
import org.json.JSONArray
import org.json.JSONObject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CredentialListScreen(navController: NavController, credentialIndex: Int = -1) {
    val credentials = CredentialStore.getAllCredentials()
    
    val displayCredentials = if (credentialIndex >= 0 && credentialIndex < credentials.size) {
        listOf(credentials[credentialIndex])
    } else {
        credentials
    }
    
    var selectedCredentialIndex by remember { mutableStateOf<Int?>(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "ID Details",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { /* Help */ }) {
                        Icon(Icons.Default.Info, contentDescription = "Help")
                    }
                    IconButton(onClick = { /* More options */ }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "More")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (displayCredentials.isEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "No credentials downloaded yet",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Download a credential to see it here",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                    )
                }
            } else {
                // Show credentials
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    itemsIndexed(displayCredentials) { index, credential ->
                        CredentialCard(
                            credential = credential,
                            index = index,
                            isExpanded = selectedCredentialIndex == index,
                            onToggle = {
                                selectedCredentialIndex = if (selectedCredentialIndex == index) null else index
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CredentialCard(
    credential: String,
    index: Int,
    isExpanded: Boolean,
    onToggle: () -> Unit
) {
    val parsedData = remember(credential) { parseCredential(credential) }

    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = com.example.samplecredentialwallet.ui.theme.CardBlue
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Start,
                    verticalAlignment = Alignment.Top
                ) {
                    parsedData["faceImage"]?.let { base64Image ->
                        val bitmap = remember(base64Image) {
                            try {
                                val imageBytes = Base64.decode(base64Image, Base64.DEFAULT)
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
                                    .size(100.dp)
                                    .clip(androidx.compose.foundation.shape.RoundedCornerShape(8.dp)),
                                contentScale = ContentScale.Crop
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Display ALL fields from received credential data
                parsedData.forEach { (key, value) ->
                    if (key != "faceImage" && key != "type" && key != "error" && key != "raw") {
                        CredentialFieldInCard(
                            label = key.replaceFirstChar { it.uppercase() }.replace(Regex("([a-z])([A-Z])"), "$1 $2"),
                            value = value
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        parsedData["activationPending"]?.let {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFFFFF3E0)
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = Color(0xFFFFA726),
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Activation pending for online login",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Please click the button below to activate this credential to be used for online login.",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Button(
                onClick = { /* Handle activation */ },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = com.example.samplecredentialwallet.ui.theme.InjiOrange
                )
            ) {
                Text("Activate", fontSize = 16.sp)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Show Raw Data Button
        var showRaw by remember { mutableStateOf(false) }
        OutlinedButton(
            onClick = { showRaw = !showRaw },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = com.example.samplecredentialwallet.ui.theme.InjiPurple
            )
        ) {
            Icon(
                imageVector = if (showRaw) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                contentDescription = null,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(if (showRaw) "Hide Raw Data" else "Show Raw Data")
        }

        if (showRaw) {
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 300.dp)
                        .verticalScroll(rememberScrollState())
                        .padding(12.dp)
                ) {
                    Text(
                        text = credential,
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace
                    )
                }
            }
        }
    }
}

@Composable
fun CredentialFieldInCard(label: String, value: String) {
    Column {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = Color.White.copy(alpha = 0.8f),
            fontSize = 12.sp
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyLarge,
            color = Color.White,
            fontSize = 16.sp
        )
    }
}



private fun parseCredential(credentialJson: String): Map<String, String> {
    return CredentialParser.parseCredential(credentialJson)
}
