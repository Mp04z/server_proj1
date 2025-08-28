const express = require('express');
const bcrypt = require('bcrypt');
const con = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------- LOGIN -----------------
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    con.query(sql, [username], (err, result) => {
        if (err) return res.status(500).send('DB error');
        if (result.length !== 1) return res.status(401).send('Wrong username');

        bcrypt.compare(password, result[0].password, (err, same) => {
            if (err) return res.status(500).send('Password checking error');
            if (same) {
                res.send('Login OK');
            } else {
                res.status(401).send('Wrong password');
            }
        });
    });
});

// ----------------- GET ALL EXPENSES -----------------
app.get('/expenses', (req, res) => {
    const sql = "SELECT id, item, paid, date FROM expense";
    con.query(sql, (err, results) => {
        if (err) return res.status(500).send("Database server error");
        res.json(results);
    });
});

// ----------------- RUN SERVER -------------------
app.listen(3000, () => {
    console.log('Server is running');
});
