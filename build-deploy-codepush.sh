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

PROJECT_ID=$(node -p "require('./google-services.json').project_info.project_id")
FCM_URL="https://fcm.googleapis.com/v1/projects/$PROJECT_ID/messages:send"
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

curl -X POST "$FCM_URL" \
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
        }'


echo "✅ CodePush deploy hoàn tất!"