package com.ctrlai.app.input

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Rect
import android.os.SystemClock
import android.util.Log
import android.view.accessibility.AccessibilityEvent

/**
 * 远程输入注入服务。通过无障碍手势 API 将控制端事件注入到屏幕坐标。
 * 坐标使用 0..1 归一化，注入前根据真实屏幕尺寸换算。
 */
class RemoteAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "RemoteAccessibility"

        /** 归一化坐标 -> 屏幕真实坐标 */
        fun normalizePoint(x: Float, y: Float, screenWidth: Int, screenHeight: Int): Pair<Int, Int> {
            val px = (x * screenWidth).toInt().coerceIn(0, screenWidth - 1)
            val py = (y * screenHeight).toInt().coerceIn(0, screenHeight - 1)
            return px to py
        }
    }

    var isEnabled = false
        private set

    override fun onServiceConnected() {
        super.onServiceConnected()
        isEnabled = true
        Log.d(TAG, "accessibility connected")
    }

    override fun onInterrupt() {}

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}

    override fun onDestroy() {
        isEnabled = false
        super.onDestroy()
    }

    private fun dispatchGesturePath(
        points: List<Pair<Float, Float>>,
        durationMs: Long,
        gestureId: Int,
    ) {
        val metrics = resources.displayMetrics
        val width = metrics.widthPixels
        val height = metrics.heightPixels

        val path = Path()
        for ((index, point) in points.withIndex()) {
            val (px, py) = normalizePoint(point.first, point.second, width, height)
            if (index == 0) {
                path.moveTo(px.toFloat(), py.toFloat())
            } else {
                path.lineTo(px.toFloat(), py.toFloat())
            }
        }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, durationMs))
            .build()
        dispatchGesture(gesture, null, null)
    }

    /** 注入点击事件 */
    fun injectTap(x: Float, y: Float) {
        if (!isEnabled) return
        dispatchGesturePath(listOf(x to y), 60, 1)
    }

    /** 注入滑动事件 */
    fun injectSwipe(fromX: Float, fromY: Float, toX: Float, toY: Float, durationMs: Long = 200) {
        if (!isEnabled) return
        dispatchGesturePath(listOf(fromX to fromY, toX to toY), durationMs, 2)
    }

    /** 注入系统按键 */
    fun injectKey(globalAction: Int) {
        if (!isEnabled) return
        performGlobalAction(globalAction)
    }
}
