/**
 * 플래시카드 앱 설정
 * 
 * 사용법:
 * 1. gas-api.js를 Google Apps Script에 배포하여 GAS_API_URL 설정
 * 2. 구글 스프레드시트에서 A열에 영어단어, B열에 뜻을 입력
 * 3. 스프레드시트를 "링크가 있는 모든 사용자(보기 가능)"로 공유
 */

const CONFIG = {
    // 앱 설정
    APP_SETTINGS: {
        // 카드 뒤집기 애니메이션 시간 (밀리초)
        FLIP_ANIMATION_DURATION: 300,
        
        // 자동 진행 모드 (true: 자동으로 다음 카드, false: 수동)
        AUTO_ADVANCE: false,
        
        // 자동 진행시 대기 시간 (밀리초)
        AUTO_ADVANCE_DELAY: 2000,
        
        // 섞기 모드 (true: 카드 순서를 랜덤으로, false: 원래 순서)
        SHUFFLE_CARDS: true,
        
        // 진행률 저장 (localStorage 사용)
        SAVE_PROGRESS: false
    },
    
    // Google Apps Script URL (결과 저장용)
    GAS_API_URL: "https://script.google.com/macros/s/AKfycbx-YKUywuYdDT44KwUSZH7B9AHJGULS1WuZwr8jGqNEvmK7AQ37pJzd26mT4yKbxgLE/exec",
    
    // UI 텍스트 설정
    MESSAGES: {
        LOADING: "단어장을 불러오는 중...",
        ERROR_NETWORK: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
        ERROR_API: "API 오류가 발생했습니다. 설정을 확인해주세요.",
        ERROR_NO_DATA: "단어장에 데이터가 없습니다.",
        COMPLETION: "모든 단어를 맞췄습니다!",
        COMPLETION_SUBTITLE: "수고하셨습니다! 🎉"
    }
};

// 설정 검증 함수
function validateConfig() {
    // OAuth 클라이언트 ID와 시트 ID는 config.secret.js에서 관리
    return true;
}

// 설정을 전역으로 노출
window.CONFIG = CONFIG;
window.validateConfig = validateConfig; 