const mysql = require('mysql');
const env = require('./env');

const db = mysql.createConnection({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
});

function connectDb() {
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err.stack);
      return;
    }
    console.log('Connected to MySQL database');
  });
}

module.exports = { db, connectDb };
