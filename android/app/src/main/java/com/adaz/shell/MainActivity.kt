package com.adaz.shell

import android.Manifest
import android.content.pm.PackageManager
import android.annotation.SuppressLint
import android.app.Activity
import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Build
import android.provider.Settings
import android.view.WindowInsets
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private val trustedHost = "diazaalejo8-star.github.io"

    private fun callbackUrl(uri: Uri?): String? {
        if (uri == null || uri.scheme != BuildConfig.AUTH_SCHEME || uri.host != "auth-callback") return null
        val code = uri.getQueryParameter("code") ?: return null
        val separator = if (BuildConfig.START_URL.contains("?")) "&" else "?"
        return BuildConfig.START_URL + separator + "code=" + Uri.encode(code)
    }

    private fun hasUsageAccess(): Boolean {
        val appOps = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), packageName)
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun usageSnapshot(): String {
        val result = JSONObject()
        result.put("permissionGranted", hasUsageAccess())
        result.put("updatedAt", System.currentTimeMillis())
        if (!hasUsageAccess()) return result.toString()
        val manager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val now = System.currentTimeMillis()
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        val start = calendar.timeInMillis
        val apps = JSONArray()
        var total = 0L
        val stats = manager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, now)
            .filter { it.totalTimeInForeground > 0L }
            .sortedByDescending { it.totalTimeInForeground }
        for (item in stats.take(30)) {
            val label = try {
                val info = packageManager.getApplicationInfo(item.packageName, 0)
                packageManager.getApplicationLabel(info).toString()
            } catch (_: Exception) { item.packageName }
            val minutes = item.totalTimeInForeground / 60000L
            if (minutes > 0) {
                apps.put(JSONObject().put("app", label).put("minutes", minutes))
                total += item.totalTimeInForeground
            }
        }
        var foregroundPackage = ""
        var foregroundLabel = ""
        try {
            val events = manager.queryEvents(now - 6 * 60 * 60 * 1000L, now)
            val event = UsageEvents.Event()
            var latest = 0L
            while (events.hasNextEvent()) {
                events.getNextEvent(event)
                if ((event.eventType == UsageEvents.Event.ACTIVITY_RESUMED || event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) && event.timeStamp >= latest) {
                    latest = event.timeStamp
                    foregroundPackage = event.packageName ?: ""
                }
            }
            if (foregroundPackage.isNotBlank()) {
                val info = packageManager.getApplicationInfo(foregroundPackage, 0)
                foregroundLabel = packageManager.getApplicationLabel(info).toString()
            }
        } catch (_: Exception) { }
        result.put("foregroundApp", foregroundLabel)
        result.put("foregroundPackage", foregroundPackage)
        result.put("totalMinutes", total / 60000L)
        result.put("apps", apps)
        return result.toString()
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) window.setDecorFitsSystemWindows(false)
        window.statusBarColor = Color.rgb(9, 11, 16)
        window.navigationBarColor = Color.rgb(9, 11, 16)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) window.isNavigationBarContrastEnforced = false
        webView = WebView(this)
        webView.setOnApplyWindowInsetsListener { view, insets ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                val bars = insets.getInsets(WindowInsets.Type.systemBars())
                view.setPadding(0, bars.top, 0, bars.bottom)
            }
            insets
        }
        webView.addJavascriptInterface(object {
            @JavascriptInterface fun authRedirectUri(): String = BuildConfig.AUTH_REDIRECT_URI
            @JavascriptInterface fun isUsageAccessGranted(): Boolean = hasUsageAccess()
            @JavascriptInterface fun openUsageAccessSettings() {
                runOnUiThread { startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)) }
            }
            @JavascriptInterface fun getUsageSnapshot(): String = UsageMonitorService.snapshot(this@MainActivity)
            @JavascriptInterface fun configureUsageSync(url: String, key: String, access: String, refresh: String, childId: String, expiresAt: Long): Boolean {
                if (!url.startsWith("https://") || key.isBlank() || access.isBlank() || refresh.isBlank() || childId.isBlank()) return false
                UsageMonitorService.configure(this@MainActivity, url, key, access, refresh, childId, expiresAt)
                return true
            }
            @JavascriptInterface fun startUsageMonitor(): Boolean {
                if (!hasUsageAccess()) return false
                if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                    runOnUiThread { requestPermissions(arrayOf("android.permission.POST_NOTIFICATIONS"), 4108) }
                    return false
                }
                runOnUiThread { UsageMonitorService.start(this@MainActivity) }
                return true
            }
            @JavascriptInterface fun stopUsageMonitor() { runOnUiThread { UsageMonitorService.stop(this@MainActivity) } }
            @JavascriptInterface fun isUsageMonitorRunning(): Boolean = getSharedPreferences("adaz_usage_monitor", Context.MODE_PRIVATE).getBoolean("running", false)
        }, "ADAZNative")
        webView.setBackgroundColor(Color.rgb(9, 11, 16))
        webView.settings.apply {
            javaScriptEnabled = true; domStorageEnabled = true; databaseEnabled = true
            allowFileAccess = false; allowContentAccess = false
            javaScriptCanOpenWindowsAutomatically = false; setSupportMultipleWindows(false)
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) safeBrowsingEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
        }
        CookieManager.getInstance().apply { setAcceptCookie(true); setAcceptThirdPartyCookies(webView, false) }
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri: Uri = request.url
                if (uri.scheme == BuildConfig.AUTH_SCHEME && uri.host == "auth-callback") {
                    callbackUrl(uri)?.let { view.loadUrl(it) }; return true
                }
                if (uri.scheme == "https" && uri.host == trustedHost) return false
                return try { startActivity(Intent(Intent.ACTION_VIEW, uri)); true } catch (_: Exception) { true }
            }
        }
        setContentView(webView)
        val authCallback = callbackUrl(intent?.data)
        if (authCallback != null) webView.loadUrl(authCallback)
        else if (savedInstanceState == null) webView.loadUrl(BuildConfig.START_URL)
        else webView.restoreState(savedInstanceState)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent); setIntent(intent)
        callbackUrl(intent?.data)?.let { if (this::webView.isInitialized) webView.loadUrl(it) }
    }
    override fun onSaveInstanceState(outState: Bundle) { webView.saveState(outState); super.onSaveInstanceState(outState) }
    @Deprecated("Deprecated on Android API; retained for broad device compatibility.")
    override fun onBackPressed() { if (this::webView.isInitialized && webView.canGoBack()) webView.goBack() else super.onBackPressed() }
    override fun onDestroy() {
        if (this::webView.isInitialized) { webView.stopLoading(); webView.destroy() }
        super.onDestroy()
    }
}
