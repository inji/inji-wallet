package com.example.sampleappvciclient.navigation

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.sampleappvciclient.ui.credential.CredentialDownloadScreen
import com.example.sampleappvciclient.ui.home.HomeScreen
import com.example.sampleappvciclient.ui.issuer.IssuerListScreen
import com.example.sampleappvciclient.ui.issuer.IssuerDetailScreen
import com.example.sampleappvciclient.ui.auth.AuthWebViewScreen
import com.example.sampleappvciclient.utils.Constants

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object IssuerList : Screen("issuer_list")
    object IssuerDetail : Screen("issuer_detail/{issuerType}") {
        fun createRoute(issuerType: String) = "issuer_detail/$issuerType"
    }
    object CredentialDetail : Screen("credential_detail?authCode={authCode}") {
        fun createRoute(authCode: String?) = "credential_detail?authCode=$authCode"
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
    NavHost(navController = navController, startDestination = Screen.Home.route) {
        composable(Screen.Home.route) {
            HomeScreen(onNavigate = { navController.navigate(Screen.IssuerList.route) })
        }
        composable(Screen.IssuerList.route) {
            IssuerListScreen(
                onIssuerClick = { issuerType ->
                    navController.navigate(Screen.IssuerDetail.createRoute(issuerType))
                }
            )
        }
        composable(Screen.IssuerDetail.route) { backStackEntry ->
            val issuerType = backStackEntry.arguments?.getString("issuerType") ?: ""
            IssuerDetailScreen(
                issuerType,
                onNavigateNext = { navController.navigate(Screen.CredentialDetail.route) }
            )
        }
        composable(Screen.CredentialDetail.route) {
            CredentialDownloadScreen(navController)
        }
        composable(Screen.AuthWebView.route) { backStackEntry ->
            val encodedUrl = backStackEntry.arguments?.getString("authUrl") ?: ""
            val authUrl = Uri.decode(encodedUrl)   // 🔑 decode back
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
    }
}
