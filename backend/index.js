const express = require('express');
//const cors = require('cors');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const https = require('https');
const http = require('http');

const MONGODB_URL = 'mongodb://172.30.1.110:27017';
const MONGODB_DBNAME = 'okpogo';
//const PORT = 8080;

const danwordlist = ["씨발", "ㅅㅂ", "ㅆㅂ", "새끼", "지랄", "좆", "엿", "병신", "존나", "썅", "쌍", "죽여", "시발", "돼지", "염병", "병자", "한남", "한녀", "년", "페미", "동덕", "게이", "인셀", "걸레", "매춘", "자살", "일베", "승만", "정희", "두환", "명박", "근혜", "무현", "재인", "홍준표", "이재명", "안철수", "조국", "석열", "빨갱", "이기야", "딸", "농ㅋ", "농쭉", "천박", "딜도", "오나", "자위", "ㅅㅅ", "섹스", "쎅쓰", "쎅스", "섹수", "니거", "비치", "후장", "딕", "야추", "fuck", "sex", "moron", "bitch", "dick", "slut", "nigger", "위험단어테스트용용용"];

const app = express();

// 인증서 로드
const privateKey = fs.readFileSync('/etc/letsencrypt/live/okpogo.servehttp.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/okpogo.servehttp.com/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

/*
// HTTPS 서버
https.createServer(credentials, app).listen(8080, () => {
    console.log('HTTPS 서버 실행 중 (8080)');
});
*/
// HTTPS 서버 생성
const httpsServer = https.createServer(credentials, app);

// Socket.IO 인스턴스 생성 (HTTPS 서버에 붙임)
const io = new Server(httpsServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// HTTPS 서버 리슨
httpsServer.listen(8080, () => {
  console.log('HTTPS 서버 실행 중 (8080)');
});

// HTTP → HTTPS 리디렉션
http.createServer((req, res) => {
    res.writeHead(301, { Location: 'https://' + req.headers.host + req.url });
    res.end();
}).listen(8081, () => {
    console.log('HTTP 요청을 HTTPS로 리디렉션 중 (80)');
});

app.use(bodyParser.json()); // JSON 파싱 미들웨어 추가

/*
app.set('trust proxy', true);
app.use(cors({
  origin: 'http://okpogo.servehttp.com:3000'
}));
*/

app.use((err, req, res, next) => {
  console.error(err); // 콘솔에는 자세히 출력
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

/*
app.use((req, res, next) => {
  console.log('Request path:', req.path);
  next();
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'http://okpogo.servehttp.com:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return res.sendStatus(200);
  }
  next();
});
*/
let visit=0;

app.post('/api/users/upload', async (req, res, next) => {
  //console.log('postapi');
  let client;
  try {
    client = await MongoClient.connect(MONGODB_URL);
    const collection = client.db(MONGODB_DBNAME).collection('namepw');
    const userinfo = await collection.findOne({ name: req.body[2] });    
    console.log(req.body);
    const titlecheck = danwordlist.some(char => req.body[0].includes(char));
    const contentcheck = danwordlist.some(char => req.body[1].includes(char));
    console.log('check',!userinfo, userinfo.ban, userinfo.pw !== req.body[3],req.body[0] === null,req.body[1] === null,titlecheck,contentcheck);
    
    if (!userinfo || userinfo.ban || userinfo.pw !== req.body[3] || req.body[0] === null || req.body[1] === null || titlecheck || contentcheck) {
      console.log('upload not allowed');
      return res.status(403).send({ error: 'Forbidden' });
    } else {
      const collectionp = client.db(MONGODB_DBNAME).collection('post');
      await collectionp.insertOne({
        name: req.body[2],
        title: req.body[0],
        content: req.body[1]
      });
    }
  } catch (err) {
    next(err);
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.post('/api/users/uploal', async (req, res, next) => {
  let client;
  try {
    client = await MongoClient.connect(MONGODB_URL);
    const collection = client.db(MONGODB_DBNAME).collection('namepw');
    const userinfo = await collection.findOne({ name: req.body[2] });
    const collectionp = client.db(MONGODB_DBNAME).collection('post');
    if (req.body[3]=="yuuka") {
      const finddocuments = await collectionp
      .find({})
      .skip(req.body[2]-1)  // 첫 4개 문서 건너뛰기
      .limit(1)  // 5번째 문서 하나만 가져오기
      .toArray();
      const documentToDelete = finddocuments[0];  // 5번째 문서
      await collectionp.deleteOne({ _id: documentToDelete._id });
      await collection.updateOne({ name: documentToDelete.name}, {$set: { ban: true }});
      
    } else if (req.body[3]=="noa"){
      await collectionp.insertOne({
        name: "관리자",
        title: req.body[0],
        content: req.body[1]
      });
    } else if (req.body[3]=="koyuki"){
      await collection.updateOne({ name: req.body[2]}, {$set: { ban: true }});
    } else if (req.body[3]=="koyukijailbreak"){
      await collection.updateOne({ name: req.body[2]}, {$set: { ban: false }});
    } else if (req.body[3]=="rio"){
      await collection.updateOne({ name: req.body[2]}, {$set: { ban: true }});
      await collectionp.deleteMany({ name: req.body[2] });
    }
  } catch (err) {
    next(err);
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.get('/api/users/read', async (req, res, next) => {
  visit+=1;
  console.log("visit: ",visit);
  let client;
  try {
    client = await MongoClient.connect(MONGODB_URL);
    const collection = client.db(MONGODB_DBNAME).collection('post');
    
    const postinfo = await collection.find({}).toArray();
    res.send(postinfo);
  } catch (err) {
    next(err);
  } finally {
    if (client) {
      client.close();
    }
  }
});

let cookie=0;
app.get('/fortune', async (req, res, next) => {
  cookie+=1;
  console.log("cookie: ",cookie);
  res.send(cookie)
});
  
//codeserver
// Python 코드 실행 요청 처리
app.post('/run', async (req, res) => {
  const code = req.body.code;
  console.log("run python code");
  console.log(code);
  if (!code) {
    return res.status(400).json({ error: '코드가 비어있습니다.' });
  }

  // 1. 임시 파이썬 파일 생성 (리눅스/라즈베리파이 경로)
  const filename = path.join('/tmp', `${uuidv4()}.py`);
  fs.writeFileSync(filename, code);

  // 2. Docker 명령어 설정 (ARM 아키텍처 호환)
  const containerName = `runner-${uuidv4()}`;
  const cmd = `docker run --rm --name ${containerName} --log-driver=none -v ${filename}:/app/script.py:ro --network none python:3.10 python /app/script.py`;

  // 3. Docker 컨테이너에서 실행
  exec(cmd, { timeout: 5000 }, (err, stdout, stderr) => {
    try {
      if (err) {
        if (err.killed) {
          return res.json({ error: '⏰ 실행 시간이 초과되었습니다.' });
        }
        return res.json({ error: stderr || err.message });
      }
      res.json({ output: stdout });
    } finally {
      exec(`docker rm -f ${containerName}`, (rmErr) => {
        if (rmErr) console.error('컨테이너 강제 종료 실패:', rmErr);
      });
      fs.unlink(filename, (unlinkErr) => {
        if (unlinkErr) console.error('임시 파일 삭제 실패:', unlinkErr);
      });
    }
  });
});

// C 컴파일러
app.post('/runc', async (req, res) => {
  const code = req.body.code;
  console.log("run c code");
  console.log(code);
  if (!code) {
    return res.status(400).json({ error: '코드가 비어있습니다.' });
  }

  const filename = path.join('/tmp', `${uuidv4()}.c`);
  const exeName = 'a.out'; // 기본 실행파일명
  const exePath = `/app/${exeName}`;

  fs.writeFileSync(filename, code);

  // gcc가 설치된 ARM 호환 Docker 이미지 사용
  // 컴파일 후 실행까지 한 번에 처리
  const containerName = `runner-${uuidv4()}`;
  const cmd = `docker run --rm --name ${containerName} --log-driver=none -v ${filename}:/app/code.c:ro --network none arm64-c-gcc /bin/bash -c "gcc /app/code.c -o ${exePath} && ${exePath}"`;
  
  exec(cmd, { timeout: 5000 }, (err, stdout, stderr) => {
    try {
      if (err) {
        if (err.killed) {
          return res.json({ error: '⏰ 실행 시간이 초과되었습니다.' });
        }
        return res.json({ error: stderr || err.message });
      }
      res.json({ output: stdout });
    } finally {
      exec(`docker rm -f ${containerName}`, (rmErr) => {
        if (rmErr) console.error('컨테이너 강제 종료 실패:', rmErr);
      });
      // 임시 소스 파일 삭제
      fs.unlink(filename, unlinkErr => {
        if (unlinkErr) console.error('임시 C 파일 삭제 실패:', unlinkErr);
      });
      // 실행 파일은 컨테이너 내부에서 생성되므로 호스트에는 없음
    }
  });
});

//화상회의
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join', (roomId) => {
    socket.join(roomId);
    const clients = io.sockets.adapter.rooms.get(roomId);

    if (clients.size === 1) {
      socket.emit('created'); // 첫 번째 입장자 (caller)
      console.log(`📥 Room [${roomId}] created by ${socket.id}`);
    } else if (clients.size === 2) {
      socket.emit('joined'); // 두 번째 입장자 (callee)
      socket.to(roomId).emit('ready'); // 두 명 다 들어왔으므로 준비 신호
      console.log(`👥 Room [${roomId}] joined by ${socket.id}`);
    } else {
      socket.emit('full');
      console.warn(`🚫 Room [${roomId}] is full. Connection denied for ${socket.id}`);
    }
  });

  socket.on('offer', ({ roomId, sdp, type }) => {
    socket.to(roomId).emit('offer', { sdp, type });
    console.log(`📡 Offer sent in room ${roomId}`);
  });

  socket.on('answer', ({ roomId, sdp, type }) => {
    socket.to(roomId).emit('answer', { sdp, type });
    console.log(`📡 Answer sent in room ${roomId}`);
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// 정적 파일 서빙 (HTML, CSS, JS 등)
app.use(express.static(path.resolve(__dirname,'../front/my-app/build')));
app.use(express.static(path.join(__dirname, 'public')));

// SPA 지원을 위한 fallback
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.resolve(__dirname,'../front/my-app/build','index.html'));
});
