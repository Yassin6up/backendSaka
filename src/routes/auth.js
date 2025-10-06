const express = require('express');
const crypto = require('crypto');
const { query } = require('../config/db');
const { sendSms } = require('../services/smsService');
const { normalizeJordanPhone } = require('../utils/phone');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();
const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, phone, password, notificationToken, accountType } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'الاسم ورقم الهاتف وكلمة المرور مطلوبة' });
    }

    const normalizedPhone = normalizeJordanPhone(phone);
    const token = crypto.randomBytes(64).toString('hex');
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const message = `رمز التحقق الخاص بك هو ${verificationCode}`;

    const existing = await new Promise((resolve, reject) =>
      query('SELECT * FROM users WHERE phone = ?', [normalizedPhone], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'رقم الهاتف مستخدم بالفعل' });
    }

    const insertSql = `
      INSERT INTO users (name, phone, password, phone_verified, session_token, notificationToken, accountType, limitPosts)
      VALUES (?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'business' THEN 100 ELSE DEFAULT(limitPosts) END)
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
    const insertResult = await new Promise((resolve, reject) =>
      query(insertSql, params, (e, r) => (e ? reject(e) : resolve(r)))
    );

    await sendSms({ to: normalizedPhone, message });
    await new Promise((resolve, reject) =>
      query('INSERT INTO verifications (phone, code) VALUES (?, ?)', [normalizedPhone, verificationCode], (e) =>
        e ? reject(e) : resolve()
      )
    );

    if (notificationToken && Expo.isExpoPushToken(notificationToken)) {
      const notification = {
        to: notificationToken,
        sound: 'default',
        title: ' مرحبًا بك في تطبيقنا التجريبي!',
        body: 'هذا التطبيق في مرحلته التجريبية. إذا كان لديك أي اقتراحات للتحسين، أخبرنا!',
        data: { type: 'beta_message' },
      };
      await expo.sendPushNotificationsAsync([notification]);
      await new Promise((resolve, reject) =>
        query(
          'INSERT INTO notifications (user_id, from_id, title, message) VALUES (?, ?, ?, ?)',
          [insertResult.insertId, 1, ' مرحبًا بك في تطبيقنا التجريبي!', 'هذا التطبيق في مرحلته التجريبية. إذا كان لديك أي اقتراحات للتحسين، أخبرنا!'],
          (e) => (e ? reject(e) : resolve())
        )
      );
    }

    const [user] = await new Promise((resolve, reject) =>
      query('SELECT * FROM users WHERE id = ?', [insertResult.insertId], (e, r) => (e ? reject(e) : resolve(r)))
    );

    res.status(200).json({ message: 'تم تسجيل المستخدم بنجاح.', user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { phone, password, notificationToken } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'رقم الهاتف وكلمة المرور مطلوبان!' });
    }
    const normalizedPhone = normalizeJordanPhone(phone);

    const users = await new Promise((resolve, reject) =>
      query('SELECT * FROM users WHERE phone = ?', [normalizedPhone], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (users.length === 0 || users[0].password !== password) {
      return res.status(404).json({ message: 'رقم الهاتف أو كلمة المرور غير صحيحة!' });
    }

    if (!users[0].phone_verified) {
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      const message = `رمز التحقق الخاص بك هو ${verificationCode}`;
      await sendSms({ to: normalizedPhone, message });
      await new Promise((resolve, reject) =>
        query('UPDATE verifications SET code = ? WHERE phone = ?', [verificationCode, phone], (e) =>
          e ? reject(e) : resolve()
        )
      );
      return res.status(200).json({ message: 'تم إرسال رمز التحقق مرة أخرى.', userId: users[0].id });
    }

    const sessionToken = crypto.randomBytes(64).toString('hex');
    await new Promise((resolve, reject) =>
      query('UPDATE users SET session_token = ?, notificationToken = ? WHERE id = ?', [sessionToken, notificationToken, users[0].id], (e) =>
        e ? reject(e) : resolve()
      )
    );

    res.status(200).json({ message: 'تسجيل الدخول ناجح!', user: users[0], sessionToken });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-phone', async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ message: 'Phone number and verification code are required!' });
    }
    const normalizedPhone = normalizeJordanPhone(phone);

    const rows = await new Promise((resolve, reject) =>
      query('SELECT * FROM verifications WHERE phone = ? AND code = ?', [normalizedPhone, code], (e, r) =>
        e ? reject(e) : resolve(r)
      )
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid verification code!' });
    }

    await new Promise((resolve, reject) =>
      query('UPDATE users SET phone_verified = true WHERE phone = ?', [normalizedPhone], (e) => (e ? reject(e) : resolve()))
    );
    await new Promise((resolve, reject) =>
      query('DELETE FROM verifications WHERE phone = ?', [normalizedPhone], (e) => (e ? reject(e) : resolve()))
    );

    const [user] = await new Promise((resolve, reject) =>
      query('SELECT * FROM users WHERE phone = ?', [normalizedPhone], (e, r) => (e ? reject(e) : resolve(r)))
    );

    res.status(200).json({ message: 'Phone number verified successfully!', user });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { phone, resetToken, newPassword } = req.body;
    const normalizedPhone = normalizeJordanPhone(phone);
    if (!normalizedPhone || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'Phone number, reset token, and new password are required!' });
    }

    const now = new Date();
    const rows = await new Promise((resolve, reject) =>
      query(
        'SELECT * FROM users WHERE phone = ? AND reset_token = ? AND reset_token_expires_at > ?',
        [normalizedPhone, resetToken, now],
        (e, r) => (e ? reject(e) : resolve(r))
      )
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid reset token or expired. Please request a new one.' });
    }

    await new Promise((resolve, reject) =>
      query('UPDATE users SET password = ? WHERE phone = ?', [newPassword, normalizedPhone], (e) =>
        e ? reject(e) : resolve()
      )
    );

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password-forget', async (req, res, next) => {
  try {
    const { phoneNumber, newPassword } = req.body;
    const normalizedPhone = normalizeJordanPhone(phoneNumber);

    const users = await new Promise((resolve, reject) =>
      query('SELECT * FROM users WHERE phone = ?', [normalizedPhone], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    await new Promise((resolve, reject) =>
      query('UPDATE users SET password = ? WHERE phone = ?', [newPassword, normalizedPhone], (e) =>
        e ? reject(e) : resolve()
      )
    );

    const [user] = await new Promise((resolve, reject) =>
      query('SELECT * FROM users WHERE phone = ?', [normalizedPhone], (e, r) => (e ? reject(e) : resolve(r)))
    );
    res.json({ success: true, message: 'Password updated successfully', user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
