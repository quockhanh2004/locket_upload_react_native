@echo off
setlocal enabledelayedexpansion

:: Lấy version từ package.json
for /f "delims=" %%i in ('node -p "require('./package.json').version"') do set VERSION=%%i

:: Lấy thời gian hiện tại
for /f %%i in ('powershell -Command "Get-Date -Format yyyyMMdd_HHmm"') do set CURRENT_TIME=%%i

:: Lấy commit gần nhất có chứa từ khóa "Build and release APK version"
for /f %%i in ('git log --grep "Build and release APK version" --pretty^=format:"%%H" -1') do set PREV_COMMIT=%%i

:: Lấy version từ message của commit trước
set PREV_VERSION=
if defined PREV_COMMIT (
  for /f "delims=" %%i in ('git log -1 --format=%%s !PREV_COMMIT! ^| findstr /r "[0-9]\+\.[0-9]\+\.[0-9]\+"') do set PREV_VERSION=%%i
)

:: Tạo changelog
set CHANGELOG=
if defined PREV_COMMIT (
  for /f "delims=" %%i in ('git log --pretty^=format:"- %%s" !PREV_COMMIT!^..HEAD --no-merges ^| findstr /v /i "Build and release APK version" ^| findstr /v /i "script deploy" ^| findstr /v /i "update readme"') do (
    set "CHANGELOG=!CHANGELOG!%%i\r\n"
  )
)

:: Build APK
cd android
call gradlew.bat assembleRelease
if errorlevel 1 (
  echo ❌ Lỗi: Build APK thất bại!
  exit /b 1
)
cd ..

:: Đổi tên file APK
set APK_PATH=android\app\build\outputs\apk\release\app-release.apk
set NEW_APK_PATH=android\app\build\outputs\apk\release\locket_upload_%CURRENT_TIME%.apk

if not exist "%APK_PATH%" (
  echo ❌ Lỗi: Không tìm thấy file APK!
  exit /b 1
)

move "%APK_PATH%" "%NEW_APK_PATH%"

:: Cài APK lên thiết bị (nếu có)
adb install "%NEW_APK_PATH%"
if errorlevel 1 (
  echo ⚠️  Cảnh báo: Cài đặt APK thất bại, nhưng vẫn tiếp tục...
)

:: Commit và push
git add .
git commit -m "Build and release APK version %VERSION% on %CURRENT_TIME%"
if errorlevel 1 (
  echo ❌ Lỗi: Commit Git thất bại!
  exit /b 1
)
git push origin main
if errorlevel 1 (
  echo ❌ Lỗi: Push Git thất bại!
  exit /b 1
)

:: Tạo hoặc cập nhật release GitHub
set RELEASE_NOTES=Release version %VERSION%^&echo.^&echo.Changelog:^&echo.%CHANGELOG%

:: Kiểm tra xem release đã tồn tại chưa
for /f "delims=" %%i in ('gh release view "v%VERSION%" --json id -q ".id" 2^>nul') do set RELEASE_ID=%%i

if not defined RELEASE_ID (
  echo ➕ Tạo release mới trên GitHub...
  gh release create "v%VERSION%" "%NEW_APK_PATH%" --notes "%RELEASE_NOTES%"
  if errorlevel 1 (
    echo ❌ Lỗi: Tạo release GitHub thất bại!
    exit /b 1
  )
) else (
  echo 🔁 Cập nhật release đã tồn tại...
  gh release update "v%VERSION%" --notes "%RELEASE_NOTES%"
  gh release upload "v%VERSION%" "%NEW_APK_PATH%" --clobber
)

:: Hỏi gửi FCM
set /p SEND_FCM="Bạn có muốn gửi thông báo qua FCM không? (y/n): "
if /i "%SEND_FCM%"=="y" (
  for /f "delims=" %%i in ('node -p "require('./google-services.json').project_info.project_id"') do set PROJECT_ID=%%i
  for /f "delims=" %%i in ('gcloud auth application-default print-access-token') do set ACCESS_TOKEN=%%i
  set FCM_URL=https://fcm.googleapis.com/v1/projects/%PROJECT_ID%/messages:send

  echo 🔔 Gửi thông báo FCM...

  curl -X POST "%FCM_URL%" ^
       -H "Authorization: Bearer %ACCESS_TOKEN%" ^
       -H "Content-Type: application/json" ^
       -d "{^
         \"message\": {^
           \"android\": {^
             \"restricted_package_name\": \"com.locket_upload\"^
           },^
           \"data\": {^
             \"update_url\": \"https://github.com/quockhanh2004/locket_upload_react_native/releases\"^
           },^
           \"notification\": {^
             \"body\": \"Cần cập nhật qua apk, nhấn vào để kiểm tra nhé!\",^
             \"title\": \"Đã có bản cập nhật mới!\"^
           },^
           \"topic\": \"new_update\"^
         }^
       }"

  if errorlevel 1 (
    echo ❌ Lỗi: Gửi thông báo FCM thất bại!
    exit /b 1
  )
  echo ✅ Đã gửi thông báo FCM thành công!
) else (
  echo 🚫 Bỏ qua việc gửi thông báo FCM.
)

echo 🎉 Build hoàn tất thành công!
pause
