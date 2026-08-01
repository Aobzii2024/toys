package com.keepmee.app.ui.util

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

object DateUtils {
    private val dayFmt = SimpleDateFormat("M月d日 EEEE", Locale.CHINA)
    private val monthFmt = SimpleDateFormat("yyyy年M月", Locale.CHINA)
    private val yearFmt = SimpleDateFormat("yyyy年", Locale.CHINA)

    fun formatDay(ts: Long): String = dayFmt.format(ts)
    fun formatMonth(ts: Long): String = monthFmt.format(ts)
    fun formatYear(ts: Long): String = yearFmt.format(ts)
    fun formatTime(ts: Long): String = SimpleDateFormat("HH:mm", Locale.CHINA).format(ts)

    fun startOfDay(ts: Long): Long {
        val c = Calendar.getInstance().apply { timeInMillis = ts }
        c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0)
        c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0)
        return c.timeInMillis
    }

    fun startOfMonth(ts: Long): Long {
        val c = Calendar.getInstance().apply { timeInMillis = ts }
        c.set(Calendar.DAY_OF_MONTH, 1)
        c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0)
        c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0)
        return c.timeInMillis
    }

    fun startOfYear(ts: Long): Long {
        val c = Calendar.getInstance().apply { timeInMillis = ts }
        c.set(Calendar.DAY_OF_YEAR, 1)
        c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0)
        c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0)
        return c.timeInMillis
    }

    fun nextMonth(ts: Long): Long {
        val c = Calendar.getInstance().apply { timeInMillis = ts }
        c.add(Calendar.MONTH, 1)
        return c.timeInMillis
    }

    fun prevMonth(ts: Long): Long {
        val c = Calendar.getInstance().apply { timeInMillis = ts }
        c.add(Calendar.MONTH, -1)
        return c.timeInMillis
    }

    fun nextYear(ts: Long): Long {
        val c = Calendar.getInstance().apply { timeInMillis = ts }
        c.add(Calendar.YEAR, 1)
        return c.timeInMillis
    }

    fun prevYear(ts: Long): Long {
        val c = Calendar.getInstance().apply { timeInMillis = ts }
        c.add(Calendar.YEAR, -1)
        return c.timeInMillis
    }
}
