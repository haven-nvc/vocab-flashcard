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
        
        // 키보드 이벤트 리스너 등록
        this.setupEventListeners();
        console.log('이벤트 리스너 설정 완료');
        
        // 데이터 로드
        console.log('데이터 로드 시작...');
        await this.loadVocabulary();
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            // 로딩 중이거나 에러 상태에서는 키 입력 무시
            if (!this.elements.app.classList.contains('hidden')) {
                this.handleKeyPress(e);
            }
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
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.toggleMeaning();
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                if (this.showingMeaning) {
                    this.markCorrect();
                }
                break;
                
            case 'ArrowLeft':
                event.preventDefault();
                if (this.showingMeaning) {
                    this.markIncorrect();
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
            
            // OAuth 클라이언트 ID와 시트 정보 확인
            if (!window.OAuth_CLIENT_ID || window.OAuth_CLIENT_ID === 'YOUR_OAUTH_CLIENT_ID_HERE') {
                throw new Error('OAuth 클라이언트 ID가 설정되지 않았습니다. config.secret.js를 확인해주세요.');
            }
            
            if (!window.SHEET_ID || window.SHEET_ID === 'YOUR_SHEET_ID_HERE') {
                throw new Error('시트 ID가 설정되지 않았습니다. config.secret.js를 확인해주세요.');
            }
            
            console.log('OAuth 클라이언트 ID:', window.OAuth_CLIENT_ID);
            console.log('시트 ID:', window.SHEET_ID);
            console.log('데이터 범위:', window.DATA_RANGE);
            
            // Google Sheets API v4 호출
            const apiUrl = `${window.SHEETS_API_BASE}/${window.SHEET_ID}/values/${window.DATA_RANGE}?key=${window.OAuth_CLIENT_ID}`;
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('API 응답 상태:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API 응답:', data);
            
            if (!data.values || data.values.length < 2) {
                throw new Error('스프레드시트에 데이터가 없습니다. A열에 영어단어, B열에 뜻을 입력해주세요.');
            }
            
            // 첫 번째 행은 헤더로 간주하고 제외, 나머지를 단어 데이터로 변환
            this.vocabulary = data.values.slice(1).map(row => ({
                word: String(row[0] || '').trim(),
                meaning: String(row[1] || '').trim()
            })).filter(item => item.word && item.meaning); // 빈 행 제거
            
            console.log(`${this.vocabulary.length}개의 단어를 로드했습니다.`);
            
            if (this.vocabulary.length === 0) {
                throw new Error('유효한 단어 데이터가 없습니다. A열에 영어단어, B열에 뜻을 입력해주세요.');
            }
            
            this.startLearning();
            
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            console.error('오류 타입:', error.constructor.name);
            console.error('오류 메시지:', error.message);
            console.error('오류 스택:', error.stack);
            
            // 네트워크 오류인지 확인
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.warn('네트워크 오류 감지, 로컬 테스트 데이터 사용');
            } else if (error.message.includes('CORS')) {
                console.warn('CORS 오류 감지, 로컬 테스트 데이터 사용');
            } else {
                console.warn('기타 오류 감지, 로컬 테스트 데이터 사용');
            }
            
            // API 실패 시 로컬 데이터 사용
            console.log('Google Sheets API 호출 실패, 로컬 테스트 데이터로 대체');
            this.useLocalTestData();
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
        
        // 현재 카드를 목록에서 제거
        this.currentCards.splice(this.currentIndex, 1);
        
        // 인덱스 조정
        if (this.currentIndex >= this.currentCards.length) {
            this.currentIndex = 0;
        }
        
        // 다음 카드 표시
        this.displayCurrentCard();
    }
    
    /**
     * 오답 처리 - 카드를 맨 뒤로 이동
     */
    markIncorrect() {
        console.log('오답 처리: 카드를 맨 뒤로 이동');
        
        // 현재 카드를 맨 뒤로 이동
        const currentCard = this.currentCards[this.currentIndex];
        this.currentCards.splice(this.currentIndex, 1);
        this.currentCards.push(currentCard);
        
        // 인덱스 조정
        if (this.currentIndex >= this.currentCards.length) {
            this.currentIndex = 0;
        }
        
        // 다음 카드 표시
        this.displayCurrentCard();
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
     * 학습 완료 처리
     */
    showCompletion() {
        console.log('학습 완료!');
        
        const endTime = new Date();
        const studyTimeMinutes = Math.round((endTime - this.startTime) / 60000);
        
        // 완료 화면 데이터 업데이트
        this.elements.totalStudied.textContent = this.totalStudied;
        this.elements.studyTime.textContent = studyTimeMinutes;
        
        // 화면 전환
        this.elements.app.classList.add('hidden');
        this.elements.completion.classList.remove('hidden');
        
        // 축하 메시지
        setTimeout(() => {
            console.log('🎉 축하합니다! 모든 단어를 학습했습니다!');
        }, 500);
    }
    
    /**
     * 에러 표시
     */
    showError(message) {
        console.error('에러:', message);
        this.elements.errorMessage.textContent = message;
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