#!/bin/bash

set -e  # Dừng ngay nếu có lỗi

# Xử lý khi người dùng nhấn Ctrl + C
trap "echo 'Quá trình build bị hủy. Dừng tất cả.'; exit 1" SIGINT

# Lấy phiên bản từ package.json
version=$(node -p "require('./package.json').version")

# Định dạng thời gian hiện tại
current_time=$(date +%Y%m%d_%H%M)

# Lấy commit hash của phiên bản build gần nhất
previous_version_commit=$(git log --grep "Build and release APK version" --pretty=format:"%H" -1)

# Lấy phiên bản từ commit message của phiên bản build gần nhất
previous_version=$(git log -1 --format=%s "$previous_version_commit" | grep -oE "[0-9]+\.[0-9]+\.[0-9]+")

# Tạo changelog
changelog=""
# Lấy commit hash của phiên bản build gần nhất
if [[ -n "$previous_version_commit" ]]; then
  # Lấy các commit sau commit của phiên bản trước và loại bỏ commit "Build and release APK version"
  git log --pretty=format:"- %s" "${previous_version_commit}^..HEAD" --no-merges | grep -v "Build and release APK version" | grep -v "script deploy"
fi

# Tạo file APK
cd android
./gradlew assembleRelease || { echo "Lỗi: Build APK thất bại!"; exit 1; }
cd ..

# Đổi tên file APK
apk_path="android/app/build/outputs/apk/release/app-release.apk"
new_apk_path="android/app/build/outputs/apk/release/locket_upload_${current_time}.apk"

if [[ ! -f "$apk_path" ]]; then
  echo "Lỗi: Không tìm thấy file APK!"
  exit 1
fi

mv "$apk_path" "$new_apk_path"

# Cài đặt file APK lên thiết bị (tùy chọn)
adb install "$new_apk_path" || { echo "Cảnh báo: Cài đặt APK thất bại, nhưng vẫn tiếp tục..."; }

# Commit và push thay đổi lên GitHub
git add .
git commit -m "Build and release APK version ${version} on ${current_time}" || { echo "Lỗi: Commit Git thất bại!"; exit 1; }
git push origin main || { echo "Lỗi: Push Git thất bại!"; exit 1; }

# Tạo hoặc cập nhật release trên GitHub với changelog
release_notes="Release version ${version}
Changelog:
${changelog}"

release_id=$(gh release view "v${version}" --json id -q .id 2>/dev/null || true)

if [ -z "$release_id" ]; then
  # Tạo release mới nếu chưa tồn tại
  gh release create "v${version}" "$new_apk_path" --notes "$release_notes" || { echo "Lỗi: Tạo release GitHub thất bại!"; exit 1; }
else
  # Cập nhật release nếu đã tồn tại
  gh release update "v${version}" --notes "$release_notes" || { echo "Lỗi: Cập nhật release thất bại!"; exit 1; }
  gh release upload "v${version}" "$new_apk_path" --clobber || { echo "Lỗi: Upload file APK thất bại!"; exit 1; }
fi

# Hỏi người dùng có muốn gửi thông báo FCM không
read -p "Bạn có muốn gửi thông báo qua FCM không? (y/n): " send_fcm

if [[ "$send_fcm" == "y" || "$send_fcm" == "Y" ]]; then
  PROJECT_ID=$(node -p "require('./google-services.json').project_info.project_id") || { echo "Lỗi: Không lấy được PROJECT_ID!"; exit 1; }
  FCM_URL="https://fcm.googleapis.com/v1/projects/$PROJECT_ID/messages:send"
  ACCESS_TOKEN=$(gcloud auth application-default print-access-token) || { echo "Lỗi: Lấy access token thất bại!"; exit 1; }
  PACKAGE_NAME="com.com.locket_upload"

  curl -X POST "$FCM_URL" \
       -H "Authorization: Bearer $ACCESS_TOKEN" \
       -H "Content-Type: application/json" \
       -d '{
   "message": {
    "android": {
     "restricted_package_name": "com.locket_upload"
    },
    "data": {
     "update_url": "https://github.com/quockhanh2004/locket_upload_react_native/releases"
    },
    "notification": {
     "body": "Cần cập nhật qua apk, nhấn vào để kiểm tra nhé!",
     "title": "Đã có bản cập nhật mới!"
    },
    "topic": "new_update"
   }
  }' || { echo "Lỗi: Gửi thông báo FCM thất bại!"; exit 1; }

  echo "📢 Đã gửi thông báo FCM thành công!"
else
  echo "🚫 Bỏ qua việc gửi thông báo FCM."
fi

echo "🎉 Build hoàn tất thành công!"