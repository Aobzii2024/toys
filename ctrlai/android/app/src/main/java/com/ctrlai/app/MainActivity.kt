package com.ctrlai.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.ctrlai.app.ui.MainScreen
import com.ctrlai.app.ui.MainViewModel

class MainActivity : ComponentActivity() {

    private lateinit var viewModel: MainViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel = androidx.lifecycle.viewmodel.compose.viewModel()
        viewModel.attachContext(applicationContext)

        setContent {
            MainScreen(viewModel = viewModel)
        }
    }
}
