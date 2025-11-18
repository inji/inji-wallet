package com.example.samplecredentialwallet.ui.issuer

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.samplecredentialwallet.R

data class Issuer(
    val id: String,
    val name: String,
    val description: String,
    val logoRes: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IssuerListScreen(onIssuerClick: (String) -> Unit) {
    var searchQuery by remember { mutableStateOf("") }
    
    val issuers = listOf(
        Issuer(
            id = "Mosip",
            name = "Republic of Veridonia National ID Department",
            description = "Download National ID credential from Collab environment",
            logoRes = R.drawable.veridonia_logo
        ),
        Issuer(
            id = "StayProtected",
            name = "StayProtected Insurance",
            description = "Download insurance credential from Collab environment",
            logoRes = R.drawable.stay_protected_logo
        ),
        Issuer(
            id = "MosipTAN",
            name = "Republic of Veridonia Tax Department",
            description = "Download Tax ID credential from Collab environment",
            logoRes = R.drawable.tan_logo
        ),
        Issuer(
            id = "Land",
            name = "AgroVeritas Property & Land Registry",
            description = "Download Land Registry credential from Collab environment",
            logoRes = R.drawable.agro_vertias_logo
        )
        
    )
    
    // Filter issuers based on search query
    val filteredIssuers = if (searchQuery.isEmpty()) {
        issuers
    } else {
        issuers.filter { issuer ->
            issuer.name.contains(searchQuery, ignoreCase = true) ||
            issuer.description.contains(searchQuery, ignoreCase = true)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Add new card",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    ) 
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
            // Search bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by Issuer's name") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedContainerColor = Color.White,
                    focusedContainerColor = Color.White
                ),
                singleLine = true
            )

            // Issuer List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredIssuers) { issuer ->
                    IssuerCard(issuer = issuer, onClick = { onIssuerClick(issuer.id) })
                }
                
                // Show "No results" message if search yields nothing
                if (filteredIssuers.isEmpty() && searchQuery.isNotEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                "No issuers found matching \"$searchQuery\"",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.Gray
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun IssuerCard(issuer: Issuer, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        border = BorderStroke(1.dp, Color.LightGray),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Issuer Logo
            Image(
                painter = painterResource(id = issuer.logoRes),
                contentDescription = "${issuer.name} Logo",
                modifier = Modifier
                    .size(48.dp)
                    .padding(2.dp),
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.width(12.dp))

            // Issuer Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = issuer.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = issuer.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray,
                    fontSize = 11.sp
                )
            }
        }
    }
}
