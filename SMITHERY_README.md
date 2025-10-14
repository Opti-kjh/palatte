# 디자인 시스템 MCP

🚀 **기존 디자인 시스템을 활용하여 Figma 디자인을 React/Vue 컴포넌트로 변환**

회사의 기존 디자인 시스템 컴포넌트를 활용하여 Figma 디자인을 React 또는 Vue 컴포넌트로 변환하는 MCP (Model Context Protocol) 서버입니다.

## ✨ 주요 기능

- 🎨 **Figma 통합**: 디자인 분석을 위한 Figma API 직접 연결
- ⚛️ **React 코드 생성**: 디자인 시스템을 활용한 React 컴포넌트 생성
- 🖖 **Vue 코드 생성**: 디자인 시스템을 활용한 Vue 컴포넌트 생성  
- 🔍 **스마트 컴포넌트 매핑**: Figma 컴포넌트를 디자인 시스템으로 자동 매핑
- 📊 **디자인 분석**: Figma 파일 분석 및 컴포넌트 매핑 제안
- 🛠️ **Cursor AI 통합**: Cursor AI와 완벽하게 연동

## 🎯 사용 사례

- **디자인을 코드로**: Figma 디자인을 프로덕션 준비된 React/Vue 컴포넌트로 변환
- **디자인 시스템 통합**: 기존 컴포넌트 라이브러리 활용
- **빠른 프로토타이핑**: 디자인에서 컴포넌트를 빠르게 생성
- **디자인 핸드오프**: 디자인-개발 프로세스 간소화

## 🚀 빠른 시작

### 설치

```bash
npm install design-system-mcp
```

### 환경 설정

1. Figma 액세스 토큰 받기:
   - Figma → 설정 → 계정 → 개인 액세스 토큰으로 이동
   - 새 토큰 생성

2. 환경 변수 설정:
   ```bash
   export FIGMA_ACCESS_TOKEN="your_token_here"
   ```

### Cursor AI 설정

Cursor AI MCP 설정에 추가:

```json
{
  "mcpServers": {
    "design-system-mcp": {
      "command": "npx",
      "args": ["design-system-mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_figma_token_here"
      }
    }
  }
}
```

## 📖 사용법

### 기본 사용법

Cursor AI에 Figma URL을 제공하기만 하면 됩니다:

```
<FigmaURL>을 React 컴포넌트로 변환해줘
```

또는

```
<FigmaURL>을 Vue 컴포넌트로 변환해줘
```

### 사용 가능한 도구들

#### 1. `convert_figma_to_react`
Figma 디자인을 React 컴포넌트로 변환

**매개변수:**
- `figmaUrl`: Figma 파일 URL 또는 파일 ID
- `componentName`: 생성될 컴포넌트 이름
- `nodeId`: (선택사항) 변환할 특정 노드 ID

#### 2. `convert_figma_to_vue`
Figma 디자인을 Vue 컴포넌트로 변환

**매개변수:**
- `figmaUrl`: Figma 파일 URL 또는 파일 ID  
- `componentName`: 생성될 컴포넌트 이름
- `nodeId`: (선택사항) 변환할 특정 노드 ID

#### 3. `list_design_system_components`
사용 가능한 디자인 시스템 컴포넌트 목록

**매개변수:**
- `framework`: "react" 또는 "vue"

#### 4. `analyze_figma_file`
Figma 파일 구조 분석 및 매핑 제안

**매개변수:**
- `figmaUrl`: Figma 파일 URL 또는 파일 ID

## 🏗️ 아키텍처

```
src/
├── index.ts                 # MCP 서버 진입점
├── services/
│   ├── figma.ts          # Figma API 통합
│   ├── design-system.ts  # 디자인 시스템 컴포넌트 관리
│   └── code-generator.ts # React/Vue 코드 생성
```

## 🎨 지원되는 디자인 시스템

이 MCP는 다음 디자인 시스템과 통합됩니다:

- **React**: [design-system-react](https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system-react)
- **Vue**: [design-system](https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system)

### 사용 가능한 컴포넌트

#### React 컴포넌트
- **Button**: 다양한 변형과 크기
- **Input**: 유효성 검사가 포함된 텍스트 입력
- **Card**: 콘텐츠 그룹화 컨테이너
- **Modal**: 오버레이 다이얼로그
- **Table**: 정렬/페이지네이션이 있는 데이터 테이블

#### Vue 컴포넌트
- **Button**: 다양한 변형과 크기
- **Input**: v-model을 지원하는 텍스트 입력
- **Card**: 콘텐츠 그룹화 컨테이너

## 📝 출력 예시

### React 컴포넌트
```tsx
import React from 'react';
import { Button } from 'design-system-react/Button';
import { Card } from 'design-system-react/Card';

interface MyComponentProps {
  // 여기에 props를 추가하세요
}

const MyComponent: React.FC<MyComponentProps> = (props) => {
  return (
    <div className="my-component-root">
      <Card title="My Card">
        <Button variant="primary" size="medium">
          Click me
        </Button>
      </Card>
    </div>
  );
};

export default MyComponent;
```

### Vue 컴포넌트
```vue
<template>
  <div class="my-component-root">
    <Card title="My Card">
      <Button variant="primary" size="medium">
        Click me
      </Button>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Button } from 'design-system/Button';
import { Card } from 'design-system/Card';
</script>

<style scoped>
.my-component-root {
  /* 여기에 스타일을 추가하세요 */
}
</style>
```

## 🔧 개발

### 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/your-username/design-system-mcp.git
cd design-system-mcp

# 의존성 설치
npm install

# 프로젝트 빌드
npm run build

# 개발 모드로 실행
npm run dev
```

### 테스트

```bash
# 테스트 실행
npm test

# 서비스 테스트
npm run test:services
```

## 📋 요구사항

- Node.js >= 18.0.0
- Figma 액세스 토큰
- Cursor AI (MCP 통합용)

## 🤝 기여하기

1. 저장소 포크
2. 기능 브랜치 생성
3. 변경사항 적용
4. 필요시 테스트 추가
5. 풀 리퀘스트 제출

## 📄 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🆘 지원

- **이슈**: [GitHub Issues](https://github.com/your-username/design-system-mcp/issues)
- **문서**: [전체 문서](https://github.com/your-username/design-system-mcp#readme)

## 🔗 링크

- **저장소**: https://github.com/your-username/design-system-mcp
- **NPM 패키지**: https://www.npmjs.com/package/design-system-mcp
- **디자인 시스템 React**: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system-react
- **디자인 시스템 Vue**: https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system

---

디자인 시스템 커뮤니티를 위해 ❤️로 만들었습니다
