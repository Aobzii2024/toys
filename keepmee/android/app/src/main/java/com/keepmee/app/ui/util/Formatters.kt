package com.keepmee.app.ui.util

import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.font.FontWeight

fun formatMoney(v: Double): String {
    return if (v % 1.0 == 0.0) v.toLong().toString() else "%.2f".format(v)
}

fun formatMoneyBig(v: Double): AnnotatedString {
    val s = formatMoney(v)
    return buildAnnotatedString {
        withStyle(SpanStyle(fontWeight = FontWeight.Bold)) {
            append(s)
        }
    }
}

fun signMoney(v: Double, isExpense: Boolean): String {
    val prefix = if (isExpense) "-" else "+"
    return prefix + formatMoney(v)
}
