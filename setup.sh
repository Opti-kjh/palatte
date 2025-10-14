#!/bin/bash

# Design System MCP 설정 스크립트
# 팀원들이 쉽게 설치할 수 있도록 도와주는 스크립트입니다.

set -e

echo "🚀 Design System MCP 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. 의존성 확인
print_step "의존성 확인 중..."

if ! command -v node &> /dev/null; then
    print_error "Node.js가 설치되어 있지 않습니다. Node.js 18 이상을 설치해주세요."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm이 설치되어 있지 않습니다."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18 이상이 필요합니다. 현재 버전: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) 확인됨"

# 2. 프로젝트 의존성 설치
print_step "프로젝트 의존성 설치 중..."
npm install
print_success "의존성 설치 완료"

# 3. 빌드
print_step "프로젝트 빌드 중..."
npm run build
print_success "빌드 완료"

# 4. 환경 변수 설정
print_step "환경 변수 설정 확인 중..."

if [ ! -f ".env" ]; then
    print_warning ".env 파일이 없습니다. env.example을 복사합니다."
    cp env.example .env
    print_success ".env 파일이 생성되었습니다."
    print_warning "⚠️  .env 파일을 열어서 FIGMA_ACCESS_TOKEN을 설정해주세요!"
    echo ""
    echo "Figma Access Token 발급 방법:"
    echo "1. https://figma.com 에 로그인"
    echo "2. Settings → Account → Personal Access Tokens"
    echo "3. 'Create new token' 클릭"
    echo "4. 토큰 이름 입력 후 생성"
    echo "5. 생성된 토큰을 .env 파일의 FIGMA_ACCESS_TOKEN에 설정"
    echo ""
else
    print_success ".env 파일이 이미 존재합니다."
fi

# 5. Cursor IDE 설정 확인
print_step "Cursor IDE MCP 설정 확인 중..."

CURSOR_MCP_FILE=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CURSOR_MCP_FILE="$HOME/.cursor/mcp.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CURSOR_MCP_FILE="$HOME/.config/cursor/mcp.json"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows
    CURSOR_MCP_FILE="$APPDATA/Cursor/User/mcp.json"
fi

if [ -z "$CURSOR_MCP_FILE" ]; then
    print_error "지원하지 않는 운영체제입니다: $OSTYPE"
    exit 1
fi

# Cursor 디렉토리 생성
CURSOR_DIR=$(dirname "$CURSOR_MCP_FILE")
if [ ! -d "$CURSOR_DIR" ]; then
    mkdir -p "$CURSOR_DIR"
    print_success "Cursor 설정 디렉토리 생성: $CURSOR_DIR"
fi

# MCP 설정 파일 생성/업데이트
CURRENT_DIR=$(pwd)
MCP_CONFIG='{
  "mcpServers": {
    "design-system-mcp": {
      "command": "node",
      "args": ["'$CURRENT_DIR'/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
      }
    }
  }
}'

if [ -f "$CURSOR_MCP_FILE" ]; then
    print_warning "기존 MCP 설정 파일이 있습니다: $CURSOR_MCP_FILE"
    print_warning "수동으로 설정을 추가해야 합니다."
    echo ""
    echo "다음 설정을 $CURSOR_MCP_FILE 에 추가하세요:"
    echo "$MCP_CONFIG"
else
    echo "$MCP_CONFIG" > "$CURSOR_MCP_FILE"
    print_success "MCP 설정 파일 생성: $CURSOR_MCP_FILE"
fi

# 6. 테스트 실행
print_step "MCP 서버 테스트 중..."
if npm run mcp --version &> /dev/null; then
    print_success "MCP 서버가 정상적으로 실행됩니다."
else
    print_warning "MCP 서버 테스트에 실패했습니다. 수동으로 확인해주세요."
fi

# 7. 완료 메시지
echo ""
print_success "🎉 Design System MCP 설정이 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. .env 파일에서 FIGMA_ACCESS_TOKEN을 설정하세요"
echo "2. Cursor IDE를 재시작하세요"
echo "3. Cursor IDE에서 다음 명령어로 테스트하세요:"
echo "   '사용 가능한 React 컴포넌트 목록을 보여줘'"
echo ""
echo "문제가 있다면 INSTALLATION.md 파일을 참고하세요."
