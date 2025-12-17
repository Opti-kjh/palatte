# Palette MCP

Figma 디자인을 기존 Design System 컴포넌트를 활용하여 React/Vue 코드로 변환하는 MCP(Model Context Protocol) 서버입니다.

[![smithery badge](https://smithery.ai/badge/@Opti-kjh/palette)](https://smithery.ai/server/@Opti-kjh/palette)
[![Smithery](https://img.shields.io/badge/Smithery-Install-blue)](https://smithery.ai/server/@anthropic/palette-mcp)
[![npm version](https://img.shields.io/npm/v/@anthropic/palette-mcp.svg)](https://www.npmjs.com/package/@anthropic/palette-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 빠른 시작

### Smithery.ai에서 설치 (권장)

1. [Smithery.ai](https://smithery.ai)에서 `palette-mcp` 검색
2. "Install" 클릭
3. 환경 변수 입력:
   - `FIGMA_ACCESS_TOKEN`: Figma API 토큰 (필수)
   - `GITHUB_TOKEN`: GitHub 토큰 (선택, 디자인 시스템 접근용)

### Cursor에서 수동 설치

`~/.cursor/mcp.json` 파일에 다음 추가:

```json
{
  "mcpServers": {
    "palette": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/palette-mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_FIGMA_TOKEN_HERE"
      }
    }
  }
}
```

### 환경 변수

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `FIGMA_ACCESS_TOKEN` | ✅ | Figma Personal Access Token |
| `GITHUB_TOKEN` | ❌ | GitHub 토큰 (디자인 시스템 패키지 접근용) |
| `FIGMA_MCP_SERVER_URL` | ❌ | Figma MCP 서버 URL (기본값: http://127.0.0.1:3845/mcp) |

#### Figma Access Token 발급:
1. [Figma](https://www.figma.com) → Settings → Account
2. Personal Access Tokens → Generate new token

---

## 📖 사용법

### Cursor에서 사용

Figma에서 디자인을 선택하고 "Copy link to selection"으로 URL을 복사한 후:

```
https://www.figma.com/design/akI7EwlWemAf8KJup9F2ZS/...?node-id=45733-32370 
를 React 코드로 작성해줘
```

### 지원하는 명령

| 명령 | 설명 |
|------|------|
| `convert_figma_to_react` | Figma 디자인을 React 컴포넌트로 변환 |
| `convert_figma_to_vue` | Figma 디자인을 Vue 컴포넌트로 변환 |
| `list_design_system_components` | 사용 가능한 디자인 시스템 컴포넌트 목록 |
| `analyze_figma_file` | Figma 파일 구조 분석 |

---

## 🎨 지원하는 Design System 컴포넌트

### React Components (`@dealicious/design-system-react`)

| 카테고리 | 컴포넌트 |
|----------|----------|
| **Actions** | Button, TextLink |
| **Forms** | Input, Check, Radio, Switch, Dropdown, TextField |
| **Data Display** | Text, Tag, Chip, Badge, LabeledText |
| **Feedback** | Toast, Notice, Error, LoadingSpinner, Tooltip |
| **Navigation** | Tab, Pagination, ArrowPagination, Accordion |
| **Overlays** | LayerPopup, LayerAlert |

### Vue Components (`@dealicious/design-system`)

| 카테고리 | 컴포넌트 |
|----------|----------|
| **Actions** | SsmButton, SsmTextLink |
| **Forms** | SsmInput, SsmCheck, SsmSwitch, SsmDropdown |
| **Data Display** | SsmText, SsmTag, SsmChip, SsmBadge |
| **Navigation** | SsmTab, SsmPagination, SsmAccordion |

---

## 🔧 로컬 개발

### 설치

```bash
git clone https://github.com/Opti-kjh/palette.git
cd palette
yarn install
```

### 환경 설정

```bash
cp .env.example .env
# .env 파일에 FIGMA_ACCESS_TOKEN 추가
```

### 빌드 및 실행

```bash
# 빌드
yarn build

# 개발 모드
yarn dev

# MCP 서버 실행
yarn mcp
```

### 테스트

```bash
# MCP Inspector로 테스트
npx @anthropic-ai/mcp-inspector ./dist/index.js
```

---

## 📁 프로젝트 구조

```
src/
├── index.ts                 # MCP 서버 메인 파일
├── services/
│   ├── figma.ts            # Figma API 연동
│   ├── design-system.ts    # 디자인 시스템 메타데이터
│   └── code-generator.ts   # React/Vue 코드 생성
└── utils/
    ├── figma-mcp-client.ts # Figma MCP 클라이언트
    └── request-manager.ts  # 요청 관리
```

---

## ⚠️ 중요: 디자인 시스템 사용 원칙

이 MCP 서버는 **항상 디자인 시스템 컴포넌트를 사용**합니다.

- ❌ Tailwind CSS 사용 금지
- ❌ 일반 HTML/CSS 사용 금지
- ✅ 디자인 시스템 컴포넌트만 사용

---

## 🤝 기여

이슈 및 PR은 [GitHub](https://github.com/Opti-kjh/palette)에서 환영합니다.

## 📄 라이선스

MIT License - [LICENSE](./LICENSE) 참조