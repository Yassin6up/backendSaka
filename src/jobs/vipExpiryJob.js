const cron = require('node-cron');
const { db } = require('../config/db');

function registerVipExpiryJob() {
  cron.schedule('0 0 * * *', () => {
    const sql = `UPDATE places SET sponsored = 0 WHERE vipExpiresAt <= NOW() AND sponsored = 1`;
    db.query(sql, (err) => {
      if (err) console.error('Error updating expired VIP places:', err);
      else console.log('Expired VIP places updated successfully.');
    });
  });
}

module.exports = { registerVipExpiryJob };
