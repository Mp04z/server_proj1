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

// ----------------- ADD NEW EXPENSE -----------------
app.post('/expenses', (req, res) => {
    const { user_id, item, paid } = req.body;

    if (!user_id || !item || !paid) {
        return res.status(400).send("Missing required fields");
    }

    const sql = "INSERT INTO expense (user_id, item, paid, date) VALUES (?, ?, ?, NOW())";
    con.query(sql, [user_id, item, paid], (err, result) => {
        if (err) return res.status(500).send("Database server error");
        res.send(`Expense '${item}' added successfully with id ${result.insertId}`);
    });
});

// ----------------- DELETE AN EXPENSE -----------------
app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM expense WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send("Database server error");
        if (result.affectedRows === 0) {
            return res.status(404).send("Expense not found");
        }
        res.send("Deleted!");
    });
});

// ----------------- RUN SERVER -------------------
app.listen(3000, () => {
    console.log('Server is running');
});
