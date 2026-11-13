package com.adaz.shell

import android.app.*
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.net.HttpURLConnection
import java.net.URL
import java.io.OutputStreamWriter
import java.util.concurrent.atomic.AtomicBoolean

class UsageMonitorService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private val uploadBusy = AtomicBoolean(false)
    private val prefs by lazy { getSharedPreferences("adaz_usage_monitor", Context.MODE_PRIVATE) }
    private val poll = object : Runnable {
        override fun run() {
            try {
                val snapshot = collectSnapshot()
                prefs.edit().putString("snapshot", snapshot.toString()).apply()
                if (cloudUrl.isNotBlank() && childId.isNotBlank() && uploadBusy.compareAndSet(false, true)) {
                    Thread { try { uploadSnapshot(snapshot) } finally { uploadBusy.set(false) } }.start()
                }
            } catch (_: Exception) {}
            handler.postDelayed(this, 20_000L)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createChannel()
        val notification = if (Build.VERSION.SDK_INT >= 26)
            Notification.Builder(this, "adaz_usage").setSmallIcon(android.R.drawable.ic_menu_view)
                .setContentTitle("ADAZ TRUST está activo")
                .setContentText("Compartición de uso visible y configurable en ADAZ Personal")
                .setOngoing(true).build()
        else Notification.Builder(this).setSmallIcon(android.R.drawable.ic_menu_view)
            .setContentTitle("ADAZ TRUST está activo").setContentText("Supervisión visible").setOngoing(true).build()
        startForeground(4107, notification)
        prefs.edit().putBoolean("running", true).apply()
        handler.post(poll)
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            val channel = NotificationChannel("adaz_usage", "ADAZ TRUST · Uso de aplicaciones", NotificationManager.IMPORTANCE_LOW)
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    private fun collectSnapshot(): JSONObject {
        val now = System.currentTimeMillis()
        val start = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis
        val manager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        var activePackage = ""
        var activeSince = 0L
        val events = manager.queryEvents(now - 6 * 60 * 60 * 1000L, now)
        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            val foreground = if (Build.VERSION.SDK_INT >= 29)
                event.eventType == UsageEvents.Event.ACTIVITY_RESUMED
            else event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND
            val background = if (Build.VERSION.SDK_INT >= 29)
                event.eventType == UsageEvents.Event.ACTIVITY_PAUSED || event.eventType == UsageEvents.Event.ACTIVITY_STOPPED
            else event.eventType == UsageEvents.Event.MOVE_TO_BACKGROUND
            if (foreground) { activePackage = event.packageName ?: ""; activeSince = event.timeStamp }
            if (background && event.packageName == activePackage) { activePackage = ""; activeSince = 0L }
        }
        if (activePackage == packageName) activePackage = ""
        val usage = JSONArray()
        val stats = manager.queryAndAggregateUsageStats(start, now).values
            .filter { it.totalTimeInForeground > 0 && it.packageName != packageName && it.packageName != "android" }
            .sortedByDescending { it.totalTimeInForeground }.take(25)
        for (item in stats) {
            val label = try {
                val app = packageManager.getApplicationInfo(item.packageName, 0)
                packageManager.getApplicationLabel(app).toString()
            } catch (_: PackageManager.NameNotFoundException) { item.packageName }
            usage.put(JSONObject().put("app", label).put("package", item.packageName)
                .put("minutes", item.totalTimeInForeground / 60000L))
        }
        val activeLabel = if (activePackage.isNotBlank()) try {
            val app = packageManager.getApplicationInfo(activePackage, 0)
            packageManager.getApplicationLabel(app).toString()
        } catch (_: Exception) { activePackage } else ""
        return JSONObject().put("activePackage", activePackage).put("activeApp", activeLabel)
            .put("activeSince", if (activeSince > 0) activeSince else JSONObject.NULL)
            .put("dailyUsage", usage).put("capturedAt", now).put("deviceStatus", "active")
    }


    private fun request(url: String, method: String, body: JSONObject, token: String? = null): Pair<Int, String> {
        val conn = (URL(url).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 12000
            readTimeout = 12000
            setRequestProperty("apikey", anonKey)
            if (token != null) setRequestProperty("Authorization", "Bearer $token")
            setRequestProperty("Content-Type", "application/json")
            doOutput = true
        }
        OutputStreamWriter(conn.outputStream, Charsets.UTF_8).use { it.write(body.toString()) }
        val code = conn.responseCode
        val stream = if (code in 200..299) conn.inputStream else conn.errorStream
        val response = stream?.bufferedReader()?.use { it.readText() } ?: ""
        conn.disconnect()
        return code to response
    }

    private fun refreshAccessToken(): Boolean {
        if (refreshToken.isBlank() || cloudUrl.isBlank()) return false
        val body = JSONObject().put("refresh_token", refreshToken)
        val (code, response) = request("$cloudUrl/auth/v1/token?grant_type=refresh_token", "POST", body)
        if (code !in 200..299) return false
        val json = JSONObject(response)
        accessToken = json.optString("access_token", accessToken)
        refreshToken = json.optString("refresh_token", refreshToken)
        tokenExpiresAt = System.currentTimeMillis() + json.optLong("expires_in", 3600L) * 1000L
        return accessToken.isNotBlank()
    }

    private fun uploadSnapshot(snapshot: JSONObject) {
        if (tokenExpiresAt - System.currentTimeMillis() < 120000L && !refreshAccessToken()) return
        val payload = JSONObject()
            .put("child_id", childId)
            .put("active_package", snapshot.optString("activePackage"))
            .put("active_app", snapshot.optString("activeApp"))
            .put("active_since", if (snapshot.isNull("activeSince")) JSONObject.NULL else java.time.Instant.ofEpochMilli(snapshot.optLong("activeSince")).toString())
            .put("daily_usage", snapshot.optJSONArray("dailyUsage") ?: JSONArray())
            .put("captured_at", java.time.Instant.ofEpochMilli(snapshot.optLong("capturedAt", System.currentTimeMillis())).toString())
            .put("device_status", "active")
        var (code, _) = request("$cloudUrl/rest/v1/adaz_usage_snapshots?on_conflict=child_id", "POST", payload, accessToken)
        if (code == 401 && refreshAccessToken()) {
            val result = request("$cloudUrl/rest/v1/adaz_usage_snapshots?on_conflict=child_id", "POST", payload, accessToken)
            code = result.first
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) { stopForeground(STOP_FOREGROUND_REMOVE); stopSelf(); return START_NOT_STICKY }
        return START_STICKY
    }
    override fun onDestroy() { handler.removeCallbacks(poll); prefs.edit().putBoolean("running", false).apply(); super.onDestroy() }
    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val ACTION_STOP = "com.adaz.shell.STOP_USAGE_MONITOR"
        @Volatile private var cloudUrl = ""
        @Volatile private var anonKey = ""
        @Volatile private var accessToken = ""
        @Volatile private var refreshToken = ""
        @Volatile private var childId = ""
        @Volatile private var tokenExpiresAt = 0L
        fun setCloudCredentials(url: String, key: String, access: String, refresh: String, userId: String) {
            cloudUrl = url.trimEnd('/')
            anonKey = key
            accessToken = access
            refreshToken = refresh
            childId = userId
            tokenExpiresAt = System.currentTimeMillis() + 3000L
        }
        fun clearCloudCredentials() { cloudUrl = ""; anonKey = ""; accessToken = ""; refreshToken = ""; childId = ""; tokenExpiresAt = 0L }
        fun start(context: Context) {
            val intent = Intent(context, UsageMonitorService::class.java)
            if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(intent) else context.startService(intent)
        }
        fun stop(context: Context) {
            context.startService(Intent(context, UsageMonitorService::class.java).setAction(ACTION_STOP))
        }
        fun snapshot(context: Context): String =
            context.getSharedPreferences("adaz_usage_monitor", Context.MODE_PRIVATE)
                .getString("snapshot", JSONObject().put("deviceStatus","stopped").toString()) ?: "{}"
    }
}
