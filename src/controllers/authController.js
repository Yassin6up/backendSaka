const crypto = require('crypto');
const { db } = require('../config/db');
const { sendVerificationCode } = require('../services/smsService');
const { normalizePhone } = require('../utils/phone');

function register(req, res) {
  const { name, phone, password, notificationToken, accountType } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ message: 'الاسم ورقم الهاتف وكلمة المرور مطلوبة' });

  const normalizedPhone = normalizePhone(phone);
  const token = crypto.randomBytes(64).toString('hex');
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const sms = `رمز التحقق الخاص بك هو ${verificationCode}`;

  const sqlCheck = 'SELECT * FROM users WHERE phone = ?';
  db.query(sqlCheck, [normalizedPhone], (err, result) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم الداخلي', error: err });
    if (result.length > 0) return res.status(400).json({ message: 'رقم الهاتف مستخدم بالفعل' });

    const sqlInsert = `
      INSERT INTO users (
        name, phone, password, phone_verified, session_token, notificationToken, accountType, limitPosts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'business' THEN 100 ELSE DEFAULT(limitPosts) END)
    `;

    const params = [
      name,
      normalizedPhone,
      password,
      false,
      token,
      notificationToken || null,
      accountType || 'personal',
      accountType || 'personal',
    ];

    db.query(sqlInsert, params, (insertErr, insertResult) => {
      if (insertErr) return res.status(500).json({ message: 'خطأ في الخادم الداخلي', error: insertErr });

      const sqlSelect = 'SELECT * FROM users WHERE id = ?';
      db.query(sqlSelect, [insertResult.insertId], (selectErr, userResult) => {
        if (selectErr) return res.status(500).json({ message: 'خطأ في الخادم الداخلي', error: selectErr });

        const registeredUser = userResult[0];
        sendVerificationCode(normalizedPhone, sms)
          .then(() => {
            const sqlVerifyInsert = 'INSERT INTO verifications (phone, code) VALUES (?, ?)';
            db.query(sqlVerifyInsert, [normalizedPhone, verificationCode], (verifyErr) => {
              if (verifyErr) return res.status(500).json({ message: 'خطأ في الخادم الداخلي', error: verifyErr });
              res.status(200).json({ message: 'تم تسجيل المستخدم بنجاح.', user: registeredUser });
            });
          })
          .catch((error) => res.status(500).json({ message: 'فشل في إرسال رمز التحقق', error: error.message }));
      });
    });
  });
}

function login(req, res) {
  const { phone, password, notificationToken } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'رقم الهاتف وكلمة المرور مطلوبان!' });

  const normalizedPhone = normalizePhone(phone);
  const sql = 'SELECT * FROM users WHERE phone = ?';
  db.query(sql, [normalizedPhone], (err, results) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم الداخلي', error: err });
    if (results.length === 0 || results[0].password !== password)
      return res.status(404).json({ message: 'رقم الهاتف أو كلمة المرور غير صحيحة!' });

    if (!results[0].phone_verified) {
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      const message = `رمز التحقق الخاص بك هو ${verificationCode}`;
      sendVerificationCode(normalizedPhone, message)
        .then(() => {
          const sql = 'UPDATE verifications SET code = ? WHERE phone = ?';
          db.query(sql, [verificationCode, phone], (err2) => {
            if (err2) return res.status(500).json({ message: 'خطأ في الخادم الداخلي', error: err2 });
            res.status(200).json({ message: 'تم إرسال رمز التحقق مرة أخرى.', userId: results[0].id });
          });
        })
        .catch((error) => res.status(500).json({ message: 'فشل في إرسال رمز التحقق', error: error.message }));
      return;
    }

    const sessionToken = crypto.randomBytes(64).toString('hex');
    const updateSql = 'UPDATE users SET session_token = ? , notificationToken = ?  WHERE id = ?';
    db.query(updateSql, [sessionToken, notificationToken, results[0].id], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: 'فشل في تحديث رمز الجلسة', error: updateErr });
      res.status(200).json({ message: 'تسجيل الدخول ناجح!', user: results[0], sessionToken });
    });
  });
}

function verifyPhone(req, res) {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ message: 'Phone number and verification code are required!' });

  const normalizedPhone = normalizePhone(phone);
  const sql = 'SELECT * FROM verifications WHERE phone = ? AND code = ?';
  db.query(sql, [normalizedPhone, code], (err, results) => {
    if (err) return res.status(500).json({ message: 'Internal server error', error: err });
    if (results.length === 0) return res.status(400).json({ message: 'Invalid verification code!' });

    const updateSql = 'UPDATE users SET phone_verified = true WHERE phone = ?';
    db.query(updateSql, [normalizedPhone], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: 'Internal server error', error: updateErr });
      const deleteSql = 'DELETE FROM verifications WHERE phone = ?';
      db.query(deleteSql, [normalizedPhone], (deleteErr) => {
        if (deleteErr) return res.status(500).json({ message: 'Internal server error', error: deleteErr });
        const userSql = 'SELECT * FROM users WHERE phone = ?';
        db.query(userSql, [normalizedPhone], (userErr, userResults) => {
          if (userErr) return res.status(500).json({ message: 'Internal server error', error: userErr });
          if (userResults.length === 0) return res.status(404).json({ message: 'User not found!' });
          res.status(200).json({ message: 'Phone number verified successfully!', user: userResults[0] });
        });
      });
    });
  });
}

function checkPhone(req, res) {
  const { phoneNumber } = req.body;
  const phone = normalizePhone(phoneNumber);
  const sql = 'SELECT * FROM users WHERE phone = ?';
  db.query(sql, [phone], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'An error occurred while retrieving user' });

    if (result.length > 0) {
      const user = result[0];
      const lastSentTime = user.lastCodeSentTime ? new Date(user.lastCodeSentTime) : null;
      const now = new Date();
      if (lastSentTime && now - lastSentTime < 30000) {
        return res.status(429).json({ message: 'Please wait before requesting another code.', success: false });
      }
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      const message = `رمز استرجاع كلمة المرور هو ${verificationCode}`;
      sendVerificationCode(phone, message)
        .then(() => {
          const updateSql = 'UPDATE users SET lastCodeSentTime = ? WHERE phone = ?';
          db.query(updateSql, [now, phone], (err2) => {
            if (err2) return res.json({ err: err2 });
            res.status(200).json({ message: 'Phone found and the verification code was sent to the phone number.', success: true, code: verificationCode });
          });
        })
        .catch((error) => res.status(500).json({ message: 'Failed to send verification code', error: error.message }));
    } else {
      res.status(200).json({ success: false, message: 'Phone number not found' });
    }
  });
}

function resetPasswordForget(req, res) {
  const { phoneNumber, newPassword } = req.body;
  const normalizedPhone = normalizePhone(phoneNumber);
  const sql = 'SELECT * FROM users WHERE phone = ?';
  db.query(sql, [normalizedPhone], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'An error occurred while retrieving user' });
    if (result.length > 0) {
      const updateSql = 'UPDATE users SET password = ? WHERE phone = ?';
      db.query(updateSql, [newPassword, normalizedPhone], (err2, updateResult) => {
        if (err2) return res.status(500).json({ success: false, message: 'An error occurred while updating password' });
        if (updateResult.affectedRows > 0) {
          const userSql = 'SELECT * FROM users WHERE phone = ?';
          db.query(userSql, [normalizedPhone], (err3, updatedUser) => {
            if (err3) return res.status(500).json({ success: false, message: 'An error occurred while retrieving updated user data' });
            res.json({ success: true, message: 'Password updated successfully', user: updatedUser[0] });
          });
        } else {
          res.status(400).json({ success: false, message: 'Phone number not found' });
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Phone number not found' });
    }
  });
}

module.exports = { register, login, verifyPhone, checkPhone, resetPasswordForget };
