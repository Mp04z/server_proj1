const express = require('express');
const bcrypt = require('bcrypt');
const con = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------- LOGIN -----------------
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT id, password FROM users WHERE username = ?";
    con.query(sql, [username], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'DB error' });
        }
        if (result.length !== 1) {
            return res.status(401).json({ message: 'Wrong username' });
        }

        bcrypt.compare(password, result[0].password, (err, same) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Password checking error' });
            }
            if (same) {
                res.json({ message: 'Login OK', userId: result[0].id });
            } else {
                res.status(401).json({ message: 'Wrong password' });
            }
        });
    });
});

// ----------------- GET ALL EXPENSES -----------------
app.get('/expenses', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: "Missing userId" });
    }
    const sql = "SELECT id, item, paid, date FROM expense WHERE user_id = ?";
    con.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database server error" });
        }
        res.json(results);
    });
});

// ----------------- GET TODAY'S EXPENSES -----------------
app.get('/expenses/today/:userId', (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: "Missing userId" });
    }
    const sql = "SELECT id, item, paid, date FROM expense WHERE user_id = ? AND DATE(date) = CURDATE()";
    con.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database server error" });
        }
        res.json(results);
    });
});

// ----------------- SEARCH EXPENSE -----------------
app.get('/expenses/search', (req, res) => {
    const { userId, item } = req.query;
    if (!userId || !item) {
        return res.status(400).json({ message: "Missing userId or search term" });
    }
    const sql = "SELECT id, item, paid, date FROM expense WHERE user_id = ? AND item LIKE ?";
    con.query(sql, [userId, `%${item}%`], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database server error" });
        }
        res.json(results);
    });
});

// ----------------- ADD NEW EXPENSE -----------------
app.post('/expenses', (req, res) => {
    const { user_id, item, paid } = req.body;

    if (!user_id || !item || !paid) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = "INSERT INTO expense (user_id, item, paid, date) VALUES (?, ?, ?, NOW())";
    con.query(sql, [user_id, item, paid], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database server error" });
        }
        res.status(200).json({ message: `Expense '${item}' added successfully with id ${result.insertId}` });
    });
});

// ----------------- DELETE AN EXPENSE -----------------
app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM expense WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database server error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(200).json({ message: "Deleted!" });
    });
});

// ----------------- RUN SERVER -------------------
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});