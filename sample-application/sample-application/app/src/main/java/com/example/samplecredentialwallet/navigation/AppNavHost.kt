package com.example.samplecredentialwallet.navigation

import android.net.Uri
import android.util.Log
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.samplecredentialwallet.ui.credential.CredentialDownloadScreen
import com.example.samplecredentialwallet.ui.credential.CredentialListScreen
import com.example.samplecredentialwallet.ui.home.HomeScreen
import com.example.samplecredentialwallet.ui.issuer.IssuerListScreen
import com.example.samplecredentialwallet.ui.issuer.IssuerDetailScreen
import com.example.samplecredentialwallet.ui.auth.AuthWebViewScreen
import com.example.samplecredentialwallet.ui.splash.SplashScreen
import com.example.samplecredentialwallet.utils.Constants
import com.example.samplecredentialwallet.utils.IssuerRepository

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Home : Screen("home")
    object IssuerList : Screen("issuer_list")
    object IssuerDetail : Screen("issuer_detail/{issuerType}") {
        fun createRoute(issuerType: String) = "issuer_detail/$issuerType"
    }
    object CredentialDetail : Screen("credential_detail?authCode={authCode}") {
        fun createRoute(authCode: String?) = "credential_detail?authCode=$authCode"
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
                    if (IssuerRepository.applyConfiguration(issuerType)) {
                        // Navigate to credential download
                        navController.navigate(Screen.CredentialDetail.route)
                    } else {
                        Log.e("AppNavHost", "Unknown issuer type: $issuerType")
                    }
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
            arguments = listOf(navArgument("authCode") { nullable = true })
        ) { backStackEntry ->
            val authCode = backStackEntry.arguments?.getString("authCode")
            CredentialDownloadScreen(navController, authCode)
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
