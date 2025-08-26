package com.example.sampleappvciclient.ui.issuer

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun IssuerListScreen(onIssuerClick: (String) -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Issuer List", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(20.dp))
        Button(onClick = { onIssuerClick("mosip") }) {
            Text("MOSIP")
        }
        Spacer(Modifier.height(10.dp))
        Button(onClick = { onIssuerClick("stay_protected") }) {
            Text("Stay Protected")
        }
    }
}
