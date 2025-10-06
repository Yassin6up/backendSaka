const db = require('../config/database');
const { formatResponse } = require('../utils/helpers');
const { sendNotification } = require('../utils/notifications');

const sendBulkNotification = async (req, res) => {
  try {
    const { title, message, redirectId, redirectType } = req.body;

    if (!title || !message) {
      return res.status(400).json(formatResponse(false, "العنوان والرسالة مطلوبان"));
    }

    // Get all users with notification tokens
    const getUsersSql = `
      SELECT id, notificationToken 
      FROM users 
      WHERE notificationToken IS NOT NULL AND notificationToken != ''
    `;

    db.query(getUsersSql, async (userErr, users) => {
      if (userErr) {
        console.error(userErr);
        return res.status(500).json(formatResponse(false, "خطأ في جلب المستخدمين", userErr));
      }

      if (users.length === 0) {
        return res.status(200).json(formatResponse(true, "لا يوجد مستخدمون لإرسال الإشعارات إليهم"));
      }

      // Send notifications to all users
      const userIds = users.map(user => user.id);
      const values = userIds.map(userId => [
        userId, null, title, message, redirectId || null
      ]);

      const insertQuery = `
        INSERT INTO notifications (user_id, from_id, title, message, redirect_id) 
        VALUES ?
      `;

      db.query(insertQuery, [values], (insertErr, result) => {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).json(formatResponse(false, "خطأ في إرسال الإشعارات", insertErr));
        }

        res.status(200).json(formatResponse(true, `تم إرسال الإشعار إلى ${users.length} مستخدم`));
      });
    });
  } catch (error) {
    console.error('Send bulk notification error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const sql = `
      SELECT n.*, u.name as from_user_name, u.profile_picture as from_user_picture
      FROM notifications n
      LEFT JOIN users u ON n.from_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب الإشعارات", err));
      }

      res.status(200).json(formatResponse(true, "تم جلب الإشعارات بنجاح", results));
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "UPDATE notifications SET is_read = 1 WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في تحديث الإشعار", err));
      }

      if (result.affectedRows === 0) {
        return res.status(404).json(formatResponse(false, "الإشعار غير موجود"));
      }

      res.status(200).json(formatResponse(true, "تم تحديث الإشعار بنجاح"));
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "DELETE FROM notifications WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في حذف الإشعار", err));
      }

      if (result.affectedRows === 0) {
        return res.status(404).json(formatResponse(false, "الإشعار غير موجود"));
      }

      res.status(200).json(formatResponse(true, "تم حذف الإشعار بنجاح"));
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getUnreadNotificationsCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const sql = "SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0";
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب عدد الإشعارات غير المقروءة", err));
      }

      const unreadCount = results[0].unread_count;
      res.status(200).json(formatResponse(true, "تم جلب عدد الإشعارات غير المقروءة بنجاح", { unreadCount }));
    });
  } catch (error) {
    console.error('Get unread notifications count error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

module.exports = {
  sendBulkNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  getUnreadNotificationsCount
};