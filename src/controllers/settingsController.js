const { db } = require('../config/db');

function getSubscriptions(req, res) {
  db.query('SELECT * FROM subscriptions', (err, result) => {
    if (err) return res.status(500).send('Error fetching subscriptions.');
    res.json(result);
  });
}

module.exports = { getSubscriptions };
