package com.example.samplecredentialwallet.navigation

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.samplecredentialwallet.ui.credential.CredentialDownloadScreen
import com.example.samplecredentialwallet.ui.credential.CredentialListScreen
import com.example.samplecredentialwallet.ui.home.HomeScreen
import com.example.samplecredentialwallet.ui.issuer.IssuerListScreen
import com.example.samplecredentialwallet.ui.issuer.IssuerDetailScreen
import androidx.compose.material3.*
import com.example.samplecredentialwallet.ui.auth.AuthWebViewScreen
import com.example.samplecredentialwallet.ui.splash.SplashScreen
import com.example.samplecredentialwallet.utils.Constants
import com.example.samplecredentialwallet.utils.IssuerRepository
import com.example.samplecredentialwallet.utils.IssuerRepositoryV2
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Home : Screen("home")
    object IssuerList : Screen("issuer_list")
    object IssuerDetail : Screen("issuer_detail/{issuerType}") {
        fun createRoute(issuerType: String) = "issuer_detail/$issuerType"
    }
    object CredentialDetail : Screen("credential_detail?authCode={authCode}&credentialOfferUri={credentialOfferUri}") {
        fun createRoute(authCode: String? = null, credentialOfferUri: String? = null): String {
            return "credential_detail?authCode=$authCode&credentialOfferUri=${Uri.encode(credentialOfferUri ?: "")}"
        }
    }
    object CredentialList : Screen("credential_list?index={index}") {
        fun createRoute(index: Int = -1) = "credential_list?index=$index"
    }

    object AuthWebView : Screen("auth_webview/{authUrl}") {
        fun createRoute(authUrl: String): String {
            // Encode the URL before putting it into the route
            return "auth_webview/${Uri.encode(authUrl)}"
        }
    }

    object QrScanner : Screen("qr_scanner")
}

@Composable
fun AppNavHost(navController: NavHostController) {
    NavHost(navController = navController, startDestination = Screen.Splash.route) {
        composable(Screen.Splash.route) {
            SplashScreen {
                navController.navigate(Screen.Home.route) {
                    popUpTo(Screen.Splash.route) { inclusive = true }
                }
            }
        }
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigate = { navController.navigate(Screen.IssuerList.route) },
                onViewCredential = { index ->
                    navController.navigate(Screen.CredentialList.createRoute(index))
                }
            )
        }
        composable(Screen.IssuerList.route) {
            IssuerListScreen(
                onIssuerClick = { issuerType ->
                    // Apply issuer configuration from repository
                    if (IssuerRepositoryV2.applyConfiguration(issuerType)) {
                        // Navigate to credential download
                        navController.navigate(Screen.CredentialDetail.route)
                    } else {
                        Log.e("AppNavHost", "Unknown issuer type: $issuerType")
                    }
                },
                onScanQrCode = {
                    navController.navigate(Screen.QrScanner.route)
                }
            )
        }
        composable(Screen.QrScanner.route) {
            QrScannerScreen(
                onQrScanned = { qrData ->
                    // Navigate to credential download screen with QR data as credentialOfferUri
                    Log.d("AppNavHost", "QR Code scanned, navigating with data: $qrData")
                    navController.navigate(Screen.CredentialDetail.createRoute(credentialOfferUri = qrData)) {
                        popUpTo(Screen.IssuerList.route) { inclusive = false }
                    }
                },
                onCancel = {
                    navController.popBackStack()
                }
            )
        }
        composable(Screen.AuthWebView.route) { backStackEntry ->
            val encodedUrl = backStackEntry.arguments?.getString("authUrl") ?: ""
            val authUrl = Uri.decode(encodedUrl)   //  decode back
            AuthWebViewScreen(
                authorizationUrl = authUrl,
                redirectUri = Constants.redirectUri ?: "",
                navController = navController
            )
        }

        composable(
            route = Screen.CredentialDetail.route,
            arguments = listOf(
                navArgument("authCode") { nullable = true },
                navArgument("credentialOfferUri") { nullable = true }
            )
        ) { backStackEntry ->
            val authCode = backStackEntry.arguments?.getString("authCode")
            val encodedCredentialOfferUri = backStackEntry.arguments?.getString("credentialOfferUri")
            val credentialOfferUri = encodedCredentialOfferUri?.let { Uri.decode(it) }

            Log.d("AppNavHost", "CredentialDetail - authCode: $authCode, credentialOfferUri: $credentialOfferUri")
            CredentialDownloadScreen(navController, authCode, credentialOfferUri)
        }

        composable(
            route = Screen.CredentialList.route,
            arguments = listOf(navArgument("index") {
                type = androidx.navigation.NavType.IntType
                defaultValue = -1
            })
        ) { backStackEntry ->
            val credentialIndex = backStackEntry.arguments?.getInt("index") ?: -1
            Log.d("AppNavHost", "Navigating to credential list with index: $credentialIndex")
            CredentialListScreen(navController, credentialIndex)
        }
    }
}

// QR scanner composable with CameraX and ML Kit
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QrScannerScreen(onQrScanned: (String) -> Unit, onCancel: () -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    var scannedData by remember { mutableStateOf<String?>(null) }
    val cameraExecutor = remember { Executors.newSingleThreadExecutor() }

    // Permission launcher
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    // Request camera permission on launch
    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    // Cleanup executor on dispose
    DisposableEffect(Unit) {
        onDispose {
            cameraExecutor.shutdown()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scan QR Code") },
                navigationIcon = {
                    IconButton(onClick = onCancel) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                !hasCameraPermission -> {
                    // Show permission denied message
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Camera permission is required to scan QR codes",
                            style = MaterialTheme.typography.bodyLarge,
                            textAlign = TextAlign.Center
                        )
                        Button(
                            onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                            modifier = Modifier.padding(top = 16.dp)
                        ) {
                            Text("Grant Permission")
                        }
                        Button(
                            onClick = onCancel,
                            modifier = Modifier.padding(top = 8.dp)
                        ) {
                            Text("Cancel")
                        }
                    }
                }
                scannedData != null -> {
                    // QR code successfully scanned
                    LaunchedEffect(scannedData) {
                        scannedData?.let { data ->
                            Log.d("QrScannerScreen", "QR Code scanned: $data")
                            onQrScanned(data)
                        }
                    }
                }
                else -> {
                    // Show camera preview
                    CameraPreview(
                        modifier = Modifier.fillMaxSize(),
                        cameraExecutor = cameraExecutor,
                        lifecycleOwner = lifecycleOwner,
                        onQrCodeDetected = { qrData ->
                            if (scannedData == null) {
                                scannedData = qrData
                            }
                        }
                    )

                    // Overlay instructions
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .align(Alignment.BottomCenter)
                            .background(Color.Black.copy(alpha = 0.7f))
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Position the QR code within the frame",
                            color = Color.White,
                            style = MaterialTheme.typography.bodyLarge,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CameraPreview(
    modifier: Modifier = Modifier,
    cameraExecutor: ExecutorService,
    lifecycleOwner: androidx.lifecycle.LifecycleOwner,
    onQrCodeDetected: (String) -> Unit
) {
    val context = LocalContext.current

    // ML Kit barcode scanner
    val barcodeScanner = remember {
        val options = BarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
            .build()
        BarcodeScanning.getClient(options)
    }

    AndroidView(
        factory = { ctx ->
            val previewView = PreviewView(ctx)
            val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)

            cameraProviderFuture.addListener({
                val cameraProvider = cameraProviderFuture.get()

                // Preview use case
                val preview = Preview.Builder().build().also {
                    it.setSurfaceProvider(previewView.surfaceProvider)
                }

                // Image analysis use case for QR code detection
                val imageAnalysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()

                imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                    processImageProxy(imageProxy, barcodeScanner, onQrCodeDetected)
                }

                // Select back camera
                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                try {
                    // Unbind all use cases before rebinding
                    cameraProvider.unbindAll()

                    // Bind use cases to camera
                    cameraProvider.bindToLifecycle(
                        lifecycleOwner,
                        cameraSelector,
                        preview,
                        imageAnalysis
                    )
                } catch (e: Exception) {
                    Log.e("CameraPreview", "Camera binding failed", e)
                }
            }, ContextCompat.getMainExecutor(ctx))

            previewView
        },
        modifier = modifier
    )
}

@androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
private fun processImageProxy(
    imageProxy: ImageProxy,
    barcodeScanner: com.google.mlkit.vision.barcode.BarcodeScanner,
    onQrCodeDetected: (String) -> Unit
) {
    val mediaImage = imageProxy.image
    if (mediaImage != null) {
        val image = InputImage.fromMediaImage(
            mediaImage,
            imageProxy.imageInfo.rotationDegrees
        )

        barcodeScanner.process(image)
            .addOnSuccessListener { barcodes ->
                for (barcode in barcodes) {
                    barcode.rawValue?.let { qrData ->
                        Log.d("QrScanner", "Detected QR code: $qrData")
                        onQrCodeDetected(qrData)
                    }
                }
            }
            .addOnFailureListener { e ->
                Log.e("QrScanner", "Barcode scanning failed", e)
            }
            .addOnCompleteListener {
                imageProxy.close()
            }
    } else {
        imageProxy.close()
    }
}
