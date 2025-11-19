# Palette

Figma 디자인을 기존 Design System 컴포넌트를 활용하여 React/Vue 코드로 변환하는 MCP(Model Context Protocol) 서버입니다.

> 🚀 **빠른 시작**: [QUICK_START.md](./QUICK_START.md) - 1분 만에 설정하고 사용하기

## 기능

- 🎨 **Figma 연동**: Figma Desktop MCP 서버 또는 REST API를 통해 디자인 파일 분석
- 🔌 **MCP 통합**: Figma Desktop MCP 서버를 우선 사용하고, 실패 시 REST API로 자동 폴백
- ⚛️ **React 코드 생성**: 기존 Design System 컴포넌트를 활용한 React 컴포넌트 생성
- 🖖 **Vue 코드 생성**: 기존 Design System 컴포넌트를 활용한 Vue 컴포넌트 생성
- 🔍 **컴포넌트 매핑**: Figma 컴포넌트와 Design System 컴포넌트 자동 매핑
- 📊 **파일 분석**: Figma 파일 구조 분석 및 컴포넌트 추천

## 빠른 설치

### 자동 설치 (권장)

**macOS/Linux:**
```bash
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### 수동 설치

```bash
yarn install
yarn build
```

## 환경 설정

자동 설치 스크립트를 사용하면 환경 설정이 자동으로 처리됩니다. 수동 설정이 필요한 경우:

1. `.env` 파일을 생성하고 다음 내용을 추가:

```env
FIGMA_ACCESS_TOKEN=your_figma_access_token_here

# 선택사항: Figma Desktop MCP 서버 설정
FIGMA_MCP_SERVER_URL=http://127.0.0.1:3845/mcp
USE_FIGMA_MCP=true
```

2. Figma Access Token 발급:
   - Figma → Settings → Account → Personal Access Tokens
   - 새 토큰 생성 후 `.env` 파일에 추가

3. (선택사항) Figma Desktop MCP 서버 활성화:
   - Figma Desktop 앱 실행
   - 환경설정(Preferences) → Dev Mode MCP 서버 활성화
   - MCP 서버가 활성화되면 자동으로 `http://127.0.0.1:3845/mcp`에서 실행됩니다
   - MCP 서버가 사용 불가능한 경우 자동으로 REST API로 폴백됩니다

4. Cursor IDE MCP 설정:
   - 자동 설치 스크립트가 설정을 자동으로 처리합니다
   - 수동 설정이 필요한 경우 `INSTALLATION.md` 참고

## 사용법

### MCP 서버 실행

```bash
yarn start
```

### 사용 가능한 도구

#### 1. Figma를 React 컴포넌트로 변환
```
convert_figma_to_react
- figmaUrl: Figma 파일 URL 또는 파일 ID
- componentName: 생성할 컴포넌트 이름
- nodeId: (선택사항) 특정 노드 ID
```

#### 2. Figma를 Vue 컴포넌트로 변환
```
convert_figma_to_vue
- figmaUrl: Figma 파일 URL 또는 파일 ID
- componentName: 생성할 컴포넌트 이름
- nodeId: (선택사항) 특정 노드 ID
```

#### 3. Design System 컴포넌트 목록 조회
```
list_design_system_components
- framework: "react" 또는 "vue"
```

#### 4. Figma 파일 분석
```
analyze_figma_file
- figmaUrl: Figma 파일 URL 또는 파일 ID
```

## 예시 사용법

### Cursor AI에서 사용

1. **React 컴포넌트 생성**:
   ```
   <FigmaURL>을 React 컴포넌트로 변환해줘
   ```

2. **Vue 컴포넌트 생성**:
   ```
   <FigmaURL>을 Vue 컴포넌트로 변환해줘
   ```

3. **특정 노드 변환**:
   ```
   <FigmaURL>의 특정 노드를 React 컴포넌트로 변환해줘
   ```

## 지원하는 Design System 컴포넌트

이 프로젝트는 [dealicious-inc/ssm-web](https://github.com/dealicious-inc/ssm-web) 저장소의 Design System 패키지들을 사용합니다:

### React Components
- **Button**: 다양한 variant와 size 지원
- **Input**: 텍스트 입력 필드 with validation
- **Card**: 콘텐츠 그룹화를 위한 카드 컴포넌트
- **Modal**: 오버레이 다이얼로그
- **Table**: 데이터 테이블 with sorting/pagination

### Vue Components
- **Button**: 다양한 variant와 size 지원
- **Input**: v-model 지원하는 텍스트 입력 필드
- **Card**: 콘텐츠 그룹화를 위한 카드 컴포넌트

### Design System 패키지
- **React**: `design-system-react` - React 컴포넌트 라이브러리
- **Vue**: `design-system` - Vue 컴포넌트 라이브러리

## 아키텍처

```
src/
├── index.ts                 # MCP 서버 메인 파일
├── services/
│   ├── figma.ts          # Figma MCP/REST API 연동 서비스
│   ├── design-system.ts  # Design System 컴포넌트 관리
│   └── code-generator.ts # React/Vue 코드 생성
└── utils/
    └── figma-mcp-client.ts # Figma Desktop MCP 클라이언트
```

### Figma 데이터 가져오기 흐름

1. **MCP 우선 사용**: Figma Desktop MCP 서버가 활성화되어 있으면 MCP를 통해 데이터 가져오기
2. **자동 폴백**: MCP 서버 연결 실패 시 기존 REST API로 자동 전환
3. **데이터 변환**: MCP 응답을 기존 `FigmaFile` 형식으로 변환하여 기존 코드와 호환성 유지

## 개발

```bash
# 개발 모드 실행
yarn dev

# 빌드
yarn build

# 테스트
yarn test
```

## 라이선스

MIT
# palatte
