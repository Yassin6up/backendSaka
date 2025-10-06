const { db } = require('../config/db');

function searchUsers(req, res) {
  const searchQuery = req.query.search || '';
  const searchTerm = `%${searchQuery}%`;
  const sql = `SELECT id, name, phone FROM users WHERE name LIKE ? OR phone LIKE ?`;
  db.query(sql, [searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
}

function searchPlaces(req, res) {
  const searchQuery = req.query.search || '';
  const searchTerm = `%${searchQuery}%`;
  const sql = `SELECT id, title FROM places WHERE id LIKE ?`;
  db.query(sql, [searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
}

function searchPlacesByTitle(req, res) {
  const { title } = req.query;
  const sql = 'SELECT * FROM places WHERE title LIKE ? OR id LIKE ?';
  db.query(sql, [`%${title}%`, `%${title}%`], (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    if (results.length === 0) return res.json([]);
    res.json(results);
  });
}

module.exports = { searchUsers, searchPlaces, searchPlacesByTitle };
