const db = require('../config/database');
const { formatResponse, generateUUID } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

const addPlace = async (req, res) => {
  try {
    const {
      title, address, description, perks, extraInfo, maxGuests, price, ownerId,
      type, sellingMethod, ownerPhone, homeType, farmHasHouse, farmHasWater,
      farmHasFarmed, landInFaceOfStreet, numberOfStreetsInLand, spaceGeneral,
      numberOfHomeStage, totalStages, numberOfRooms, buyOrRent, rentType,
      ownerStatus, location, amenities, hajezDays, hajezType, variablePrices,
      publisherState, adsAccept, priceHide, specificDaysInCalander,
      specificDaysCalanderPrice, latitude, longitude, ownerName, poolType,
      deepPool, gettingCalls, containSdah, evacuation, tripLong, tripDate,
      timeOpen, meetingRoomType, countPeople, subscriptionTypeGym,
      priceBeforeNoon, priceAfterNoon, street, closePlace
    } = req.body;

    const addedPhotos = req.files['images'] || [];
    const chaletDocument = req.files['chaletDocument'] ? req.files['chaletDocument'][0] : null;
    const poolDocument = req.files['poolDocument'] ? req.files['poolDocument'][0] : null;
    const placeId = generateUUID();
    const folderName = placeId;
    const uploadDir = path.join(__dirname, '../../uploads', folderName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedPhotos = [];
    let savedChaletDocument = null;
    let savedPoolDocument = null;

    // Move uploaded photos to the unique directory
    addedPhotos.forEach((file, index) => {
      const oldPath = file.path;
      const newPath = path.join(uploadDir, `${index + 1}_${file.originalname}`);
      try {
        fs.renameSync(oldPath, newPath);
        savedPhotos.push({
          originalName: file.originalname,
          savedAs: `${index + 1}_${file.originalname}`,
        });
      } catch (err) {
        console.error("Failed to move file:", err);
        return res.status(500).json(formatResponse(false, "خطأ في رفع الملفات", err.message));
      }
    });

    // Move chaletDocument if exists
    if (chaletDocument) {
      const oldPath = chaletDocument.path;
      const newPath = path.join(uploadDir, `chalet_${chaletDocument.originalname}`);
      try {
        fs.renameSync(oldPath, newPath);
        savedChaletDocument = `chalet_${chaletDocument.originalname}`;
      } catch (err) {
        console.error("Failed to move chalet document:", err);
      }
    }

    // Move poolDocument if exists
    if (poolDocument) {
      const oldPath = poolDocument.path;
      const newPath = path.join(uploadDir, `pool_${poolDocument.originalname}`);
      try {
        fs.renameSync(oldPath, newPath);
        savedPoolDocument = `pool_${poolDocument.originalname}`;
      } catch (err) {
        console.error("Failed to move pool document:", err);
      }
    }

    const sql = `
      INSERT INTO places (
        id, title, address, description, perks, extraInfo, maxGuests, price,
        owner_id, type, sellingMethod, ownerPhone, homeType, farmHasHouse,
        farmHasWater, farmHasFarmed, landInFaceOfStreet, numberOfStreetsInLand,
        spaceGeneral, numberOfHomeStage, totalStages, numberOfRooms, buyOrRent,
        rentType, ownerStatus, location, amenities, hajezDays, hajezType,
        variablePrices, publisherState, adsAccept, priceHide, specificDaysInCalander,
        specificDaysCalanderPrice, latitude, longitude, ownerName, poolType,
        deepPool, gettingCalls, containSdah, evacuation, tripLong, tripDate,
        timeOpen, meetingRoomType, countPeople, subscriptionTypeGym,
        priceBeforeNoon, priceAfterNoon, street, closePlace, photos,
        chaletDocument, poolDocument
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      placeId, title, address, description, perks, extraInfo, maxGuests, price,
      ownerId, type, sellingMethod, ownerPhone, homeType, farmHasHouse,
      farmHasWater, farmHasFarmed, landInFaceOfStreet, numberOfStreetsInLand,
      spaceGeneral, numberOfHomeStage, totalStages, numberOfRooms, buyOrRent,
      rentType, ownerStatus, location, amenities, hajezDays, hajezType,
      variablePrices, publisherState, adsAccept, priceHide, specificDaysInCalander,
      specificDaysCalanderPrice, latitude, longitude, ownerName, poolType,
      deepPool, gettingCalls, containSdah, evacuation, tripLong, tripDate,
      timeOpen, meetingRoomType, countPeople, subscriptionTypeGym,
      priceBeforeNoon, priceAfterNoon, street, closePlace,
      JSON.stringify(savedPhotos), savedChaletDocument, savedPoolDocument
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في إضافة المكان", err));
      }

      res.status(200).json(formatResponse(true, "تم إضافة المكان بنجاح", { placeId }));
    });
  } catch (error) {
    console.error('Add place error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getPlaces = async (req, res) => {
  try {
    const sql = `
      SELECT p.*, u.name as owner_name, u.profile_picture as owner_picture,
             COUNT(l.id) as likes_count
      FROM places p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN likes l ON p.id = l.place_id
      WHERE p.active = 1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب الأماكن", err));
      }

      // Parse photos JSON for each place
      const places = results.map(place => ({
        ...place,
        photos: place.photos ? JSON.parse(place.photos) : []
      }));

      res.status(200).json(formatResponse(true, "تم جلب الأماكن بنجاح", places));
    });
  } catch (error) {
    console.error('Get places error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT p.*, u.name as owner_name, u.profile_picture as owner_picture,
             u.phone as owner_phone_number, u.whatsapp, u.instagram,
             u.snapchat, u.tiktok, u.city as owner_city,
             COUNT(l.id) as likes_count
      FROM places p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN likes l ON p.id = l.place_id
      WHERE p.id = ?
      GROUP BY p.id
    `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب المكان", err));
      }

      if (results.length === 0) {
        return res.status(404).json(formatResponse(false, "المكان غير موجود"));
      }

      const place = {
        ...results[0],
        photos: results[0].photos ? JSON.parse(results[0].photos) : []
      };

      // Increment visits count
      const updateVisitsSql = "UPDATE places SET visits = visits + 1 WHERE id = ?";
      db.query(updateVisitsSql, [id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating visits:', updateErr);
        }
      });

      res.status(200).json(formatResponse(true, "تم جلب المكان بنجاح", place));
    });
  } catch (error) {
    console.error('Get place by ID error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getPlacesByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const sql = `
      SELECT p.*, COUNT(l.id) as likes_count
      FROM places p
      LEFT JOIN likes l ON p.id = l.place_id
      WHERE p.owner_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    db.query(sql, [ownerId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب أماكن المالك", err));
      }

      const places = results.map(place => ({
        ...place,
        photos: place.photos ? JSON.parse(place.photos) : []
      }));

      res.status(200).json(formatResponse(true, "تم جلب أماكن المالك بنجاح", places));
    });
  } catch (error) {
    console.error('Get places by owner error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const searchPlaces = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json(formatResponse(false, "استعلام البحث مطلوب"));
    }

    const sql = `
      SELECT p.*, u.name as owner_name, u.profile_picture as owner_picture,
             COUNT(l.id) as likes_count
      FROM places p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN likes l ON p.id = l.place_id
      WHERE p.active = 1 AND (
        p.title LIKE ? OR 
        p.description LIKE ? OR 
        p.address LIKE ? OR 
        p.location LIKE ?
      )
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `;

    const searchTerm = `%${query}%`;
    db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في البحث", err));
      }

      const places = results.map(place => ({
        ...place,
        photos: place.photos ? JSON.parse(place.photos) : []
      }));

      res.status(200).json(formatResponse(true, "تم البحث بنجاح", places));
    });
  } catch (error) {
    console.error('Search places error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const filterPlaces = async (req, res) => {
  try {
    const { type, buyOrRent, minPrice, maxPrice, city, homeType } = req.body;

    let sql = `
      SELECT p.*, u.name as owner_name, u.profile_picture as owner_picture,
             COUNT(l.id) as likes_count
      FROM places p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN likes l ON p.id = l.place_id
      WHERE p.active = 1
    `;

    const conditions = [];
    const values = [];

    if (type) {
      conditions.push('p.type = ?');
      values.push(type);
    }

    if (buyOrRent) {
      conditions.push('p.buyOrRent = ?');
      values.push(buyOrRent);
    }

    if (minPrice) {
      conditions.push('p.price >= ?');
      values.push(minPrice);
    }

    if (maxPrice) {
      conditions.push('p.price <= ?');
      values.push(maxPrice);
    }

    if (city) {
      conditions.push('p.location LIKE ?');
      values.push(`%${city}%`);
    }

    if (homeType) {
      conditions.push('p.homeType = ?');
      values.push(homeType);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY p.id ORDER BY p.created_at DESC';

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في تصفية الأماكن", err));
      }

      const places = results.map(place => ({
        ...place,
        photos: place.photos ? JSON.parse(place.photos) : []
      }));

      res.status(200).json(formatResponse(true, "تم تصفية الأماكن بنجاح", places));
    });
  } catch (error) {
    console.error('Filter places error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const deletePlace = async (req, res) => {
  try {
    const { id } = req.params;

    // First get the place to delete its folder
    const getPlaceSql = "SELECT * FROM places WHERE id = ?";
    db.query(getPlaceSql, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب المكان", err));
      }

      if (results.length === 0) {
        return res.status(404).json(formatResponse(false, "المكان غير موجود"));
      }

      // Delete the place folder
      const uploadDir = path.join(__dirname, '../../uploads', id);
      if (fs.existsSync(uploadDir)) {
        fs.rmSync(uploadDir, { recursive: true, force: true });
      }

      // Delete from database
      const deleteSql = "DELETE FROM places WHERE id = ?";
      db.query(deleteSql, [id], (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error(deleteErr);
          return res.status(500).json(formatResponse(false, "خطأ في حذف المكان", deleteErr));
        }

        res.status(200).json(formatResponse(true, "تم حذف المكان بنجاح"));
      });
    });
  } catch (error) {
    console.error('Delete place error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const togglePlaceActive = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current active status
    const getSql = "SELECT active FROM places WHERE id = ?";
    db.query(getSql, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب المكان", err));
      }

      if (results.length === 0) {
        return res.status(404).json(formatResponse(false, "المكان غير موجود"));
      }

      const newActiveStatus = !results[0].active;
      const updateSql = "UPDATE places SET active = ? WHERE id = ?";
      
      db.query(updateSql, [newActiveStatus, id], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json(formatResponse(false, "خطأ في تحديث حالة المكان", updateErr));
        }

        res.status(200).json(formatResponse(true, "تم تحديث حالة المكان بنجاح", { active: newActiveStatus }));
      });
    });
  } catch (error) {
    console.error('Toggle place active error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getPlaceImage = async (req, res) => {
  try {
    const { folderName, imageName } = req.params;
    const imagePath = path.join(__dirname, '../../uploads', folderName, imageName);

    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).json(formatResponse(false, "الصورة غير موجودة"));
    }
  } catch (error) {
    console.error('Get place image error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

module.exports = {
  addPlace,
  getPlaces,
  getPlaceById,
  getPlacesByOwner,
  searchPlaces,
  filterPlaces,
  deletePlace,
  togglePlaceActive,
  getPlaceImage
};