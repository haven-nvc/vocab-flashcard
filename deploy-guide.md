# Netlify 배포 가이드

## 환경변수 설정

Netlify 대시보드에서 다음 환경변수를 설정해야 합니다:

### 1. Netlify 대시보드 접속
1. [Netlify](https://app.netlify.com)에 로그인
2. 해당 사이트 선택
3. **Site settings** → **Environment variables** 메뉴로 이동

### 2. 환경변수 추가
- **Key**: `GAS_WEBAPP_URL`
- **Value**: Google Apps Script 웹앱 URL (예: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

### 3. 환경변수 확인
- **Production** 환경에 설정되어 있는지 확인
- **Deploy previews**에도 설정되어 있는지 확인 (선택사항)

## Google Apps Script 설정

1. `gas-api.js` 파일을 Google Apps Script에 복사
2. 스프레드시트 ID와 OAuth 클라이언트 ID 설정
3. **Deploy** → **New deployment** → **Web app**으로 배포
4. 배포된 URL을 `GAS_WEBAPP_URL` 환경변수에 설정

## 배포 후 확인사항

1. 사이트가 정상적으로 로드되는지 확인
2. 브라우저 개발자 도구에서 네트워크 탭 확인
3. `/api/gas-proxy` 엔드포인트가 정상 응답하는지 확인
4. Netlify Functions 로그에서 환경변수 로그 확인

## 문제 해결

### 환경변수가 로드되지 않는 경우
1. Netlify 대시보드에서 환경변수가 올바르게 설정되었는지 확인
2. 사이트를 다시 배포
3. Netlify Functions 로그에서 환경변수 디버깅 메시지 확인

### CORS 오류가 발생하는 경우
1. Google Apps Script에서 CORS 헤더 설정 확인
2. 스프레드시트 접근 권한이 "링크가 있는 모든 사용자(보기 가능)"로 설정되었는지 확인 