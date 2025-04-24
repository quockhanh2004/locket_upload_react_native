#!/bin/bash
set -ex
set -e  # Dừng ngay nếu có lỗi

trap "echo 'Quá trình build bị hủy. Dừng tất cả.'; exit 1" SIGINT

version=$(node -p "require('./package.json').version")
current_time=$(date +%Y%m%d_%H%M)

previous_version_commit=$(git log --grep "Build and release APK version" --pretty=format:"%H" -1)
previous_version=$(git log -1 --format=%s "$previous_version_commit" | grep -oE "[0-9]+\.[0-9]+\.[0-9]+")

changelog=""
if [[ -n "$previous_version_commit" ]]; then
  changelog=$(git log --pretty=format:"- %s" "${previous_version_commit}^..HEAD" --no-merges | grep -v "Build and release APK version" | grep -v "script deploy" | grep -v "update readme" | grep -v "update script" )
fi

# Build APKs cho tất cả kiến trúc
cd android
./gradlew assembleRelease || { echo "Lỗi: Build APK thất bại!"; exit 1; }
cd ..

# Lấy danh sách ABI
abis=("arm64-v8a" "armeabi-v7a" "x86" "x86_64" "universal")

# Cài APK vào thiết bị nếu kiến trúc khớp
device_abi=$(adb shell getprop ro.product.cpu.abi | tr -d '\r')

apk_paths=()
for abi in "${abis[@]}"; do
  input_path="android/app/build/outputs/apk/release/app-${abi}-release.apk"
  if [[ -f "$input_path" ]]; then
    output_path="android/app/build/outputs/apk/release/locket_upload_${current_time}_${abi}.apk"
    mv "$input_path" "$output_path"
    apk_paths+=("$output_path")

    if [[ "$abi" == "$device_abi" ]]; then
      echo "📱 Installing: $output_path"
      adb install -r "$output_path" || echo "Cảnh báo: Cài đặt APK thất bại!"
    fi
  fi
done

# Git commit & push
git add .
git commit -m "Build and release APK version ${version} on ${current_time}" || { echo "Lỗi: Commit Git thất bại!"; exit 1; }
git push origin main || { echo "Lỗi: Push Git thất bại!"; exit 1; }

# Release GitHub
release_notes="Release version ${version}
Changelog:
${changelog}

Note: 
- hầu hết các thiết bị hiện nay đều là arm64-v8a
- nếu bạn không chắc chắn về thiết bị của mình thì có thể cài đặt bản universal (điều này làm tăng kích thước của ứng dụng)"

release_id=$(gh release view "v${version}" --json id -q .id 2>/dev/null || true)

if [ -z "$release_id" ]; then
  gh release create "v${version}" "${apk_paths[@]}" --notes "$release_notes" || { echo "Lỗi: Tạo release GitHub thất bại!"; exit 1; }
else
  gh release update "v${version}" --notes "$release_notes" || { echo "Lỗi: Cập nhật release thất bại!"; exit 1; }
  gh release upload "v${version}" "${apk_paths[@]}" --clobber || { echo "Lỗi: Upload file APK thất bại!"; exit 1; }
fi

# Gửi FCM nếu người dùng đồng ý
read -p "Bạn có muốn gửi thông báo qua FCM không? (y/n): " send_fcm

if [[ "$send_fcm" == "y" || "$send_fcm" == "Y" ]]; then
  PROJECT_ID=$(node -p "require('./google-services.json').project_info.project_id") || { echo "Lỗi: Không lấy được PROJECT_ID!"; exit 1; }
  FCM_URL="https://fcm.googleapis.com/v1/projects/$PROJECT_ID/messages:send"
  ACCESS_TOKEN=$(gcloud auth application-default print-access-token) || { echo "Lỗi: Lấy access token thất bại!"; exit 1; }

  curl -X POST "$FCM_URL" \
       -H "Authorization: Bearer $ACCESS_TOKEN" \
       -H "Content-Type: application/json" \
       -d '{
   "message": {
    "android": {
      "restricted_package_name": "com.locket_upload",
      "ttl": "604800s"
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