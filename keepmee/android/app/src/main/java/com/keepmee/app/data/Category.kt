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
import androidx.compose.ui.graphics.vector.ImageVector

data class Category(
    val name: String,
    val icon: ImageVector,
    val isExpense: Boolean,
    val editable: Boolean = false
)

object Categories {
    val expenses = listOf(
        Category("餐饮", Icons.Outlined.Restaurant, true),
        Category("购物", Icons.Outlined.LocalMall, true),
        Category("日用", Icons.Outlined.ShoppingBag, true),
        Category("交通", Icons.Outlined.DirectionsBus, true),
        Category("蔬菜", Icons.Outlined.Fastfood, true),
        Category("水果", Icons.Outlined.LocalDrink, true),
        Category("零食", Icons.Outlined.Fastfood, true),
        Category("运动", Icons.Outlined.SportsSoccer, true),
        Category("娱乐", Icons.Outlined.SportsEsports, true),
        Category("通讯", Icons.Outlined.Phone, true),
        Category("服饰", Icons.Outlined.Checkroom, true),
        Category("美容", Icons.Outlined.Favorite, true),
        Category("住房", Icons.Outlined.Home, true),
        Category("居家", Icons.Outlined.PhotoCamera, true),
        Category("孩子", Icons.Outlined.ChildCare, true),
        Category("长辈", Icons.Outlined.VolunteerActivism, true),
        Category("社交", Icons.Outlined.Groups, true),
        Category("旅行", Icons.Outlined.Flight, true),
        Category("烟酒", Icons.Outlined.WineBar, true),
        Category("数码", Icons.Outlined.Phone, true),
        Category("汽车", Icons.Outlined.DirectionsCar, true),
        Category("医疗", Icons.Outlined.LocalHospital, true),
        Category("书籍", Icons.Outlined.MenuBook, true),
        Category("学习", Icons.Outlined.Lightbulb, true),
        Category("宠物", Icons.Outlined.Pets, true),
        Category("礼金", Icons.Outlined.Redeem, true),
        Category("礼物", Icons.Outlined.Redeem, true),
        Category("办公", Icons.Outlined.BusinessCenter, true),
        Category("维修", Icons.Outlined.Build, true),
        Category("捐赠", Icons.Outlined.VolunteerActivism, true),
        Category("彩票", Icons.Outlined.Casino, true),
        Category("亲友", Icons.Outlined.Groups, true),
    )

    val incomes = listOf(
        Category("工资", Icons.Outlined.Paid, false),
        Category("兼职", Icons.Outlined.Work, false),
        Category("理财", Icons.Outlined.MonitorHeart, false),
        Category("礼金", Icons.Outlined.Redeem, false),
        Category("其它", Icons.Outlined.MoreHoriz, false),
    )

    fun byName(name: String, isExpense: Boolean): Category? {
        val pool = if (isExpense) expenses else incomes
        return pool.find { it.name == name }
    }

    fun iconFor(name: String, isExpense: Boolean): ImageVector =
        byName(name, isExpense)?.icon ?: Icons.Outlined.Star
}
