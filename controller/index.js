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
client.connect()
    .then(() => console.log("Connected!!"))
    .catch((error) => console.log("err", error));

const login = (req, res) => {
    const sql = 'SELECT * FROM users WHERE email = $1 AND password= $2';

    client.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err)
            res.json(err);

        const userInfo = data.rows.length > 0;
        if (userInfo) {
            // res.json({ success: "good" });
            // accessToken발급
            const accessToken = jwt.sign({ // HEADER
                id: data.rows[0].id,
                email: data.rows[0].email
            }, process.env.ACCESS_SECRET, { // Signature
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

            res.status(200).json(data);
        } else {
            res.json({ success: "failed" });
        }
    })
};

const accessToken = (req, res) => {
    try {
        const token = req.cookies.accessToken;
        const data = jwt.verify(token, process.env.ACCESS_SECRET);
        const query = "SELECT user_id,email FROM users WHERE email = $1";

        client.query(query, [data.email], (err, result) => {
            res.status(200).json({ userInfo: result.rows[0] });
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const refreshToken = (req, res) => {
    // 용도: accestoken을 갱신.
    try {
        const token = req.cookies.refreshToken;
        const data = jwt.verify(token, process.env.REFRESH_SECRET); // 복호화
        const query = "SELECT user_id,email FROM users WHERE email = $1";

        client.query(query, [data.email], (err, result) => {
            const accessToken = jwt.sign({// 1.유저정보  2. .env파일 access,refresh토큰 지정
                id: result.rows[0].user_id,
                email: result.rows[0].email
            }, process.env.ACCESS_SECRET, {
                expiresIn: '1m',     // 유효기간
                issuer: 'About Tech' // 발행자
            })

            res.cookie("accessToken", accessToken, {
                secure: false,   // http와 https의 차이를 명시
                httpOnly: true,  // js와 http중 어디서 접근할지 지정(true=js접근 불가)
            })

            res.status(200).json("Access Token recreated :)");
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const loginSuccess = (req, res) => {
    try {
        const token = req.cookies.accessToken;
        const data = jwt.verify(token, process.env.ACCESS_SECRET);
        const query = "SELECT user_id,email FROM users WHERE email = $1";

        client.query(query, [data.email], (err, result) => {

            res.status(200).json(result.rows[0]);
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const logout = (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        // const data = jwt.verify(token, process.env.ACCESS_SECRET);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json(token);
    } catch (error) {
        res.status(500).json("Logout Failed :(");
    }
};

// 모듈형태로 관리 
module.exports = {
    login,
    accessToken,
    refreshToken,
    loginSuccess,
    logout
}