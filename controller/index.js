const { Client } = require('pg');
const connectionConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'oceansbio',
    password: '1234',
    port: 5432
}
const jwt = require('jsonwebtoken');

const client = new Client(connectionConfig);
const emailQuery = 'SELECT * FROM users WHERE email = "phseo98@gmail.com"';
client.connect()
    .then(() => console.log("Connected!!"))
    .catch((error) => console.log("err", error));

const login = (req, res) => {
    const sql = 'SELECT * FROM users WHERE email = $1 AND password= $2';

    client.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err)
            return res.json(err);

        const userInfo = data.rows.length > 0;
        if (userInfo) {
            // res.json({ success: "good" });
            // accessToken발급
            const accessToken = jwt.sign({// 1.유저정보  2. .env파일 access,refresh토큰 지정
                id: data.rows[0].id,
                email: data.rows[0].email
            }, process.env.ACCESS_SECRET, {
                expiresIn: '1m',     // 유효기간
                issuer: 'About Tech' // 발행자
            })

            // refreshToken발급 
            // accessToken을 갱신시키기 위한 용도이기 때문에  유효기간을 길게 설정
            const refreshToken = jwt.sign({
                id: data.rows[0].id,
                email: data.rows[0].email
            }, process.env.REFRESH_SECRET, {
                expiresIn: '24h',    // 유효기간
                issuer: 'About Tech' // 발행자
            })

            // 쿠키에 담아서 Token전송
            res.cookie("accessToken", accessToken, {
                secure: false,   // http와 https의 차이를 명시
                httpOnly: true,  // js와 http중 어디서 접근할지 지정(true=js접근 불가)
            })

            res.cookie("refreshToken", refreshToken, {
                secure: false,   // http와 https의 차이를 명시
                httpOnly: true,  // js와 http중 어디서 접근할지 지정(true=js접근 불가)
            })

            res.status(200).json("Login success");
        } else {
            res.json({ success: "failed" });
        }
    })
};

const accessToken = (req, res) => {
    res.status(200).json({ gg: "GG" })
};

const refreshToken = (req, res) => {

};

const loginSuccess = (req, res) => {

};

const logout = (req, res) => {

};

// 모듈형태로 관리 
module.exports = {
    login,
    accessToken,
    refreshToken,
    loginSuccess,
    logout
}