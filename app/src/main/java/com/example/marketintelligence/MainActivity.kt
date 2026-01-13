
package com.example.marketintelligence

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.marketintelligence.ui.academy.AcademyScreen
import com.example.marketintelligence.ui.analysis.AnalysisScreen
import com.example.marketintelligence.ui.fno.FnoScreen
import com.example.marketintelligence.ui.main.MainViewModel
import com.example.marketintelligence.ui.market.MarketScreen
import com.example.marketintelligence.ui.market.MarketViewModel
import com.example.marketintelligence.ui.notifications.NotificationsScreen
import com.example.marketintelligence.ui.portfolio.HoldingDetailScreen
import com.example.marketintelligence.ui.portfolio.PortfolioScreen
import com.example.marketintelligence.ui.scanner.AIScannerScreen
import com.example.marketintelligence.ui.theme.*
import dagger.hilt.android.AndroidEntryPoint

sealed class Screen(val route: String, val label: String, val icon: Int? = null) {
    object Market : Screen("market", "Market", R.drawable.ic_market)
    object AiScan : Screen("ai_scan", "AI Scan", R.drawable.ic_ai_scan)
    object Fno : Screen("fno", "F&O", R.drawable.ic_fno)
    object Portfolio : Screen("portfolio", "Portfolio", R.drawable.ic_portfolio)
    object Academy : Screen("academy", "Academy", R.drawable.ic_academy)
    object Notifications : Screen("notifications", "Notifications")
    object Analysis : Screen("analysis/{symbol}", "Analysis") { fun createRoute(symbol: String) = "analysis/$symbol" }
    object HoldingDetail : Screen("holding/{symbol}", "Holding Detail") { fun createRoute(symbol: String) = "holding/$symbol" }
}

val navItems = listOf(Screen.Market, Screen.AiScan, Screen.Fno, Screen.Portfolio, Screen.Academy)

@AndroidEntryPoint // ADDED: Hilt Entry Point
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MarketIntelligenceAiAndroidTheme {
                MainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(mainViewModel: MainViewModel = hiltViewModel()) {
    val navController = rememberNavController()
    val unreadCount by mainViewModel.unreadNotificationCount.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Market Intelligence", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.Notifications.route) }) {
                        BadgedBox(badge = { if (unreadCount > 0) Badge { Text("$unreadCount") } }) {
                            Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Black, titleContentColor = TextPrimary, actionIconContentColor = TextPrimary)
            )
        },
        bottomBar = {
            CustomBottomNavigation(navController = navController)
        }
    ) { innerPadding ->
        NavHost(
            navController,
            startDestination = Screen.Market.route,
            Modifier.padding(innerPadding).fillMaxSize().background(Color(0xFF0A0A0A))
        ) {
            composable(Screen.Market.route) {
                val marketViewModel: MarketViewModel = hiltViewModel()
                LaunchedEffect(Unit) {
                    marketViewModel.navigationEvents.collect { symbol ->
                        navController.navigate(Screen.Analysis.createRoute(symbol))
                    }
                }
                MarketScreen(marketViewModel = marketViewModel)
            }
            composable(Screen.AiScan.route) { AIScannerScreen() }
            composable(Screen.Fno.route) { FnoScreen() }
            composable(Screen.Portfolio.route) {
                PortfolioScreen(onHoldingClick = { symbol ->
                    navController.navigate(Screen.HoldingDetail.createRoute(symbol))
                })
            }
            composable(Screen.Academy.route) { AcademyScreen() }
            composable(Screen.Notifications.route) {
                NotificationsScreen(onNavigateToAnalysis = { symbol ->
                    navController.navigate(Screen.Analysis.createRoute(symbol))
                })
             }
            composable(
                route = Screen.Analysis.route,
                arguments = listOf(navArgument("symbol") { type = NavType.StringType })
            ) { AnalysisScreen() }
            composable(
                route = Screen.HoldingDetail.route,
                arguments = listOf(navArgument("symbol") { type = NavType.StringType })
            ) { HoldingDetailScreen() }
        }
    }
}

@Composable
fun CustomBottomNavigation(navController: NavController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    Row(
        modifier = Modifier.fillMaxWidth().background(Color.Black).padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceAround,
        verticalAlignment = Alignment.CenterVertically
    ) {
        navItems.forEach { screen ->
            val isSelected = currentDestination?.hierarchy?.any { it.route == screen.route } == true
            val contentColor = if (isSelected) AppGreen else TextSecondary
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .weight(1f)
                    .clickable {
                        navController.navigate(screen.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
            ) {
                screen.icon?.let {
                    Icon(
                        imageVector = ImageVector.vectorResource(id = it),
                        contentDescription = screen.label,
                        tint = contentColor,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = screen.label,
                    color = contentColor,
                    fontSize = 10.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                )
            }
        }
    }
}

// REMOVED: The fake R object is no longer needed.
