# 📚 영어 단어 플래시카드 웹앱

구글 스프레드시트를 단어장으로 활용하는 HTML + JavaScript 플래시카드 웹앱입니다.

## ✨ 주요 기능

- 🔄 **구글 스프레드시트 연동**: "Vocab" 시트에서 영어단어와 뜻을 자동으로 가져옵니다
- ⌨️ **키보드 조작**: Space키로 뜻 보기, 좌우 방향키로 정답/오답 처리
- 📊 **진행률 추적**: 실시간으로 학습 진행률을 표시합니다
- 🎯 **적응형 학습**: 틀린 단어는 다시 나타나고, 맞춘 단어는 제거됩니다
- 📱 **반응형 디자인**: 모바일과 데스크톱에서 모두 사용 가능합니다
- 🆓 **완전 무료**: GitHub Pages와 Google Apps Script로 무료 호스팅

## 🚀 빠른 시작

### 1단계: 구글 스프레드시트 준비

1. 새 구글 스프레드시트를 생성합니다
2. 시트 이름을 **"Vocab"**으로 변경합니다
3. 다음과 같이 데이터를 입력합니다:

```
A열(영어단어)  |  B열(뜻)
apple         |  사과
banana        |  바나나
orange        |  오렌지
```

4. **공유 > 링크가 있는 모든 사용자(읽기 전용)**으로 설정합니다

### 2단계: Google Apps Script 배포

1. [Google Apps Script](https://script.google.com)에 접속합니다
2. **새 프로젝트**를 클릭합니다
3. `gas-api.js` 파일의 내용을 복사하여 붙여넣습니다
4. **프로젝트 설정 > 스크립트 속성**에서 스프레드시트를 연결합니다:
   - 스프레드시트 메뉴에서 **확장 프로그램 > Apps Script** 클릭
   - 또는 스프레드시트 URL을 스크립트에서 직접 참조
5. **배포 > 새 배포**를 클릭합니다
6. **유형 선택 > 웹 앱**을 선택합니다
7. 설정값:
   - **실행자**: 나
   - **액세스 권한**: 모든 사용자
8. **배포** 버튼을 클릭하고 **웹 앱 URL**을 복사해둡니다

### 3단계: 웹앱 설정

1. `config.js` 파일을 열어서 다음 부분을 수정합니다:

```javascript
API_URL: "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"
```

2. 2단계에서 복사한 웹 앱 URL로 교체합니다:

```javascript
API_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

### 4단계: GitHub Pages 배포

1. GitHub에 새 저장소를 생성합니다
2. 모든 파일을 저장소에 업로드합니다:
   - `index.html`
   - `style.css`
   - `script.js`
   - `config.js`
   - `README.md`
3. **Settings > Pages**로 이동합니다
4. **Source**를 **Deploy from a branch**로 설정합니다
5. **Branch**를 **main**으로 선택합니다
6. **Save** 버튼을 클릭합니다
7. 몇 분 후 `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME`에서 접속 가능합니다

## 📖 사용법

### 키보드 조작

- **Space**: 영어단어 뒷면(뜻) 보기/숨기기
- **→ (오른쪽 방향키)**: 정답 - 카드가 제거되고 다음 카드로 이동
- **← (왼쪽 방향키)**: 오답 - 카드가 맨 뒤로 이동하여 나중에 다시 나타남

### 학습 과정

1. 영어단어가 표시됩니다
2. Space키를 눌러 뜻을 확인합니다
3. 알고 있었다면 →키, 몰랐다면 ←키를 누릅니다
4. 모든 단어를 맞출 때까지 반복합니다
5. 완료되면 축하 메시지와 통계가 표시됩니다

## ⚙️ 설정 옵션

`config.js` 파일에서 다음 설정들을 변경할 수 있습니다:

```javascript
APP_SETTINGS: {
    SHUFFLE_CARDS: true,        // 카드 순서 섞기
    AUTO_ADVANCE: false,        // 자동 진행 모드
    AUTO_ADVANCE_DELAY: 2000,   // 자동 진행 대기 시간(ms)
    SAVE_PROGRESS: false        // 진행률 저장 (개발 예정)
}
```

## 📁 파일 구조

```
vocab-flashcard/
├── index.html          # 메인 HTML 파일
├── style.css           # CSS 스타일시트
├── script.js           # JavaScript 메인 로직
├── config.js           # 설정 파일
├── gas-api.js          # Google Apps Script 코드
└── README.md           # 사용 설명서
```

## 🔧 문제 해결

### "데이터를 불러올 수 없습니다" 오류

1. `config.js`의 API_URL이 올바르게 설정되었는지 확인
2. Google Apps Script가 제대로 배포되었는지 확인
3. 스프레드시트의 시트 이름이 "Vocab"인지 확인
4. 스프레드시트가 공개 공유로 설정되었는지 확인

### 카드가 표시되지 않는 경우

1. 브라우저 개발자 도구(F12)의 콘솔에서 오류 메시지 확인
2. 스프레드시트의 A열과 B열에 데이터가 있는지 확인
3. 네트워크 연결 상태 확인

### Google Apps Script 권한 오류

1. Apps Script 배포 시 "실행자: 나"로 설정했는지 확인
2. "액세스 권한: 모든 사용자"로 설정했는지 확인
3. 필요시 새로 배포하여 새 URL 받기

## 🛠️ 개발자 정보

### 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Google Apps Script
- **호스팅**: GitHub Pages
- **데이터**: Google Sheets

### 브라우저 지원

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자유롭게 사용하고 수정하세요.

## 🤝 기여하기

버그 신고나 기능 제안은 GitHub Issues를 통해 해주세요.

---

**즐거운 영어 학습 되세요! 📚✨** 