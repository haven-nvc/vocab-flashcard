/**
 * 플래시카드 웹앱 메인 스크립트
 * 
 * 주요 기능:
 * - Google Sheets API에서 단어 데이터 가져오기
 * - 플래시카드 표시 및 관리
 * - 키보드 입력 처리 (Space, 좌/우 방향키)
 * - 진행률 추적 및 표시
 * - 학습 완료 처리
 */

class FlashcardApp {
    constructor() {
        // 앱 상태
        this.vocabulary = []; // 전체 단어 목록
        this.currentCards = []; // 현재 학습 중인 카드들
        this.currentIndex = 0; // 현재 카드 인덱스
        this.showingMeaning = false; // 뜻 표시 여부
        this.totalStudied = 0; // 총 학습한 단어 수
        this.startTime = null; // 학습 시작 시간
        
        // 학습 결과 추적
        this.correctCount = 0; // 맞은 개수
        this.incorrectCount = 0; // 틀린 개수
        
        // URL 파라미터에서 학생 정보 읽기
        this.studentName = this.getStudentNameFromURL();
        console.log('학생 이름:', this.studentName);
        
        // DOM 요소들
        this.elements = {
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            errorMessage: document.getElementById('error-message'),
            app: document.getElementById('app'),
            completion: document.getElementById('completion'),
            
            // 진행률 관련
            currentIndex: document.getElementById('current-index'),
            totalCount: document.getElementById('total-count'),
            remainingCount: document.getElementById('remaining-count'),
            progressFill: document.getElementById('progress-fill'),
            
            // 카드 관련
            flashcard: document.getElementById('flashcard'),
            word: document.getElementById('word'),
            meaning: document.getElementById('meaning'),
            cardFront: document.getElementById('card-front'),
            cardBack: document.getElementById('card-back'),
            
            // 완료 화면
            totalStudied: document.getElementById('total-studied'),
            studyTime: document.getElementById('study-time')
        };
        
        // 초기화
        this.init();
    }
    
    /**
     * URL에서 학생 이름 읽기
     */
    getStudentNameFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const student = urlParams.get('student');
        
        if (!student) {
            // URL 파라미터가 없으면 기본값 사용
            console.warn('URL에 student 파라미터가 없습니다. 기본값 "Vocab"을 사용합니다.');
            return 'Vocab';
        }
        
        return student;
    }
    
    /**
     * 앱 초기화
     */
    async init() {
        console.log('플래시카드 앱 초기화 시작...');
        console.log('현재 설정:', CONFIG);
        
        // 설정 검증
        if (!validateConfig()) {
            console.error('설정 검증 실패');
            this.showError('설정 오류: Google Apps Script URL을 config.js에서 설정해주세요.');
            return;
        }
        
        console.log('설정 검증 통과');
        
        // 사운드 효과 초기화
        this.initSoundEffects();
        
        // 키보드 이벤트 리스너 등록
        this.setupEventListeners();
        console.log('이벤트 리스너 설정 완료');
        
        // 데이터 로드
        console.log('데이터 로드 시작...');
        await this.loadVocabulary();
    }
    
    /**
     * 사운드 효과 초기화
     */
    initSoundEffects() {
        // 맞춤 사운드 (Web Audio API 사용)
        this.correctSound = this.createTone(800, 0.3, 'sine'); // 높은 톤
        this.incorrectSound = this.createTone(200, 0.3, 'sawtooth'); // 낮은 톤
    }
    
    /**
     * 톤 생성 (Web Audio API)
     */
    createTone(frequency, duration, type = 'sine') {
        return () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.log('사운드 재생 실패:', error);
            }
        };
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 카드 클릭으로도 뒤집기 가능
        this.elements.flashcard.addEventListener('click', () => {
            if (this.currentCards.length > 0) {
                this.toggleMeaning();
            }
        });
    }
    
    /**
     * 키보드 입력 처리
     */
    handleKeyPress(event) {
        // 로딩 중이거나 에러 상태에서는 키 입력 무시
        if (this.elements.loading.classList.contains('hidden') === false || 
            this.elements.error.classList.contains('hidden') === false) {
            return;
        }
        
        console.log('키 입력 감지:', event.code, '뜻 표시 상태:', this.showingMeaning, '카드 수:', this.currentCards.length);
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.toggleMeaning();
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                console.log('오른쪽 화살표 입력 - 뜻 표시:', this.showingMeaning, '카드 수:', this.currentCards.length);
                if (this.showingMeaning && this.currentCards.length > 0) {
                    this.markCorrect();
                } else {
                    console.log('오른쪽 화살표 무시됨 - 조건 불충족');
                }
                break;
                
            case 'ArrowLeft':
                event.preventDefault();
                console.log('왼쪽 화살표 입력 - 뜻 표시:', this.showingMeaning, '카드 수:', this.currentCards.length);
                if (this.showingMeaning && this.currentCards.length > 0) {
                    this.markIncorrect();
                } else {
                    console.log('왼쪽 화살표 무시됨 - 조건 불충족');
                }
                break;
        }
    }
    
    /**
     * 단어장 데이터 로드
     */
    async loadVocabulary() {
        try {
            console.log('단어장 데이터 로드 시작...');
            console.log('학생 이름:', this.studentName);
            
            // Google Apps Script URL 확인
            if (!window.GAS_API_URL || window.GAS_API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                console.warn('Google Apps Script URL이 설정되지 않았습니다. 로컬 테스트 데이터를 사용합니다.');
                this.useLocalTestData();
                return;
            }
            
            // Google Apps Script 호출 (텍스트 형식)
            const apiUrl = `${window.GAS_API_URL}?student=${encodeURIComponent(this.studentName)}`;
            console.log('API URL:', apiUrl);
            
            // 텍스트 형식으로 데이터 로드
            const response = await fetch(apiUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'text/plain',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const textData = await response.text();
            console.log('API 응답 (텍스트):', textData);
            
            // 텍스트 응답 파싱
            const lines = textData.trim().split('\n');
            
            if (lines.length === 0) {
                throw new Error('빈 응답을 받았습니다.');
            }
            
            const firstLine = lines[0];
            
            if (firstLine.startsWith('ERROR:')) {
                throw new Error(firstLine.substring(6).trim());
            }
            
            if (!firstLine.startsWith('SUCCESS')) {
                throw new Error('잘못된 응답 형식입니다.');
            }
            
            if (lines.length < 3) {
                throw new Error('데이터가 부족합니다.');
            }
            
            const count = parseInt(lines[1]);
            const vocabData = [];
            
            // 3번째 줄부터 데이터 파싱 (단어|뜻 형식)
            for (let i = 2; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const parts = line.split('|');
                    if (parts.length === 2) {
                        vocabData.push({
                            word: parts[0].trim(),
                            meaning: parts[1].trim()
                        });
                    }
                }
            }
            
            console.log(`${vocabData.length}개의 단어를 로드했습니다.`);
            
            if (vocabData.length === 0) {
                throw new Error('유효한 단어 데이터가 없습니다. A열에 영어단어, B열에 뜻을 입력해주세요.');
            }
            
            // 단어 데이터 변환
            this.vocabulary = vocabData.filter(item => item.word && item.meaning);
            
            if (this.vocabulary.length === 0) {
                throw new Error('유효한 단어 데이터가 없습니다. A열에 영어단어, B열에 뜻을 입력해주세요.');
            }
            
            this.startLearning();
            
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            console.error('오류 타입:', error.constructor.name);
            console.error('오류 메시지:', error.message);
            console.error('오류 스택:', error.stack);
            
            // CORS 오류 및 네트워크 오류 감지
            const isCorsError = error.message.includes('CORS') || 
                               error.message.includes('Failed to fetch') ||
                               error.message.includes('Access-Control') ||
                               error.message.includes('NetworkError') ||
                               error.message.includes('TypeError') ||
                               error.message.includes('타임아웃');
            
            const isNetworkError = error.message.includes('fetch') ||
                                  error.message.includes('network') ||
                                  error.message.includes('connection') ||
                                  error.message.includes('timeout');
            
            let errorMessage = '';
            
            if (isCorsError) {
                errorMessage = `CORS 오류가 발생했습니다. 
                <br><br>
                <strong>해결 방법:</strong>
                <ul>
                    <li>Google Apps Script가 올바르게 배포되었는지 확인</li>
                    <li>스프레드시트 접근 권한이 "링크가 있는 모든 사용자(보기 가능)"로 설정되었는지 확인</li>
                    <li>브라우저 캐시를 삭제하고 페이지를 새로고침</li>
                    <li>다른 브라우저에서 시도</li>
                </ul>
                <br>
                <strong>오류 상세:</strong> ${error.message}`;
            } else if (isNetworkError) {
                errorMessage = `네트워크 오류가 발생했습니다.
                <br><br>
                <strong>해결 방법:</strong>
                <ul>
                    <li>인터넷 연결을 확인해주세요</li>
                    <li>방화벽이나 보안 소프트웨어가 차단하고 있는지 확인</li>
                    <li>잠시 후 다시 시도해주세요</li>
                </ul>
                <br>
                <strong>오류 상세:</strong> ${error.message}`;
            } else {
                errorMessage = `데이터를 불러오는 중 오류가 발생했습니다.
                <br><br>
                <strong>오류 상세:</strong> ${error.message}
                <br><br>
                <strong>확인사항:</strong>
                <ul>
                    <li>config.js에서 GAS_API_URL이 올바르게 설정되었는지 확인</li>
                    <li>Google Apps Script가 정상적으로 배포되었는지 확인</li>
                    <li>스프레드시트에 데이터가 있는지 확인</li>
                </ul>`;
            }
            
            this.showError(errorMessage);
        }
    }
    
    /**
     * 로컬 테스트 데이터 사용
     */
    useLocalTestData() {
        console.log('로컬 테스트 데이터 사용');
        
        // 테스트용 단어 데이터 (더 풍부한 예시)
        this.vocabulary = [
            { word: "apple", meaning: "사과" },
            { word: "banana", meaning: "바나나" },
            { word: "orange", meaning: "오렌지" },
            { word: "grape", meaning: "포도" },
            { word: "strawberry", meaning: "딸기" },
            { word: "computer", meaning: "컴퓨터" },
            { word: "phone", meaning: "전화" },
            { word: "book", meaning: "책" },
            { word: "car", meaning: "자동차" },
            { word: "house", meaning: "집" },
            { word: "dog", meaning: "개" },
            { word: "cat", meaning: "고양이" },
            { word: "bird", meaning: "새" },
            { word: "fish", meaning: "물고기" },
            { word: "tree", meaning: "나무" },
            { word: "flower", meaning: "꽃" },
            { word: "sun", meaning: "태양" },
            { word: "moon", meaning: "달" },
            { word: "star", meaning: "별" },
            { word: "water", meaning: "물" }
        ];
        
        console.log(`${this.vocabulary.length}개의 테스트 단어를 로드했습니다.`);
        this.startLearning();
    }
    
    /**
     * 학습 시작
     */
    startLearning() {
        console.log('학습 시작');
        
        // 카드 목록 초기화 (복사본 생성)
        this.currentCards = [...this.vocabulary];
        
        // 섞기 옵션이 활성화된 경우 카드 섞기
        if (CONFIG.APP_SETTINGS.SHUFFLE_CARDS) {
            this.shuffleArray(this.currentCards);
        }
        
        this.currentIndex = 0;
        this.showingMeaning = false;
        this.totalStudied = this.vocabulary.length;
        this.startTime = new Date();
        
        // UI 업데이트
        this.hideLoading();
        this.showApp();
        this.updateProgress();
        this.displayCurrentCard();
        
        // 학생 이름 표시
        this.updateStudentName();
    }
    
    /**
     * 배열 섞기 (Fisher-Yates 알고리즘)
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    /**
     * 현재 카드 표시
     */
    displayCurrentCard() {
        if (this.currentCards.length === 0) {
            this.showCompletion();
            return;
        }
        
        const currentCard = this.currentCards[this.currentIndex];
        
        // 카드 내용 업데이트
        this.elements.word.textContent = currentCard.word;
        this.elements.meaning.textContent = currentCard.meaning;
        
        // 뜻 숨기기
        this.hideMeaning();
        
        // 진행률 업데이트
        this.updateProgress();
        
        console.log(`카드 표시: ${currentCard.word} -> ${currentCard.meaning}`);
    }
    
    /**
     * 뜻 표시/숨기기 토글
     */
    toggleMeaning() {
        if (this.showingMeaning) {
            this.hideMeaning();
        } else {
            this.showMeaning();
        }
    }
    
    /**
     * 뜻 표시
     */
    showMeaning() {
        this.showingMeaning = true;
        this.elements.meaning.classList.remove('hidden');
        this.elements.cardFront.classList.remove('active');
        this.elements.cardBack.classList.add('active');
        
        // 애니메이션 효과
        setTimeout(() => {
            this.elements.meaning.style.opacity = '1';
            this.elements.meaning.style.transform = 'translateY(0)';
        }, 10);
    }
    
    /**
     * 뜻 숨기기
     */
    hideMeaning() {
        this.showingMeaning = false;
        this.elements.meaning.classList.add('hidden');
        this.elements.cardFront.classList.add('active');
        this.elements.cardBack.classList.remove('active');
        
        // 애니메이션 리셋
        this.elements.meaning.style.opacity = '0';
        this.elements.meaning.style.transform = 'translateY(20px)';
    }
    
    /**
     * 정답 처리 - 카드 제거
     */
    markCorrect() {
        console.log('정답 처리: 카드 제거');
        
        // 맞춤 사운드 재생
        if (this.correctSound) {
            this.correctSound();
        }
        
        // 맞춤 효과 적용
        this.elements.flashcard.classList.add('correct');
        
        // 맞은 개수 증가
        this.correctCount++;
        console.log(`맞은 개수: ${this.correctCount}`);
        
        // 애니메이션 완료 후 카드 제거
        setTimeout(() => {
            // 현재 카드를 목록에서 제거
            this.currentCards.splice(this.currentIndex, 1);
            
            // 인덱스 조정
            if (this.currentIndex >= this.currentCards.length) {
                this.currentIndex = 0;
            }
            
            // 효과 클래스 제거
            this.elements.flashcard.classList.remove('correct');
            
            // 다음 카드 표시
            this.displayCurrentCard();
        }, 800); // 애니메이션 시간과 동일
    }
    
    /**
     * 오답 처리 - 카드를 맨 뒤로 이동
     */
    markIncorrect() {
        console.log('오답 처리: 카드를 맨 뒤로 이동');
        
        // 틀림 사운드 재생
        if (this.incorrectSound) {
            this.incorrectSound();
        }
        
        // 틀림 효과 적용
        this.elements.flashcard.classList.add('incorrect');
        
        // 틀린 개수 증가
        this.incorrectCount++;
        console.log(`틀린 개수: ${this.incorrectCount}`);
        
        // 애니메이션 완료 후 카드 이동
        setTimeout(() => {
            // 현재 카드를 맨 뒤로 이동
            const currentCard = this.currentCards[this.currentIndex];
            this.currentCards.splice(this.currentIndex, 1);
            this.currentCards.push(currentCard);
            
            // 인덱스 조정
            if (this.currentIndex >= this.currentCards.length) {
                this.currentIndex = 0;
            }
            
            // 효과 클래스 제거
            this.elements.flashcard.classList.remove('incorrect');
            
            // 다음 카드 표시
            this.displayCurrentCard();
        }, 800); // 애니메이션 시간과 동일
    }
    
    /**
     * 진행률 업데이트
     */
    updateProgress() {
        const total = this.vocabulary.length;
        const remaining = this.currentCards.length;
        const completed = total - remaining;
        const progress = total > 0 ? (completed / total) * 100 : 0;
        
        // 텍스트 업데이트
        this.elements.currentIndex.textContent = completed + 1;
        this.elements.totalCount.textContent = total;
        this.elements.remainingCount.textContent = remaining;
        
        // 진행률 바 업데이트
        this.elements.progressFill.style.width = `${progress}%`;
        
        console.log(`진행률: ${completed}/${total} (${progress.toFixed(1)}%)`);
    }
    
    /**
     * 학생 이름 표시
     */
    updateStudentName() {
        const header = document.querySelector('.header h1');
        if (header && this.studentName) {
            header.textContent = `📚 ${this.studentName}의 영어 단어 플래시카드`;
        }
    }
    
    /**
     * 학습 결과를 Google Apps Script를 통해 저장
     */
    async saveResultsToSheet() {
        try {
            console.log('학습 결과를 시트에 저장 중...');
            console.log(`학생: ${this.studentName}, 맞은 개수: ${this.correctCount}, 틀린 개수: ${this.incorrectCount}`);
            
            // Google Apps Script URL 확인
            if (!window.GAS_API_URL) {
                console.warn('Google Apps Script URL이 설정되지 않아 결과를 저장할 수 없습니다.');
                return;
            }
            
            // 텍스트 형식으로 데이터 전송 (studentName,correctCount,incorrectCount)
            const postData = `${this.studentName},${this.correctCount},${this.incorrectCount}`;
            
            // POST 요청으로 결과 전송
            const response = await fetch(window.GAS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: postData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.text();
            console.log('결과 저장 성공:', result);
            
            // 성공 메시지 확인
            if (result.startsWith('SUCCESS:')) {
                console.log('결과가 성공적으로 저장되었습니다.');
            } else if (result.startsWith('ERROR:')) {
                console.warn('결과 저장 중 오류:', result.substring(6));
            }
            
        } catch (error) {
            console.error('결과 저장 실패:', error);
            // 에러가 발생해도 앱은 계속 작동
        }
    }
    
    /**
     * 학습 완료 처리
     */
    showCompletion() {
        console.log('학습 완료!');
        
        const endTime = new Date();
        const studyTimeMinutes = Math.round((endTime - this.startTime) / 60000);
        
        // 완료 화면 데이터 업데이트
        this.elements.totalStudied.textContent = this.totalStudied;
        this.elements.studyTime.textContent = studyTimeMinutes;
        
        // 맞은 개수와 틀린 개수 표시
        const correctCountElement = document.getElementById('correct-count');
        const incorrectCountElement = document.getElementById('incorrect-count');
        if (correctCountElement) correctCountElement.textContent = this.correctCount;
        if (incorrectCountElement) incorrectCountElement.textContent = this.incorrectCount;
        
        // 화면 전환
        this.elements.app.classList.add('hidden');
        this.elements.completion.classList.remove('hidden');
        
        // 학습 결과를 Google Apps Script를 통해 저장
        this.saveResultsToSheet().then(() => {
            console.log('🎉 축하합니다! 모든 단어를 학습했습니다!');
        }).catch(() => {
            console.log('🎉 축하합니다! 모든 단어를 학습했습니다! (결과 저장 실패)');
        });
    }
    
    /**
     * 에러 표시
     */
    showError(message) {
        console.error('에러:', message);
        this.elements.errorMessage.innerHTML = message; // HTML 태그 허용
        this.hideLoading();
        this.elements.error.classList.remove('hidden');
    }
    
    /**
     * 로딩 화면 숨기기
     */
    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }
    
    /**
     * 앱 화면 표시
     */
    showApp() {
        this.elements.app.classList.remove('hidden');
    }
}

/**
 * 앱 시작
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료, 플래시카드 앱 시작');
    new FlashcardApp();
});

/**
 * 페이지 언로드 시 정리
 */
window.addEventListener('beforeunload', () => {
    console.log('플래시카드 앱 종료');
}); 