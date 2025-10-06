const { db } = require('../config/db');

function upsertInterests(req, res) {
  try {
    const { userId, interests, city, district } = req.body;
    if (!userId || !interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ success: false, message: 'User identifier and interests are required' });
    }
    const location = district ? `${city},${district}` : city;

    db.query('DELETE FROM user_interests WHERE user_id = ?', [userId], (error) => {
      if (error) return res.status(500).json({ success: false, error });
      if (interests.length === 0) return res.json({ success: true, message: 'Interests cleared successfully', interestsCount: 0 });

      const placeholders = interests.map(() => '(?, ?, ?)').join(', ');
      const flattenedValues = [];
      interests.forEach((interest) => flattenedValues.push(userId, interest, location));
      const insertQuery = `INSERT INTO user_interests (user_id, interest, city) VALUES ${placeholders}`;

      db.query(insertQuery, flattenedValues, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err });
        res.json({ success: true, message: 'Interests and location saved successfully', interestsCount: results.affectedRows });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

function matchingRequests(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });

    const getUserInterestsQuery = `SELECT interest, city, district FROM user_interests WHERE user_id = ?`;
    db.query(getUserInterestsQuery, [userId], (error, userInterests) => {
      if (error) return res.status(500).json({ success: false, message: 'Database error' });
      if (userInterests.length === 0) return res.json({ success: true, message: 'No interests found for user', requests: [] });

      const interests = [...new Set(userInterests.map((item) => item.interest))];
      const userCity = userInterests[0].city;
      const userDistrict = userInterests[0].district;

      let query = `SELECT * FROM property_requests WHERE property_type IN (?) OR city LIKE ? OR city LIKE ?`;
      const queryParams = [interests, `%${userCity}%`, `%${userDistrict}%`];
      if (userCity && userDistrict) {
        query += ` OR city LIKE ?`;
        queryParams.push(`%${userCity},%${userDistrict}%`);
      }
      query += ` ORDER BY created_at DESC LIMIT 20`;

      db.query(query, queryParams, (err, requests) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, userInterests: interests, userLocation: { city: userCity, district: userDistrict }, matchingRequests: requests });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { upsertInterests, matchingRequests };
