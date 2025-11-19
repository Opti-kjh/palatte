# GitHub Personal Access Token 발급 가이드

이 가이드는 Palette 프로젝트에서 필요한 GitHub Personal Access Token을 발급받는 방법을 단계별로 설명합니다.

## 📋 목차

1. [Token이 필요한 이유](#token이-필요한-이유)
2. [Token 발급 방법 (단계별)](#token-발급-방법-단계별)
3. [Scopes 설명](#scopes-설명)
4. [Token 설정 및 사용](#token-설정-및-사용)
5. [보안 주의사항](#보안-주의사항)
6. [문제 해결](#문제-해결)

---

## 🔑 Token이 필요한 이유

Palette 프로젝트는 `@dealicious/design-system-react`와 `@dealicious/design-system` 패키지를 사용합니다.
이 패키지들은 **private GitHub 저장소** (`dealicious-inc/ssm-web`)에 있어서, 접근하려면 인증이 필요합니다.

- ✅ **필요**: Private 저장소 접근
- ✅ **필요**: 패키지 설치 및 사용
- ✅ **필요**: Yarn을 통한 의존성 설치

---

## 🎯 Token 발급 방법 (단계별)

### 1단계: GitHub 로그인

1. 웹 브라우저에서 [GitHub](https://github.com) 접속
2. GitHub 계정으로 로그인

### 2단계: Settings 접근

1. 우측 상단 프로필 아이콘 클릭
2. 드롭다운 메뉴에서 **"Settings"** 클릭

### 3단계: Developer settings 접근

1. 좌측 메뉴 하단으로 스크롤
2. **"Developer settings"** 클릭

### 4단계: Personal access tokens 선택

1. 좌측 메뉴에서 **"Personal access tokens"** 클릭
2. **"Tokens (classic)"** 클릭
   - ⚠️ **중요**: "Fine-grained tokens"가 아닌 **"Tokens (classic)"**을 선택하세요!

### 5단계: 새 Token 생성

1. **"Generate new token"** 버튼 클릭
2. **"Generate new token (classic)"** 클릭

### 6단계: Token 설정

#### Note (토큰 이름)
- **입력**: `Palette Design System` 또는 원하는 이름
- **용도**: 나중에 이 토큰을 식별하기 위한 이름

#### Expiration (만료 기간)
- **옵션**: 
  - `No expiration` (만료 없음) - 개발용 권장
  - `30 days`, `60 days`, `90 days` 등 - 보안을 위해 만료 기간 설정
- **권장**: 개발 환경에서는 `No expiration`, 프로덕션에서는 만료 기간 설정

#### Scopes (권한)
- **필수**: ✅ **`repo`** 체크박스 선택
  - 이 scope를 선택하면 모든 하위 scopes가 자동으로 포함됩니다
  - Private 저장소 접근에 필수입니다

### 7단계: Token 생성 및 복사

1. 하단 **"Generate token"** 버튼 클릭
2. ⚠️ **중요**: 생성된 토큰을 **즉시 복사**하세요!
   - 토큰은 한 번만 표시됩니다
   - 페이지를 벗어나면 다시 볼 수 없습니다
   - 형식: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 8단계: Token 저장

생성된 토큰을 안전한 곳에 저장하세요:
- ✅ 비밀 관리 도구 (1Password, LastPass 등)
- ✅ 환경 변수 파일 (`.env` - `.gitignore`에 추가)
- ❌ 코드에 직접 작성하지 마세요
- ❌ 공개 저장소에 커밋하지 마세요

---

## 🔐 Scopes 설명

### 필수 Scope: `repo` (Full control of private repositories)

**이 scope가 가장 중요합니다!**

#### 설명
- Private 저장소에 대한 전체 제어 권한
- Public 저장소에도 접근 가능
- Palette 프로젝트에서 **필수**입니다

#### 포함되는 하위 scopes
- `repo:status` - 커밋 상태 접근
- `repo_deployment` - 배포 상태 접근
- `public_repo` - 공개 저장소 접근
- `repo:invite` - 저장소 초대 접근
- `security_events` - 보안 이벤트 읽기/쓰기

#### 선택 방법
- ✅ **`repo`** 체크박스 하나만 선택하면 모든 하위 scopes가 자동으로 포함됩니다
- ❌ `public_repo`만 선택하면 private 저장소에 접근할 수 없습니다!

### 다른 Scopes (선택사항)

Palette 프로젝트에서는 필요하지 않지만, 참고용으로 설명합니다:

#### `read:org` (Read org and team membership)
- 조직 정보 읽기
- 팀 멤버십 읽기
- Palette 프로젝트에서는 선택사항

#### `read:user` (Read user profile data)
- 사용자 프로필 정보 읽기
- Palette 프로젝트에서는 선택사항

#### `user:email` (Access user email addresses)
- 사용자 이메일 주소 접근
- Palette 프로젝트에서는 선택사항

### Scope 비교표

| Scope | Public 저장소 | Private 저장소 | Palette 필요 여부 |
|-------|--------------|---------------|------------------|
| `public_repo` | ✅ | ❌ | ❌ |
| `repo` | ✅ | ✅ | ✅ **필수** |

---

## ⚙️ Token 설정 및 사용

### macOS/Linux

#### 임시 설정 (현재 세션만)
```bash
export GITHUB_TOKEN=ghp_your_token_here
```

#### 영구 설정 (추천)
```bash
# ~/.zshrc 또는 ~/.bashrc에 추가
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.zshrc
source ~/.zshrc
```

### Windows

#### PowerShell
```powershell
$env:GITHUB_TOKEN="ghp_your_token_here"
```

#### CMD
```cmd
setx GITHUB_TOKEN "ghp_your_token_here"
```

### .env 파일 사용 (권장)

프로젝트 루트에 `.env` 파일 생성:

```bash
# .env 파일
GITHUB_TOKEN=ghp_your_token_here
```

`.gitignore`에 `.env` 추가:
```
.env
```

### 설정 확인

```bash
# 환경 변수 확인
echo $GITHUB_TOKEN

# 또는
env | grep GITHUB_TOKEN
```

---

## 🔒 보안 주의사항

### ✅ 해야 할 것

1. **토큰을 안전하게 저장**
   - 비밀 관리 도구 사용
   - `.env` 파일 사용 (`.gitignore`에 추가)

2. **토큰을 정기적으로 갱신**
   - 만료 기간 설정
   - 사용하지 않는 토큰 삭제

3. **최소 권한 원칙**
   - 필요한 scope만 선택
   - `repo` scope만 선택 (다른 scope는 불필요)

### ❌ 하지 말아야 할 것

1. **코드에 토큰 직접 작성**
   ```javascript
   // ❌ 나쁜 예
   const token = "ghp_xxxxxxxxxxxx";
   ```

2. **공개 저장소에 커밋**
   - `package.json`에 토큰 포함하지 않기
   - `.env` 파일 커밋하지 않기

3. **토큰 공유**
   - 다른 사람과 토큰 공유하지 않기
   - 각자 토큰 발급받기

4. **만료 없는 토큰 남겨두기**
   - 사용하지 않는 토큰은 즉시 삭제

---

## 🛠️ 문제 해결

### "Bad credentials" 오류

**원인**: 토큰이 유효하지 않거나 만료됨

**해결**:
1. 토큰이 올바르게 복사되었는지 확인
2. 토큰이 만료되지 않았는지 확인
3. 새 토큰 생성

### "Repository not found" 오류

**원인**: 
- 토큰에 `repo` scope가 없음
- 저장소 접근 권한 없음

**해결**:
1. 토큰에 `repo` scope가 있는지 확인
2. 저장소 접근 권한 확인
3. 조직 멤버십 확인

### "Permission denied" 오류

**원인**: 
- `public_repo` scope만 있고 `repo` scope가 없음
- 저장소가 private인데 public_repo만 선택함

**해결**:
1. 토큰 재생성
2. **`repo` scope 전체** 선택 (public_repo만 선택하지 말 것!)

### 토큰을 잃어버렸을 때

**해결**:
1. GitHub → Settings → Developer settings → Personal access tokens
2. 기존 토큰 삭제
3. 새 토큰 생성

---

## 📚 추가 자료

- [GitHub Personal Access Token 공식 문서](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [OAuth Scopes 설명](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)
- [Token 보안 모범 사례](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

---

## ✅ 체크리스트

Token 발급 전:
- [ ] GitHub 계정 로그인
- [ ] Developer settings 접근
- [ ] Personal access tokens (classic) 선택

Token 생성 시:
- [ ] Note 입력 (토큰 이름)
- [ ] Expiration 선택
- [ ] ✅ **`repo` scope 선택** (필수!)
- [ ] Generate token 클릭
- [ ] 토큰 즉시 복사 및 저장

Token 설정 후:
- [ ] 환경 변수 설정
- [ ] `.env` 파일에 추가 (선택)
- [ ] `.gitignore`에 `.env` 추가 확인
- [ ] `check-repo-access.sh` 실행하여 확인

---

## 💡 팁

1. **토큰 이름 규칙**: 프로젝트별로 구분하기 쉽게 이름 지정
   - 예: `Palette-Design-System-2024`
   - 예: `Work-Project-Name-Token`

2. **토큰 관리**: 여러 프로젝트에서 사용하는 경우 각각 다른 토큰 생성

3. **자동화**: CI/CD 환경에서는 환경 변수로 설정

4. **백업**: 토큰을 안전한 비밀 관리 도구에 저장

