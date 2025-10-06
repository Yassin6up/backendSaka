const cron = require('node-cron');
const { query } = require('../config/db');

function scheduleVipExpiryJob() {
  cron.schedule('0 0 * * *', () => {
    const sql = `
      UPDATE places 
      SET sponsored = 0 
      WHERE vipExpiresAt <= NOW() AND sponsored = 1
    `;
    query(sql, [], (err) => {
      if (err) console.error('Error updating expired VIP places:', err);
      else console.log('Expired VIP places updated successfully.');
    });
  });
}

module.exports = { scheduleVipExpiryJob };
