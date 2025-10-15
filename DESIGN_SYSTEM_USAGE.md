# Design System을 사용한 Figma → React 변환

## 개요
이 프로젝트는 Figma 디자인을 **Design System 컴포넌트를 사용하여** React/Vue 컴포넌트로 변환하는 MCP 서버입니다.

## 핵심 개념

### ❌ 잘못된 방식 (별도 CSS 생성)
```tsx
// 이렇게 하면 안됩니다!
import './ExchangeRateCard.css'; // 별도 CSS 파일
<div className="custom-styles">...</div>
```

### ✅ 올바른 방식 (Design System 사용)
```tsx
// 이렇게 해야 합니다!
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Card } from '@dealicious/design-system-react/src/components/ssm-card';
import { Table } from '@dealicious/design-system-react/src/components/ssm-table';

<Card title="제목" elevation={2}>
  <Button variant="primary">클릭</Button>
</Card>
```

## Design System 컴포넌트 목록

### 🎨 사용 가능한 컴포넌트들

#### Actions & Navigation
- **ssm-button**: 다양한 variant (primary, secondary, tertiary, danger)
- **ssm-text-link**: 링크 버튼 컴포넌트
- **ssm-arrow-pagination**: 화살표 페이지네이션
- **ssm-pagination**: 일반 페이지네이션

#### Layout & Containers
- **ssm-accordion**: 아코디언 컴포넌트
- **ssm-tab**: 탭 컴포넌트
- **ssm-layer-popup**: 팝업 레이어
- **ssm-layer-alert**: 알림 레이어

#### Forms & Inputs
- **ssm-input**: 기본 입력 필드
- **ssm-text-field**: 텍스트 필드 (라벨 포함)
- **ssm-check**: 체크박스 컴포넌트
- **ssm-radio**: 라디오 버튼 컴포넌트
- **ssm-switch**: 스위치 컴포넌트
- **ssm-dropdown**: 드롭다운 컴포넌트

#### Data Display
- **ssm-table**: 데이터 테이블 컴포넌트
- **ssm-badge**: 배지 컴포넌트
- **ssm-chip**: 칩 컴포넌트
- **ssm-tag**: 태그 컴포넌트
- **ssm-labeled-text**: 라벨이 있는 텍스트
- **ssm-text**: 기본 텍스트 컴포넌트

#### Feedback & Status
- **ssm-toast**: 토스트 알림
- **ssm-notice**: 공지사항 컴포넌트
- **ssm-error**: 에러 표시 컴포넌트
- **ssm-helper-text**: 도움말 텍스트
- **ssm-tooltip**: 툴팁 컴포넌트
- **ssm-loading-spinner**: 로딩 스피너

#### Icons & Media
- **ssm-icon**: 아이콘 컴포넌트
- **env-badge**: 환경 배지 (React만)

## 설치 및 설정

### 1. Design System 패키지 설치

✅ **Private 저장소 사용**: `ssm-web` 저장소는 private로 되어있지만, 인증을 통해 사용할 수 있습니다.

**설치 방법들:**

#### 방법 1: SSH 키 사용 (권장)
```bash
# 1. SSH 키 생성 및 GitHub 등록 (한 번만 설정)
ssh-keygen -t ed25519 -C "your_email@example.com"
# 생성된 공개 키를 GitHub → Settings → SSH and GPG keys에 등록

# 2. SSH 연결 테스트
ssh -T git@github.com

# 3. Private 저장소에서 패키지 설치
yarn add git+ssh://git@github.com/dealicious-inc/ssm-web.git#master

# 또는 특정 패키지만 설치
yarn add git+ssh://git@github.com/dealicious-inc/ssm-web.git#master:packages/design-system-react
```

#### 방법 2: Personal Access Token 사용
```bash
# 1. GitHub → Settings → Developer settings → Personal access tokens에서 토큰 생성
# 2. 필요한 권한: repo (전체 저장소 접근)

# 3. Personal Access Token을 사용한 설치
yarn add git+https://<YOUR_TOKEN>@github.com/dealicious-inc/ssm-web.git#master
```

#### 방법 3: 환경 변수 사용
```bash
export GITHUB_TOKEN=your_personal_access_token

yarn add git+https://${GITHUB_TOKEN}@github.com/dealicious-inc/ssm-web.git#master
```

### 2. 컴포넌트 사용

✅ **Private 저장소에서 설치한 경우**: 아래 코드로 컴포넌트를 사용할 수 있습니다.

```tsx
// 만약 패키지가 설치된다면 이렇게 사용할 수 있습니다
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Input } from '@dealicious/design-system-react/src/components/ssm-input';
import { Badge } from '@dealicious/design-system-react/src/components/ssm-badge';
import { Toast } from '@dealicious/design-system-react/src/components/ssm-toast';

function MyComponent() {
  return (
    <div>
      <Input placeholder="입력하세요" />
      <Button variant="primary">저장</Button>
      <Badge variant="success">완료</Badge>
    </div>
  );
}
```

**실제 사용 가능한 대안:**
```tsx
// Material-UI 사용 예시
import { Button, TextField, Chip } from '@mui/material';

function MyComponent() {
  return (
    <div>
      <TextField placeholder="입력하세요" />
      <Button variant="contained">저장</Button>
      <Chip label="완료" color="success" />
    </div>
  );
}
```

## 생성된 컴포넌트 예제

### ExchangeRateCard 컴포넌트
```tsx
// Design System 컴포넌트들을 조합하여 생성
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Input } from '@dealicious/design-system-react/src/components/ssm-input';
import { Badge } from '@dealicious/design-system-react/src/components/ssm-badge';
import { Table } from '@dealicious/design-system-react/src/components/ssm-table';
import { Text } from '@dealicious/design-system-react/src/components/ssm-text';
import { LoadingSpinner } from '@dealicious/design-system-react/src/components/ssm-loading-spinner';

const ExchangeRateCard = () => {
  return (
    <div className="exchange-rate-card">
      <div className="filter-section">
        <Input placeholder="검색어 입력" />
        <Button variant="primary">검색</Button>
      </div>
      
      <div className="stats-section">
        <Badge variant="info">총 결제 건수: 1,234</Badge>
        <Text size="large">환율 정보</Text>
      </div>
      
      <Table 
        data={paymentData}
        columns={columns}
        sortable={true}
        pagination={true}
      />
      
      <LoadingSpinner size="medium" />
    </div>
  );
};
```

## MCP 서버 사용법

### 1. Figma 디자인 분석
```bash
# MCP 서버 시작
yarn dev

# Figma 파일 분석
# convert_figma_to_react 도구 사용
```

### 2. Design System 매핑
- Figma 컴포넌트 → Design System 컴포넌트 자동 매핑
- ssm-button, ssm-input, ssm-badge, ssm-table, ssm-toast 등으로 변환
- 별도 CSS 없이 Design System 스타일 사용
- 30개 이상의 컴포넌트 자동 매핑 지원

## 장점

### 🎯 일관성
- 모든 컴포넌트가 동일한 Design System 사용
- 브랜드 가이드라인 준수

### 🚀 효율성  
- 별도 CSS 작성 불필요
- 기존 Design System 컴포넌트 재사용

### 🔧 유지보수성
- Design System 업데이트 시 자동 반영
- 중앙화된 스타일 관리

## Design System 저장소

✅ **올바른 저장소 경로**:

- **웹 Design System (Private)**: https://github.com/dealicious-inc/ssm-web
- **iOS Design System**: https://github.com/dealicious-inc/ssm-mobile-ios-design-system  
- **Android Design System**: https://github.com/dealicious-inc/ssm-mobile-android-design-system

ℹ️ **참고**: `ssm-web` 저장소는 private로 되어있어 인증이 필요합니다.

**대안 Design System 저장소들:**
- **Material-UI**: https://github.com/mui/material-ui
- **Chakra UI**: https://github.com/chakra-ui/chakra-ui
- **Ant Design**: https://github.com/ant-design/ant-design
- **Mantine**: https://github.com/mantinedev/mantine

## 결론

이 프로젝트의 목적은 **별도의 CSS를 생성하는 것이 아니라**, 기존 Design System 컴포넌트들을 활용하여 Figma 디자인을 React/Vue 컴포넌트로 변환하는 것입니다. 

모든 스타일링은 Design System에서 제공되며, 개발자는 비즈니스 로직에만 집중할 수 있습니다.

## 🚨 현재 상황 및 해결 방안

### 문제점
- `@dealicious/design-system-react` 패키지가 npm registry에 존재하지 않음
- `ssm-web` 저장소가 private로 되어있어 인증 없이는 접근할 수 없음
- 문서의 설치 방법이 인증 과정을 포함하지 않음

### 해결 방안

#### 1. Private 저장소 접근 (권장)
```bash
# SSH 키 사용 (가장 안전한 방법)
yarn add git+ssh://git@github.com/dealicious-inc/ssm-web.git#master

# 또는 Personal Access Token 사용
yarn add git+https://<YOUR_TOKEN>@github.com/dealicious-inc/ssm-web.git#master
```

#### 2. 대체 Design System 사용 (fallback)
```bash
# Private 저장소 접근이 어려운 경우
yarn add @mui/material @emotion/react @emotion/styled
yarn add @mui/icons-material

# 또는 Chakra UI
yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

#### 3. 장기 해결책
1. **npm 패키지 배포**: `@dealicious/design-system-react` 패키지를 npm registry에 배포
2. **Private 저장소 공개**: 필요시 `ssm-web` 저장소를 public으로 전환
3. **GitHub Packages 사용**: GitHub Packages를 통해 private 패키지 배포

#### 4. 프로젝트 수정 필요사항
- `src/services/design-system.ts` 파일에서 실제 존재하는 패키지로 변경
- `src/services/code-generator.ts`에서 import 경로 수정
- MCP 서버의 컴포넌트 매핑 로직 업데이트


