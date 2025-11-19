#!/bin/bash

# Monorepo에서 Design System 패키지 설치 스크립트

echo "🔐 Design System 패키지 설치 (Monorepo)"
echo ""

# GitHub Token 확인
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN 환경 변수가 설정되어 있지 않습니다."
  echo ""
  echo "다음 명령어로 토큰을 설정하세요:"
  echo "  export GITHUB_TOKEN=your_token_here"
  exit 1
fi

echo "✅ GITHUB_TOKEN이 설정되어 있습니다."
echo ""

# package.json 백업
if [ ! -f "package.json.bak" ]; then
  cp package.json package.json.bak
  echo "📋 package.json 백업 완료"
fi

# 방법 1: SSH 사용 (가장 안정적)
echo "🔧 방법 1: SSH를 사용한 설치 시도..."
if ssh -T git@github.com &>/dev/null; then
  echo "✅ SSH 키가 설정되어 있습니다."
  
  if command -v jq &> /dev/null; then
    jq '.dependencies["@dealicious/design-system"] = "git+ssh://git@github.com/dealicious-inc/ssm-web.git#master:packages/design-system" |
        .dependencies["@dealicious/design-system-react"] = "git+ssh://git@github.com/dealicious-inc/ssm-web.git#master:packages/design-system-react"' \
        package.json > package.json.tmp && mv package.json.tmp package.json
    
    echo "✅ package.json 업데이트 완료 (SSH)"
    echo "📥 패키지 설치 중..."
    yarn install
    
    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ 설치 완료!"
      exit 0
    fi
  fi
else
  echo "⚠️  SSH 키가 설정되어 있지 않습니다."
fi

# 방법 2: HTTPS with Token (monorepo 경로 포함)
echo ""
echo "🔧 방법 2: HTTPS with Token 사용 (monorepo 경로 포함)..."

if command -v jq &> /dev/null; then
  jq --arg token "$GITHUB_TOKEN" \
    '.dependencies["@dealicious/design-system"] = "https://\($token)@github.com/dealicious-inc/ssm-web.git#master:packages/design-system" |
     .dependencies["@dealicious/design-system-react"] = "https://\($token)@github.com/dealicious-inc/ssm-web.git#master:packages/design-system-react"' \
    package.json > package.json.tmp && mv package.json.tmp package.json
  
  echo "✅ package.json 업데이트 완료"
  echo "📥 패키지 설치 중..."
  yarn install
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 설치 완료!"
    exit 0
  fi
fi

# 방법 3: 전체 저장소 클론 후 workspace 사용
echo ""
echo "🔧 방법 3: 전체 저장소 클론 후 workspace 사용..."

TEMP_DIR=$(mktemp -d)
echo "📥 임시 디렉토리에 저장소 클론 중: $TEMP_DIR"

git clone "https://$GITHUB_TOKEN@github.com/dealicious-inc/ssm-web.git" "$TEMP_DIR/ssm-web" 2>&1 | head -5

if [ -d "$TEMP_DIR/ssm-web/packages/design-system-react" ]; then
  echo "✅ 저장소 클론 성공"
  echo ""
  echo "💡 대안: 로컬 경로로 설치"
  echo ""
  echo "다음 명령어로 로컬에서 설치할 수 있습니다:"
  echo "  yarn add file:$TEMP_DIR/ssm-web/packages/design-system-react"
  echo "  yarn add file:$TEMP_DIR/ssm-web/packages/design-system"
  echo ""
  echo "또는 package.json에 직접 추가:"
  echo '  "@dealicious/design-system": "file:'"$TEMP_DIR"'/ssm-web/packages/design-system",'
  echo '  "@dealicious/design-system-react": "file:'"$TEMP_DIR"'/ssm-web/packages/design-system-react"'
else
  echo "❌ 저장소 클론 실패"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "❌ 자동 설치가 실패했습니다."
echo ""
echo "📝 수동 설치 방법:"
echo ""
echo "1. 저장소를 로컬에 클론:"
echo "   git clone https://$GITHUB_TOKEN@github.com/dealicious-inc/ssm-web.git"
echo ""
echo "2. package.json에 로컬 경로 추가:"
echo '   "@dealicious/design-system": "file:../ssm-web/packages/design-system",'
echo '   "@dealicious/design-system-react": "file:../ssm-web/packages/design-system-react"'
echo ""
echo "3. yarn install 실행"

