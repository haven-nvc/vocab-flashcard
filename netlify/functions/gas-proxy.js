const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400'
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Google Apps Script 웹앱 URL (환경 변수에서 가져오거나 기본값 사용)
    const GAS_WEBAPP_URL = process.env.GAS_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbxpu9oj2KEYWByxP2lUNy6HmXfvHIFQ7ecnnSmDNxqkBre_ZE88vN66DGswrz9QvqM/exec';
    
    // URL 파라미터 추출
    const queryParams = event.queryStringParameters || {};
    const student = queryParams.student || 'Vocab';
    
    let gasUrl = `${GAS_WEBAPP_URL}?student=${encodeURIComponent(student)}`;
    
    // POST 요청인 경우
    if (event.httpMethod === 'POST') {
      const response = await fetch(GAS_WEBAPP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: event.body
      });
      
      const data = await response.text();
      
      return {
        statusCode: response.status,
        headers: {
          ...headers,
          'Content-Type': 'text/plain; charset=utf-8'
        },
        body: data
      };
    }
    
    // GET 요청인 경우
    const response = await fetch(gasUrl);
    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: data
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: `ERROR: 프록시 서버 오류가 발생했습니다. ${error.message}`
    };
  }
}; 