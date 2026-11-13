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
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.Executors
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class UsageMonitorService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private val executor = Executors.newSingleThreadExecutor()
    private val prefs by lazy { getSharedPreferences("adaz_usage_monitor", Context.MODE_PRIVATE) }
    private val poll = object : Runnable {
        override fun run() {
            try {
                val snapshot = collectSnapshot()
                prefs.edit().putString("snapshot", snapshot.toString()).apply()
                executor.execute { uploadSnapshot(snapshot) }
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
                .setContentText("Compartición visible de uso de aplicaciones")
                .setOngoing(true).build()
        else Notification.Builder(this).setSmallIcon(android.R.drawable.ic_menu_view)
            .setContentTitle("ADAZ TRUST está activo").setContentText("Compartición visible").setOngoing(true).build()
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

    private fun iso(timestamp: Long): String {
        val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        format.timeZone = TimeZone.getTimeZone("UTC")
        return format.format(Date(timestamp))
    }

    private fun refreshAccessToken(): String? {
        val url = prefs.getString("supabase_url", "") ?: ""
        val key = prefs.getString("supabase_key", "") ?: ""
        val refresh = UsageTokenVault.open(prefs.getString("refresh_token", "") ?: "")
        if (url.isBlank() || key.isBlank() || refresh.isBlank()) return null
        val endpoint = URL(url.trimEnd('/') + "/auth/v1/token?grant_type=refresh_token")
        val connection = (endpoint.openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"; connectTimeout = 10000; readTimeout = 10000
            setRequestProperty("apikey", key); setRequestProperty("Content-Type", "application/json")
            doOutput = true
        }
        try {
            OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use {
                it.write(JSONObject().put("refresh_token", refresh).toString())
            }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val body = stream.bufferedReader().use { it.readText() }
            if (code !in 200..299) return null
            val json = JSONObject(body)
            val access = json.optString("access_token", "")
            val nextRefresh = json.optString("refresh_token", refresh)
            if (access.isBlank()) return null
            prefs.edit().putString("access_token", UsageTokenVault.seal(access)).putString("refresh_token", UsageTokenVault.seal(nextRefresh))
                .putLong("expires_at", System.currentTimeMillis() + json.optLong("expires_in", 3600L) * 1000L).apply()
            return access
        } finally { connection.disconnect() }
    }

    private fun uploadSnapshot(snapshot: JSONObject) {
        val url = prefs.getString("supabase_url", "") ?: return
        val key = prefs.getString("supabase_key", "") ?: return
        var access = UsageTokenVault.open(prefs.getString("access_token", "") ?: "")
        if (access.isBlank() || prefs.getLong("expires_at", 0L) < System.currentTimeMillis() + 60_000L) {
            access = refreshAccessToken() ?: return
        }
        val childId = prefs.getString("child_id", "") ?: return
        val activeSince = snapshot.optLong("activeSince", 0L)
        val payload = JSONObject().put("child_id", childId)
            .put("active_package", snapshot.optString("activePackage", ""))
            .put("active_app", snapshot.optString("activeApp", ""))
            .put("active_since", if (activeSince > 0) iso(activeSince) else JSONObject.NULL)
            .put("daily_usage", snapshot.optJSONArray("dailyUsage") ?: JSONArray())
            .put("captured_at", iso(snapshot.optLong("capturedAt", System.currentTimeMillis())))
            .put("device_status", snapshot.optString("deviceStatus", "active"))
        val endpoint = URL(url.trimEnd('/') + "/rest/v1/adaz_usage_snapshots?on_conflict=child_id")
        val connection = (endpoint.openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"; connectTimeout = 10000; readTimeout = 10000
            setRequestProperty("apikey", key); setRequestProperty("Authorization", "Bearer $access")
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Prefer", "resolution=merge-duplicates,return=minimal")
            doOutput = true
        }
        try {
            OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { it.write(payload.toString()) }
            connection.responseCode
        } catch (_: Exception) {
        } finally { connection.disconnect() }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            prefs.edit().remove("supabase_url").remove("supabase_key").remove("access_token")
                .remove("refresh_token").remove("child_id").remove("expires_at").apply()
            stopForeground(STOP_FOREGROUND_REMOVE); stopSelf(); return START_NOT_STICKY
        }
        return START_STICKY
    }
    override fun onDestroy() {
        handler.removeCallbacks(poll); executor.shutdownNow()
        prefs.edit().putBoolean("running", false).apply()
        super.onDestroy()
    }
    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val ACTION_STOP = "com.adaz.shell.STOP_USAGE_MONITOR"
        fun configure(context: Context, url: String, key: String, access: String, refresh: String, childId: String, expiresAt: Long) {
            context.getSharedPreferences("adaz_usage_monitor", Context.MODE_PRIVATE).edit()
                .putString("supabase_url", url).putString("supabase_key", key)
                .putString("access_token", UsageTokenVault.seal(access)).putString("refresh_token", UsageTokenVault.seal(refresh))
                .putString("child_id", childId).putLong("expires_at", expiresAt).apply()
        }
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

private object UsageTokenVault {
    private const val ALIAS = "adaz_trust_usage_tokens_v1"
    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (store.getKey(ALIAS, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setRandomizedEncryptionRequired(true).build())
        return generator.generateKey()
    }
    fun seal(value: String): String {
        if (value.isBlank()) return ""
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key())
        val encrypted = cipher.iv + cipher.doFinal(value.toByteArray(Charsets.UTF_8))
        return Base64.encodeToString(encrypted, Base64.NO_WRAP)
    }
    fun open(value: String): String {
        if (value.isBlank()) return ""
        return try {
            val bytes = Base64.decode(value, Base64.NO_WRAP)
            val iv = bytes.copyOfRange(0, 12)
            val data = bytes.copyOfRange(12, bytes.size)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, iv))
            String(cipher.doFinal(data), Charsets.UTF_8)
        } catch (_: Exception) { "" }
    }
}
