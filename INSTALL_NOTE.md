# Design System 패키지 설치 참고사항

## ⚠️ 중요

`@dealicious/design-system-react`와 `@dealicious/design-system` 패키지는 **npm 레지스트리에 게시되어 있지 않습니다**.

따라서 다음 명령어는 작동하지 않습니다:
```bash
# ❌ 작동하지 않음
yarn add @dealicious/design-system-react @dealicious/design-system
npm install @dealicious/design-system-react @dealicious/design-system
```

## ✅ 올바른 설치 방법

이 패키지들은 **GitHub 저장소에서 직접 설치**해야 합니다.

### 이미 설치되어 있는 경우

`package.json`에 이미 git URL로 설정되어 있다면:
```bash
yarn install
```

### 처음 설치하는 경우

1. **Git Credential Helper 사용 (권장)**
   ```bash
   export GITHUB_TOKEN=your_token_here
   ./install-via-git-credentials.sh
   ```

2. **또는 .env 파일 사용**
   ```bash
   # .env 파일에 추가
   GITHUB_TOKEN=your_token_here
   
   # 스크립트 실행 (자동으로 .env를 읽음)
   ./install-via-git-credentials.sh
   ```

## 설치 확인

```bash
# 패키지 정보 확인
yarn info @dealicious/design-system-react
yarn info @dealicious/design-system

# 설치 위치 확인
ls -la node_modules/@dealicious/
```

## package.json 설정

현재 `package.json`에는 다음과 같이 설정되어 있습니다:

```json
{
  "dependencies": {
    "@dealicious/design-system": "https://github.com/dealicious-inc/ssm-web.git#master",
    "@dealicious/design-system-react": "https://github.com/dealicious-inc/ssm-web.git#master"
  }
}
```

이 설정으로 `yarn install`을 실행하면 자동으로 GitHub에서 설치됩니다.

## 문제 해결

### "404 Not Found" 에러
- npm 레지스트리에서 찾으려고 하는 것이므로 정상입니다
- `yarn install`을 사용하세요 (git URL에서 설치)

### "Permission denied" 에러
- Git credential helper가 설정되지 않았습니다
- `./install-via-git-credentials.sh` 스크립트를 실행하세요

### "Repository not found" 에러
- 저장소 접근 권한이 없습니다
- GitHub에서 저장소 접근 권한을 확인하세요


