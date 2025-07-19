# Netlify 배포 가이드

## 1. 사전 준비

### 1-1. Google Apps Script 배포
1. `gas-api.js` 파일을 Google Apps Script에 배포
2. 웹앱 URL 복사 (예: `https://script.google.com/macros/s/AKfycbxpu9oj2KEYWByxP2lUNy6HmXfvHIFQ7ecnnSmDNxqkBre_ZE88vN66DGswrz9QvqM/exec`)

### 1-2. 환경 변수 설정
1. `.env` 파일을 생성하고 Google Apps Script 웹앱 URL 설정:

```bash
GAS_WEBAPP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

2. Netlify 대시보드에서 환경 변수 설정:
   - Site settings → Environment variables
   - `GAS_WEBAPP_URL` 추가

## 2. 로컬 테스트

### 2-1. 의존성 설치
```bash
npm install
```

### 2-2. 로컬 개발 서버 실행
```bash
npm run dev
```

### 2-3. 테스트
- 브라우저에서 `http://localhost:8888` 접속
- 단어 데이터가 정상적으로 로드되는지 확인
- 학습 완료 후 결과가 저장되는지 확인

## 3. Netlify 배포

### 3-1. GitHub 저장소 연결 (권장)
1. [Netlify](https://netlify.com)에 가입/로그인
2. "New site from Git" 클릭
3. GitHub 저장소 선택
4. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.`
5. "Deploy site" 클릭

### 3-2. 파일 업로드
1. [Netlify](https://netlify.com)에 가입/로그인
2. "New site from Git" → "Deploy manually"
3. 프로젝트 폴더를 ZIP으로 압축하여 업로드

## 4. 배포 후 설정

### 4-1. 환경 변수 설정 (선택사항)
Netlify 대시보드에서 환경 변수 설정:
- `GAS_WEBAPP_URL`: Google Apps Script 웹앱 URL

### 4-2. 도메인 설정
1. Netlify에서 제공하는 기본 도메인 사용
2. 또는 커스텀 도메인 연결

## 5. 문제 해결

### 5-1. Functions 오류
- Netlify Functions 로그 확인
- `GAS_WEBAPP_URL` 설정 확인
- Google Apps Script 권한 설정 확인

### 5-2. CORS 오류
- Netlify Functions가 정상 작동하는지 확인
- 브라우저 개발자 도구에서 네트워크 요청 확인

### 5-3. 데이터 로드 실패
- Google Apps Script URL 확인
- 스프레드시트 권한 설정 확인
- 학생 이름 파라미터 확인

## 6. 성능 최적화

### 6-1. 캐싱
- Netlify Functions에 캐싱 로직 추가
- 브라우저 캐싱 설정

### 6-2. 에러 처리
- 더 자세한 에러 메시지 추가
- 재시도 로직 구현

## 7. 보안 고려사항

### 7-1. API 키 보호
- Google Apps Script URL을 환경 변수로 관리
- 클라이언트에 민감한 정보 노출 방지

### 7-2. 요청 제한
- Netlify Functions에 rate limiting 추가
- 악의적인 요청 차단

## 8. 모니터링

### 8-1. 로그 확인
- Netlify Functions 로그 모니터링
- 사용자 활동 추적

### 8-2. 성능 측정
- 페이지 로드 시간 측정
- API 응답 시간 모니터링 