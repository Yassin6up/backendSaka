const cron = require('node-cron');
const db = require('../config/database');

// Clean up old notifications daily at midnight
const cleanupOldNotifications = () => {
  cron.schedule('0 0 * * *', () => {
    console.log('Running daily cleanup of old notifications...');
    
    const sql = `
      DELETE FROM notifications 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error cleaning up old notifications:', err);
      } else {
        console.log(`Cleaned up ${result.affectedRows} old notifications`);
      }
    });
  });
};

// Clean up old verification codes every hour
const cleanupOldVerifications = () => {
  cron.schedule('0 * * * *', () => {
    console.log('Running hourly cleanup of old verification codes...');
    
    const sql = `
      DELETE FROM verifications 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `;
    
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error cleaning up old verification codes:', err);
      } else {
        console.log(`Cleaned up ${result.affectedRows} old verification codes`);
      }
    });
  });
};

const initializeCronJobs = () => {
  console.log('Initializing cron jobs...');
  cleanupOldNotifications();
  cleanupOldVerifications();
  console.log('Cron jobs initialized successfully');
};

module.exports = {
  initializeCronJobs
};