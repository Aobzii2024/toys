package com.keepmee.app.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import androidx.room.Delete
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {

    @Query("SELECT * FROM transactions ORDER BY timestamp DESC, id DESC")
    fun observeAll(): Flow<List<Transaction>>

    @Query("SELECT * FROM transactions ORDER BY timestamp DESC, id DESC")
    suspend fun getAll(): List<Transaction>

    @Query("SELECT * FROM transactions WHERE id = :id")
    suspend fun getById(id: Long): Transaction?

    @Insert
    suspend fun insert(t: Transaction): Long

    @Insert
    suspend fun insertAll(list: List<Transaction>)

    @Insert
    suspend fun insertAllPreserveIds(list: List<Transaction>)

    @Update
    suspend fun update(t: Transaction)

    @Delete
    suspend fun delete(t: Transaction)

    @Query("DELETE FROM transactions")
    suspend fun clearAll()

    @Query("SELECT * FROM transactions WHERE timestamp BETWEEN :from AND :to ORDER BY timestamp ASC")
    suspend fun getBetween(from: Long, to: Long): List<Transaction>

    @Query("SELECT * FROM transactions WHERE timestamp BETWEEN :from AND :to")
    fun observeBetween(from: Long, to: Long): Flow<List<Transaction>>
}
