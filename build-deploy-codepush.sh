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
# code-push release-react $APP_NAME android \
#   --targetBinaryVersion "$TARGET_VERSION" \
#   --deploymentName "$DEPLOYMENT" \
#   --description "$DESCRIPTION" \
#   --mandatory true \
#   --outputDir ./build/android
code-push release-react "$APP_NAME" android \
  --deploymentName "$DEPLOYMENT" \
  --targetBinaryVersion "$TARGET_VERSION" \
  --mandatory \
  --description "$DESCRIPTION"

# Đẩy lên CodePush cho iOS
# echo "🚀 Deploy lên CodePush (iOS)..."
# code-push release-react $APP_NAME ios \
#   --targetBinaryVersion "$TARGET_VERSION" \
#   --deploymentName "$DEPLOYMENT" \
#   --description "$DESCRIPTION" \
#   --mandatory true \
#   --outputDir ./build/ios

echo "✅ CodePush deploy hoàn tất!"