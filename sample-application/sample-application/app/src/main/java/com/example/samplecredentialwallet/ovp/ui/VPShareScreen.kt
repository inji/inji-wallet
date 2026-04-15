package com.example.samplecredentialwallet.ovp.ui

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.OptIn
import androidx.camera.core.CameraSelector
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.example.samplecredentialwallet.R
import com.example.samplecredentialwallet.ovp.utils.CredentialStoreOVPBridge
import com.example.samplecredentialwallet.ovp.utils.MatchingVcsHelper
import com.example.samplecredentialwallet.ovp.utils.OVPConstants
import com.example.samplecredentialwallet.ovp.utils.OpenID4VPManager
import com.example.samplecredentialwallet.ovp.viewmodel.OVPViewModel
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import io.mosip.openID4VP.exceptions.OpenID4VPExceptions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.Executors

@OptIn(ExperimentalGetImage::class)
@Composable
fun VPShareScreen(
    ovpViewModel: OVPViewModel,
    onNavigateToMatching: () -> Unit
) {
    val context = LocalContext.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasCameraPermission = granted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    when {
        hasCameraPermission -> {
            CameraPreviewAndScanner(ovpViewModel, onNavigateToMatching)
        }
        else -> {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Camera permission is required to scan QR codes")
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) }) {
                    Text("Grant Permission")
                }
            }
        }
    }
}

@OptIn(ExperimentalGetImage::class)
@Composable
private fun CameraPreviewAndScanner(
    ovpViewModel: OVPViewModel,
    onNavigateToMatching: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
    val executor = remember { Executors.newSingleThreadExecutor() }
    val barcodeScanner = remember {
        BarcodeScanning.getClient(
            BarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                .build()
        )
    }

    var boundCameraProvider by remember { mutableStateOf<ProcessCameraProvider?>(null) }
    var analysisUseCase by remember { mutableStateOf<ImageAnalysis?>(null) }

    var scannedText by remember { mutableStateOf<String?>(null) }
    var showErrorDialog by remember { mutableStateOf(false) }
    var scanningEnabled by remember { mutableStateOf(true) }

    DisposableEffect(Unit) {
        onDispose {
            analysisUseCase?.clearAnalyzer()
            boundCameraProvider?.unbindAll()
            barcodeScanner.close()
            executor.shutdownNow()
        }
    }

    LaunchedEffect(scanningEnabled) {
        if (!scanningEnabled) {
            analysisUseCase?.clearAnalyzer()
            boundCameraProvider?.unbindAll()
        }
    }

    LaunchedEffect(scannedText) {
        scannedText?.let {
            handleScannedText(
                urlEncodedAuthRequest = it,
                ovpViewModel = ovpViewModel,
                onNavigateToMatching = onNavigateToMatching,
                showError = { showErrorDialog = true },
                disableScanning = { scanningEnabled = false }
            )
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(factory = { ctx ->
            val previewView = PreviewView(ctx)

            cameraProviderFuture.addListener({
                val cameraProvider = cameraProviderFuture.get()
                boundCameraProvider = cameraProvider

                val preview = Preview.Builder().build().also {
                    it.setSurfaceProvider(previewView.surfaceProvider)
                }

                val imageAnalysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()

                analysisUseCase = imageAnalysis

                imageAnalysis.setAnalyzer(executor) { imageProxy ->
                    if (!scanningEnabled) {
                        imageProxy.close()
                        return@setAnalyzer
                    }

                    processImageProxy(
                        imageProxy = imageProxy,
                        barcodeScanner = barcodeScanner,
                        onQrCodeDetected = { value ->
                            if (scannedText != value) {
                                scannedText = value
                                scanningEnabled = false
                            }
                        }
                    )
                }

                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                try {
                    cameraProvider.unbindAll()
                    cameraProvider.bindToLifecycle(
                        lifecycleOwner,
                        cameraSelector,
                        preview,
                        imageAnalysis
                    )
                } catch (e: Exception) {
                    Log.e("VPShareScreen", "Use case binding failed", e)
                }
            }, ContextCompat.getMainExecutor(ctx))

            previewView
        })

        if (showErrorDialog) {
            LaunchedEffect(Unit) {
                withContext(Dispatchers.IO) {
                    try {
                        OpenID4VPManager.sendErrorToVerifier(
                            OpenID4VPExceptions.InvalidTransactionData(
                                OVPConstants.ERR_NO_MATCHING_VCS,
                                "VPShareScreen"
                            )
                        )
                    } catch (e: Exception) {
                        Log.e("VPShareScreen", "Failed to send error to verifier", e)
                    }
                }
            }

            ErrorOverlay {
                showErrorDialog = false
                scanningEnabled = true
                scannedText = null
            }
        }
    }
}

@Composable
private fun ErrorOverlay(onDismiss: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White.copy(alpha = 0.95f))
            .clickable(enabled = false) {},
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .padding(24.dp)
                .fillMaxWidth()
        ) {
            Text(
                text = stringResource(R.string.invalid_qr_code),
                style = MaterialTheme.typography.headlineSmall,
                color = Color.Red
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = stringResource(R.string.no_matching_credential_found_for_the_scanned_qr_code),
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(24.dp))
            Button(onClick = onDismiss) {
                Text(stringResource(R.string.ok))
            }
        }
    }
}

private suspend fun handleScannedText(
    urlEncodedAuthRequest: String,
    ovpViewModel: OVPViewModel,
    onNavigateToMatching: () -> Unit,
    showError: () -> Unit,
    disableScanning: () -> Unit
) {
    val gson = Gson()
    ovpViewModel.updateScannedQr(urlEncodedAuthRequest)
    Log.d("OVP_SCAN", "QR scanned length=${urlEncodedAuthRequest.length}")

    try {
        val authorizationRequest = withContext(Dispatchers.IO) {
            OpenID4VPManager.authenticateVerifier(urlEncodedAuthRequest)
        }

        Log.d("OVP_SCAN", "Verifier authentication succeeded")

        val downloadedVcs = CredentialStoreOVPBridge.getAllCredentialMetadata()
        val authRequestJson: JsonObject = gson.toJsonTree(authorizationRequest).asJsonObject

        val pd = authRequestJson.getAsJsonObject("presentationDefinition")
            ?: authRequestJson.getAsJsonObject("presentation_definition")
        val inputDescriptors = pd?.getAsJsonArray("inputDescriptors")
            ?: pd?.getAsJsonArray("input_descriptors")
        Log.d(
            "OVP_SCAN",
            "Auth request parsed: hasPresentationDefinition=${pd != null}, descriptorCount=${inputDescriptors?.size() ?: 0}, downloadedVcCount=${downloadedVcs.size}"
        )

        val matchingVcsResult = MatchingVcsHelper().getVcsMatchingAuthRequest(downloadedVcs, authRequestJson)

        val matchedDescriptorCount = matchingVcsResult.matchingVCs.keys.size
        val totalMatchedVCs = matchingVcsResult.matchingVCs.values.sumOf { it.size }
        Log.d(
            "OVP_SCAN",
            "Matching completed: matchedDescriptorCount=$matchedDescriptorCount, totalMatchedVCs=$totalMatchedVCs, requestedClaims=${matchingVcsResult.requestedClaims}"
        )

        ovpViewModel.storeMatchResult(matchingVcsResult)

        val hasMatchingVCs = matchingVcsResult.matchingVCs.values.any { it.isNotEmpty() }

        if (hasMatchingVCs) {
            withContext(Dispatchers.Main) {
                Log.d("OVP_SCAN", "Navigating to matching credentials screen")
                onNavigateToMatching()
            }
        } else {
            Log.w("OVP_SCAN", "No matching VCs found for scanned request")
            showError()
            disableScanning()
        }
    } catch (e: Exception) {
        Log.e("VPShareScreen", "Failed to process scanned QR", e)
        showError()
        disableScanning()
    }
}

@androidx.annotation.OptIn(ExperimentalGetImage::class)
private fun processImageProxy(
    imageProxy: ImageProxy,
    barcodeScanner: com.google.mlkit.vision.barcode.BarcodeScanner,
    onQrCodeDetected: (String) -> Unit
) {
    val mediaImage = imageProxy.image
    if (mediaImage != null) {
        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

        barcodeScanner.process(image)
            .addOnSuccessListener { barcodes ->
                for (barcode in barcodes) {
                    barcode.rawValue?.let { qrData ->
                        onQrCodeDetected(qrData)
                    }
                }
            }
            .addOnFailureListener { e ->
                Log.e("VPShareScreen", "Barcode scanning failed", e)
            }
            .addOnCompleteListener {
                imageProxy.close()
            }
    } else {
        imageProxy.close()
    }
}
