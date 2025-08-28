const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const con = require('./db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/password/:raw', (req, res) => {
    const raw = req.params.raw;
    bcrypt.hash(raw, 10, (err, hash) => {
        if(err) {
            return res.status(500).send('Hashing error');
        }
        res.send(hash);
    })
})

// --- login ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";
    con.query(sql, [username], (err, result) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        if (result.length !== 1) return res.status(400).json({ message: 'Wrong username' });

        bcrypt.compare(password, result[0].password, (err, same) => {
            if (err) return res.status(500).json({ message: 'Password checking error' });
            if (same) {
                res.json({
                    message: 'Login OK',
                    userId: result[0].id
                });
            } else {
                return res.status(401).json({ message: 'Wrong password' });
            }
        });
    });
});

// --- get today's expenses ---
app.get('/expenses/today/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT item, paid, date FROM expense WHERE user_id=? AND DATE(date)=CURDATE()";
    con.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).send('DB error');
        res.json(rows);
    });
});


app.listen(3000, () => {
    console.log('Server is running');
});