const mysql = require('mysql');
const env = require('./env');

const db = mysql.createConnection({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  multipleStatements: true,
});

// Lazily connect on first query to avoid startup crashes
let connected = false;
function ensureConnection() {
  if (!connected) {
    db.connect((err) => {
      if (err) {
        console.error('Error connecting to database:', err.stack);
        return;
      }
      connected = true;
      console.log('Connected to MySQL database');
    });
  }
}

// Wrap query to ensure connection
const query = (sql, params, cb) => {
  ensureConnection();
  return db.query(sql, params, cb);
};

module.exports = { db, query };
