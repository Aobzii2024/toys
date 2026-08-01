package com.keepmee.app.export

import android.content.Context
import android.net.Uri
import com.keepmee.app.data.Transaction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.IOException

@Serializable
data class TransactionDto(
    val id: Long = 0L,
    val amount: Double,
    val category: String,
    val isExpense: Boolean,
    val note: String = "",
    val timestamp: Long
)

@Serializable
data class BackupData(
    val app: String = "keepmee",
    val version: Int = 1,
    val exportedAt: Long = System.currentTimeMillis(),
    val transactions: List<TransactionDto> = emptyList()
)

object BackupManager {

    private val json = Json {
        prettyPrint = true
        encodeDefaults = true
        ignoreUnknownKeys = true
    }

    fun toDto(t: Transaction) = TransactionDto(
        id = t.id, amount = t.amount, category = t.category,
        isExpense = t.isExpense, note = t.note, timestamp = t.timestamp
    )

    fun fromDto(d: TransactionDto) = Transaction(
        id = d.id, amount = d.amount, category = d.category,
        isExpense = d.isExpense, note = d.note, timestamp = d.timestamp
    )

    fun serialize(transactions: List<Transaction>): String =
        json.encodeToString(BackupData.serializer(), BackupData(transactions = transactions.map(::toDto)))

    fun parse(content: String): List<Transaction> {
        val backup = json.decodeFromString(BackupData.serializer(), content)
        return backup.transactions.map(::fromDto)
    }

    suspend fun writeToUri(context: Context, uri: Uri, transactions: List<Transaction>): Result<String> =
        withContext(Dispatchers.IO) {
            runCatching {
                context.contentResolver.openOutputStream(uri)?.use { out ->
                    out.write(serialize(transactions).toByteArray(Charsets.UTF_8))
                } ?: throw IOException("无法打开输出流")
                "${transactions.size} 条记录已导出"
            }
        }

    suspend fun readFromUri(context: Context, uri: Uri): Result<List<Transaction>> =
        withContext(Dispatchers.IO) {
            runCatching {
                val content = context.contentResolver.openInputStream(uri)?.use { ins ->
                    ins.readBytes().toString(Charsets.UTF_8)
                } ?: throw IOException("无法读取文件")
                parse(content)
            }
        }
}
