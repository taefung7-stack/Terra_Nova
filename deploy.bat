@echo off
chcp 65001 >nul
cd /d "c:\Users\user\OneDrive\Desktop\Terra Nova"

echo [Terra Nova] 변경 파일 확인 중...
git add index.html order.html sample.html level_test.html faq.html subscription_detail_complete.html sitemap.html mypage.html login.html signup.html

git diff --cached --quiet
if %errorlevel% == 0 (
  echo 변경된 파일이 없습니다.
  pause
  exit /b
)

for /f "tokens=*" %%i in ('powershell -command "Get-Date -Format \"yyyy-MM-dd HH:mm\""') do set TIMESTAMP=%%i
git commit -m "Update: %TIMESTAMP%"

echo [Terra Nova] GitHub에 업로드 중...
git push origin main

echo.
echo 완료! 1~2분 후 아래 주소에서 확인하세요.
echo https://taefung7-stack.github.io/Terra_Nova/
echo.
pause
