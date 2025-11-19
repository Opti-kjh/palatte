# Design System 패키지 설치 가이드

이 가이드는 `@dealicious/design-system-react`와 `@dealicious/design-system` 패키지를 설치하는 방법을 설명합니다.

## ⚠️ 중요 사항

이 패키지들은 **private GitHub 저장소**에 있습니다. 설치하려면 GitHub 인증이 필요합니다.

## 설치 방법

### 방법 1: Personal Access Token 사용 (권장)

#### 1단계: GitHub Personal Access Token 생성

1. GitHub에 로그인
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token (classic)" 클릭
4. Token 이름 입력 (예: "Palette Design System")
5. **필요한 권한(Scopes) 선택:**
   - ✅ **`repo`** (Full control of private repositories)
     - 이 scope는 private 저장소에 접근하는 데 필요합니다
     - 하위 scope들:
       - `repo:status` (Access commit status)
       - `repo_deployment` (Access deployment status)
       - `public_repo` (Access public repositories)
       - `repo:invite` (Access repository invitations)
       - `security_events` (Read and write security events)
6. "Generate token" 클릭
7. 생성된 토큰을 복사 (한 번만 표시됩니다!)

#### 2단계: 환경 변수 설정

**macOS/Linux:**
```bash
export GITHUB_TOKEN=your_personal_access_token_here
```

**영구적으로 설정하려면:**
```bash
# ~/.zshrc 또는 ~/.bashrc에 추가
echo 'export GITHUB_TOKEN=your_personal_access_token_here' >> ~/.zshrc
source ~/.zshrc
```

**Windows:**
```cmd
setx GITHUB_TOKEN "your_personal_access_token_here"
```

#### 3단계: 패키지 설치

**방법 A: 자동 설치 스크립트 사용 (권장)**

```bash
# GITHUB_TOKEN 환경 변수 설정 후
export GITHUB_TOKEN=your_token_here

# 설치 스크립트 실행
./install-with-token.sh
```

이 스크립트는 자동으로 `package.json`을 업데이트하고 패키지를 설치합니다.

**방법 B: 수동 설치**

`package.json`의 dependencies에 다음을 추가하세요:

```json
{
  "dependencies": {
    "@dealicious/design-system": "https://YOUR_TOKEN@github.com/dealicious-inc/ssm-web.git#master",
    "@dealicious/design-system-react": "https://YOUR_TOKEN@github.com/dealicious-inc/ssm-web.git#master"
  }
}
```

⚠️ **보안 주의**: 토큰을 직접 포함하는 것은 보안상 권장하지 않습니다. 가능하면 스크립트를 사용하거나, `.gitignore`에 `package.json`을 추가하세요.

그 다음:

```bash
yarn install
```

### 방법 2: SSH 키 사용

#### 1단계: SSH 키 생성 및 GitHub 등록

```bash
# SSH 키 생성 (이미 있다면 건너뛰기)
ssh-keygen -t ed25519 -C "your_email@example.com"

# 공개 키 복사
cat ~/.ssh/id_ed25519.pub

# GitHub → Settings → SSH and GPG keys → New SSH key
# 복사한 공개 키를 붙여넣기
```

#### 2단계: SSH 연결 테스트

```bash
ssh -T git@github.com
# "Hi username! You've successfully authenticated..." 메시지가 나오면 성공
```

#### 3단계: package.json 수정

`package.json`의 dependencies에 다음을 추가:

```json
{
  "dependencies": {
    "@dealicious/design-system": "git+ssh://git@github.com/dealicious-inc/ssm-web.git#master",
    "@dealicious/design-system-react": "git+ssh://git@github.com/dealicious-inc/ssm-web.git#master"
  }
}
```

#### 4단계: 패키지 설치

```bash
yarn install
```

### 방법 3: .yarnrc.yml 사용 (Yarn 3+)

`.yarnrc.yml` 파일을 생성하고 다음 내용을 추가:

```yaml
npmRegistryServer: "https://registry.yarnpkg.com"

git:
  github:
    token: "${GITHUB_TOKEN}"
```

그리고 `package.json`에:

```json
{
  "dependencies": {
    "@dealicious/design-system": "https://github.com/dealicious-inc/ssm-web.git#master",
    "@dealicious/design-system-react": "https://github.com/dealicious-inc/ssm-web.git#master"
  }
}
```

## 설치 확인

설치가 완료되면 다음 명령어로 확인할 수 있습니다:

```bash
yarn list --pattern "@dealicious/design-system*"
```

또는:

```bash
ls node_modules/@dealicious/
```

## 문제 해결

### "Permission denied (publickey)" 오류

SSH 키가 설정되지 않았습니다. 방법 1 (Personal Access Token)을 사용하세요.

### "Repository not found" 오류

1. Personal Access Token에 `repo` 권한이 있는지 확인
2. 저장소 접근 권한이 있는지 확인
3. 토큰이 만료되지 않았는지 확인

### "Invalid Git resolution protocol" 오류

Yarn 버전에 따라 git URL 형식이 다를 수 있습니다. 다음 형식을 시도해보세요:

```json
"git+https://github.com/dealicious-inc/ssm-web.git#master"
"https://github.com/dealicious-inc/ssm-web.git#master"
"git+ssh://git@github.com/dealicious-inc/ssm-web.git#master"
```

## 참고

- Personal Access Token은 보안상 안전하게 관리하세요
- 토큰을 `.env` 파일에 저장하고 `.gitignore`에 추가하는 것을 권장합니다
- 팀 공유가 필요한 경우, 환경 변수나 CI/CD 설정을 통해 관리하세요

