@echo off
REM 콘솔 코드 페이지 UTF-8 설정 (한글 처리용)
chcp 65001 > nul

echo [1/4] 과제 빌드 중...
node build.js
if %errorlevel% neq 0 (
    echo 오류: 빌드 실패! node build.js 문제
    pause
    exit /b %errorlevel%
)
echo 빌드 완료. 계속하려면 아무 키나 누르세요
pause > nul

echo [2/4] 변경사항 스테이징 중...
git add .
echo 스테이징 완료. 계속하려면 아무 키나 누르세요
pause > nul

echo [3/4] 커밋 메시지 입력 단계...
echo.
REM --- 이전 커밋 메시지 가져오기 ---
set "previous_message="
for /f "delims=" %%a in ('git log -1 --pretty^=%%s') do set "previous_message=%%a"

if defined previous_message (
    echo 이전 커밋 메시지: %previous_message%
) else (
    echo 이전 커밋 메시지를 찾을 수 없습니다.
)
echo.
REM --- 새 커밋 메시지 입력받기 ---
set "commit_message="
set /p commit_message="업데이트 내용을 입력하세요: "
if "%commit_message%"=="" set commit_message=Update via script

echo 새 커밋 메시지: "%commit_message%"
git commit -m "%commit_message%"
if %errorlevel% neq 0 (
    git status | findstr /B /C:"nothing to commit, working tree clean" > nul
    if %errorlevel% equ 0 (
      echo 정보: 커밋할 변경사항 없음.
    ) else (
      echo 오류: 커밋 실패! git commit 문제
      pause
      exit /b %errorlevel%
    )
) else (
    echo 커밋 완료.
)
echo 계속하려면 아무 키나 누르세요
pause > nul

echo [4/4] GitHub 저장소로 푸시 중...
git push origin master:main
if %errorlevel% neq 0 (
    echo 오류: 푸시 실패! git push 문제
    echo 원인: 인터넷 연결, 권한 문제 또는 원격 저장소에 로컬에 없는 변경사항이 있을 수 있습니다.
    echo 해결: CMD에서 'git pull origin main' 실행 후 다시 푸시 시도.
    pause
    exit /b %errorlevel%
)
echo 푸시 완료!

echo.
echo 작업 완료. 잠시 후 웹사이트에서 확인하세요.
pause