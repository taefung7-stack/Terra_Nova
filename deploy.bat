@echo off
chcp 65001 >nul
cd /d "c:\Users\user\OneDrive\Desktop\Terra Nova"

:: Service Worker CACHE_VERSION 자동 갱신 — 매 배포마다 새 timestamp 주입.
:: 사용자 브라우저의 SW가 다음 진입에 새 버전 install → 옛 캐시 폐기 →
:: 갱신된 shared.css / pwa-register.js 등이 바로 반영됨.
for /f "tokens=*" %%i in ('powershell -command "Get-Date -Format \"yyyyMMdd-HHmm\""') do set CACHE_TS=%%i
echo [Terra Nova] SW CACHE_VERSION → tn-v2-%CACHE_TS%
powershell -Command "$c = Get-Content -Raw service-worker.js; $c = $c -replace 'tn-v\d+-[\d-]+', 'tn-v2-%CACHE_TS%'; [IO.File]::WriteAllText('service-worker.js', $c)"

echo [Terra Nova] 변경 파일 확인 중...
git add index.html order.html sample.html level_test.html faq.html subscription_detail_complete.html sitemap.html mypage.html login.html signup.html market.html market_checkout.html naver-callback.html privacy.html refund.html terms.html shared.css service-worker.js pwa-register.js

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
echo https://terra-nova.kr/
echo.
pause
