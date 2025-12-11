# Design System Local Setup Guide

이 문서는 Palette 프로젝트에서 디자인 시스템 패키지를 로컬로 설정하는 방법을 설명합니다.

## 개요

Palette 프로젝트는 `@dealicious/design-system-react` (React) 및 `@dealicious/design-system` (Vue) 패키지를 사용합니다.
이 패키지들은 monorepo 구조로 되어 있어 npm에서 직접 설치할 수 없으므로, 로컬에서 설정해야 합니다.

## 사전 요구사항

- Node.js 18.0.0 이상
- Yarn
- Git
- GitHub 저장소 접근 권한

## 설정 단계

### 1. ssm-web 저장소 클론

```bash
cd /Users/eos/workspaces
git clone https://github.com/dealicious-inc/ssm-web.git
```

### 2. ssm-web 의존성 설치

```bash
cd /Users/eos/workspaces/ssm-web
yarn install
```

### 3. Symlink 생성

Palette 프로젝트의 node_modules에 symlink를 생성합니다:

```bash
cd /Users/eos/workspaces/palatte

# 기존 디렉토리 제거 (있는 경우)
rm -rf node_modules/@dealicious/design-system-react
rm -rf node_modules/@dealicious/design-system

# Symlink 생성
ln -s /Users/eos/workspaces/ssm-web/packages/design-system-react node_modules/@dealicious/design-system-react
ln -s /Users/eos/workspaces/ssm-web/packages/design-system node_modules/@dealicious/design-system
```

### 4. package.json exports 수정

ssm-web 패키지의 `package.json`에 exports 필드를 추가해야 합니다:

**React (`/Users/eos/workspaces/ssm-web/packages/design-system-react/package.json`):**
```json
"exports": {
  ".": "./dist/index.js",
  "./icon": "./dist/components/ssm-icon/icons/index.js",
  "./style.css": "./dist/style.css",
  "./client": "./svg-component.d.ts",
  "./src/*": "./src/*",
  "./src/components/*": "./src/components/*"
}
```

**Vue (`/Users/eos/workspaces/ssm-web/packages/design-system/package.json`):**
```json
"exports": {
  ".": {
    "import": "./dist/design-system.js",
    "require": "./dist/design-system.umd.cjs",
    "types": "./dist/index.d.ts"
  },
  "./style.css": "./dist/style.css",
  "./src/*": "./src/*",
  "./src/components/*": "./src/components/*"
}
```

### 5. 설치 검증

검증 스크립트를 실행하여 설치가 올바른지 확인합니다:

```bash
cd /Users/eos/workspaces/palatte
node verify-design-system.js
```

## 디렉토리 구조

설정 완료 후 디렉토리 구조:

```
/Users/eos/workspaces/
├── palatte/                          # 현재 프로젝트
│   ├── node_modules/
│   │   └── @dealicious/
│   │       ├── design-system-react -> /Users/eos/workspaces/ssm-web/packages/design-system-react
│   │       └── design-system -> /Users/eos/workspaces/ssm-web/packages/design-system
│   └── ...
└── ssm-web/                          # 디자인 시스템 monorepo
    └── packages/
        ├── design-system-react/      # React 컴포넌트
        │   └── src/components/
        │       ├── ssm-button/
        │       ├── ssm-text/
        │       └── ...
        └── design-system/            # Vue 컴포넌트
            └── src/components/
                ├── SsmButton/
                ├── SsmText/
                └── ...
```

## Import 경로

### React 컴포넌트

```typescript
import { Button } from '@dealicious/design-system-react/src/components/ssm-button';
import { Text } from '@dealicious/design-system-react/src/components/ssm-text';
import { Tag } from '@dealicious/design-system-react/src/components/ssm-tag';
import { Check } from '@dealicious/design-system-react/src/components/ssm-check';
import { Chip } from '@dealicious/design-system-react/src/components/ssm-chip';
```

### Vue 컴포넌트

```typescript
import SsmButton from '@dealicious/design-system/src/components/SsmButton';
import SsmText from '@dealicious/design-system/src/components/SsmText';
```

## 알려진 제한사항

### TypeScript 타입 체크

디자인 시스템 패키지는 내부적으로 경로 별칭(`@/components/...`)을 사용합니다.
Palette 프로젝트의 TypeScript 컴파일러는 이 경로를 해석할 수 없어 타입 오류가 발생합니다.

**해결 방법:**
- `src/components/` 디렉토리는 TypeScript 빌드에서 제외됩니다 (tsconfig.json)
- 디자인 시스템 컴포넌트를 사용하는 파일은 개발 시 `tsx`를 통해 실행합니다

### yarn install 후 Symlink 복구

`yarn install`을 실행하면 symlink가 초기화될 수 있습니다.
이 경우 위의 "Symlink 생성" 단계를 다시 실행해야 합니다.

## 문제 해결

### 컴포넌트를 찾을 수 없는 경우

```bash
# Symlink 상태 확인
ls -la node_modules/@dealicious/

# 컴포넌트 디렉토리 확인
ls node_modules/@dealicious/design-system-react/src/components/
```

### package.json exports 오류

`Package subpath './src/components/...' is not defined by "exports"` 오류가 발생하면
위의 "package.json exports 수정" 단계가 올바르게 적용되었는지 확인합니다.

### ssm-web 업데이트

디자인 시스템을 업데이트하려면:

```bash
cd /Users/eos/workspaces/ssm-web
git pull origin master
yarn install
```

## 참고 자료

- GitHub 저장소: https://github.com/dealicious-inc/ssm-web
- React 컴포넌트: `packages/design-system-react`
- Vue 컴포넌트: `packages/design-system`
