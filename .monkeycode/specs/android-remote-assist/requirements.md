# Requirements Document

## Introduction

This feature delivers an Android-to-Android remote assistance app with explicit pairing, live screen sharing, remote input control, clipboard sync, file transfer, and full-screen viewing. The product targets local, consent-based sessions and avoids a centralized cloud dependency.

## Glossary

- **Controller device**: The Android device that views and操控s the remote session.
- **Controlled device**: The Android device that shares its screen and accepts remote input.
- **Session**: A temporary trusted connection between two devices.
- **Pairing code**: A short code used to bind two devices for one session.
- **Consent**: User approval for screen sharing and input injection.

## Requirements

### Requirement 1: Mode Selection

**User Story:** AS a user, I want to choose the controller or controlled role, so that I can start the correct side of the session.

#### Acceptance Criteria

1. WHEN the app opens, the system SHALL present a mode selection screen with controller and controlled options.
2. WHEN the user selects controller mode, the system SHALL enter controller workflow.
3. WHEN the user selects controlled mode, the system SHALL enter controlled workflow.

### Requirement 2: Session Pairing

**User Story:** AS a user, I want a short pairing code workflow, so that two devices can establish a trusted session.

#### Acceptance Criteria

1. WHEN the controlled device starts a session, the system SHALL generate a 6-digit pairing code.
2. WHEN the controller device enters a valid 6-digit pairing code, the system SHALL request session binding.
3. IF the pairing code is invalid, the system SHALL present a validation error.
4. WHILE a session is active, the system SHALL show the paired remote device identity.

### Requirement 3: Screen Sharing Consent

**User Story:** AS a controlled-device user, I want to approve screen sharing before the session begins, so that I retain control over capture consent.

#### Acceptance Criteria

1. WHEN controlled mode starts, the system SHALL request screen capture permission from the operating system.
2. WHEN the user approves screen capture, the system SHALL start screen sharing for the current session.
3. IF the user denies screen capture, the system SHALL keep the session in a non-sharing state and show an explanation.

### Requirement 4: Remote Input Consent

**User Story:** AS a controlled-device user, I want to approve remote input access before control begins, so that the session can inject touch and key events only after permission.

#### Acceptance Criteria

1. WHEN controlled mode starts, the system SHALL guide the user to enable the accessibility permission required for input injection.
2. WHILE accessibility permission is disabled, the system SHALL display the permission state.
3. WHEN accessibility permission becomes available, the system SHALL allow remote input handling for the active session.

### Requirement 5: Remote Viewing and Control

**User Story:** AS a controller-device user, I want to see the remote screen and send control actions, so that I can operate the other device.

#### Acceptance Criteria

1. WHEN a session is connected, the system SHALL display the remote screen stream on the controller device.
2. WHEN the user taps or swipes on the controller screen, the system SHALL transmit normalized input events to the controlled device.
3. WHEN the user sends a system action or text action, the system SHALL transmit the corresponding remote command.

### Requirement 6: Local Session Operation

**User Story:** AS a user, I want the app to work without a centralized cloud backend, so that the deployment stays simple and self-contained.

#### Acceptance Criteria

1. THE system SHALL support session establishment without a cloud-hosted control backend.
2. THE system SHALL keep pairing and session state local to the participating devices or a local runtime component.
3. WHILE the app is offline from the public internet, the system SHALL preserve the ability to start a new local session.

### Requirement 7: Clipboard and File Transfer

**User Story:** AS a controller-device user, I want clipboard sync and file transfer, so that routine remote assistance tasks can be completed without leaving the session.

#### Acceptance Criteria

1. WHEN the user sends clipboard text, the system SHALL deliver the text to the paired device for the active session.
2. WHEN the user selects a file for transfer, the system SHALL send file metadata and file content to the paired device for the active session.
3. WHILE a file transfer is active, the system SHALL show transfer state to the user.
4. IF a transfer fails, the system SHALL show a recoverable error state.

### Requirement 8: Full-Screen Remote View

**User Story:** AS a controller-device user, I want a full-screen remote view, so that touch targets match the controlled device more accurately.

#### Acceptance Criteria

1. WHEN the controller device is connected, the system SHALL provide a full-screen viewing mode.
2. WHILE full-screen mode is active, the system SHALL preserve normalized touch coordinate mapping.
3. WHEN the user exits full-screen mode, the system SHALL return to the connected controller screen.

### Requirement 9: Session Visibility and Exit

**User Story:** AS a user, I want clear status and an easy exit path, so that I can trust the session state.

#### Acceptance Criteria

1. WHILE screen sharing is active, the controlled device SHALL display a persistent foreground notification.
2. WHILE a session is active, the app SHALL show connection state and peer identity.
3. WHEN the user ends the session, the system SHALL stop screen sharing, stop input handling, and return to the mode selection screen.

## Confirmed Scope

1. 连接方式采用配对码。
2. 控制范围包含基础控制、系统按键、剪贴板、文件传输和全屏查看。
3. 目标范围为完整版 APK。
