const crypto = require('crypto');
const db = require('../config/database');
const { formatResponse } = require('../utils/helpers');
const { logAdminAction } = require('../utils/notifications');

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(formatResponse(false, "اسم المستخدم وكلمة المرور مطلوبان"));
    }

    const sql = "SELECT * FROM admins WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (results.length === 0) {
        return res.status(401).json(formatResponse(false, "اسم المستخدم أو كلمة المرور غير صحيحة"));
      }

      const admin = results[0];
      const token = crypto.randomBytes(64).toString('hex');

      // Update admin token
      const updateSql = "UPDATE admins SET token = ? WHERE id = ?";
      db.query(updateSql, [token, admin.id], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json(formatResponse(false, "خطأ في تحديث الرمز المميز", updateErr));
        }

        res.status(200).json(formatResponse(true, "تم تسجيل الدخول بنجاح", {
          admin: { ...admin, password: undefined },
          token
        }));
      });
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getDashboardCounts = async (req, res) => {
  try {
    const queries = [
      "SELECT COUNT(*) as total_users FROM users",
      "SELECT COUNT(*) as total_places FROM places",
      "SELECT COUNT(*) as total_bookings FROM bookings",
      "SELECT COUNT(*) as pending_bookings FROM bookings WHERE status = 'pending'",
      "SELECT COUNT(*) as active_places FROM places WHERE active = 1",
      "SELECT COUNT(*) as inactive_places FROM places WHERE active = 0"
    ];

    const results = {};
    let completed = 0;

    queries.forEach((query, index) => {
      db.query(query, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json(formatResponse(false, "خطأ في جلب الإحصائيات", err));
        }

        const key = Object.keys(result[0])[0];
        results[key] = result[0][key];
        completed++;

        if (completed === queries.length) {
          res.status(200).json(formatResponse(true, "تم جلب الإحصائيات بنجاح", results));
        }
      });
    });
  } catch (error) {
    console.error('Get dashboard counts error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getAllUsers = async (req, res) => {
  try {
    const sql = `
      SELECT id, name, phone, email, city, accountType, phone_verified,
             blocked, trustable, created_at, profile_picture
      FROM users
      ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب المستخدمين", err));
      }

      res.status(200).json(formatResponse(true, "تم جلب المستخدمين بنجاح", results));
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getAllPlacesAdmin = async (req, res) => {
  try {
    const sql = `
      SELECT p.*, u.name as owner_name, u.phone as owner_phone
      FROM places p
      LEFT JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب الأماكن", err));
      }

      const places = results.map(place => ({
        ...place,
        photos: place.photos ? JSON.parse(place.photos) : []
      }));

      res.status(200).json(formatResponse(true, "تم جلب الأماكن بنجاح", places));
    });
  } catch (error) {
    console.error('Get all places admin error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const toggleUserBlocked = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current blocked status
    const getSql = "SELECT blocked FROM users WHERE id = ?";
    db.query(getSql, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب المستخدم", err));
      }

      if (results.length === 0) {
        return res.status(404).json(formatResponse(false, "المستخدم غير موجود"));
      }

      const newBlockedValue = !results[0].blocked;
      const updateSql = "UPDATE users SET blocked = ? WHERE id = ?";

      db.query(updateSql, [newBlockedValue, id], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json(formatResponse(false, "خطأ في تحديث حالة الحظر", updateErr));
        }

        res.status(200).json(formatResponse(true, "تم تحديث حالة الحظر بنجاح", { blocked: newBlockedValue }));
      });
    });
  } catch (error) {
    console.error('Toggle user blocked error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const toggleUserTrustable = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current trustable status
    const getSql = "SELECT trustable FROM users WHERE id = ?";
    db.query(getSql, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب المستخدم", err));
      }

      if (results.length === 0) {
        return res.status(404).json(formatResponse(false, "المستخدم غير موجود"));
      }

      const newTrustableValue = !results[0].trustable;
      const updateSql = "UPDATE users SET trustable = ? WHERE id = ?";

      db.query(updateSql, [newTrustableValue, id], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json(formatResponse(false, "خطأ في تحديث حالة الثقة", updateErr));
        }

        res.status(200).json(formatResponse(true, "تم تحديث حالة الثقة بنجاح", { trustable: newTrustableValue }));
      });
    });
  } catch (error) {
    console.error('Toggle user trustable error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في حذف المستخدم", err));
      }

      if (result.affectedRows === 0) {
        return res.status(404).json(formatResponse(false, "المستخدم غير موجود"));
      }

      res.status(200).json(formatResponse(true, "تم حذف المستخدم بنجاح"));
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const addUser = async (req, res) => {
  try {
    const { name, phone, password, email, accountType } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json(formatResponse(false, "الاسم ورقم الهاتف وكلمة المرور مطلوبة"));
    }

    // Check if phone already exists
    const checkSql = "SELECT * FROM users WHERE phone = ?";
    db.query(checkSql, [phone], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (results.length > 0) {
        return res.status(400).json(formatResponse(false, "رقم الهاتف مستخدم بالفعل"));
      }

      const token = crypto.randomBytes(64).toString('hex');
      const insertSql = `
        INSERT INTO users (name, phone, password, email, accountType, phone_verified, session_token)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `;

      const values = [name, phone, password, email, accountType || 'personal', token];

      db.query(insertSql, values, (insertErr, result) => {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).json(formatResponse(false, "خطأ في إضافة المستخدم", insertErr));
        }

        res.status(200).json(formatResponse(true, "تم إضافة المستخدم بنجاح", { userId: result.insertId }));
      });
    });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getAdminActions = async (req, res) => {
  try {
    const { placeId } = req.params;

    const sql = `
      SELECT * FROM admin_actions
      WHERE place_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [placeId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب إجراءات الإدارة", err));
      }

      res.status(200).json(formatResponse(true, "تم جلب إجراءات الإدارة بنجاح", results));
    });
  } catch (error) {
    console.error('Get admin actions error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const updatePassword = async (req, res) => {
  try {
    const { adminId, currentPassword, newPassword } = req.body;

    if (!adminId || !currentPassword || !newPassword) {
      return res.status(400).json(formatResponse(false, "جميع الحقول مطلوبة"));
    }

    // Verify current password
    const verifySql = "SELECT * FROM admins WHERE id = ? AND password = ?";
    db.query(verifySql, [adminId, currentPassword], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (results.length === 0) {
        return res.status(401).json(formatResponse(false, "كلمة المرور الحالية غير صحيحة"));
      }

      // Update password
      const updateSql = "UPDATE admins SET password = ? WHERE id = ?";
      db.query(updateSql, [newPassword, adminId], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json(formatResponse(false, "خطأ في تحديث كلمة المرور", updateErr));
        }

        res.status(200).json(formatResponse(true, "تم تحديث كلمة المرور بنجاح"));
      });
    });
  } catch (error) {
    console.error('Update admin password error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

module.exports = {
  adminLogin,
  getDashboardCounts,
  getAllUsers,
  getAllPlacesAdmin,
  toggleUserBlocked,
  toggleUserTrustable,
  deleteUser,
  addUser,
  getAdminActions,
  updatePassword
};