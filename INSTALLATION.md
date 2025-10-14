# Design System MCP 설치 가이드

이 가이드는 팀원들이 Design System MCP를 Cursor IDE에 설정하는 방법을 설명합니다.

## 1. 프로젝트 설치

### 방법 1: npm으로 전역 설치 (권장)

```bash
# 프로젝트 클론
git clone <repository-url>
cd design-system-mcp

# 의존성 설치 및 빌드
npm install

# 전역 설치 (선택사항)
npm link
```

### 방법 2: npx로 직접 사용

```bash
# 프로젝트 클론
git clone <repository-url>
cd design-system-mcp

# 의존성 설치 및 빌드
npm install
```

## 2. 환경 변수 설정

### Figma Access Token 발급

1. [Figma](https://figma.com)에 로그인
2. Settings → Account → Personal Access Tokens
3. "Create new token" 클릭
4. 토큰 이름 입력 후 생성
5. 생성된 토큰을 복사

### 환경 변수 설정

#### 방법 1: .env 파일 생성 (로컬 개발용)

```bash
# 프로젝트 루트에 .env 파일 생성
echo "FIGMA_ACCESS_TOKEN=your_figma_access_token_here" > .env
```

#### 방법 2: 시스템 환경 변수 설정 (전역 사용용)

**macOS/Linux:**
```bash
# ~/.zshrc 또는 ~/.bashrc에 추가
export FIGMA_ACCESS_TOKEN="your_figma_access_token_here"

# 설정 적용
source ~/.zshrc
```

**Windows:**
```cmd
# 시스템 환경 변수에 추가
setx FIGMA_ACCESS_TOKEN "your_figma_access_token_here"
```

## 3. Cursor IDE 설정

### MCP 설정 파일 위치

Cursor IDE의 MCP 설정 파일은 다음 위치에 있습니다:

- **macOS**: `~/.cursor/mcp.json`
- **Windows**: `%APPDATA%\Cursor\User\mcp.json`
- **Linux**: `~/.config/cursor/mcp.json`

### 설정 파일 생성/수정

```json
{
  "mcpServers": {
    "design-system-mcp": {
      "command": "npx",
      "args": ["design-system-mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
      }
    }
  }
}
```

### 절대 경로 사용 (권장)

만약 npx가 작동하지 않는다면 절대 경로를 사용하세요:

```json
{
  "mcpServers": {
    "design-system-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/design-system-mcp/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
      }
    }
  }
}
```

## 4. Cursor IDE 재시작

설정을 완료한 후 Cursor IDE를 재시작하여 MCP 서버가 로드되도록 합니다.

## 5. 사용법 테스트

Cursor IDE에서 다음과 같이 테스트해보세요:

```
사용 가능한 React 컴포넌트 목록을 보여줘
```

또는

```
https://www.figma.com/file/your-file-id/your-design을 React 컴포넌트로 변환해줘
```

## 문제 해결

### 1. MCP 서버가 로드되지 않는 경우

- Cursor IDE를 완전히 재시작
- 환경 변수가 올바르게 설정되었는지 확인
- 프로젝트가 올바르게 빌드되었는지 확인 (`npm run build`)

### 2. Figma API 오류

- Figma Access Token이 유효한지 확인
- 토큰에 필요한 권한이 있는지 확인

### 3. 경로 오류

- 절대 경로를 사용하는 경우 경로가 올바른지 확인
- npx를 사용하는 경우 프로젝트가 전역으로 설치되었는지 확인

## 팀 공유 방법

### 1. Git 저장소 공유

```bash
# 팀원들이 클론할 수 있도록 저장소 공유
git clone <repository-url>
cd design-system-mcp
npm install
```

### 2. npm 패키지로 배포 (고급)

```bash
# npm에 패키지 배포
npm publish

# 팀원들이 설치
npm install -g design-system-mcp
```

### 3. Docker 사용 (고급)

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", "dist/index.js"]
```

## 추가 설정

### 개발 모드 사용

개발 중에는 다음과 같이 설정할 수 있습니다:

```json
{
  "mcpServers": {
    "design-system-mcp": {
      "command": "npm",
      "args": ["run", "mcp:dev"],
      "cwd": "/path/to/design-system-mcp",
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
      }
    }
  }
}
```

이렇게 하면 TypeScript 파일을 직접 실행하여 개발 중 변경사항을 즉시 반영할 수 있습니다.
