package com.keepmee.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.keepmee.app.ui.KeepmeeApp
import com.keepmee.app.ui.theme.KeepmeeTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            KeepmeeTheme {
                KeepmeeApp()
            }
        }
    }
}
