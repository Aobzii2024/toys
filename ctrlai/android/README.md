# ctrlai Android app

Android 原生远程控制应用（Kotlin + Jetpack Compose），同一安装包同时支持控制端与被控端角色。

## 构建要求

- JDK 17
- Android SDK 35 (cmdline-tools)
- Android 7.0 (API 24)+ 真机（需两台用于联调）

## 命令行构建（无需 Android Studio）

### 环境准备（一次性）

```bash
# 1. 安装 JDK 17
sudo apt-get install -y openjdk-17-jdk

# 2. 下载 Android command-line tools
#    从 https://developer.android.com/studio#command-line-tools-only 获取
#    commandlinetools-linux-XXXXXXX_latest.zip，解压到 /opt/android-sdk/cmdline-tools/latest

# 3. 安装 SDK 组件
export ANDROID_HOME=/opt/android-sdk
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --install \
    "platform-tools" "platforms;android-35" "build-tools;35.0.0"

# 4. 配置 SDK 路径
echo "sdk.dir=/opt/android-sdk" > local.properties
```

### 构建 APK

```bash
./gradlew assembleDebug
# 产物：app/build/outputs/apk/debug/app-debug.apk
```

### 安装到手机

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 查看构建任务

```bash
./gradlew tasks
./gradlew build          # 含 Lint 检查
./gradlew lintDebug      # 仅 Lint
./gradlew testDebugUnitTest  # 单元测试
```

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
