# Requirements Document

## Introduction

ctrlai 是一个远程控制安卓手机的应用套件，支持安卓手机之间（Android to Android）的安全远程控制。系统由三部分组成：

1. **控制端 App**（Controller）：运行在安卓手机上，用于发起远程控制请求并操作被控端设备。
2. **被控端 App**（Controlled）：运行在另一台安卓手机上，接受控制请求并共享屏幕、接收触控指令。
3. **信令服务器**（Signaling Server）：中继设备发现、配对验证、WebRTC 会话协商（SDP/ICE），并作为 WebRTC 协商失败时的兜底数据通道。

系统核心能力：连接方便（扫码/配对码快速连接）、安全（配对码验证 + 端到端加密）、界面精美（现代化 Material 设计）。

## Glossary

- **Controller（控制端）**：发起远程控制的安卓 App。
- **Controlled（被控端）**：接收远程控制的安卓 App，本方案中与控制端为对等结构，同一 App 安装包同时具备两种角色。
- **Signaling Server（信令服务器）**：Node.js 服务，负责设备注册、配对码校验、WebRTC 信令转发。
- **Pairing Code（配对码）**：6 位数字码，被控端生成并展示，控制端输入以建立受信任连接。
- **E2E Encryption（端到端加密）**：控制端与被控端之间通过 WebRTC DTLS-SRTP / DataChannel 提供的端到端加密通信。
- **Screen Sharing（屏幕共享）**：被控端通过 Android MediaProjection API 采集屏幕并编码传输。
- **Remote Input（远程输入）**：控制端发送触控/滑动/按键事件到被控端并注入执行。

## Requirements

### R1. 设备发现与连接

**User Story:** 作为控制端用户，我想通过简单的扫码或输入配对码连接被控端，以便快速建立远程控制会话。

#### Acceptance Criteria

1. WHEN 被控端启动并进入"被控模式"，the system SHALL 生成并展示一个 6 位数字配对码，该配对码有效期为 3 分钟。
2. WHEN 控制端进入"控制模式"并输入 6 位配对码，the system SHALL 通过信令服务器验证配对码并向被控端发起连接请求。
3. WHEN 被控端接受连接请求，the system SHALL 建立 WebRTC 点对点会话并显示连接状态。
4. IF 配对码错误或过期，the system SHALL 向控制端返回明确错误提示并允许重新输入。
5. IF WebRTC 点对点连接失败（NAT 限制），the system SHALL 自动回退到 TURN 中继服务器传输数据。

### R2. 安全与权限

**User Story:** 作为被控端用户，我想确保远程控制连接经过验证且内容加密，以便防止未授权访问。

#### Acceptance Criteria

1. WHEN 控制端发起连接，the system SHALL 要求控制端出示有效配对码，配对码与设备指纹（Session ID）绑定。
2. WHEN 点对点通道建立，the system SHALL 使用 WebRTC DTLS-SRTP 对音视频流加密，使用 DataChannel 加密传输控制信令。
3. WHEN 被控端收到连接请求，the system SHALL 显示控制端设备信息（昵称/设备型号）并要求用户确认授权。
4. WHILE 被控端处于被控状态，the system SHALL 在状态栏和屏幕显著位置持续显示"正在被控制"提示。
5. IF 会话空闲超过 5 分钟或被控端用户主动断开，the system SHALL 立即终止会话并撤销所有远程控制权限。

### R3. 屏幕共享与远程输入

**User Story:** 作为控制端用户，我想实时看到被控端屏幕并操控它，以便协助解决问题或演示操作。

#### Acceptance Criteria

1. WHEN 控制端会话建立成功，the system SHALL 以不低于 30fps、分辨率不低于 720p 的 H.264 视频流实时展示被控端屏幕。
2. WHEN 控制端用户在屏幕画面上的任意位置进行触控操作，the system SHALL 将该事件（坐标、类型、多点触控）编码后通过 DataChannel 发送至被控端。
3. WHEN 被控端收到远程触控事件，the system SHALL 通过无障碍服务将事件注入到屏幕对应坐标。
4. WHEN 控制端发起返回/主页/最近任务按键操作，the system SHALL 将被控端执行对应系统按键。
5. IF 被控端屏幕旋转或分辨率变化，the system SHALL 自适应调整视频流参数并保持画面连续。
6. IF 被控端收到来电或锁屏，the system SHALL 暂停远程控制并通知控制端。

### R4. 界面与体验

**User Story:** 作为用户，我想获得精美、直观、易用的界面，以便快速完成远程控制任务。

#### Acceptance Criteria

1. WHEN 用户打开应用，the system SHALL 展示现代化 Material Design 3 风格主界面，包含"控制"与"被控"两个核心入口。
2. WHEN 用户进入控制流程，the system SHALL 提供扫码连接、手动输入配对码、历史连接记录三种连接方式。
3. WHILE 远程控制进行中，the system SHALL 展示全屏控制界面，包含悬浮工具栏（断开、输入法、设置）与连接质量指示。
4. WHEN 用户进入被控流程，the system SHALL 提供大字号配对码展示、自动复制、分享连接信息等便捷操作。
5. WHEN 应用处于任何状态，the system SHALL 保证深色/浅色主题自适应并保持界面一致。

### R5. 信令服务器

**User Story:** 作为系统管理员，我想获得一个轻量、可靠的信令服务器，以便支撑设备发现与会话协商。

#### Acceptance Criteria

1. WHEN 被控端或控制端上线，the system SHALL 允许设备注册到信令服务器并通过持久化 WebSocket 保持在线。
2. WHEN 设备发起会话，the system SHALL 由服务器校验配对码并通过 WebSocket 转发 SDP 与 ICE 候选。
3. WHEN 点对点连接建立成功，the system SHALL 由信令服务器退出媒体路径，仅保留控制信令兜底通道。
4. WHEN 服务器处理任意请求，the system SHALL 采用简单房间/会话模型并支持水平扩展。
5. WHILE 服务器运行，the system SHALL 记录会话建立、错误与断连日志，便于排查。

### R6. 双角色对等架构

**User Story:** 作为用户，我想在同一个 App 中扮演控制端或被控端，以便无需安装多个应用。

#### Acceptance Criteria

1. WHEN 用户在任意时刻切换"控制"或"被控"入口，the system SHALL 允许同一 App 实例在两种角色间切换，无需重启。
2. WHEN App 处于被控模式，the system SHALL 同时保持自身可被其他控制端发现。
3. WHILE 用户正在控制其他设备，the system SHALL 允许 App 同时作为被控端被其他设备控制（可选场景）。

## 验证方式

- 需求 R1、R2 通过信令服务器集成测试与手动端到端连接测试验证。
- 需求 R3 通过两台真机 Android 设备联调验证画面延迟与触控准确性。
- 需求 R4 通过界面走查与截图审查验证。
- 需求 R5 通过信令服务器自动化测试（连接、校验、转发、断连）验证。
- 需求 R6 通过角色切换流程测试验证。
