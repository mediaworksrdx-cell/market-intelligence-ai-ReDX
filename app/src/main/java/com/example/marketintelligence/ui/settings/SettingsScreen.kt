
package com.example.marketintelligence.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun SettingsScreen(viewModel: SettingsViewModel = hiltViewModel()) {
    val selectedScannerEngine by viewModel.selectedScannerEngine.collectAsState()
    val selectedMentorEngine by viewModel.selectedMentorEngine.collectAsState()
    val selectedChartEngine by viewModel.selectedChartEngine.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item { Text("Settings", style = MaterialTheme.typography.titleLarge) }
        
        // --- Other settings like Biometrics would go here ---
        
        item { Divider() }
        
        item {
            EngineSelector(
                label = "AI Scanner Engine",
                options = viewModel.availableScannerEngines,
                selected = selectedScannerEngine,
                onSelected = { viewModel.setScannerEngine(it) }
            )
        }
        item {
            EngineSelector(
                label = "AI Mentor Engine",
                options = viewModel.availableMentorEngines,
                selected = selectedMentorEngine,
                onSelected = { viewModel.setMentorEngine(it) }
            )
        }
        item {
            EngineSelector(
                label = "Charting Engine",
                options = viewModel.availableChartEngines,
                selected = selectedChartEngine,
                onSelected = { viewModel.setChartEngine(it) }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EngineSelector(
    label: String,
    options: List<String>,
    selected: String,
    onSelected: (String) -> Unit
) {
    var isExpanded by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(label, style = MaterialTheme.typography.titleMedium)
        ExposedDropdownMenuBox(
            expanded = isExpanded,
            onExpandedChange = { isExpanded = !isExpanded }
        ) {
            OutlinedTextField(
                value = selected,
                onValueChange = {},
                readOnly = true,
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isExpanded) },
                modifier = Modifier.fillMaxWidth().menuAnchor()
            )
            ExposedDropdownMenu(expanded = isExpanded, onDismissRequest = { isExpanded = false }) {
                options.forEach { option ->
                    DropdownMenuItem(
                        text = { Text(option) },
                        onClick = {
                            onSelected(option)
                            isExpanded = false
                        }
                    )
                }
            }
        }
    }
}
