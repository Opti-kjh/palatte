#!/bin/bash

# Design System 패키지 설치 스크립트 (Yarn 3 호환)
# 이 스크립트는 GitHub Personal Access Token을 사용하여 private 저장소에서 패키지를 설치합니다.

# .env 파일에서 GITHUB_TOKEN 로드 (있는 경우)
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "🔐 Design System 패키지 설치"
echo ""

# GitHub Token 확인
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN 환경 변수가 설정되어 있지 않습니다."
  echo ""
  echo "📝 설정 방법:"
  echo ""
  echo "방법 1: .env 파일 사용 (권장)"
  echo "  프로젝트 루트에 .env 파일을 만들고 다음을 추가:"
  echo "  GITHUB_TOKEN=your_token_here"
  echo ""
  echo "방법 2: 환경 변수 직접 설정"
  echo "  export GITHUB_TOKEN=your_token_here"
  echo ""
  echo "토큰 생성 방법:"
  echo "1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)"
  echo "2. 'Generate new token (classic)' 클릭"
  echo "3. 필요한 권한 선택: repo (전체 저장소 접근)"
  echo "4. 토큰 생성 후 복사"
  echo ""
  exit 1
fi

echo "✅ GITHUB_TOKEN이 설정되어 있습니다."
echo ""

# package.json 백업
if [ ! -f "package.json.bak" ]; then
  cp package.json package.json.bak
  echo "📋 package.json 백업 완료"
fi

# package.json에서 기존 Design System 패키지 제거 (있다면)
echo "🧹 기존 설정 정리 중..."

# jq를 사용하여 패키지 추가/업데이트
if command -v jq &> /dev/null; then
  echo "📦 package.json 업데이트 중..."
  
  # 토큰을 포함한 URL로 패키지 추가
  jq --arg token "$GITHUB_TOKEN" \
    '.dependencies["@dealicious/design-system"] = "https://\($token)@github.com/dealicious-inc/ssm-web.git#master" |
     .dependencies["@dealicious/design-system-react"] = "https://\($token)@github.com/dealicious-inc/ssm-web.git#master"' \
    package.json > package.json.tmp && mv package.json.tmp package.json
  
  echo "✅ package.json 업데이트 완료"
else
  echo "⚠️  jq가 설치되어 있지 않습니다."
  echo ""
  echo "📝 수동으로 package.json을 수정해주세요:"
  echo ""
  echo "dependencies 섹션에 다음을 추가하세요:"
  echo '  "@dealicious/design-system": "https://YOUR_TOKEN@github.com/dealicious-inc/ssm-web.git#master",'
  echo '  "@dealicious/design-system-react": "https://YOUR_TOKEN@github.com/dealicious-inc/ssm-web.git#master"'
  echo ""
  echo "YOUR_TOKEN을 실제 토큰으로 교체하세요."
  exit 1
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
  yarn list --pattern "@dealicious/design-system*" 2>/dev/null || echo "패키지 목록 확인 중..."
  echo ""
  echo "⚠️  보안 주의: package.json에 토큰이 포함되어 있습니다."
  echo "   .gitignore에 package.json이 포함되어 있는지 확인하세요."
else
  echo ""
  echo "❌ 설치 실패"
  echo ""
  echo "문제 해결:"
  echo "1. GITHUB_TOKEN이 올바른지 확인"
  echo "2. 토큰에 'repo' scope가 있는지 확인"
  echo "3. 저장소 접근 권한이 있는지 확인"
  exit 1
fi

