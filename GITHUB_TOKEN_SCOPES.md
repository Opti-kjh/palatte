# GitHub Personal Access Token - 필요한 Scopes

Design System 패키지를 설치하기 위해 GitHub Personal Access Token을 생성할 때 필요한 scopes입니다.

## 필수 Scope

### ✅ `repo` (Full control of private repositories)

**이 scope가 필수입니다!**

- **설명**: Private 저장소에 대한 전체 제어 권한
- **필요한 이유**: `@dealicious/design-system-react`와 `@dealicious/design-system` 패키지들이 private GitHub 저장소(`dealicious-inc/ssm-web`)에 있기 때문입니다
- **포함되는 하위 scopes**:
  - `repo:status` - 커밋 상태 접근
  - `repo_deployment` - 배포 상태 접근
  - `public_repo` - 공개 저장소 접근
  - `repo:invite` - 저장소 초대 접근
  - `security_events` - 보안 이벤트 읽기/쓰기

## Token 생성 단계별 가이드

1. **GitHub에 로그인**
   - https://github.com 에서 로그인

2. **Settings로 이동**
   - 우측 상단 프로필 아이콘 클릭
   - "Settings" 클릭

3. **Developer settings 접근**
   - 좌측 메뉴 하단 "Developer settings" 클릭

4. **Personal access tokens 선택**
   - "Personal access tokens" → "Tokens (classic)" 클릭

5. **새 토큰 생성**
   - "Generate new token" → "Generate new token (classic)" 클릭

6. **토큰 설정**
   - **Note**: 토큰 이름 입력 (예: "Palette Design System")
   - **Expiration**: 만료 기간 선택 (권장: 90일 또는 No expiration)
   - **Scopes**: 
     - ✅ **`repo`** 체크박스 선택
     - 이 scope를 선택하면 모든 하위 scopes가 자동으로 포함됩니다

7. **토큰 생성**
   - 하단 "Generate token" 버튼 클릭
   - ⚠️ **중요**: 생성된 토큰을 즉시 복사하세요! 다시 볼 수 없습니다!

## 보안 주의사항

- ✅ 토큰을 `.env` 파일에 저장하고 `.gitignore`에 추가
- ✅ 토큰을 코드나 공개 저장소에 커밋하지 마세요
- ✅ 만료 기간을 설정하여 정기적으로 갱신
- ✅ 사용하지 않는 토큰은 즉시 삭제

## 환경 변수 설정

토큰을 생성한 후 환경 변수로 설정:

```bash
# macOS/Linux
export GITHUB_TOKEN=ghp_your_token_here

# 영구 설정 (추천)
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.zshrc
source ~/.zshrc
```

```bash
# Windows (PowerShell)
$env:GITHUB_TOKEN="ghp_your_token_here"

# Windows (CMD)
setx GITHUB_TOKEN "ghp_your_token_here"
```

## 설치 확인

환경 변수 설정 후 패키지 설치:

```bash
yarn install
```

설치가 성공하면 다음 명령어로 확인:

```bash
yarn list --pattern "@dealicious/design-system*"
```

## 문제 해결

### "Repository not found" 오류
- `repo` scope가 선택되었는지 확인
- 토큰이 만료되지 않았는지 확인
- 저장소 접근 권한이 있는지 확인

### "Permission denied" 오류
- 토큰에 `repo` scope가 포함되어 있는지 확인
- 환경 변수 `GITHUB_TOKEN`이 올바르게 설정되었는지 확인

## 참고

- GitHub Personal Access Token 문서: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- OAuth Scopes 설명: https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps

