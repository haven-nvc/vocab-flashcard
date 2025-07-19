/**
 * Google Apps Script 웹 API
 * 구글 스프레드시트의 학생별 탭에서 단어장 데이터를 JSON으로 제공하고 결과를 저장
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
    // CORS 헤더 설정
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };
    
    // JSONP 콜백 함수명 가져오기
    const callback = e.parameter.callback;
    
    // URL 파라미터에서 학생 이름 가져오기
    const studentName = e.parameter.student || "Vocab";
    
    // 현재 스프레드시트의 학생별 시트에 접근
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(studentName);
    
    if (!sheet) {
      const errorResponse = {
        error: `${studentName} 시트를 찾을 수 없습니다. 시트 이름을 확인해주세요.`
      };
      
      if (callback) {
        return ContentService
          .createTextOutput(`${callback}(${JSON.stringify(errorResponse)})`)
          .setMimeType(ContentService.MimeType.JAVASCRIPT)
          .setHeaders(headers);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify(errorResponse))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders(headers);
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
          .setMimeType(ContentService.MimeType.JAVASCRIPT)
          .setHeaders(headers);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify(emptyResponse))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders(headers);
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
        .setMimeType(ContentService.MimeType.JAVASCRIPT)
        .setHeaders(headers);
    } else {
      // 일반 JSON 응답
      return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
      
  } catch (error) {
    // 에러 처리
    const errorResponse = {
      success: false,
      error: error.toString(),
      message: "데이터를 가져오는 중 오류가 발생했습니다."
    };
    
    const callback = e.parameter.callback;
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };
    
    if (callback) {
      return ContentService
        .createTextOutput(`${callback}(${JSON.stringify(errorResponse)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT)
        .setHeaders(headers);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
  }
}

/**
 * HTTP POST 요청을 처리하는 함수
 * 학습 결과를 스프레드시트에 저장
 */
function doPost(e) {
  try {
    // CORS 헤더 설정
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };
    
    // 요청 본문 파싱
    const postData = JSON.parse(e.postData.contents);
    const { studentName, correctCount, incorrectCount } = postData;
    
    if (!studentName) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: "학생 이름이 필요합니다." }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
    // 해당 학생의 시트에 접근
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(studentName);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: `${studentName} 시트를 찾을 수 없습니다.` }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
    // 현재 날짜
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    // C열과 D열에 결과 저장 (날짜, 맞은 개수, 틀린 개수)
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    
    // 헤더가 없는 경우 헤더 추가
    if (lastRow === 0) {
      sheet.getRange(1, 3).setValue("날짜");
      sheet.getRange(1, 4).setValue("맞은 개수");
      sheet.getRange(1, 5).setValue("틀린 개수");
    }
    
    // 데이터 저장
    const dataRow = lastRow === 0 ? 2 : nextRow;
    sheet.getRange(dataRow, 3).setValue(dateString);
    sheet.getRange(dataRow, 4).setValue(correctCount || 0);
    sheet.getRange(dataRow, 5).setValue(incorrectCount || 0);
    
    const response = {
      success: true,
      message: "결과가 성공적으로 저장되었습니다.",
      data: {
        studentName,
        date: dateString,
        correctCount: correctCount || 0,
        incorrectCount: incorrectCount || 0
      }
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
      
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.toString(),
      message: "결과 저장 중 오류가 발생했습니다."
    };
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

/**
 * CORS 프리플라이트 요청 처리
 */
function doOptions(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
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