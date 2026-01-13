
package com.example.marketintelligence.ui.scanner

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun AIScannerScreen(viewModel: AIScannerViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    
    // ... (Main Column and Header are the same) ...
     Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // ...
        if (uiState.mode == ScannerMode.AUTO) {
            AutoScannerSectionContent(
                // ... (pass other parameters)
                isBackgroundScanEnabled = uiState.isBackgroundScanEnabled,
                onEnableBackgroundScan = { viewModel.setBackgroundScanning(it) }
            )
        } 
        // ...
    }
}

@Composable
fun AutoScannerSectionContent(
    // ... (other parameters)
    isBackgroundScanEnabled: Boolean,
    onEnableBackgroundScan: (Boolean) -> Unit
) {
    // ... (Existing Column with search and watchlist)
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        // ...
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Enable Background Scanning (Every 2 hours)", modifier = Modifier.weight(1f))
            Switch(
                checked = isBackgroundScanEnabled,
                onCheckedChange = onEnableBackgroundScan
            )
        }
    }
}

// NOTE: This is a highly abbreviated version of the file to show only the new changes.
// The full file content would be much larger.
