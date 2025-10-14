# 🚀 Design System MCP 빠른 시작 가이드

팀원들이 Design System MCP를 빠르게 설정하고 사용하는 방법을 설명합니다.

## 간단 설정

### 1. 프로젝트 클론 및 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd design-system-mcp

# 자동 설치 (macOS/Linux)
./setup.sh

# 또는 Windows
setup.bat
```

### 2. Figma 토큰 설정

1. [Figma](https://figma.com) 로그인
2. Settings → Account → Personal Access Tokens
3. "Create new token" 클릭
4. 생성된 토큰을 `.env` 파일에 설정:

```env
FIGMA_ACCESS_TOKEN=your_token_here
```

### 3. Cursor IDE 재시작

Cursor IDE를 완전히 종료하고 다시 실행합니다.

## 사용법

### 기본 사용법

Cursor IDE에서 다음과 같이 요청하세요:

```
사용 가능한 React 컴포넌트 목록을 보여줘
```

```
https://www.figma.com/file/your-file-id/your-design을 React 컴포넌트로 변환해줘
```

```
https://www.figma.com/file/your-file-id/your-design을 Vue 컴포넌트로 변환해줘
```

### 고급 사용법

#### 특정 노드만 변환
```
https://www.figma.com/file/your-file-id/your-design의 버튼 노드를 React 컴포넌트로 변환해줘
```

#### Figma 파일 분석
```
https://www.figma.com/file/your-file-id/your-design 파일을 분석해줘
```

## 생성되는 코드 예시

### React 컴포넌트
```tsx
import React from 'react';
import { Button } from '@dealicious/design-system-react/Button';
import { Card } from '@dealicious/design-system-react/Card';

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
import { Button } from '@dealicious/design-system/Button';
import { Card } from '@dealicious/design-system/Card';
</script>

<style scoped>
.my-component-root {
  /* Add your styles here */
}
</style>
```

## 문제 해결

### MCP 서버가 로드되지 않는 경우

1. Cursor IDE를 완전히 재시작
2. 환경 변수 확인: `echo $FIGMA_ACCESS_TOKEN` (macOS/Linux) 또는 `echo %FIGMA_ACCESS_TOKEN%` (Windows)
3. 프로젝트 빌드 확인: `npm run build`

### Figma API 오류

1. Figma 토큰이 유효한지 확인
2. 토큰에 필요한 권한이 있는지 확인
3. 네트워크 연결 상태 확인

### 코드 생성이 안 되는 경우

1. Figma URL이 올바른지 확인
2. Figma 파일이 공개되어 있는지 확인
3. Design System 컴포넌트가 올바르게 매핑되었는지 확인

## 추가 도움말

- 자세한 설치 방법: `INSTALLATION.md`
- 전체 사용법: `USAGE.md`
- 문제가 있다면 팀 채널에 문의하세요!

## 팀 공유

이 MCP 서버를 팀원들과 공유하려면:

1. Git 저장소에 푸시
2. 팀원들에게 저장소 URL 공유
3. 팀원들이 위의 "1분 설정" 과정을 따라하면 됩니다

```bash
# 팀원들이 실행할 명령어
git clone <repository-url>
cd design-system-mcp
./setup.sh  # 또는 setup.bat
```
