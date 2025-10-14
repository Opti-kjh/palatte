# smithery.ai 등록 가이드

## 📋 등록 전 체크리스트

### ✅ 완료된 작업들

- [x] **MCP 서버 구현 완료**
  - Figma API 연동
  - React/Vue 코드 생성
  - 디자인 시스템 컴포넌트 매핑
  - 4개 주요 도구 제공

- [x] **패키지 최적화 완료**
  - `package.json` smithery.ai 등록용으로 최적화
  - npm 배포 준비 완료
  - 바이너리 실행 파일 설정

- [x] **문서화 완료**
  - `SMITHERY_README.md`: smithery.ai용 README
  - `smithery.json`: smithery.ai 등록 설정 파일
  - 사용법 및 예시 포함

- [x] **테스트 완료**
  - 모든 서비스 테스트 통과
  - MCP 서버 정상 작동 확인
  - 빌드 성공 확인

## 🚀 smithery.ai 등록 단계

### 1. GitHub 저장소 준비

```bash
# GitHub에 저장소 생성 후
git init
git add .
git commit -m "Initial commit: Design System MCP"
git branch -M main
git remote add origin https://github.com/your-username/design-system-mcp.git
git push -u origin main
```

### 2. npm 패키지 배포

```bash
# npm 로그인
npm login

# 패키지 배포
npm publish
```

### 3. smithery.ai 등록

1. **smithery.ai 웹사이트 방문**: https://smithery.ai
2. **새 MCP 등록** 클릭
3. **다음 정보 입력**:

#### 기본 정보
- **Name**: `디자인 시스템 MCP`
- **Description**: `기존 디자인 시스템을 활용하여 Figma 디자인을 React/Vue 컴포넌트로 변환`
- **Category**: `디자인 & 개발`
- **Tags**: `figma, react, vue, design-system, mcp, ai`

#### 기술 정보
- **Repository URL**: `https://github.com/your-username/design-system-mcp`
- **NPM Package**: `design-system-mcp`
- **Version**: `1.0.0`
- **License**: `MIT`

#### 설치 정보
- **Install Command**: `npm install design-system-mcp`
- **Requirements**: 
  - Node.js >= 18.0.0
  - Figma 액세스 토큰

#### Cursor AI 설정
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

#### 사용 예시
```
<FigmaURL>을 React 컴포넌트로 변환해줘
<FigmaURL>을 Vue 컴포넌트로 변환해줘
```

### 4. 등록 후 확인사항

- [ ] smithery.ai에서 MCP가 정상적으로 표시되는지 확인
- [ ] 사용자가 설치할 수 있는지 테스트
- [ ] Cursor AI에서 MCP가 작동하는지 확인
- [ ] 문서 링크들이 정상 작동하는지 확인

## 📁 등록에 필요한 파일들

### 필수 파일들
- ✅ `package.json` - npm 패키지 설정
- ✅ `dist/index.js` - 빌드된 MCP 서버
- ✅ `README.md` - 기본 문서
- ✅ `SMITHERY_README.md` - smithery.ai용 README
- ✅ `smithery.json` - smithery.ai 설정 파일
- ✅ `LICENSE` - MIT 라이선스

### 추가 파일들
- ✅ `QUICK_START.md` - 빠른 시작 가이드
- ✅ `USAGE.md` - 상세 사용법
- ✅ `INSTALLATION.md` - 설치 가이드
- ✅ `CHANGELOG.md` - 변경 이력

## 🎯 등록 후 마케팅 포인트

### 주요 기능
1. **Figma → React/Vue 변환**: 디자인을 코드로 자동 변환
2. **기존 디자인 시스템 활용**: 회사 디자인 시스템 컴포넌트 재사용
3. **Cursor AI 통합**: AI와 함께 디자인-개발 워크플로우 최적화
4. **스마트 매핑**: Figma 컴포넌트를 디자인 시스템 컴포넌트로 자동 매핑

### 타겟 사용자
- **프론트엔드 개발자**: 디자인-개발 워크플로우 최적화
- **디자이너**: 디자인을 코드로 빠르게 변환
- **팀 리드**: 디자인 시스템 활용도 향상
- **스타트업**: 빠른 프로토타이핑

### 경쟁 우위
- **기존 디자인 시스템 활용**: 새로 만들지 않고 기존 시스템 활용
- **AI 통합**: Cursor AI와 완벽 통합
- **멀티 프레임워크**: React와 Vue 모두 지원
- **스마트 매핑**: 자동 컴포넌트 매핑

## 🔗 등록 후 링크들

- **GitHub 저장소**: https://github.com/your-username/design-system-mcp
- **NPM 패키지**: https://www.npmjs.com/package/design-system-mcp
- **smithery.ai 페이지**: https://smithery.ai/mcp/design-system-mcp
- **문서**: https://github.com/your-username/design-system-mcp#readme

## 📞 지원 및 문의

- **GitHub 이슈**: https://github.com/your-username/design-system-mcp/issues
- **이메일**: jongho@example.com
- **문서**: https://github.com/your-username/design-system-mcp#readme

---

🎉 **등록 완료 후 모든 사용자가 쉽게 사용할 수 있는 MCP가 됩니다!**
