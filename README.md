# 플래시카드 웹앱

Google Sheets를 활용한 영어 단어 플래시카드 웹앱입니다.

## 주요 기능

- Google Sheets에서 단어 데이터 자동 로드
- 플래시카드 형태의 학습 인터페이스
- 키보드 조작 (Space: 뒤집기, ←→: 정답/오답)
- 학습 결과 자동 저장
- 진행률 실시간 표시

## 설치 및 설정

### 1. Google Apps Script 배포

1. [Google Apps Script](https://script.google.com)에 접속
2. 새 프로젝트 생성
3. `gas-api.js` 파일의 내용을 복사하여 붙여넣기
4. 배포 > 새 배포 > 웹 앱으로 배포
5. 실행 권한: "나", 액세스 권한: "모든 사용자"로 설정
6. 배포 URL 복사

### 2. 설정 파일 수정

`config.js` 파일에서 `GAS_API_URL`을 배포한 URL로 변경:

```javascript
GAS_API_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

### 3. Google Sheets 설정

1. 새 Google Sheets 생성
2. 시트 이름을 학생 이름으로 설정 (예: "Vocab", "John", "Mary")
3. A열에 영어단어, B열에 뜻 입력
4. 스프레드시트를 "링크가 있는 모든 사용자(보기 가능)"로 공유
5. 스프레드시트 ID를 Google Apps Script에 설정

## CORS 오류 해결 가이드

### CORS 오류란?

CORS(Cross-Origin Resource Sharing) 오류는 웹 브라우저의 보안 정책으로 인해 발생하는 오류입니다. 다른 도메인에서 리소스를 요청할 때 발생합니다.

### 해결 방법: 텍스트 형식 사용

이 프로젝트는 CORS 문제를 해결하기 위해 **텍스트 형식**으로 데이터를 주고받습니다:

#### 데이터 형식

**GET 요청 (단어 데이터 가져오기):**
```
SUCCESS
3
apple|사과
banana|바나나
orange|오렌지
```

**POST 요청 (결과 저장):**
```
studentName,correctCount,incorrectCount
```

#### 장점

1. **CORS 문제 최소화**: JSON 대신 텍스트를 사용하여 브라우저 제한 우회
2. **간단한 파싱**: 복잡한 JSON 파싱 없이 줄 단위로 처리
3. **안정성**: 다양한 브라우저에서 일관된 동작

### 일반적인 원인

1. **Google Apps Script 배포 문제**
   - 웹앱으로 제대로 배포되지 않음
   - 액세스 권한 설정 오류

2. **스프레드시트 권한 문제**
   - 스프레드시트가 공개되지 않음
   - 접근 권한이 제한됨

3. **브라우저 캐시 문제**
   - 이전 버전의 스크립트가 캐시됨

### 해결 방법

#### 1. Google Apps Script 재배포

1. Google Apps Script 편집기에서 코드 확인
2. 배포 > 새 배포 > 웹 앱으로 배포
3. 버전 설명 추가 (예: "텍스트 형식으로 변경")
4. 액세스 권한을 "모든 사용자"로 설정

#### 2. 스프레드시트 권한 확인

1. Google Sheets에서 "공유" 버튼 클릭
2. "링크가 있는 모든 사용자" 선택
3. 권한을 "보기 가능"으로 설정

#### 3. 브라우저 캐시 삭제

1. 브라우저 개발자 도구 열기 (F12)
2. Network 탭에서 "Disable cache" 체크
3. 페이지 새로고침 (Ctrl+F5)

#### 4. 대체 방법

만약 CORS 오류가 지속된다면:

1. **다른 브라우저 시도**: Chrome, Firefox, Safari 등
2. **시크릿 모드 사용**: 캐시나 확장 프로그램 영향 제거
3. **로컬 서버 사용**: Live Server 등으로 로컬에서 실행

### 디버깅 방법

1. **브라우저 개발자 도구 확인**
   - Console 탭에서 오류 메시지 확인
   - Network 탭에서 요청/응답 확인

2. **Google Apps Script 로그 확인**
   - Apps Script 편집기에서 "실행" > "실행 로그" 확인

3. **URL 직접 테스트**
   - 브라우저에서 Google Apps Script URL 직접 접속
   - 텍스트 응답이 정상적으로 나오는지 확인

## 사용법

### URL 파라미터

- `?student=학생이름`: 특정 학생의 단어장 사용
- 예: `index.html?student=John`

### 키보드 조작

- **Space**: 카드 뒤집기
- **← (왼쪽 화살표)**: 오답 처리
- **→ (오른쪽 화살표)**: 정답 처리

### 학습 결과

학습 완료 후 결과가 Google Sheets의 해당 학생 시트에 자동 저장됩니다:
- C열: 날짜
- D열: 맞은 개수
- E열: 틀린 개수

## 문제 해결

### 자주 발생하는 문제

1. **"데이터를 불러올 수 없습니다"**
   - Google Apps Script URL 확인
   - 스프레드시트에 데이터 있는지 확인

2. **"CORS 오류"**
   - 위의 CORS 해결 가이드 참조

3. **"학생 시트를 찾을 수 없습니다"**
   - 스프레드시트에 해당 이름의 시트가 있는지 확인
   - URL 파라미터 확인

### 지원

문제가 지속되면 다음을 확인해주세요:
1. 브라우저 콘솔의 오류 메시지
2. Google Apps Script 실행 로그
3. 네트워크 연결 상태

## 라이선스

MIT License 