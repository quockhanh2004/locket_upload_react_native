#!/bin/bash

cd android

# Build APKs
./gradlew assembleRelease

# Lấy ABI của thiết bị
ABI=$(adb shell getprop ro.product.cpu.abi | tr -d '\r')

# Tạo tên file APK tương ứng
APK_PATH="./app/build/outputs/apk/release/app-$ABI-release.apk"

# Nếu file APK không tồn tại, fallback sang universal
if [ ! -f "$APK_PATH" ]; then
  echo "⚠️ ABI $ABI không có APK riêng, dùng universal APK"
  APK_PATH="./app/build/outputs/apk/release/app-universal-release.apk"
fi

# Cài APK
echo "📱 Installing: $APK_PATH"
adb install -r "$APK_PATH"

cd ..
