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
                    // Set constants based on issuer type - COLLAB ENVIRONMENT
                    when (issuerType) {
                        "Mosip" -> {
                            Constants.credentialIssuerHost = "https://injicertify-mosipid.collab.mosip.net"
                            Constants.credentialTypeId = "MosipVerifiableCredential"
                            Constants.clientId = "mpartner-default-mimoto-mosipid-oidc"
                            Constants.redirectUri = "io.mosip.residentapp.inji://oauthredirect"
                            Constants.credentialDisplayName = "Veridonia National ID"
                        }
                        "StayProtected" -> {
                            Constants.credentialIssuerHost = "https://injicertify-insurance.collab.mosip.net"
                            Constants.credentialTypeId = "InsuranceCredential"
                            Constants.clientId = "esignet-sunbird-partner"
                            Constants.redirectUri = "io.mosip.residentapp.inji://oauthredirect"
                            Constants.credentialDisplayName = "Life Insurance"
                        }
                        "MosipTAN" -> {
                            Constants.credentialIssuerHost = "https://injicertify-tan.collab.mosip.net/v1/certify/issuance"
                            Constants.credentialTypeId = "IncomeTaxAccountCredential"
                            Constants.clientId = "mpartner-default-mimoto-mosipid-oidc"
                            Constants.redirectUri = "io.mosip.residentapp.inji://oauthredirect"
                            Constants.credentialDisplayName = "Income Tax Account"
                        }
                        "Land" -> {
                            Constants.credentialIssuerHost = "https://injicertify-landregistry.collab.mosip.net"
                            Constants.credentialTypeId = "LandStatementCredential"
                            Constants.clientId = "mpartner-default-mimoto-land-oidc"
                            Constants.redirectUri = "io.mosip.residentapp.inji://oauthredirect"
                            Constants.credentialDisplayName = "Land Records Statement"
                        }
                    }
                    // Navigate directly to credential download
                    navController.navigate(Screen.CredentialDetail.route)
                }
            )
        }
        composable(Screen.CredentialDetail.route) {
            CredentialDownloadScreen(navController)
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
