# ctrlai relay deployment

This directory contains the public signaling service and TURN relay configuration used by cross-network Android-to-Android sessions.

## Required DNS

Point a domain name to the public server that runs this stack. The Android app should use:

```text
ws://47.116.53.224:8080/ws
turn:47.116.53.224:3478
```

## Environment

Create a `.env` file on the server with the following values:

```bash
# Signaling service
PORT=8080
HOST=0.0.0.0
TURN_ENABLED=true
LOG_LEVEL=info

# TURN relay
TURN_USERNAME=ctrlai
TURN_PASSWORD=329664
TURN_REALM=ctrlai
```

## Run

```bash
# Start signaling and TURN relay
docker compose up -d
```

## Android App Fields

Fill the same values on both Android devices:

```text
公网信令地址: ws://47.116.53.224:8080/ws
TURN 地址: turn:47.116.53.224:3478
TURN 用户: ctrlai
TURN 密码: 329664
```

The current Android APK uses these relay values by default. LAN or hotspot mode is attempted before relay fallback.
