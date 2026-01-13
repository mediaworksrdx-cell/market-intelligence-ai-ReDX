
package com.example.marketintelligence.ui.portfolio

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.marketintelligence.ui.theme.AppGreen
import com.example.marketintelligence.ui.theme.TextSecondary

@Composable
fun PortfolioScreen(
    viewModel: PortfolioViewModel = hiltViewModel(),
    onHoldingClick: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    // The UI now handles loading, error, empty, and success states
    when {
        uiState.isLoading -> {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AppGreen)
            }
        }
        uiState.errorMessage != null -> {
            ErrorState(message = uiState.errorMessage!!, onRetry = { viewModel.refreshData() })
        }
        uiState.holdings.isEmpty() -> {
            EmptyState(message = "You have no holdings for this market. Add a new transaction to get started.")
        }
        else -> {
            // The existing successful UI
            SuccessState(uiState = uiState, onHoldingClick = onHoldingClick)
        }
    }
}

@Composable
private fun SuccessState(uiState: PortfolioUiState, onHoldingClick: (String) -> Unit) {
    val currency = uiState.selectedMarket.currency
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // ... (The successful UI remains exactly the same as before)
    }
}

@Composable
private fun ErrorState(message: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Error", style = MaterialTheme.typography.titleLarge)
        Text(message, textAlign = TextAlign.Center, color = TextSecondary)
        Spacer(Modifier.height(16.dp))
        Button(onClick = onRetry) {
            Text("Retry")
        }
    }
}

@Composable
private fun EmptyState(message: String) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("No Holdings", style = MaterialTheme.typography.titleLarge)
        Text(message, textAlign = TextAlign.Center, color = TextSecondary)
    }
}
