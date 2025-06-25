const mysql = require('mysql2/promise');
const { DB_HOST = "localhost", DB_USER = 'root', DB_PASSWORD, DB_NAME = 'generate_ticket' } = process.env;
const connection = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

module.exports = connection;