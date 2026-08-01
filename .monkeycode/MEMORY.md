# User Instruction Memory

This file records user instructions, preferences, and teachings for reference in future interactions.

## Format

### User Instruction Entry
User instruction entries should follow this format:

[User Instruction Summary]
- Date: [YYYY-MM-DD]
- Context: [Mentioned scenario or time]
- Instructions:
  - [Content of user teaching or instruction, described line by line]

### Project Knowledge Entry
Entries discovered by the Agent during task execution should follow this format:

[Project Knowledge Summary]
- Date: [YYYY-MM-DD]
- Context: Discovered by Agent while performing [specific task description]
- Category: [Operations & Deployment|Build Methods|Testing Methods|Troubleshooting & Debugging|Workflow & Collaboration|Environment Configuration]
- Instructions:
  - [Specific knowledge points, described line by line]

## Deduplication Strategy
- Before adding a new entry, check for similar or identical instructions.
- If a duplicate is found, skip the new entry or merge it with the existing one.
- When merging, update the context or date information.
- This helps avoid redundant entries and keeps the memory file tidy.

## Entries

[User Instruction Summary]
- Date: 2026-08-01
- Context: 用户提出“先规划，后执行”的协作要求
- Instructions:
  - 针对复杂任务，先输出规划与确认点，再进入实现。
  - 在未确认规划前，不直接进入代码修改。

[Project Knowledge Summary]
- Date: 2026-08-01
- Context: Discovered by Agent while building the Android APK for ctrlai
- Category: Build Methods
- Instructions:
  - Android project build root is `/workspace/ctrlai/android`.
  - Build command: `./gradlew :app:assembleDebug`.
  - JVM test command: `./gradlew :app:testDebugUnitTest`.
  - Local build environment needs JDK 17 and Android SDK path `/usr/lib/android-sdk` in `local.properties`.

[Project Knowledge Summary]
- Date: 2026-08-01
- Context: Discovered by Agent while building the Android APK for keepmee
- Category: Build Methods
- Instructions:
  - The shared Android toolchain in this environment: JDK 17 at `/usr/lib/jvm/java-17-openjdk-amd64`, Android SDK at `/opt/android-sdk` (platforms;android-35, build-tools 35.0.0, 34.0.0, platform-tools).
  - Gradle wrapper 8.9 downloads automatically on first build; Kotlin daemon may fail to start in this container and fallback to in-process compilation (harmless, just slow).
  - Build command from `/workspace/keepmee/android`: `./gradlew :app:assembleDebug --no-daemon`. APK output: `app/build/outputs/apk/debug/app-debug.apk`.
  - Test command: `./gradlew :app:testDebugUnitTest --no-daemon`.
  - AGP 8.7.3 auto-installs its required build-tools version (34.0.0) on first run.
