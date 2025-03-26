#!/bin/bash

set -e  # Dừng script ngay khi gặp lỗi

# Lấy phiên bản từ package.json
version=$(node -p "require('./package.json').version")

# Định dạng thời gian hiện tại
current_time=$(date +%Y%m%d_%H%M)

# Lấy message commit của version trước
previous_version_commit=$(git log --grep "Build and release APK version" --pretty=format:"%H" | sed -n 2p || true)
previous_version=$(echo "$previous_version_commit" | grep -oE "version [0-9]+\.[0-9]+\.[0-9]+") || true
previous_version=$(echo "$previous_version" | awk '{print $2}') || true

# Tạo changelog
changelog=""
if [[ -n "$previous_version_commit" ]]; then
  changelog=$(git log --pretty=format:"- %s" "${previous_version_commit}..HEAD" --no-merges)  
fi

# Tạo file APK
echo "🔨 Bắt đầu build APK..."
cd android
if ! ./gradlew assembleRelease; then
  echo "❌ Build APK thất bại!"
  exit 1
fi
cd ..

# Đổi tên file APK
apk_path="android/app/build/outputs/apk/release/app-release.apk"
new_apk_path="android/app/build/outputs/apk/release/locket_upload_${current_time}.apk"

if [ ! -f "$apk_path" ]; then
  echo "❌ Không tìm thấy file APK!"
  exit 1
fi

mv "$apk_path" "$new_apk_path"
echo "✅ APK đã được build: $new_apk_path"

# Cài đặt file APK lên thiết bị (tùy chọn)
if adb install "$new_apk_path"; then
  echo "✅ Cài đặt APK thành công!"
else
  echo "⚠️ Không thể cài đặt APK lên thiết bị, tiếp tục..."
fi

# Commit và push thay đổi lên GitHub
echo "📤 Đang commit thay đổi lên GitHub..."
git add .
git commit -m "Build and release APK version ${version} on ${current_time}" || exit 1
git push origin main || exit 1
echo "✅ Code đã được push lên GitHub!"

# Tạo hoặc cập nhật release trên GitHub với changelog
release_notes="Release version ${version}
Changelog:
${changelog}"

release_id=$(gh release view "v${version}" --json id -q .id 2>/dev/null || true)

if [ -z "$release_id" ]; then
  echo "📦 Tạo release mới..."
  gh release create "v${version}" "$new_apk_path" --notes "$release_notes" || exit 1
else
  echo "📦 Cập nhật release..."
  gh release update "v${version}" --notes "$release_notes" || exit 1
  gh release upload "v${version}" "$new_apk_path" --clobber || exit 1
fi

echo "✅ Release đã được cập nhật trên GitHub!"

# Gửi thông báo qua Firebase Cloud Messaging (FCM)
echo "📢 Gửi thông báo cập nhật qua FCM..."
PROJECT_ID=$(node -p "require('./google-services.json').project_info.project_id") || exit 1
FCM_URL="https://fcm.googleapis.com/v1/projects/$PROJECT_ID/messages:send"
ACCESS_TOKEN=$(gcloud auth application-default print-access-token) || exit 1
PACKAGE_NAME="com.locket_upload"  # Sửa lỗi "com.com.locket_upload"

DESCRIPTION="Bản cập nhật mới đã sẵn sàng! 🚀"

response=$(curl -s -o response.json -w "%{http_code}" -X POST "$FCM_URL" \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
 "message": {
  "android": {
   "restricted_package_name": "com.locket_upload"
  },
  "data": {
   "local_update": "true"
  },
  "notification": {
   "body": "'"$DESCRIPTION"'",
   "title": "Đã có bản cập nhật mới!"
  },
  "topic": "new_update"
 }
}')

if [ "$response" -ne 200 ]; then
  echo "❌ Gửi thông báo thất bại! Kiểm tra lỗi trong response.json"
  cat response.json
  exit 1
else
  echo "✅ Thông báo cập nhật đã được gửi!"
fi

echo "🎉 Hoàn thành tất cả các bước thành công!"
