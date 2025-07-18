/**
 * 플래시카드 앱 설정
 * 
 * 사용법:
 * 1. Google Apps Script에서 웹 앱을 배포한 후 받은 URL을 API_URL에 입력
 * 2. 필요시 다른 설정들도 수정 가능
 */

const CONFIG = {
    // Google Apps Script 웹 앱 URL
    // 배포 후 받은 URL을 여기에 입력하세요
    // 예: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
    // ⚠️ CORS 문제 해결을 위해 새로 배포한 URL로 변경해주세요!
    API_URL: "https://script.google.com/macros/s/AKfycbyW-Jt4-GZiOra9ZISJvBVuOZxaEQl4msffN7CUyE-_8NBr9nrFCRrpmoIBAjvIf5Q0/exec",
    
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
    
    // UI 텍스트 설정
    MESSAGES: {
        LOADING: "단어장을 불러오는 중...",
        ERROR_NETWORK: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
        ERROR_API: "API 오류가 발생했습니다. URL 설정을 확인해주세요.",
        ERROR_NO_DATA: "단어장에 데이터가 없습니다.",
        COMPLETION: "모든 단어를 맞췄습니다!",
        COMPLETION_SUBTITLE: "수고하셨습니다! 🎉"
    }
};

// 설정 검증 함수
function validateConfig() {
    if (CONFIG.API_URL === "YOUR_NEW_GOOGLE_APPS_SCRIPT_URL_HERE" || 
        CONFIG.API_URL === "https://script.google.com/macros/s/AKfycbwruAJuRgtMyiuFs7fpkFWCsyXmLOi_PpvyZsiqFVdN-c-K-_Ov7hC2SrZKho_ilIPT/exec") {
        console.warn("⚠️ 경고: Google Apps Script URL이 설정되지 않았습니다!");
        console.warn("config.js 파일에서 API_URL을 실제 URL로 변경해주세요.");
        return false;
    }
    return true;
}

// 설정을 전역으로 노출
window.CONFIG = CONFIG;
window.validateConfig = validateConfig; 