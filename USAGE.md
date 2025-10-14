# Design System MCP 사용법

## 설치 및 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 Figma Access Token을 설정합니다:

```env
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
```

### 3. 빌드
```bash
npm run build
```

## Cursor AI에서 사용하기

### 1. MCP 서버 설정
Cursor AI의 설정에서 MCP 서버를 추가합니다:

```json
{
  "mcpServers": {
    "design-system-mcp": {
      "command": "node",
      "args": ["/path/to/design-system-mcp/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_figma_access_token_here"
      }
    }
  }
}
```

### 2. 사용 예시

#### React 컴포넌트 생성
```
<FigmaURL>을 React 컴포넌트로 변환해줘
```

#### Vue 컴포넌트 생성
```
<FigmaURL>을 Vue 컴포넌트로 변환해줘
```

#### 특정 노드 변환
```
<FigmaURL>의 특정 노드를 React 컴포넌트로 변환해줘
```

## 사용 가능한 도구

### 1. `convert_figma_to_react`
Figma 디자인을 React 컴포넌트로 변환합니다.

**매개변수:**
- `figmaUrl`: Figma 파일 URL 또는 파일 ID
- `componentName`: 생성할 컴포넌트 이름
- `nodeId`: (선택사항) 특정 노드 ID

### 2. `convert_figma_to_vue`
Figma 디자인을 Vue 컴포넌트로 변환합니다.

**매개변수:**
- `figmaUrl`: Figma 파일 URL 또는 파일 ID
- `componentName`: 생성할 컴포넌트 이름
- `nodeId`: (선택사항) 특정 노드 ID

### 3. `list_design_system_components`
사용 가능한 Design System 컴포넌트 목록을 조회합니다.

**매개변수:**
- `framework`: "react" 또는 "vue"

### 4. `analyze_figma_file`
Figma 파일 구조를 분석하고 컴포넌트 매핑을 제안합니다.

**매개변수:**
- `figmaUrl`: Figma 파일 URL 또는 파일 ID

## 예시 사용법

### 1. 기본 사용법
```
사용자: https://www.figma.com/file/abc123/My-Design을 React 컴포넌트로 변환해줘
AI: convert_figma_to_react 도구를 사용하여 React 컴포넌트를 생성합니다.
```

### 2. 특정 노드 변환
```
사용자: https://www.figma.com/file/abc123/My-Design의 버튼 노드를 React 컴포넌트로 변환해줘
AI: convert_figma_to_react 도구를 사용하여 특정 노드를 React 컴포넌트로 변환합니다.
```

### 3. Design System 컴포넌트 조회
```
사용자: 사용 가능한 React 컴포넌트 목록을 보여줘
AI: list_design_system_components 도구를 사용하여 React 컴포넌트 목록을 조회합니다.
```

## 생성되는 코드 예시

### React 컴포넌트
```tsx
import React from 'react';
// React Design System Components from GitHub
// https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system-react
import { Button } from 'design-system-react/Button';
import { Card } from 'design-system-react/Card';

interface MyComponentProps {
  // Add your props here
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
// Vue Design System Components from GitHub
// https://github.com/dealicious-inc/ssm-web/tree/master/packages/design-system
import { Button } from 'design-system/Button';
import { Card } from 'design-system/Card';
</script>

<style scoped>
.my-component-root {
  /* Add your styles here */
}
</style>
```

## 문제 해결

### 1. Figma Access Token 오류
- Figma → Settings → Account → Personal Access Tokens에서 토큰을 생성합니다.
- `.env` 파일에 올바른 토큰을 설정했는지 확인합니다.

### 2. 컴포넌트 매핑 실패
- Figma 컴포넌트 이름을 Design System 컴포넌트와 유사하게 명명합니다.
- `analyze_figma_file` 도구를 사용하여 매핑 제안을 확인합니다.

### 3. 빌드 오류
- TypeScript 버전을 확인합니다.
- `npm run build` 명령어를 실행합니다.

## 개발 및 디버깅

### 서비스 테스트
```bash
npm run test:services
```

### 개발 모드 실행
```bash
npm run dev
```

### 로그 확인
MCP 서버는 stderr로 로그를 출력합니다. Cursor AI의 개발자 도구에서 확인할 수 있습니다.
