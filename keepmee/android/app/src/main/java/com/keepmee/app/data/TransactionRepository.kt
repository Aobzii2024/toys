package com.keepmee.app.data

import android.content.Context
import kotlinx.coroutines.flow.Flow

class TransactionRepository(private val dao: TransactionDao) {

    fun observeAll(): Flow<List<Transaction>> = dao.observeAll()

    fun observeBetween(from: Long, to: Long): Flow<List<Transaction>> =
        dao.observeBetween(from, to)

    suspend fun getAll(): List<Transaction> = dao.getAll()

    suspend fun getBetween(from: Long, to: Long): List<Transaction> =
        dao.getBetween(from, to)

    suspend fun insert(t: Transaction): Long = dao.insert(t)

    suspend fun update(t: Transaction) = dao.update(t)

    suspend fun delete(t: Transaction) = dao.delete(t)

    suspend fun replaceAll(list: List<Transaction>) {
        dao.clearAll()
        dao.insertAll(list)
    }

    suspend fun insertAllWithIds(list: List<Transaction>) = dao.insertAllPreserveIds(list)

    companion object {
        @Volatile
        private var INSTANCE: TransactionRepository? = null

        fun get(context: Context): TransactionRepository =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: TransactionRepository(
                    AppDatabase.get(context).transactionDao()
                ).also { INSTANCE = it }
            }
    }
}
