const db = require('../config/database');
const { formatResponse, generateUUID } = require('../utils/helpers');
const { sendNotification } = require('../utils/notifications');

const addBooking = async (req, res) => {
  try {
    const {
      place_id, user_id, checkIn, checkOut, numberOfGuests, name, phone,
      totalPrice, status, paymentMethod, specialRequests, user_name
    } = req.body;

    if (!place_id || !user_id || !checkIn || !checkOut || !numberOfGuests || !name || !phone) {
      return res.status(400).json(formatResponse(false, "جميع الحقول المطلوبة يجب ملؤها"));
    }

    const bookingId = generateUUID();
    const sql = `
      INSERT INTO bookings (
        id, place_id, user_id, checkIn, checkOut, numberOfGuests,
        name, phone, totalPrice, status, paymentMethod, specialRequests, user_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      bookingId, place_id, user_id, checkIn, checkOut, numberOfGuests,
      name, phone, totalPrice || 0, status || 'pending', paymentMethod || 'cash',
      specialRequests, user_name
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في إضافة الحجز", err));
      }

      // Get place owner to send notification
      const getOwnerSql = "SELECT owner_id, title FROM places WHERE id = ?";
      db.query(getOwnerSql, [place_id], (ownerErr, ownerResults) => {
        if (ownerErr) {
          console.error(ownerErr);
        } else if (ownerResults.length > 0) {
          const ownerId = ownerResults[0].owner_id;
          const placeTitle = ownerResults[0].title;

          // Send notification to owner
          sendNotification({
            title: "حجز جديد",
            message: `لديك حجز جديد في ${placeTitle}`,
            redirectId: bookingId,
            redirectType: "booking",
            userId: ownerId,
            fromId: user_id
          }, (notifErr) => {
            if (notifErr) {
              console.error('Error sending booking notification:', notifErr);
            }
          });
        }
      });

      res.status(200).json(formatResponse(true, "تم إضافة الحجز بنجاح", { bookingId }));
    });
  } catch (error) {
    console.error('Add booking error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getAllBookings = async (req, res) => {
  try {
    const sql = `
      SELECT b.*, p.title as place_title, p.address as place_address,
             u.name as user_name, u.phone as user_phone
      FROM bookings b
      LEFT JOIN places p ON b.place_id = p.id
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب الحجوزات", err));
      }

      res.status(200).json(formatResponse(true, "تم جلب الحجوزات بنجاح", results));
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(formatResponse(false, "معرف المستخدم مطلوب"));
    }

    const sql = `
      SELECT b.*, p.title as place_title, p.address as place_address,
             p.photos as place_photos, u.name as owner_name, u.phone as owner_phone
      FROM bookings b
      LEFT JOIN places p ON b.place_id = p.id
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب حجوزات المستخدم", err));
      }

      const bookings = results.map(booking => ({
        ...booking,
        place_photos: booking.place_photos ? JSON.parse(booking.place_photos) : []
      }));

      res.status(200).json(formatResponse(true, "تم جلب حجوزات المستخدم بنجاح", bookings));
    });
  } catch (error) {
    console.error('Get bookings by user error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT b.*, p.title as place_title, p.address as place_address,
             p.photos as place_photos, p.owner_id,
             u.name as user_name, u.phone as user_phone,
             owner.name as owner_name, owner.phone as owner_phone
      FROM bookings b
      LEFT JOIN places p ON b.place_id = p.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN users owner ON p.owner_id = owner.id
      WHERE b.id = ?
    `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب الحجز", err));
      }

      if (results.length === 0) {
        return res.status(404).json(formatResponse(false, "الحجز غير موجود"));
      }

      const booking = {
        ...results[0],
        place_photos: results[0].place_photos ? JSON.parse(results[0].place_photos) : []
      };

      res.status(200).json(formatResponse(true, "تم جلب الحجز بنجاح", booking));
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status, adminToken } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json(formatResponse(false, "معرف الحجز والحالة مطلوبان"));
    }

    const sql = "UPDATE bookings SET status = ? WHERE id = ?";
    db.query(sql, [status, bookingId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في تحديث حالة الحجز", err));
      }

      if (result.affectedRows === 0) {
        return res.status(404).json(formatResponse(false, "الحجز غير موجود"));
      }

      // Get booking details to send notification to user
      const getBookingSql = `
        SELECT b.user_id, b.place_id, p.title as place_title
        FROM bookings b
        LEFT JOIN places p ON b.place_id = p.id
        WHERE b.id = ?
      `;

      db.query(getBookingSql, [bookingId], (bookingErr, bookingResults) => {
        if (bookingErr) {
          console.error(bookingErr);
        } else if (bookingResults.length > 0) {
          const { user_id, place_title } = bookingResults[0];
          
          let notificationMessage = '';
          switch (status) {
            case 'confirmed':
              notificationMessage = `تم تأكيد حجزك في ${place_title}`;
              break;
            case 'cancelled':
              notificationMessage = `تم إلغاء حجزك في ${place_title}`;
              break;
            case 'completed':
              notificationMessage = `تم إكمال حجزك في ${place_title}`;
              break;
            default:
              notificationMessage = `تم تحديث حالة حجزك في ${place_title}`;
          }

          sendNotification({
            title: "تحديث حالة الحجز",
            message: notificationMessage,
            redirectId: bookingId,
            redirectType: "booking",
            userId: user_id,
            fromId: null
          }, (notifErr) => {
            if (notifErr) {
              console.error('Error sending status update notification:', notifErr);
            }
          });
        }
      });

      res.status(200).json(formatResponse(true, "تم تحديث حالة الحجز بنجاح"));
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "DELETE FROM bookings WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في حذف الحجز", err));
      }

      if (result.affectedRows === 0) {
        return res.status(404).json(formatResponse(false, "الحجز غير موجود"));
      }

      res.status(200).json(formatResponse(true, "تم حذف الحجز بنجاح"));
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

const getBookingTitles = async (req, res) => {
  try {
    const { place_id } = req.params;

    const sql = `
      SELECT DISTINCT name as title
      FROM bookings
      WHERE place_id = ?
      ORDER BY name
    `;

    db.query(sql, [place_id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(formatResponse(false, "خطأ في جلب عناوين الحجوزات", err));
      }

      const titles = results.map(row => row.title);
      res.status(200).json(formatResponse(true, "تم جلب عناوين الحجوزات بنجاح", titles));
    });
  } catch (error) {
    console.error('Get booking titles error:', error);
    res.status(500).json(formatResponse(false, "خطأ في الخادم الداخلي"));
  }
};

module.exports = {
  addBooking,
  getAllBookings,
  getBookingsByUser,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingTitles
};