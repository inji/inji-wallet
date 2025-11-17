package com.example.samplecredentialwallet.ui.issuer

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.samplecredentialwallet.viewmodel.CredentialViewModel

@Composable
fun IssuerDetailScreen(
    issuerType: String,
    onNavigateNext: () -> Unit,
    vm: CredentialViewModel = viewModel()
) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        when (issuerType) {
            "mosip" -> {
                Text("MOSIP Issuer", style = MaterialTheme.typography.headlineMedium)
                Spacer(Modifier.height(20.dp))
                Button(onClick = {
                    vm.setNationalIdentityConstants()
                    onNavigateNext()
                }) {
                    Text("National Identity")
                }
            }
            "stay_protected" -> {
                Text("Stay Protected Issuer", style = MaterialTheme.typography.headlineMedium)
                Spacer(Modifier.height(20.dp))
                Button(onClick = {
                    vm.setLifeInsuranceConstants()
                    onNavigateNext()
                }) {
                    Text("Life Insurance")
                }
            }
        }
    }
}
