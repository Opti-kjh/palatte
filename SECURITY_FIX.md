# 🔒 보안 수정 가이드

## 현재 상태

✅ `package.json`에서 토큰을 제거했습니다.
✅ Git credential helper가 설정되어 있어 토큰 없이도 작동합니다.

## ⚠️ 중요: 추가 보안 조치

### 1. GitHub에서 토큰 무효화 (필수)

노출된 토큰(`ghp_***REMOVED***`)을 즉시 무효화하세요:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 해당 토큰 찾기
3. "Revoke" 클릭하여 무효화
4. 새 토큰 생성 (필요한 경우)

### 2. Git History에서 토큰 제거

만약 이전에 `package.json`이 커밋되었다면, git history에서도 토큰을 제거해야 합니다.

#### 방법 1: BFG Repo-Cleaner 사용 (권장)

```bash
# BFG 설치
brew install bfg

# 토큰 제거
bfg --replace-text <(echo 'ghp_***REMOVED***==***REMOVED***') 

# 히스토리 재작성
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

#### 방법 2: git filter-branch 사용

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch package.json" \
  --prune-empty --tag-name-filter cat -- --all

# 토큰이 포함된 파일을 다시 추가
git add package.json
git commit -m "Remove token from package.json"
```

#### 방법 3: 새 저장소로 이전 (가장 안전)

```bash
# 새 저장소 생성
# 기존 저장소의 최신 버전만 가져오기
git clone --depth 1 <repository-url> new-repo
cd new-repo
# package.json 확인 후 커밋
```

### 3. 원격 저장소에 푸시

히스토리를 정리한 후:

```bash
# 강제 푸시 (주의: 팀원과 협의 필요)
git push origin --force --all
git push origin --force --tags
```

⚠️ **주의**: Force push는 팀원들에게 영향을 줄 수 있으므로 반드시 협의하세요.

### 4. .gitignore 확인

`.gitignore`에 다음이 포함되어 있는지 확인:

```
.env
.env.local
*.env
package.json.bak
```

### 5. 새 토큰 생성 및 설정

1. GitHub에서 새 토큰 생성
2. `.env` 파일에 추가:
   ```
   GITHUB_TOKEN=your_new_token_here
   ```
3. Git credential helper 확인:
   ```bash
   echo "https://$GITHUB_TOKEN@github.com" > ~/.git-credentials
   ```

## 예방 조치

### package.json에 토큰을 포함하지 않기

✅ **올바른 방법:**
- Git credential helper 사용
- `.env` 파일 사용
- 환경 변수 사용

❌ **잘못된 방법:**
- `package.json`에 토큰 직접 포함
- 코드에 토큰 하드코딩
- 공개 저장소에 토큰 커밋

### 자동 검사

프로젝트에 pre-commit hook을 추가하여 토큰이 포함되지 않도록 할 수 있습니다:

```bash
# .git/hooks/pre-commit
#!/bin/bash
if git diff --cached --name-only | xargs grep -l "ghp_\|github_pat_"; then
  echo "❌ 토큰이 포함된 파일이 있습니다!"
  exit 1
fi
```

## 참고

- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)


