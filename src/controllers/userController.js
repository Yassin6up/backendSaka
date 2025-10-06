const db = require('../config/database');
const { formatResponse } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (results.length === 0) {
        return res.status(404).json(formatResponse(false, "المستخدم غير موجود"));
      }

      res.status(200).json(formatResponse(true, "تم جلب بيانات المستخدم بنجاح", results[0]));
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId, name, email, bio, city, whatsapp, instagram, snapchat, tiktok } = req.body;

    if (!userId) {
      return res.status(400).json(formatResponse(false, "معرف المستخدم مطلوب"));
    }

    const sql = `
      UPDATE users SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        bio = COALESCE(?, bio),
        city = COALESCE(?, city),
        whatsapp = COALESCE(?, whatsapp),
        instagram = COALESCE(?, instagram),
        snapchat = COALESCE(?, snapchat),
        tiktok = COALESCE(?, tiktok)
      WHERE id = ?
    `;

    const params = [name, email, bio, city, whatsapp, instagram, snapchat, tiktok, userId];

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (result.affectedRows === 0) {
        return res.status(404).json(formatResponse(false, "المستخدم غير موجود"));
      }

      res.status(200).json(formatResponse(true, "تم تحديث بيانات المستخدم بنجاح"));
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(formatResponse(false, "معرف المستخدم مطلوب"));
    }

    if (!req.file) {
      return res.status(400).json(formatResponse(false, "الصورة مطلوبة"));
    }

    const imageName = req.file.filename;
    const sql = "UPDATE users SET profile_picture = ? WHERE id = ?";

    db.query(sql, [imageName, userId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (result.affectedRows === 0) {
        return res.status(404).json(formatResponse(false, "المستخدم غير موجود"));
      }

      res.status(200).json(formatResponse(true, "تم تحديث صورة الملف الشخصي بنجاح", { imageName }));
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getProfilePicture = async (req, res) => {
  try {
    const { imageName } = req.params;
    const imagePath = path.join(__dirname, '../../uploads/profiles', imageName);

    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).json(formatResponse(false, "الصورة غير موجودة"));
    }
  } catch (error) {
    console.error('Get profile picture error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json(formatResponse(false, "استعلام البحث مطلوب"));
    }

    const sql = `
      SELECT id, name, phone, profile_picture, city, accountType 
      FROM users 
      WHERE name LIKE ? OR phone LIKE ? 
      ORDER BY name ASC 
      LIMIT 20
    `;

    const searchTerm = `%${query}%`;
    db.query(sql, [searchTerm, searchTerm], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      res.status(200).json(formatResponse(true, "تم البحث بنجاح", results));
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const checkUserLimitPosts = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "SELECT limitPosts FROM users WHERE id = ?";
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (results.length === 0) {
        return res.status(404).json(formatResponse(false, "المستخدم غير موجود"));
      }

      const limitPosts = results[0].limitPosts;
      const countSql = "SELECT COUNT(*) as postCount FROM places WHERE owner_id = ?";
      
      db.query(countSql, [id], (countErr, countResults) => {
        if (countErr) {
          console.error(countErr);
          return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", countErr));
        }

        const postCount = countResults[0].postCount;
        const canPost = postCount < limitPosts;

        res.status(200).json(formatResponse(true, "تم فحص حد المنشورات بنجاح", {
          limitPosts,
          currentPosts: postCount,
          canPost
        }));
      });
    });
  } catch (error) {
    console.error('Check user limit posts error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const followUser = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json(formatResponse(false, "معرف المتابع والمتابَع مطلوبان"));
    }

    if (followerId === followingId) {
      return res.status(400).json(formatResponse(false, "لا يمكن متابعة نفسك"));
    }

    // Check if already following
    const checkSql = "SELECT * FROM followers WHERE follower_id = ? AND following_id = ?";
    db.query(checkSql, [followerId, followingId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي", err));
      }

      if (results.length > 0) {
        // Unfollow
        const deleteSql = "DELETE FROM followers WHERE follower_id = ? AND following_id = ?";
        db.query(deleteSql, [followerId, followingId], (deleteErr) => {
          if (deleteErr) {
            console.error(deleteErr);
            return res.status(500).json(formatResponse(false, "خطأ في إلغاء المتابعة", deleteErr));
          }

          res.status(200).json(formatResponse(true, "تم إلغاء المتابعة بنجاح", { isFollowing: false }));
        });
      } else {
        // Follow
        const insertSql = "INSERT INTO followers (follower_id, following_id) VALUES (?, ?)";
        db.query(insertSql, [followerId, followingId], (insertErr) => {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json(formatResponse(false, "خطأ في المتابعة", insertErr));
          }

          res.status(200).json(formatResponse(true, "تم المتابعة بنجاح", { isFollowing: true }));
        });
      }
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

module.exports = {
  getUserProfile,
  updateUser,
  updateProfilePicture,
  getProfilePicture,
  searchUsers,
  checkUserLimitPosts,
  followUser
};