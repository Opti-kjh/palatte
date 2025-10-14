@echo off
REM Design System MCP 설정 스크립트 (Windows)
REM 팀원들이 쉽게 설치할 수 있도록 도와주는 스크립트입니다.

setlocal enabledelayedexpansion

echo 🚀 Design System MCP 설정을 시작합니다...

REM 1. 의존성 확인
echo 📋 의존성 확인 중...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되어 있지 않습니다. Node.js 18 이상을 설치해주세요.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm이 설치되어 있지 않습니다.
    pause
    exit /b 1
)

echo ✅ Node.js 및 npm 확인됨

REM 2. 프로젝트 의존성 설치
echo 📋 프로젝트 의존성 설치 중...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 의존성 설치에 실패했습니다.
    pause
    exit /b 1
)
echo ✅ 의존성 설치 완료

REM 3. 빌드
echo 📋 프로젝트 빌드 중...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 빌드에 실패했습니다.
    pause
    exit /b 1
)
echo ✅ 빌드 완료

REM 4. 환경 변수 설정
echo 📋 환경 변수 설정 확인 중...

if not exist ".env" (
    echo ⚠️  .env 파일이 없습니다. env.example을 복사합니다.
    copy env.example .env
    echo ✅ .env 파일이 생성되었습니다.
    echo.
    echo ⚠️  .env 파일을 열어서 FIGMA_ACCESS_TOKEN을 설정해주세요!
    echo.
    echo Figma Access Token 발급 방법:
    echo 1. https://figma.com 에 로그인
    echo 2. Settings → Account → Personal Access Tokens
    echo 3. 'Create new token' 클릭
    echo 4. 토큰 이름 입력 후 생성
    echo 5. 생성된 토큰을 .env 파일의 FIGMA_ACCESS_TOKEN에 설정
    echo.
) else (
    echo ✅ .env 파일이 이미 존재합니다.
)

REM 5. Cursor IDE 설정 확인
echo 📋 Cursor IDE MCP 설정 확인 중...

set "CURSOR_MCP_FILE=%APPDATA%\Cursor\User\mcp.json"

REM Cursor 디렉토리 생성
if not exist "%APPDATA%\Cursor\User" (
    mkdir "%APPDATA%\Cursor\User"
    echo ✅ Cursor 설정 디렉토리 생성: %APPDATA%\Cursor\User
)

REM MCP 설정 파일 생성/업데이트
set "CURRENT_DIR=%CD%"
set "CURRENT_DIR=%CURRENT_DIR:\=/%"

if exist "%CURSOR_MCP_FILE%" (
    echo ⚠️  기존 MCP 설정 파일이 있습니다: %CURSOR_MCP_FILE%
    echo ⚠️  수동으로 설정을 추가해야 합니다.
    echo.
    echo 다음 설정을 %CURSOR_MCP_FILE% 에 추가하세요:
    echo.
    echo {
    echo   "mcpServers": {
    echo     "design-system-mcp": {
    echo       "command": "node",
    echo       "args": ["%CURRENT_DIR%/dist/index.js"],
    echo       "env": {
    echo         "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
    echo       }
    echo     }
    echo   }
    echo }
    echo.
) else (
    (
        echo {
        echo   "mcpServers": {
        echo     "design-system-mcp": {
        echo       "command": "node",
        echo       "args": ["%CURRENT_DIR%/dist/index.js"],
        echo       "env": {
        echo         "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
        echo       }
        echo     }
        echo   }
        echo }
    ) > "%CURSOR_MCP_FILE%"
    echo ✅ MCP 설정 파일 생성: %CURSOR_MCP_FILE%
)

REM 6. 완료 메시지
echo.
echo ✅ 🎉 Design System MCP 설정이 완료되었습니다!
echo.
echo 다음 단계:
echo 1. .env 파일에서 FIGMA_ACCESS_TOKEN을 설정하세요
echo 2. Cursor IDE를 재시작하세요
echo 3. Cursor IDE에서 다음 명령어로 테스트하세요:
echo    '사용 가능한 React 컴포넌트 목록을 보여줘'
echo.
echo 문제가 있다면 INSTALLATION.md 파일을 참고하세요.
echo.
pause
