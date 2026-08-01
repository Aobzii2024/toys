# ctrlai relay deployment

This directory contains the public signaling service and TURN relay configuration used by cross-network Android-to-Android sessions.

## Required DNS

Point a domain name to the public server that runs this stack. The Android app should use:

```text
wss://your-domain.example/ws
turn:your-domain.example:3478
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
TURN_PASSWORD=change-this-password
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
公网信令地址: wss://your-domain.example/ws
TURN 地址: turn:your-domain.example:3478
TURN 用户: ctrlai
TURN 密码: change-this-password
```

Leave these fields empty for LAN or hotspot mode.
