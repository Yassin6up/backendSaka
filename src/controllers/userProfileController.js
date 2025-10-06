const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class UserProfileController {
  // Get user profile with posts
  static getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const myId = req.headers.authorization?.split(' ')[1];

    if (!myId) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized access' 
      });
    }

    // Query to fetch user profile details
    const userProfileQuery = `
      SELECT 
        u.id,
        u.name,
        u.picture_url,
        u.image_name,
        u.trustable,
        u.description,
        (SELECT COUNT(*) FROM followers WHERE followee_id = u.id) AS followersCount,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) AS followingCount,
        EXISTS (
          SELECT 1 FROM followers WHERE follower_id = ? AND followee_id = u.id
        ) AS isFollowing
      FROM users u
      WHERE u.id = ?
    `;

    // Query to fetch user posts
    const userPostsQuery = `
      SELECT id, title, photos, sponsored, address, price, buy_or_rent, folderName
      FROM places 
      WHERE owner_id = ? 
      AND approved = 1 
      AND active = 1
    `;

    // Execute both queries
    db.query(userProfileQuery, [myId, userId], (err, userResults) => {
      if (err) {
        console.error('Error fetching user profile:', err);
        return res.status(500).json({ 
          success: false,
          error: err.message 
        });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found', 
          userid: userId 
        });
      }

      const userProfile = userResults[0];

      db.query(userPostsQuery, [userId], (err, postResults) => {
        if (err) {
          console.error('Error fetching user posts:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
          });
        }

        res.json({
          success: true,
          id: userProfile.id,
          name: userProfile.name,
          image_name: userProfile.image_name,
          picture_url: userProfile.picture_url,
          trustable: userProfile.trustable,
          avatar: userProfile.avatar,
          description: userProfile.description,
          followersCount: userProfile.followersCount,
          followingCount: userProfile.followingCount,
          isFollowing: !!userProfile.isFollowing,
          places: postResults
        });
      });
    });
  });

  // Get profile places
  static getProfilePlaces = asyncHandler(async (req, res) => {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    const query = `
      SELECT id, title, photos, sponsored, address, price, buy_or_rent, folderName
      FROM places 
      WHERE owner_id = ? 
      AND approved = 1 
      AND active = 1
      ORDER BY created_at DESC
    `;

    db.query(query, [ownerId], (err, results) => {
      if (err) {
        console.error('Error fetching profile places:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        places: results
      });
    });
  });
}

module.exports = UserProfileController;