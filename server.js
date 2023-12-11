const express = require('express');
const dotenv = require('dotenv');               // 환경변수로드 라이브러리
const cookieParser = require('cookie-parser');  // 쿠키를 파싱할수 있도록 도와주는 미들웨어
const cors = require('cors');
const {
    login,
    accessToken,
    refreshToken,
    loginSuccess,
    logout
} = require('./controller/index'); // index.js파일은 경로만 잡아주면 알아서 import됨

const app = express();
dotenv.config();

// 기본설정
app.use(express.json()); // json 미들웨어 설정
app.use(cookieParser()); // 쿠키이용
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

// JWT기반 인증 과정
// 1. 로그인
// 2. 사용자확인
// 3. JWT토큰발급
// 4. client응답 + jwt토큰
// 5. 클라이언트 데이터요청
// 6. Access Token 검증
// 7. 응답
app.post('/login', login);               // 로그인
app.get('/accesstoken', accessToken);    // access 토큰 발급
app.get('/refreshtoken', refreshToken);  // refresh 토큰(access 토큰 갱신용도)
app.get('/login/success', loginSuccess); // login 성공(사용자가 요청시 현재 쿠키에 있는 acess토큰을 이용해 사용자 정보 파싱)
app.post('/logout', logout);             // 로그아웃(쿠키에 담긴 access 토큰제거)

app.listen(process.env.PORT, () => {
    console.log(`Server is on ${process.env.PORT}`);
});