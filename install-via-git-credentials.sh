#!/bin/bash

# Git credential helper를 사용한 설치 스크립트

# .env 파일에서 GITHUB_TOKEN 로드 (있는 경우)
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "🔐 Design System 패키지 설치 (Git Credential Helper)"
echo ""

# GitHub Token 확인
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN 환경 변수가 설정되어 있지 않습니다."
  echo ""
  echo "다음 중 하나의 방법으로 토큰을 설정하세요:"
  echo ""
  echo "방법 1: .env 파일 사용 (권장)"
  echo "  프로젝트 루트에 .env 파일을 만들고 다음을 추가:"
  echo "  GITHUB_TOKEN=your_token_here"
  echo ""
  echo "방법 2: 환경 변수 직접 설정"
  echo "  export GITHUB_TOKEN=your_token_here"
  echo ""
  exit 1
fi

echo "✅ GITHUB_TOKEN이 설정되어 있습니다."
echo ""

# Git credential helper 설정
echo "🔧 Git credential helper 설정 중..."
git config --global credential.helper store

# Credential 파일에 토큰 추가
CREDENTIAL_FILE="$HOME/.git-credentials"
if [ -f "$CREDENTIAL_FILE" ]; then
  # 기존 GitHub 항목 제거
  grep -v "github.com" "$CREDENTIAL_FILE" > "${CREDENTIAL_FILE}.tmp" 2>/dev/null || true
  mv "${CREDENTIAL_FILE}.tmp" "$CREDENTIAL_FILE" 2>/dev/null || true
fi

# 새 토큰 추가
echo "https://$GITHUB_TOKEN@github.com" >> "$CREDENTIAL_FILE"
echo "✅ Git credential helper 설정 완료"
echo ""

# package.json 업데이트 (토큰 없이)
if command -v jq &> /dev/null; then
  echo "📦 package.json 업데이트 중..."
  jq '.dependencies["@dealicious/design-system"] = "https://github.com/dealicious-inc/ssm-web.git#master" |
      .dependencies["@dealicious/design-system-react"] = "https://github.com/dealicious-inc/ssm-web.git#master"' \
      package.json > package.json.tmp && mv package.json.tmp package.json
  
  echo "✅ package.json 업데이트 완료"
else
  echo "⚠️  jq가 설치되어 있지 않습니다."
  echo ""
  echo "수동으로 package.json을 수정하세요:"
  echo '  "@dealicious/design-system": "https://github.com/dealicious-inc/ssm-web.git#master",'
  echo '  "@dealicious/design-system-react": "https://github.com/dealicious-inc/ssm-web.git#master"'
fi

# yarn install 실행
echo ""
echo "📥 패키지 설치 중..."
yarn install

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 설치 완료!"
  echo ""
  echo "📦 설치된 패키지 확인:"
  echo ""
  yarn info @dealicious/design-system-react 2>/dev/null | head -3 || true
  yarn info @dealicious/design-system 2>/dev/null | head -3 || true
  echo ""
  echo "📁 설치 위치:"
  ls -d node_modules/@dealicious/* 2>/dev/null || echo "  node_modules/@dealicious/ 디렉토리 확인 중..."
else
  echo ""
  echo "❌ 설치 실패"
  echo ""
  echo "다른 방법을 시도해보세요:"
  echo "  ./install-monorepo.sh"
fi

