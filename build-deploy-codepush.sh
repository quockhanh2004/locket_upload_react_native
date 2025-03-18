#!/bin/bash

# Yêu cầu nhập target version nếu chưa có
if [ -z "$TARGET_VERSION" ]; then
    read -p "🔹 Nhập phiên bản mục tiêu: " TARGET_VERSION
fi

# Yêu cầu nhập description nếu chưa có
if [ -z "$DESCRIPTION" ]; then
    read -p "📝 Nhập mô tả phiên bản: " DESCRIPTION
fi

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

FCM_SERVER_KEY=$(node -p "require('./server-service.json').private_key")
PACKAGE_NAME="com.com.locket_upload"
curl -X POST "https://fcm.googleapis.com/fcm/send" \
     -H "Authorization: key=$FCM_SERVER_KEY" \
     -H "Content-Type: application/json" \
     -d '{
           "to": "/new_update/all_users",
           "notification": {
             "title": "Đã có bản cập nhật mới!",
             "body": "'"$DESCRIPTION"'",
             "click_action": "OPEN_APP"
           },
           "data": {
             "local_update": "true"
           },
           "restricted_package_name": "'"$PACKAGE_NAME"'"
         }'

echo "✅ CodePush deploy hoàn tất!"