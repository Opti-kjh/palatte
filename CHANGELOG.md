# Changelog

## [1.0.0] - 2024-01-01

### Added
- 🎨 Figma API 연동 기능
- ⚛️ React 컴포넌트 자동 생성
- 🖖 Vue 컴포넌트 자동 생성
- 🔍 Design System 컴포넌트 매핑
- 📊 Figma 파일 구조 분석
- 🛠️ MCP 서버 구현

### Features
- **Figma 연동**: Figma API를 통한 디자인 파일 분석
- **컴포넌트 매핑**: Figma 컴포넌트와 Design System 컴포넌트 자동 매핑
- **코드 생성**: React/Vue 컴포넌트 자동 생성
- **Design System 통합**: 기존 Design System 컴포넌트 활용

### Supported Design System Components

#### React Components
- Button (다양한 variant와 size 지원)
- Input (validation 지원)
- Card (콘텐츠 그룹화)
- Modal (오버레이 다이얼로그)
- Table (데이터 테이블 with sorting/pagination)

#### Vue Components
- Button (다양한 variant와 size 지원)
- Input (v-model 지원)
- Card (콘텐츠 그룹화)

### Tools
- `convert_figma_to_react`: Figma → React 컴포넌트 변환
- `convert_figma_to_vue`: Figma → Vue 컴포넌트 변환
- `list_design_system_components`: Design System 컴포넌트 목록 조회
- `analyze_figma_file`: Figma 파일 구조 분석

### Technical Details
- TypeScript 기반 구현
- MCP (Model Context Protocol) 서버
- Figma API v1 연동
- Design System 컴포넌트 자동 매핑
- React/Vue 코드 생성 엔진
