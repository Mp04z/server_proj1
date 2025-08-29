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
        if (err) {
            return res.status(500).json({ message: 'DB error' });
        }
        if (result.length !== 1) {
            return res.status(401).json({ message: 'Wrong username' });
        }

        bcrypt.compare(password, result[0].password, (err, same) => {
            if (err) {
                return res.status(500).json({ message: 'Password checking error' });
            }
            if (same) {
                    res.status(200).json({ message: 'Login successful!', userId: result[0].id });
            } else {
                res.status(401).json({ message: 'Wrong password' });
            }
        });
    });
});


// ----------------- GET ALL EXPENSES -----------------
app.get('/expenses', (req, res) => {
    const userId = req.query.userId;
    const sql = "SELECT id, item, paid, date FROM expense WHERE user_id = ?";
    con.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).send("Database server error");
        res.json(results);
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



// ----------------- ADD NEW EXPENSE -----------------
app.post('/expenses', (req, res) => {
    const { user_id, item, paid } = req.body;
    if (!user_id || !item || !paid) {
        return res.status(400).send("Missing required fields");
    }
    const sql = "INSERT INTO expense (user_id, item, paid, date) VALUES (?, ?, ?, NOW())";
    con.query(sql, [user_id, item, paid], (err, result) => {
        if (err) return res.status(500).send("Database server error");
        res.status(200).json({ message: `Expense '${item}' added successfully with id ${result.insertId}` });
    });
});

// ----------------- DELETE AN EXPENSE -----------------
app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId; // This is the old code, which is correct**
    // The client has to send this query parameter**

    const checkSql = "SELECT * FROM expense WHERE id = ? AND user_id = ?";
    con.query(checkSql, [id, userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(403).json({ message: "Not allowed to delete this item or item not found!" });
        const deleteSql = "DELETE FROM expense WHERE id = ?";
        con.query(deleteSql, [id], (err, result) => {
            if (err) return res.status(500).json({ message: "Delete error" });
            res.status(200).json({ message: "Deleted!" });
        });
    });
});

// ----------------- RUN SERVER -------------------
app.listen(3000, () => {
    console.log('Server is running');
});