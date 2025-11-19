# 저장소 접근 권한 문제 해결 가이드

## 🔍 현재 문제 상황

`check-repo-access.sh` 실행 결과:
- ❌ 토큰에 전체 `repo` scope가 없음 (현재: `public_repo`만 있음)
- ❌ dealicious-inc 조직의 멤버가 아님
- ❌ 저장소 접근 권한 없음 (404/403 에러)

## 🎯 해결 방법

### 1단계: GitHub Personal Access Token 재생성 (필수)

**문제**: 현재 토큰에 `public_repo` scope만 있어서 private 저장소에 접근할 수 없습니다.

**해결**:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 기존 토큰 삭제 또는 새 토큰 생성
3. **중요**: `repo` scope **전체**를 선택하세요
   - ❌ `public_repo`만 선택하면 안 됩니다
   - ✅ `repo` (Full control of private repositories) 체크박스를 선택
4. 토큰 생성 후 복사
5. 환경 변수 업데이트:
   ```bash
   export GITHUB_TOKEN=your_new_token_here
   ```

**Scope 차이**:
- `public_repo`: 공개 저장소만 접근 가능
- `repo`: 모든 저장소(공개/비공개) 접근 가능 ← **이것이 필요합니다**

### 2단계: 조직 멤버십 요청

**문제**: dealicious-inc 조직의 멤버가 아니어서 조직의 private 저장소에 접근할 수 없습니다.

**해결**:
1. 조직 관리자에게 멤버십 요청
2. 또는 저장소 관리자에게 저장소 접근 권한 요청
3. GitHub에서 직접 확인:
   - https://github.com/dealicious-inc/ssm-web 에 접근 가능한지 확인
   - 접근할 수 없다면 관리자에게 권한 요청

### 3단계: 저장소 접근 권한 확인

**문제**: 저장소에 대한 접근 권한이 없습니다.

**해결**:
1. GitHub 웹에서 직접 접근 시도:
   ```
   https://github.com/dealicious-inc/ssm-web
   ```
2. 접근할 수 없다면:
   - 저장소 관리자에게 접근 권한 요청
   - 저장소 초대를 받았는지 확인 (이메일 확인)
   - 조직 관리자에게 문의

### 4단계: 재확인

토큰을 재생성하고 권한을 받은 후:

```bash
# 1. 새 토큰으로 환경 변수 설정
export GITHUB_TOKEN=your_new_token_here

# 2. 접근 권한 재확인
./check-repo-access.sh

# 3. 모든 확인이 통과되면 설치
./install-via-git-credentials.sh
```

## 📋 체크리스트

설치 전 확인사항:
- [ ] GitHub Personal Access Token에 전체 `repo` scope가 있음
- [ ] dealicious-inc 조직의 멤버임
- [ ] https://github.com/dealicious-inc/ssm-web 에 접근 가능
- [ ] `check-repo-access.sh` 실행 시 모든 확인 통과

## 🆘 여전히 문제가 있다면

1. **토큰 확인**:
   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
   ```

2. **저장소 직접 접근 테스트**:
   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/dealicious-inc/ssm-web
   ```

3. **조직 관리자에게 문의**:
   - 조직 멤버십 요청
   - 저장소 접근 권한 요청

## 참고 문서

- [GitHub Personal Access Token 생성 가이드](./GITHUB_TOKEN_SCOPES.md)
- [설치 가이드](./DESIGN_SYSTEM_INSTALL.md)
- [문제 해결 가이드](./TROUBLESHOOTING.md)
