const express = require('express');
const bcrypt = require('bcrypt');
const con = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------- ADD ITEM -------------------
app.post('/addexpense', (req, res) => {
  console.log("📦 Received:", req.body);  // <== debug

  const { item, paid } = req.body;
  const sql = "INSERT INTO expense (item, paid) VALUES (?, ?)";
  con.query(sql, [item, paid], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ message: "Expense added", id: result.insertId });
  });
});


// ----------------- RUN SERVER -------------------
app.listen(3000, () => {
  console.log('Server is running');
});