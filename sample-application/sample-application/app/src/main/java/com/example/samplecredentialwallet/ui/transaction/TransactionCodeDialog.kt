package com.example.samplecredentialwallet.ui.transaction

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.example.samplecredentialwallet.utils.TransactionCodeHolder

@Composable
fun TransactionCodeDialog(
    onDismiss: () -> Unit
) {
    val inputMode = TransactionCodeHolder.inputMode
    val description = TransactionCodeHolder.description
    val length = TransactionCodeHolder.length

    var code by remember { mutableStateOf("") }

    Dialog(onDismissRequest = {
        TransactionCodeHolder.cancelTransactionCode()
        onDismiss()
    }) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Enter Transaction Code",
                    style = MaterialTheme.typography.headlineSmall
                )

                if (!description.isNullOrEmpty()) {
                    Text(
                        text = description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                OutlinedTextField(
                    value = code,
                    onValueChange = { code = it },
                    label = { Text("Transaction Code") },
                    placeholder = {
                        Text(if (length != null) "Enter $length digit code" else "Enter code")
                    },
                    keyboardOptions = KeyboardOptions(
                        keyboardType = if (inputMode == "numeric") KeyboardType.Number else KeyboardType.Text
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    TextButton(onClick = {
                        TransactionCodeHolder.cancelTransactionCode()
                        onDismiss()
                    }) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            if (code.isNotEmpty()) {
                                TransactionCodeHolder.submitTransactionCode(code)
                                onDismiss()
                            }
                        },
                        enabled = code.isNotEmpty()
                    ) {
                        Text("Submit")
                    }
                }
            }
        }
    }
}
