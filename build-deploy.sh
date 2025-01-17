#!/bin/bash

# Lấy phiên bản từ package.json
version=$(node -p "require('./package.json').version")

# Định dạng thời gian hiện tại
current_time=$(date +%Y%m%d_%H%M)

# Tạo file APK
cd android
./gradlew assembleRelease
cd ..

# Đổi tên file APK
apk_path="android/app/build/outputs/apk/release/app-release.apk"
new_apk_path="android/app/build/outputs/apk/release/app-release_${current_time}.apk"
mv "$apk_path" "$new_apk_path"

# Cài đặt file APK lên thiết bị
adb install "$new_apk_path"

# Commit và push thay đổi lên GitHub
git add .
git commit -m "Build and release APK version ${version} on ${current_time}"
git push origin main

# Kiểm tra xem release đã tồn tại hay chưa
release_id=$(gh release view "v${version}" --json id -q .id 2>/dev/null)

if [ -z "$release_id" ]; then
  # Tạo release mới nếu chưa tồn tại
  gh release create "v${version}" "$new_apk_path" --notes "Release version ${version}"
else
  # Cập nhật release nếu đã tồn tại
  gh release upload "v${version}" "$new_apk_path" --clobber
fi
