
package com.example.marketintelligence.data.engine

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.example.marketintelligence.domain.engine.ChartEngine
import com.example.marketintelligence.ui.theme.SurfaceDark
import javax.inject.Inject

class TradingViewChartEngine @Inject constructor() : ChartEngine {
    override val engineName: String = "Standard (TradingView)"

    @Composable
    override fun Render(symbol: String) {
        val url = "https://www.tradingview.com/widgetembed/?frameElementId=tradingview_b9a30&symbol=$symbol&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=www.tradingview.com&utm_medium=widget_new&utm_campaign=chart&utm_term=$symbol"
        
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    webViewClient = WebViewClient()
                    loadUrl(url)
                }
            },
            modifier = Modifier
                .fillMaxSize()
                .background(SurfaceDark, RoundedCornerShape(12))
        )
    }
}
