package com.ctrlai.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.ctrlai.app.ui.MainScreen
import com.ctrlai.app.ui.MainViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.attachContext(applicationContext)

        setContent {
            MainScreen(viewModel = viewModel)
        }
    }
}
