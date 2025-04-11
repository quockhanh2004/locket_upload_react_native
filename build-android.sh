#!/bin/bash

set -e

cd android

# 🏗️ Build tất cả APKs (bao gồm per-ABI và universal)
echo "📦 Building APKs..."
./gradlew assembleRelease || { echo "❌ Build APK thất bại!"; exit 1; }

cd ..

# 🕒 Lấy thời gian hiện tại
current_time=$(date +"%Y%m%d_%H%M%S")

# 📱 Lấy ABI của thiết bị đang kết nối
device_abi=$(adb shell getprop ro.product.cpu.abi | tr -d '\r')
echo "📱 Thiết bị ABI: $device_abi"

# 📦 Danh sách ABI cần xử lý
abis=("arm64-v8a" "armeabi-v7a" "x86" "x86_64" "universal")

# 🗃️ Duyệt qua từng ABI, copy + rename + cài nếu phù hợp
for abi in "${abis[@]}"; do
  input_path="android/app/build/outputs/apk/release/app-${abi}-release.apk"

  if [[ -f "$input_path" ]]; then
    output_name="locket_upload_${current_time}_${abi}.apk"
    output_path="android/app/build/outputs/apk/release/${output_name}"

    mv "$input_path" "$output_path"
    echo "✅ APK tạo: $output_path"

    # Nếu ABI khớp thiết bị thì cài đặt
    if [[ "$abi" == "$device_abi" ]]; then
      echo "📲 Installing APK to device: $output_name"
      adb install -r "$output_path" || echo "⚠️ Cài đặt thất bại!"
    fi
  else
    echo "⚠️ Không tìm thấy APK cho ABI: $abi"
  fi
done
