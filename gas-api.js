/**
 * Google Apps Script 웹 API
 * 구글 스프레드시트의 "Vocab" 시트에서 단어장 데이터를 JSON으로 제공
 * 
 * 배포 방법:
 * 1. Google Apps Script (script.google.com)에서 새 프로젝트 생성
 * 2. 이 코드를 복사하여 붙여넣기
 * 3. 배포 > 새 배포 > 웹 앱으로 배포
 * 4. 실행 권한: 나, 액세스 권한: 모든 사용자
 */

/**
 * HTTP GET 요청을 처리하는 함수
 * 스프레드시트 데이터를 JSON 형태로 반환
 */
function doGet(e) {
  try {
    // JSONP 콜백 함수명 가져오기
    const callback = e.parameter.callback;
    
    // 현재 스프레드시트의 "Vocab" 시트에 접근
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vocab");
    
    if (!sheet) {
      const errorResponse = {
        error: "Vocab 시트를 찾을 수 없습니다. 시트 이름을 확인해주세요."
      };
      
      if (callback) {
        return ContentService
          .createTextOutput(`${callback}(${JSON.stringify(errorResponse)})`)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify(errorResponse))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // 데이터 범위 가져오기 (첫 번째 행부터 마지막 데이터까지)
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 1) {
      const emptyResponse = {
        error: "데이터가 없습니다.",
        data: []
      };
      
      if (callback) {
        return ContentService
          .createTextOutput(`${callback}(${JSON.stringify(emptyResponse)})`)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify(emptyResponse))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // A열(영어단어)과 B열(뜻) 데이터 읽기
    const range = sheet.getRange(1, 1, lastRow, 2);
    const values = range.getValues();
    
    // JSON 형태로 변환
    const vocabData = [];
    
    for (let i = 0; i < values.length; i++) {
      const word = values[i][0]; // A열
      const meaning = values[i][1]; // B열
      
      // 빈 행은 건너뛰기
      if (word && meaning) {
        vocabData.push({
          word: String(word).trim(),
          meaning: String(meaning).trim()
        });
      }
    }
    
    // CORS 허용을 위한 응답 생성
    const response = {
      success: true,
      count: vocabData.length,
      data: vocabData,
      timestamp: new Date().toISOString()
    };
    
    if (callback) {
      // JSONP 응답
      return ContentService
        .createTextOutput(`${callback}(${JSON.stringify(response)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      // 일반 JSON 응답
      return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    // 에러 처리
    const errorResponse = {
      success: false,
      error: error.toString(),
      message: "데이터를 가져오는 중 오류가 발생했습니다."
    };
    
    const callback = e.parameter.callback;
    
    if (callback) {
      return ContentService
        .createTextOutput(`${callback}(${JSON.stringify(errorResponse)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

/**
 * CORS 프리플라이트 요청 처리
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * 테스트용 함수 - Apps Script 편집기에서 실행하여 테스트 가능
 */
function testApi() {
  const result = doGet();
  const output = result.getContent();
  console.log(output);
  return output;
} 