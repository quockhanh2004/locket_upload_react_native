@echo off
setlocal enabledelayedexpansion

:: Lấy phiên bản từ package.json
for /f "tokens=2 delims=:" %%i in ('type package.json ^| findstr /i "version"') do set version=%%i
set version=%version:~2,-2%

:: Định dạng thời gian hiện tại
for /f "tokens=1-5 delims=:. " %%a in ("%date% %time%") do (
    set year=%%c
    set month=%%a
    set day=%%b
    set hour=%%d
    set minute=%%e
)
set current_time=%year%%month%%day%_%hour%%minute%

:: Tạo file APK
cd android
gradlew assembleRelease
cd ..

:: Đổi tên file APK
set apk_path=android\app\build\outputs\apk\release\app-release.apk
set new_apk_path=android\app\build\outputs\apk\release\app-release_%current_time%.apk
rename %apk_path% app-release_%current_time%.apk

:: Cài đặt file APK lên thiết bị
adb install %new_apk_path%

:: Commit và push thay đổi lên GitHub
git add .
git commit -m "Build and release APK version %version% on %current_time%"
git push origin main

:: Kiểm tra xem release đã tồn tại hay chưa
for /f "tokens=*" %%i in ('gh release view "v%version%" --json id -q .id 2^>nul') do set release_id=%%i

if "%release_id%"=="" (
    :: Tạo release mới nếu chưa tồn tại
    gh release create "v%version%" "%new_apk_path%" --notes "Release version %version%"
) else (
    :: Cập nhật release nếu đã tồn tại
    gh release upload "v%version%" "%new_apk_path%" --clobber
)
