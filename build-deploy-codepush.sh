#!/bin/bash

# Dừng script nếu gặp lỗi
set -e  

# Xử lý khi nhấn Ctrl + C
trap "echo -e '\n❌ Quá trình đã bị hủy!'; exit 1" SIGINT

default_version=$(node -p "require('./package.json').version")

# Yêu cầu nhập target version nếu chưa có
read -p "Nhập phiên bản CodePush (nhấn Enter để dùng $default_version): " TARGET_VERSION
TARGET_VERSION=${TARGET_VERSION:-$default_version}

# Yêu cầu nhập description nếu chưa có
echo "📝 Nhập mô tả phiên bản (nhấn Enter xuống dòng, Ctrl+D để kết thúc):"
DESCRIPTION=""
while IFS= read -r line; do
    DESCRIPTION+="$line"$'\n'
done


APP_NAME="locket_upload_react_native"
DEPLOYMENT="Production"

echo "🚀 Bắt đầu deploy CodePush..."
echo "📌 Phiên bản mục tiêu: $TARGET_VERSION"
echo "📝 Mô tả: $DESCRIPTION"

# Đẩy lên CodePush cho Android
echo "🚀 Deploy lên CodePush (Android)..."

code-push release-react "$APP_NAME" android \
  --deploymentName "$DEPLOYMENT" \
  --targetBinaryVersion "$TARGET_VERSION" \
  --mandatory \
  --description "$DESCRIPTION"

echo "✅ CodePush deploy hoàn tất!"

# Hỏi người dùng có muốn gửi thông báo qua FCM không
read -p "📢 Bạn có muốn gửi thông báo cập nhật qua FCM không? (Y/n): " send_fcm
send_fcm=${send_fcm:-y} # nếu user bấm Enter, tự set send_fcm = y

if [[ "$send_fcm" != "y" && "$send_fcm" != "Y" ]]; then
    echo "🚫 Bỏ qua gửi thông báo FCM."
    exit 0
fi

# Gửi thông báo qua Firebase Cloud Messaging (FCM)
read -p "🔹 Nhập phiên bản nhận thông báo (Enter để dùng mặc định: $TARGET_VERSION): " MESSAGE_VERSION
MESSAGE_VERSION=${MESSAGE_VERSION:-$TARGET_VERSION}

echo "📢 Đang gửi thông báo cập nhật..."
PROJECT_ID=$(node -p "require('./google-services.json').project_info.project_id")
FCM_URL="https://fcm.googleapis.com/v1/projects/$PROJECT_ID/messages:send"
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

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
              "local_update": "true"
            },
            "notification": {
              "body": "'"$DESCRIPTION"'",
              "title": "Đã có bản cập nhật mới!"
            },
          "topic": "'"$MESSAGE_VERSION"'"
          }
        }'

echo "✅ Thông báo cập nhật đã được gửi!"
echo "🎉 Hoàn thành tất cả các bước thành công!"
