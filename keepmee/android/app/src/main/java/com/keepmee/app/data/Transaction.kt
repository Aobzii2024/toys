package com.keepmee.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class Transaction(
    @PrimaryKey
    val id: Long = 0L,
    val amount: Double,
    val category: String,
    val isExpense: Boolean,
    val note: String = "",
    val timestamp: Long = System.currentTimeMillis()
)
