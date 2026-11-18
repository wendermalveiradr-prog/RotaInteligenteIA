package com.anonymous.RotaInteligenteIA

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.util.Locale
import java.util.regex.Pattern

class MobLetsAccessibilityService : AccessibilityService() {
    private var windowManager: WindowManager? = null
    private var overlayView: LinearLayout? = null
    private var tvInfo: TextView? = null
    private var tvAlert: TextView? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) return
        setupOverlay()
    }

    private fun setupOverlay() {
        if (overlayView != null) return
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#E6111827"))
            setPadding(36, 28, 36, 28)
        }
        tvInfo = TextView(this).apply {
            text = "Mob Lets Radar - Aguardando corrida..."
            setTextColor(Color.WHITE)
            textSize = 14f
            setTypeface(null, Typeface.BOLD)
        }
        tvAlert = TextView(this).apply {
            text = "Abra o Mob Lets para analisar"
            setTextColor(Color.parseColor("#94A3B8"))
            textSize = 12f
        }
        layout.addView(tvInfo)
        layout.addView(tvAlert)
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY else @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        ).apply { gravity = Gravity.TOP or Gravity.START; x = 0; y = 60 }
        overlayView = layout
        windowManager?.addView(overlayView, params)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (overlayView == null && (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(this))) setupOverlay()
        val rootNode = rootInActiveWindow ?: return
        val texts = mutableListOf<String>()
        extractTexts(rootNode, texts)
        val lowerText = texts.joinToString(" | ").lowercase(Locale.getDefault())
        val moneyMatcher = Pattern.compile("r\\$\\s*(\\d+[.,]\\d{2})").matcher(lowerText)
        val kmMatcher = Pattern.compile("(\\d+[.,]?\\d*)\\s*km").matcher(lowerText)
        var valor = 0.0
        var km = 0.0
        if (moneyMatcher.find()) valor = moneyMatcher.group(1)?.replace(",", ".")?.toDoubleOrNull() ?: 0.0
        while (kmMatcher.find()) km += kmMatcher.group(1)?.replace(",", ".")?.toDoubleOrNull() ?: 0.0
        if (valor > 0.0 && km > 0.0) {
            val prefs = getSharedPreferences("RKStorage", Context.MODE_PRIVATE)
            val configStr = prefs.getString("@config_km", null)
            var metaKm = 2.0
            var kmMax = 15.0
            var evitados = listOf("zona rural", "distrito industrial")
            var preferidos = listOf("centro", "major prates", "ibituruna", "todos os santos")
            if (configStr != null) {
                try {
                    val json = JSONObject(configStr)
                    metaKm = json.optString("valorKm", "2.0").replace(",", ".").toDoubleOrNull() ?: 2.0
                    kmMax = json.optString("kmMaximo", "15").replace(",", ".").toDoubleOrNull() ?: 15.0
                    val evStr = json.optString("bairrosEvitados", "")
                    if (evStr.isNotEmpty()) evitados = evStr.split(",").map { it.trim().lowercase(Locale.getDefault()) }.filter { it.isNotEmpty() }
                    val prefStr = json.optString("bairrosPreferidos", "")
                    if (prefStr.isNotEmpty()) preferidos = prefStr.split(",").map { it.trim().lowercase(Locale.getDefault()) }.filter { it.isNotEmpty() }
                } catch (_: Exception) {}
            }
            val ganhoPorKm = valor / km
            val bairroRuim = evitados.firstOrNull { lowerText.contains(it) }
            val bairroBom = preferidos.firstOrNull { lowerText.contains(it) }
            val valStr = String.format(Locale.US, "%.2f", valor)
            val kmStr = String.format(Locale.US, "%.1f", km)
            val gKmStr = String.format(Locale.US, "%.2f", ganhoPorKm)
            val metaStr = String.format(Locale.US, "%.2f", metaKm)
            overlayView?.post {
                tvInfo?.text = "R$ " + valStr + " | " + kmStr + " km (R$ " + gKmStr + "/km)"
                when {
                    bairroRuim != null -> { overlayView?.setBackgroundColor(Color.parseColor("#F2DC2626")); tvAlert?.text = "NAO IR - AREA EVITADA (" + bairroRuim + ")" }
                    ganhoPorKm < metaKm -> { overlayView?.setBackgroundColor(Color.parseColor("#F2DC2626")); tvAlert?.text = "NAO VALE A PENA - Meta: R$ " + metaStr + "/km" }
                    km > kmMax -> { overlayView?.setBackgroundColor(Color.parseColor("#F2D97706")); tvAlert?.text = "ATENCAO - MUITO LONGE (Max: " + kmMax.toInt() + " km)" }
                    bairroBom != null -> { overlayView?.setBackgroundColor(Color.parseColor("#F216A34A")); tvAlert?.text = "VALE A PENA - BAIRRO BOM (" + bairroBom + ")" }
                    else -> { overlayView?.setBackgroundColor(Color.parseColor("#F22563EB")); tvAlert?.text = "VALE A PENA - DENTRO DA META DE KM" }
                }
            }
        }
    }

    private fun extractTexts(node: AccessibilityNodeInfo?, list: MutableList<String>) {
        if (node == null) return
        node.text?.toString()?.let { if (it.isNotBlank()) list.add(it) }
        node.contentDescription?.toString()?.let { if (it.isNotBlank()) list.add(it) }
        for (i in 0 until node.childCount) extractTexts(node.getChild(i), list)
    }

    override fun onInterrupt() {}
    override fun onDestroy() {
        super.onDestroy()
        if (overlayView != null) { try { windowManager?.removeView(overlayView) } catch (_: Exception) {} ; overlayView = null }
    }
}