# Design System 패키지 빠른 설치 가이드

## ⚠️ 중요: HTML 미리보기는 이미 작동합니다!

생성된 `SomaComponent.html` 파일은 **모의 컴포넌트**를 사용하므로 패키지 설치 없이도 브라우저에서 확인할 수 있습니다.

## 실제 프로젝트에서 사용하려면

### 빠른 설치 (3단계)

#### 1. GitHub 토큰 생성
1. https://github.com/settings/tokens 접속
2. "Generate new token (classic)" 클릭
3. `repo` 권한 선택
4. 토큰 생성 후 복사

#### 2. 토큰 설정
```bash
# .env 파일에 추가 (권장)
echo "GITHUB_TOKEN=your_token_here" >> .env

# 또는 환경 변수로 직접 설정
export GITHUB_TOKEN=your_token_here
```

#### 3. 설치 스크립트 실행
```bash
chmod +x install-with-token.sh
./install-with-token.sh
```

### 또는 수동 설치

```bash
# package.json 수정 (YOUR_TOKEN을 실제 토큰으로 교체)
# dependencies에 추가:
# "@dealicious/design-system": "https://YOUR_TOKEN@github.com/dealicious-inc/ssm-web.git#master"
# "@dealicious/design-system-react": "https://YOUR_TOKEN@github.com/dealicious-inc/ssm-web.git#master"

yarn install
```

## 확인

설치 후 생성된 컴포넌트를 사용할 수 있습니다:

```tsx
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Input } from '@dealicious/design-system-react/src/components/ssm-input';
// ... 등등
```

## 문제 해결

- 404 에러: 토큰이 없거나 권한이 부족합니다
- 접근 거부: 저장소 접근 권한이 필요합니다 (팀 관리자에게 문의)
- 설치 실패: `.env` 파일에 토큰이 올바르게 설정되었는지 확인


