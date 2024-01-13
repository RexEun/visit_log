


const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@@6q9w7e4R',
  database: 'logdata',
});

db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 오류:', err);
  } else {
    console.log('MySQL에 성공적으로 연결되었습니다.');
  }
});

// 홈 화면
app.get('/', (req, res) => {
  res.send('안녕하세요! 홈 화면에 오신 것을 환영합니다.');
});

// 방문자 정보를 기록하고 /info 페이지에 테이블로 표시
app.get('/log', (req, res) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent');
  const acceptLanguage = req.get('Accept-Language');
  const referer = req.get('Referer');
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const host = req.get('host');
  const connection = req.get('Connection');

  const logQuery = `INSERT INTO visitor_info (ip_address, user_agent, accept_language, referer, time_zone, host, connection) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(logQuery, [ip, userAgent, acceptLanguage, referer, timeZone, host, connection], (err, results) => {
    if (err) {
      console.error('방문자 정보를 기록하는 도중 오류 발생:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('방문자 정보가 성공적으로 기록되었습니다.');
      res.send('방문자 정보가 성공적으로 기록되었습니다.');
    }
  });
});

// /info 페이지에 테이블로 표시
app.get('/info', (req, res) => {
  const infoQuery = 'SELECT * FROM visitor_info';
  
  db.query(infoQuery, (err, results) => {
    if (err) {
      console.error('방문자 정보를 조회하는 도중 오류 발생:', err);
      res.status(500).send('Internal Server Error');
    } else {
      const tableRows = results.map((row) => {
        return `<tr>
                  <td>${row.ip_address}</td>
                  <td>${row.user_agent}</td>
                  <td>${row.accept_language}</td>
                  <td>${row.referer}</td>
                  <td>${row.time_zone}</td>
                  <td>${row.host}</td>
                  <td>${row.connection}</td>
                  <td>${row.created_at}</td>
                </tr>`;
      });

      const infoTable = `
        <table border="1">
          <tr>
            <th>IP Address</th>
            <th>User-Agent</th>
            <th>Accept-Language</th>
            <th>Referer</th>
            <th>Time Zone</th>
            <th>Host</th>
            <th>Connection</th>
            <th>Created At</th>
          </tr>
          ${tableRows.join('')}
        </table>
      `;

      res.send(infoTable);
    }
  });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
