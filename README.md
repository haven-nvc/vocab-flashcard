# 플래시카드 웹앱

영어 단어 학습을 위한 플래시카드 웹앱입니다.

## 🚀 Netlify 배포 준비 완료

이 프로젝트는 Netlify Functions를 사용하여 CORS 문제를 해결하고 안정적인 API 호출을 제공합니다.

### 배포 방법

**자세한 배포 가이드**: [deploy-guide.md](deploy-guide.md) 참조

1. **Netlify 계정 생성 및 사이트 연결**
2. **환경변수 설정**: `GAS_WEBAPP_URL`
3. **Google Apps Script 배포**
4. **테스트 및 확인**

## 주요 기능

- 📚 Google Sheets에서 단어 데이터 가져오기
- 🎯 플래시카드 형식의 학습
- ⌨️ 키보드 조작 (Space, 방향키)
- 📊 학습 진행률 추적
- 🎵 사운드 효과
- 📈 학습 결과 저장
- 🔒 CORS 문제 해결 (Netlify Functions)

## 사용법

1. URL 파라미터로 학생 이름 지정:
   ```
   https://your-site.netlify.app?student=태경
   ```

2. 키보드 조작:
   - **Space**: 카드 뒤집기
   - **→ (오른쪽 화살표)**: 맞음
   - **← (왼쪽 화살표)**: 틀림

## 설정

### 1. Google Apps Script 설정

1. `gas-api.js`를 Google Apps Script에 복사
2. 스프레드시트 ID와 OAuth 클라이언트 ID 설정
3. 웹앱으로 배포하여 URL 획득

### 2. Netlify 환경변수 설정

Netlify 대시보드에서:
- **Key**: `GAS_WEBAPP_URL`
- **Value**: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`

### 3. 스프레드시트 형식

- A열: 영어 단어
- B열: 한국어 뜻
- 첫 번째 행은 헤더로 사용

## 파일 구조

```
vocab-flashcard/
├── index.html          # 메인 HTML
├── script.js           # 메인 JavaScript
├── style.css           # 스타일시트
├── config.js           # 설정 파일
├── gas-api.js          # Google Apps Script 코드
├── netlify/
│   └── functions/
│       └── gas-proxy.js # Netlify Functions
├── netlify.toml        # Netlify 설정
└── deploy-guide.md     # 배포 가이드
```

## 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Netlify Functions (Node.js)
- **API**: Google Apps Script
- **Database**: Google Sheets
- **Deployment**: Netlify

## 라이선스

MIT License 