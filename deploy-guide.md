# Netlify 배포 가이드

## 🚀 1단계: Netlify 계정 생성 및 사이트 연결

### 1-1. Netlify 계정 생성
1. [Netlify](https://netlify.com)에 가입/로그인
2. "New site from Git" 클릭
3. GitHub 선택 후 `haven-nvc/vocab-flashcard` 리포지토리 연결

### 1-2. 배포 설정
- **Build command**: (비워두기)
- **Publish directory**: `.` (현재 디렉토리)
- **Deploy site** 클릭

### 1-3. 배포 확인
배포가 완료되면 `https://your-site-name.netlify.app`에서 접근 가능

## 🔧 2단계: Google Apps Script 설정

### 2-1. Google Apps Script 프로젝트 생성
1. [Google Apps Script](https://script.google.com)에 접속
2. "새 프로젝트" 클릭
3. 프로젝트 이름을 "Vocab Flashcard API"로 설정

### 2-2. 코드 복사
1. `gas-api.js` 파일의 내용을 복사
2. Google Apps Script 편집기에 붙여넣기
3. 저장 (Ctrl+S)

### 2-3. 스프레드시트 ID 설정
1. Google Sheets에서 스프레드시트 URL 복사
2. URL에서 스프레드시트 ID 추출 (예: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`)
3. `gas-api.js`의 `SPREADSHEET_ID` 변수에 설정

### 2-4. 웹앱 배포
1. **Deploy** → **New deployment** 클릭
2. **Type**: Web app 선택
3. **Execute as**: Me
4. **Who has access**: Anyone
5. **Deploy** 클릭
6. 배포된 URL 복사 (예: `https://script.google.com/macros/s/AKfycbz.../exec`)

## ⚙️ 3단계: Netlify 환경변수 설정

### 3-1. Netlify 대시보드 접속
1. Netlify 대시보드에서 해당 사이트 선택
2. **Site settings** → **Environment variables** 메뉴로 이동

### 3-2. 환경변수 추가
- **Key**: `GAS_WEBAPP_URL`
- **Value**: Google Apps Script 배포 URL (2-4단계에서 복사한 URL)
- **Production** 환경에 설정

### 3-3. 배포 트리거
환경변수 설정 후 자동으로 재배포됩니다.

## 🧪 4단계: 테스트 및 확인

### 4-1. 기본 테스트
```
https://your-site-name.netlify.app?student=태경
```

### 4-2. 개발자 도구 확인
1. 브라우저에서 F12 눌러 개발자 도구 열기
2. **Console** 탭에서 오류 메시지 확인
3. **Network** 탭에서 API 호출 확인

### 4-3. Netlify Functions 로그 확인
1. Netlify 대시보드 → **Functions** 탭
2. `gas-proxy` 함수의 로그 확인
3. 환경변수가 정상 로드되는지 확인

## 🔍 5단계: 문제 해결

### 5-1. 환경변수 문제
**증상**: "GAS_WEBAPP_URL 환경 변수가 설정되지 않았습니다"
**해결**: Netlify 대시보드에서 환경변수 재설정

### 5-2. CORS 오류
**증상**: 브라우저에서 CORS 오류 발생
**해결**: Netlify Functions가 정상 작동하는지 확인

### 5-3. 데이터 로드 실패
**증상**: "데이터를 불러올 수 없습니다"
**해결**: 
1. Google Apps Script URL 확인
2. 스프레드시트 권한 확인
3. 학생 이름 시트 존재 확인

## 📋 체크리스트

- [ ] Netlify 사이트 배포 완료
- [ ] Google Apps Script 배포 완료
- [ ] 환경변수 `GAS_WEBAPP_URL` 설정 완료
- [ ] 스프레드시트 권한 설정 완료
- [ ] 기본 테스트 성공
- [ ] 개발자 도구에서 오류 없음
- [ ] Netlify Functions 로그 정상

## 🎯 완료 후 사용법

배포가 완료되면 다음과 같이 사용할 수 있습니다:

```
https://your-site-name.netlify.app?student=학생이름
```

예시:
- `https://vocab-flashcard.netlify.app?student=태경`
- `https://vocab-flashcard.netlify.app?student=John`
- `https://vocab-flashcard.netlify.app?student=Mary` 