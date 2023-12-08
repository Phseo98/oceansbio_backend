const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = 5001;

app.use(express.json());
app.use(cors());

const connectionConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'oceansbio',
    password: '1234',
    port: 5432
}

const client = new Client(connectionConfig);
client.connect()
    .then(() => console.log("Connected!!"))
    .catch((error) => console.log("err", error));

app.post('/login', (req, res) => {
    const sql = 'SELECT * FROM users WHERE email = $1 AND password= $2';

    client.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err)
            return res.json(err);

        if (data.rows.length > 0) {
            return res.json({ succes: true, message: "Succes Login :)" })
        } else {
            return res.json({ succes: false, message: "Failed Login :(" })
        }
    })
})

app.listen(port, () => {
    console.log('Listening...');
});