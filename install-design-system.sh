#!/bin/bash

# Design System 패키지 설치 스크립트
# 이 스크립트는 GitHub Personal Access Token을 사용하여 private 저장소에서 패키지를 설치합니다.

echo "🔐 Design System 패키지 설치"
echo ""

# GitHub Token 확인
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN 환경 변수가 설정되어 있지 않습니다."
  echo ""
  echo "📝 설정 방법:"
  echo "1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)"
  echo "2. 'Generate new token (classic)' 클릭"
  echo "3. 필요한 권한 선택: repo (전체 저장소 접근)"
  echo "4. 토큰 생성 후 복사"
  echo "5. 다음 명령어 실행:"
  echo "   export GITHUB_TOKEN=your_token_here"
  echo "   ./install-design-system.sh"
  echo ""
  exit 1
fi

echo "✅ GITHUB_TOKEN이 설정되어 있습니다."
echo ""

# package.json에 패키지 추가
echo "📦 package.json 업데이트 중..."
cat > /tmp/package_update.json << 'EOF'
{
  "dependencies": {
    "@dealicious/design-system": "https://${GITHUB_TOKEN}@github.com/dealicious-inc/ssm-web.git#master",
    "@dealicious/design-system-react": "https://${GITHUB_TOKEN}@github.com/dealicious-inc/ssm-web.git#master"
  }
}
EOF

# yarn install 실행
echo "📥 패키지 설치 중..."
yarn add "https://${GITHUB_TOKEN}@github.com/dealicious-inc/ssm-web.git#master" --scope @dealicious/design-system --scope @dealicious/design-system-react 2>&1 || {
  echo ""
  echo "⚠️  위 방법이 실패했습니다. 대안 방법을 시도합니다..."
  echo ""
  
  # 대안: package.json 직접 수정
  echo "📝 package.json에 직접 추가 중..."
  
  # package.json 백업
  cp package.json package.json.bak
  
  # jq를 사용하여 패키지 추가 (jq가 있는 경우)
  if command -v jq &> /dev/null; then
    jq '.dependencies["@dealicious/design-system"] = "https://'${GITHUB_TOKEN}'@github.com/dealicious-inc/ssm-web.git#master"' package.json > package.json.tmp
    jq '.dependencies["@dealicious/design-system-react"] = "https://'${GITHUB_TOKEN}'@github.com/dealicious-inc/ssm-web.git#master"' package.json.tmp > package.json
    rm package.json.tmp
  else
    echo "⚠️  jq가 설치되어 있지 않습니다. 수동으로 package.json을 수정해주세요."
    echo ""
    echo "다음 내용을 package.json의 dependencies에 추가하세요:"
    echo '  "@dealicious/design-system": "https://YOUR_TOKEN@github.com/dealicious-inc/ssm-web.git#master",'
    echo '  "@dealicious/design-system-react": "https://YOUR_TOKEN@github.com/dealicious-inc/ssm-web.git#master"'
    exit 1
  fi
  
  echo "✅ package.json 업데이트 완료"
  echo "📥 yarn install 실행 중..."
  yarn install
}

echo ""
echo "✅ 설치 완료!"
echo ""
echo "📦 설치된 패키지 확인:"
yarn list --pattern "@dealicious/design-system*" 2>/dev/null || echo "패키지 목록 확인 중..."

