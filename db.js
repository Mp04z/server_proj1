const mysql = require('mysql2');
<<<<<<< HEAD

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'expenses'
});

module.exports = con;
=======
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "expenses"
})
module.exports = con;
>>>>>>> login
