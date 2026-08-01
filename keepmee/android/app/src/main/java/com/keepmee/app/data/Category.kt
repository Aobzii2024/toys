package com.keepmee.app.data

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChildCare
import androidx.compose.material.icons.outlined.DirectionsCar
import androidx.compose.material.icons.outlined.Favorite
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Lightbulb
import androidx.compose.material.icons.outlined.LocalDrink
import androidx.compose.material.icons.outlined.LocalHospital
import androidx.compose.material.icons.outlined.LocalMall
import androidx.compose.material.icons.outlined.MenuBook
import androidx.compose.material.icons.outlined.MonitorHeart
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material.icons.outlined.Pets
import androidx.compose.material.icons.outlined.PhotoCamera
import androidx.compose.material.icons.outlined.Redeem
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.outlined.Savings
import androidx.compose.material.icons.outlined.Checkroom
import androidx.compose.material.icons.outlined.SportsEsports
import androidx.compose.material.icons.outlined.SportsSoccer
import androidx.compose.material.icons.outlined.Train
import androidx.compose.material.icons.outlined.DirectionsBus
import androidx.compose.material.icons.outlined.VolunteerActivism
import androidx.compose.material.icons.outlined.ShoppingBag
import androidx.compose.material.icons.outlined.Fastfood
import androidx.compose.material.icons.outlined.WineBar
import androidx.compose.material.icons.outlined.EmojiEvents
import androidx.compose.material.icons.outlined.Flight
import androidx.compose.material.icons.outlined.Work
import androidx.compose.material.icons.outlined.BusinessCenter
import androidx.compose.material.icons.outlined.Build
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material.icons.outlined.Paid
import androidx.compose.material.icons.outlined.AddCard
import androidx.compose.material.icons.outlined.Casino
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.MoreHoriz
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

data class Category(
    val name: String,
    val icon: ImageVector,
    val isExpense: Boolean,
    val color: Color,
    val editable: Boolean = false
)

private val C_ORANGE = Color(0xFFFFA15C)
private val C_RED = Color(0xFFFF7A7A)
private val C_BLUE = Color(0xFF6BB8FF)
private val C_GREEN = Color(0xFF6BD49C)
private val C_TEAL = Color(0xFF53D6C8)
private val C_PURPLE = Color(0xFFB79BFF)
private val C_PINK = Color(0xFFFF8FB6)
private val C_AMBER = Color(0xFFFFC35C)
private val C_CYAN = Color(0xFF57D3E8)
private val C_INDIGO = Color(0xFF8FA1FF)
private val C_BROWN = Color(0xFFC9A17E)
private val C_GREY = Color(0xFFA8B3B8)

private val expenseColors = listOf(C_ORANGE, C_RED, C_BLUE, C_GREEN, C_TEAL, C_PURPLE, C_PINK, C_AMBER, C_CYAN, C_INDIGO, C_BROWN, C_GREY)

object Categories {
    private fun expenseCat(name: String, icon: ImageVector, index: Int) =
        Category(name, icon, true, expenseColors[index % expenseColors.size])

    val expenses = listOf(
        expenseCat("餐饮", Icons.Outlined.Restaurant, 0),
        expenseCat("购物", Icons.Outlined.LocalMall, 1),
        expenseCat("日用", Icons.Outlined.ShoppingBag, 2),
        expenseCat("交通", Icons.Outlined.DirectionsBus, 3),
        expenseCat("蔬菜", Icons.Outlined.Fastfood, 4),
        expenseCat("水果", Icons.Outlined.LocalDrink, 5),
        expenseCat("零食", Icons.Outlined.Fastfood, 6),
        expenseCat("运动", Icons.Outlined.SportsSoccer, 7),
        expenseCat("娱乐", Icons.Outlined.SportsEsports, 8),
        expenseCat("通讯", Icons.Outlined.Phone, 9),
        expenseCat("服饰", Icons.Outlined.Checkroom, 10),
        expenseCat("美容", Icons.Outlined.Favorite, 11),
        expenseCat("住房", Icons.Outlined.Home, 0),
        expenseCat("居家", Icons.Outlined.PhotoCamera, 1),
        expenseCat("孩子", Icons.Outlined.ChildCare, 2),
        expenseCat("长辈", Icons.Outlined.VolunteerActivism, 3),
        expenseCat("社交", Icons.Outlined.Groups, 4),
        expenseCat("旅行", Icons.Outlined.Flight, 5),
        expenseCat("烟酒", Icons.Outlined.WineBar, 6),
        expenseCat("数码", Icons.Outlined.Phone, 7),
        expenseCat("汽车", Icons.Outlined.DirectionsCar, 8),
        expenseCat("医疗", Icons.Outlined.LocalHospital, 9),
        expenseCat("书籍", Icons.Outlined.MenuBook, 10),
        expenseCat("学习", Icons.Outlined.Lightbulb, 11),
        expenseCat("宠物", Icons.Outlined.Pets, 0),
        expenseCat("礼金", Icons.Outlined.Redeem, 1),
        expenseCat("礼物", Icons.Outlined.Redeem, 2),
        expenseCat("办公", Icons.Outlined.BusinessCenter, 3),
        expenseCat("维修", Icons.Outlined.Build, 4),
        expenseCat("捐赠", Icons.Outlined.VolunteerActivism, 5),
        expenseCat("彩票", Icons.Outlined.Casino, 6),
        expenseCat("亲友", Icons.Outlined.Groups, 7),
    )

    val incomes = listOf(
        Category("工资", Icons.Outlined.Paid, false, C_GREEN),
        Category("兼职", Icons.Outlined.Work, false, C_TEAL),
        Category("理财", Icons.Outlined.MonitorHeart, false, C_INDIGO),
        Category("礼金", Icons.Outlined.Redeem, false, C_RED),
        Category("其它", Icons.Outlined.MoreHoriz, false, C_GREY),
    )

    fun byName(name: String, isExpense: Boolean): Category? {
        val pool = if (isExpense) expenses else incomes
        return pool.find { it.name == name }
    }

    fun colorFor(name: String, isExpense: Boolean): Color =
        byName(name, isExpense)?.color ?: C_GREY

    fun iconFor(name: String, isExpense: Boolean): ImageVector =
        byName(name, isExpense)?.icon ?: Icons.Outlined.Star
}
