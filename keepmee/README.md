# keepmee — 本地记账 App（Android）

一款完全本地存储的 Android 记账应用，支持可配置的视觉 AI 自动记账。

## 功能

- **基本记账**：支出/收入录入，32 个支出分类 + 收入分类（可自定义），金额、日期、备注
- **账单流水**：首页按月汇总（结余/收入/支出），按日分组的账单列表，点击可编辑/删除
- **月/年账单**：黄色汇总卡片 + 月度明细表格，月账单/年账单切换
- **统计**：月度支出/收入分类占比环形图
- **视觉 AI 自动记账**：可配置 OpenAI 兼容视觉接口（BaseURL / API Key / 模型），拍照或从相册选图，AI 识别金额、分类、备注后一键落账
- **完全本地存储**：数据存于本机 Room 数据库，不经过任何服务器；AI 图片仅在拍照记账时发送到用户自配的接口
- **数据导出/一键导入**：导出为 JSON 文件（系统文件选择器选位置），导入自动去重合并

## 界面风格

参考经典记账 App：亮黄色顶栏 + 白色内容区，浅灰圆底线性图标，4 列分类网格。

## 构建

前置：JDK 17 + Android SDK（`local.properties` 中 `sdk.dir` 指向 SDK 路径）。

```bash
cd android
./gradlew :app:assembleDebug
```

APK 输出：`android/app/build/outputs/apk/debug/app-debug.apk`

```bash
./gradlew :app:testDebugUnitTest   # 单元测试
```

## 目录结构

```
keepmee/
├── android/
│   └── app/src/main/java/com/keepmee/app/
│       ├── MainActivity.kt        # 入口
│       ├── data/                  # Room 实体、DAO、Repository、分类定义
│       ├── ai/                    # 视觉 AI 客户端、设置存储（DataStore）
│       ├── export/                # JSON 导出/导入
│       └── ui/
│           ├── screens/           # 首页/记账/账单/统计/设置/AI/分类管理
│           ├── viewmodel/         # AppViewModel
│           └── theme/             # 主题色
```

## 隐私

- 所有记账数据仅保存在本机数据库
- API Key 仅保存在本机 DataStore
- 视觉 AI 仅在拍照记账时把图片发送到你配置的 BaseURL
