const crypto = require('crypto');
const db = require('../config/database');
const { sendVerificationCode } = require('../utils/sms');
const { formatResponse, generateRandomCode } = require('../utils/helpers');

const register = async (req, res) => {
  try {
    const { name, phone, password, notificationToken, accountType } = req.body;
    
    if (!name || !phone || !password) {
      return res.status(400).json(formatResponse(false, "الاسم ورقم الهاتف وكلمة المرور مطلوبة"));
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/^\+9620/, "+962");
    const token = crypto.randomBytes(64).toString("hex");
    const verificationCode = generateRandomCode(4);
    const message = `رمز التحقق الخاص بك هو ${verificationCode}`;

    // Check if phone number already exists
    const sqlCheck = "SELECT * FROM users WHERE phone = ?";
    db.query(sqlCheck, [normalizedPhone], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (result.length > 0) {
        return res.status(400).json(formatResponse(false, "رقم الهاتف مستخدم بالفعل"));
      }

      // Insert the new user
      const sqlInsert = `
        INSERT INTO users (
          name, phone, password, phone_verified, session_token, 
          notificationToken, accountType, limitPosts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 
          CASE 
            WHEN ? = 'business' THEN 100 
            ELSE DEFAULT(limitPosts) 
          END
        )
      `;

      const params = [
        name, normalizedPhone, password, false, token,
        notificationToken || null, accountType || "personal",
        accountType || "personal"
      ];
      
      db.query(sqlInsert, params, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
        }

        // Fetch the newly inserted user
        const sqlSelect = "SELECT * FROM users WHERE id = ?";
        db.query(sqlSelect, [result.insertId], (err, userResult) => {
          if (err) {
            return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
          }

          const registeredUser = userResult[0];

          // Send verification code
          sendVerificationCode(normalizedPhone, message)
            .then(() => {
              const sqlVerifyInsert = "INSERT INTO verifications (phone, code) VALUES (?, ?)";
              db.query(sqlVerifyInsert, [normalizedPhone, verificationCode], (err) => {
                if (err) {
                  return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
                }

                res.status(200).json(formatResponse(true, "تم تسجيل المستخدم بنجاح.", registeredUser));
              });
            })
            .catch((error) => {
              res.status(500).json(formatResponse(false, "فشل في إرسال رمز التحقق", error.message));
            });
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const login = async (req, res) => {
  try {
    const { phone, password, notificationToken } = req.body;

    if (!phone || !password) {
      return res.status(400).json(formatResponse(false, "رقم الهاتف وكلمة المرور مطلوبان!"));
    }

    const normalizedPhone = phone.replace(/^\+9620/, "+962");
    const sql = "SELECT * FROM users WHERE phone = ?";
    
    db.query(sql, [normalizedPhone], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (results.length === 0 || results[0].password !== password) {
        return res.status(404).json(formatResponse(false, "رقم الهاتف أو كلمة المرور غير صحيحة!"));
      }

      if (!results[0].phone_verified) {
        // Phone number not verified, send verification code again
        const verificationCode = generateRandomCode(4);
        const message = `رمز التحقق الخاص بك هو ${verificationCode}`;

        sendVerificationCode(normalizedPhone, message)
          .then(() => {
            // Save verification code to database
            const sql = "UPDATE verifications SET code = ? WHERE phone = ?";
            db.query(sql, [verificationCode, phone], (err) => {
              if (err) {
                return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
              }
              res.status(200).json(formatResponse(true, "تم إرسال رمز التحقق مرة أخرى.", { userId: results[0].id }));
            });
          })
          .catch((error) => {
            res.status(500).json(formatResponse(false, "فشل في إرسال رمز التحقق", error.message));
          });

        return;
      }

      // Generate a secure session token
      const sessionToken = crypto.randomBytes(64).toString("hex");
      const updateSql = "UPDATE users SET session_token = ?, notificationToken = ? WHERE id = ?";
      
      db.query(updateSql, [sessionToken, notificationToken, results[0].id], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json(formatResponse(false, "فشل في تحديث رمز الجلسة", updateErr));
        }

        res.status(200).json(formatResponse(true, "تسجيل الدخول ناجح!", {
          user: results[0],
          sessionToken: sessionToken
        }));
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const verifyPhone = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json(formatResponse(false, "رقم الهاتف ورمز التحقق مطلوبان"));
    }

    const normalizedPhone = phone.replace(/^\+9620/, "+962");
    const sql = "SELECT * FROM verifications WHERE phone = ? AND code = ?";
    
    db.query(sql, [normalizedPhone, code], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (results.length === 0) {
        return res.status(400).json(formatResponse(false, "رمز التحقق غير صحيح"));
      }

      // Update user's phone_verified status
      const updateSql = "UPDATE users SET phone_verified = 1 WHERE phone = ?";
      db.query(updateSql, [normalizedPhone], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json(formatResponse(false, "فشل في تحديث حالة التحقق", updateErr));
        }

        // Delete verification record
        const deleteSql = "DELETE FROM verifications WHERE phone = ?";
        db.query(deleteSql, [normalizedPhone], (deleteErr) => {
          if (deleteErr) {
            console.error(deleteErr);
          }
          
          res.status(200).json(formatResponse(true, "تم التحقق من رقم الهاتف بنجاح"));
        });
      });
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const resetPassword = async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword) {
      return res.status(400).json(formatResponse(false, "رقم الهاتف وكلمة المرور الجديدة مطلوبان"));
    }

    const normalizedPhone = phone.replace(/^\+9620/, "+962");
    const sql = "UPDATE users SET password = ? WHERE phone = ?";
    
    db.query(sql, [newPassword, normalizedPhone], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (result.affectedRows === 0) {
        return res.status(404).json(formatResponse(false, "المستخدم غير موجود"));
      }

      res.status(200).json(formatResponse(true, "تم تحديث كلمة المرور بنجاح"));
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

module.exports = {
  register,
  login,
  verifyPhone,
  resetPassword
};