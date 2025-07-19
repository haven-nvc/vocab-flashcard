/**
 * Google Apps Script 웹 API
 * 구글 스프레드시트의 학생별 탭에서 단어장 데이터를 텍스트로 제공하고 결과를 저장
 * 
 * 배포 방법:
 * 1. Google Apps Script (script.google.com)에서 새 프로젝트 생성
 * 2. 이 코드를 복사하여 붙여넣기
 * 3. SPREADSHEET_ID를 실제 스프레드시트 ID로 변경
 * 4. 배포 > 새 배포 > 웹 앱으로 배포
 * 5. 실행 권한: 나, 액세스 권한: 모든 사용자
 */

// 스프레드시트 ID 설정 (여기에 실제 스프레드시트 ID를 입력하세요)
const SPREADSHEET_ID = '1zijLVSPYePWg6yuiVsaHnjyHcROexFTvkUaWncIpDfw';

/**
 * 스프레드시트 가져오기 함수
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * HTTP GET 요청을 처리하는 함수
 * 스프레드시트 데이터를 텍스트 형태로 반환
 */
function doGet(e) {
  try {
    // CORS 헤더 설정 (더 포괄적으로)
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // URL 파라미터에서 학생 이름 가져오기
    const studentName = e.parameter.student || "Vocab";
    
    // 스프레드시트 가져오기
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName(studentName);
    
    if (!sheet) {
      const errorResponse = `ERROR: ${studentName} 시트를 찾을 수 없습니다. 시트 이름을 확인해주세요.`;
      return ContentService
        .createTextOutput(errorResponse)
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(headers);
    }
    
    // 데이터 범위 가져오기 (첫 번째 행부터 마지막 데이터까지)
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 1) {
      const emptyResponse = `ERROR: 데이터가 없습니다.`;
      return ContentService
        .createTextOutput(emptyResponse)
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(headers);
    }
    
    // A열(영어단어)과 B열(뜻) 데이터 읽기
    const range = sheet.getRange(1, 1, lastRow, 2);
    const values = range.getValues();
    
    // 텍스트 형태로 변환 (단어|뜻 형식)
    let vocabText = '';
    let count = 0;
    
    for (let i = 0; i < values.length; i++) {
      const word = values[i][0]; // A열
      const meaning = values[i][1]; // B열
      
      // 빈 행은 건너뛰기
      if (word && meaning) {
        vocabText += `${String(word).trim()}|${String(meaning).trim()}\n`;
        count++;
      }
    }
    
    if (count === 0) {
      const noDataResponse = `ERROR: 유효한 단어 데이터가 없습니다. A열에 영어단어, B열에 뜻을 입력해주세요.`;
      return ContentService
        .createTextOutput(noDataResponse)
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(headers);
    }
    
    // 성공 응답 (첫 줄에 SUCCESS 표시, 두 번째 줄에 개수, 그 다음부터 데이터)
    const response = `SUCCESS\n${count}\n${vocabText.trim()}`;
    
    return ContentService
      .createTextOutput(response)
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders(headers);
      
  } catch (error) {
    // 에러 처리
    const errorResponse = `ERROR: 데이터를 가져오는 중 오류가 발생했습니다. ${error.toString()}`;
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    return ContentService
      .createTextOutput(errorResponse)
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders(headers);
  }
}

/**
 * HTTP POST 요청을 처리하는 함수
 * 학습 결과를 스프레드시트에 저장
 */
function doPost(e) {
  try {
    // CORS 헤더 설정 (더 포괄적으로)
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // 요청 본문 파싱 (텍스트 형식: studentName,correctCount,incorrectCount)
    const postData = e.postData.contents;
    const parts = postData.split(',');
    
    if (parts.length < 3) {
      return ContentService
        .createTextOutput('ERROR: 잘못된 데이터 형식입니다. studentName,correctCount,incorrectCount 형식으로 보내주세요.')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(headers);
    }
    
    const studentName = parts[0];
    const correctCount = parseInt(parts[1]) || 0;
    const incorrectCount = parseInt(parts[2]) || 0;
    
    if (!studentName) {
      return ContentService
        .createTextOutput('ERROR: 학생 이름이 필요합니다.')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(headers);
    }
    
    // 해당 학생의 시트에 접근
    const spreadsheet = getSpreadsheet();
    const sheet = spreadsheet.getSheetByName(studentName);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(`ERROR: ${studentName} 시트를 찾을 수 없습니다.`)
        .setMimeType(ContentService.MimeType.TEXT)
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
    sheet.getRange(dataRow, 4).setValue(correctCount);
    sheet.getRange(dataRow, 5).setValue(incorrectCount);
    
    const response = `SUCCESS: 결과가 성공적으로 저장되었습니다. ${studentName}, ${dateString}, ${correctCount}, ${incorrectCount}`;
    
    return ContentService
      .createTextOutput(response)
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders(headers);
      
  } catch (error) {
    const errorResponse = `ERROR: 결과 저장 중 오류가 발생했습니다. ${error.toString()}`;
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    return ContentService
      .createTextOutput(errorResponse)
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders(headers);
  }
}

/**
 * CORS 프리플라이트 요청 처리
 */
function doOptions(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
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