# Implementation Task List

Feature Name: android-remote-assist
Updated: 2026-08-01

## Tasks

- [x] 1. Create initial requirements and design documents.
- [x] 2. Fix the controller connection flow so the pairing code button calls the ViewModel and visible session state updates correctly.
- [x] 3. Replace the hardcoded signaling server dependency with an APK-owned pairing/session strategy suitable for local use.
- [x] 4. Wire `PeerConnectionManager` into `MainViewModel` for SDP, ICE, screen capture, and remote stream state.
- [x] 5. Wire controller touch, swipe, text, and system-key actions through `RemoteProtocol` and `RemoteAccessibilityService`.
- [x] 6. Add full-screen remote viewing mode.
- [x] 7. Add clipboard sync protocol and UI actions.
- [x] 8. Add file-transfer protocol and UI actions.
- [x] 9. Add focused tests for pairing validation and remote protocol payloads.
- [x] 10. Build the APK and report the output path.
- [x] 11. Add cross-network signaling and TURN relay configuration.

## Implementation Notes

- Scope confirmed by user: pairing-code connection, full version, basic control, system keys, clipboard, file transfer, and full-screen viewing.
- Safety baseline: screen capture requires MediaProjection consent, input control requires accessibility consent, and the controlled device keeps visible session status.
- Runtime path: controlled device owns the local signaling server, advertises the pairing code through Android NSD, and WebRTC uses local ICE candidates without a fixed external signaling server.
- Cross-network path: both Android devices use the same public `wss://.../ws` signaling endpoint and the same TURN credentials.
