package com.keepmee.app.export

import com.keepmee.app.data.Transaction
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class BackupManagerTest {

    @Test
    fun `export then import roundtrip preserves all fields`() {
        val list = listOf(
            Transaction(id = 1001L, amount = 25.5, category = "餐饮", isExpense = true, note = "午餐", timestamp = 1700000000000L),
            Transaction(id = 1002L, amount = 8000.0, category = "工资", isExpense = false, note = "", timestamp = 1700000001000L)
        )
        val json = BackupManager.serialize(list)
        assertTrue(json.contains("keepmee"))
        val restored = BackupManager.parse(json)
        assertEquals(2, restored.size)
        assertEquals(list[0], restored[0])
        assertEquals(list[1], restored[1])
    }

    @Test
    fun `parse ignores unknown fields for forward compatibility`() {
        val json = """
            {"app":"keepmee","version":1,"exportedAt":1,"newField":"x",
             "transactions":[{"id":7,"amount":1.0,"category":"交通","isExpense":true,"note":"地铁","timestamp":99,"extra":1}]}
        """.trimIndent()
        val restored = BackupManager.parse(json)
        assertEquals(1, restored.size)
        assertEquals("交通", restored[0].category)
    }

    @Test
    fun `empty export produces empty list on import`() {
        val restored = BackupManager.parse(BackupManager.serialize(emptyList()))
        assertTrue(restored.isEmpty())
    }
}
