# ctrlai Android app

Android 原生远程控制应用（Kotlin + Jetpack Compose），同一安装包同时支持控制端与被控端角色。

## 构建要求

- Android Studio (Ladybug / 2024.2+) 或 Android SDK 34+
- JDK 17
- Android 7.0 (API 24)+ 真机（需两台用于联调）

## 结构

```
android/
├── app/
│   ├── src/main/java/com/ctrlai/app/
│   │   ├── MainActivity.kt       # 入口，模式切换
│   │   ├── capture/              # MediaProjection 屏幕采集
│   │   ├── input/                # 远程输入注入（无障碍）
│   │   ├── pairing/              # 配对码生成/校验
│   │   ├── signaling/            # WebSocket 信令客户端
│   │   ├── webrtc/               # PeerConnection 封装
│   │   └── ui/                   # Compose 界面
│   └── src/main/AndroidManifest.xml
└── build.gradle.kts
```

## 构建

```bash
./gradlew assembleDebug
```
