# Design System 패키지 설치 문제 해결 가이드

## 403 에러 해결 방법

### 문제 원인
- 토큰 권한 부족 (`repo` scope 없음)
- 토큰 만료
- 저장소 접근 권한 없음
- 토큰이 URL에 포함되어 인증 실패

### 해결 방법

#### 1단계: 토큰 확인 및 재생성

1. **GitHub에서 토큰 확인**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 기존 토큰 확인:
     - ✅ `repo` scope가 선택되어 있는지 확인
     - ✅ 만료되지 않았는지 확인
     - ✅ 저장소 접근 권한이 있는지 확인

2. **토큰 재생성 (필요시)**
   - "Generate new token (classic)" 클릭
   - **Note**: "Palette Design System" 입력
   - **Expiration**: 만료 기간 선택
   - **Scopes**: ✅ **`repo`** 체크박스 선택 (필수!)
   - "Generate token" 클릭
   - 생성된 토큰 복사 (한 번만 표시됨!)

#### 2단계: Git Credential Helper 사용 (권장)

이 방법은 토큰을 `package.json`에 포함하지 않고 안전하게 저장합니다.

```bash
# 1. 환경 변수 설정
export GITHUB_TOKEN=your_token_here

# 2. Git Credential Helper 스크립트 실행
./install-via-git-credentials.sh
```

이 스크립트는:
- ✅ `package.json`에서 토큰을 제거하고 안전하게 저장
- ✅ Git credential helper를 사용하여 인증
- ✅ `yarn install` 실행

#### 3단계: 저장소 접근 권한 확인

```bash
# 저장소 접근 테스트
./check-repo-access.sh
```

이 스크립트는:
- 토큰이 올바르게 설정되었는지 확인
- 저장소 접근 권한 확인
- 토큰 scope 확인

### 대안 방법: SSH 사용

토큰 방식이 작동하지 않으면 SSH를 사용할 수 있습니다.

1. **SSH 키 생성 및 GitHub 등록**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   cat ~/.ssh/id_ed25519.pub
   # GitHub → Settings → SSH and GPG keys → New SSH key
   ```

2. **SSH 연결 테스트**
   ```bash
   ssh -T git@github.com
   ```

3. **package.json 수정**
   ```json
   {
     "dependencies": {
       "@dealicious/design-system": "git+ssh://git@github.com/dealicious-inc/ssm-web.git#master",
       "@dealicious/design-system-react": "git+ssh://git@github.com/dealicious-inc/ssm-web.git#master"
     }
   }
   ```

4. **설치**
   ```bash
   yarn install
   ```

## 보안 주의사항

⚠️ **중요**: 
- `package.json`에 토큰을 포함하지 마세요!
- 토큰이 노출된 경우 즉시 재생성하세요
- `.gitignore`에 `package.json`이 포함되어 있는지 확인하세요

## 추가 도움말

- [GitHub Personal Access Token 생성 가이드](./GITHUB_TOKEN_SCOPES.md)
- [설치 가이드](./DESIGN_SYSTEM_INSTALL.md)
