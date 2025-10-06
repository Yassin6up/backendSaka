const { db } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { Expo } = require('expo-server-sdk');

async function addBooking(req, res) {
  const { checkIn, checkOut, resirvedDays, name, phone, place, price, costumerId } = req.body;
  if (!checkIn || !checkOut || !place || !price || !costumerId || !resirvedDays) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }
  try {
    let userDetails;
    if (name && phone) {
      userDetails = { name, phone };
    } else {
      const [userResult] = await new Promise((resolve, reject) => {
        db.query('SELECT name, phone FROM users WHERE id = ?', [costumerId], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      if (!userResult) return res.status(404).json({ error: 'المستخدم غير موجود' });
      userDetails = userResult;
    }

    const bookingId = uuidv4();

    await new Promise((resolve, reject) => {
      const insertSql = `INSERT INTO bookings (id, check_in, check_out, name, phone, place_id, price, costumerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(insertSql, [bookingId, checkIn, checkOut, userDetails.name, userDetails.phone, place, price, costumerId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    await new Promise((resolve, reject) => {
      const updateSql = `UPDATE places SET notAllowedDays = ? WHERE id = ?`;
      db.query(updateSql, [resirvedDays, place], (err, result) => (err ? reject(err) : resolve(result)));
    });

    const [placeData] = await new Promise((resolve, reject) => {
      db.query('SELECT owner_id FROM places WHERE id = ?', [place], (err, results) => (err ? reject(err) : resolve(results)));
    });

    const [ownerData] = await new Promise((resolve, reject) => {
      db.query('SELECT notificationToken FROM users WHERE id = ?', [placeData.owner_id], (err, results) => (err ? reject(err) : resolve(results)));
    });

    if (ownerData?.notificationToken) {
      try {
        const expo = new Expo();
        const notification = { to: ownerData.notificationToken, sound: 'default', title: 'حجز جديد', body: `لديك حجز جديد في إعلانك رقم ${place}`, data: { bookingId } };
        const chunks = expo.chunkPushNotifications([notification]);
        for (const chunk of chunks) {
          await expo.sendPushNotificationsAsync(chunk);
        }
      } catch (notificationError) {
        console.error('فشل إرسال الإشعار:', notificationError);
      }
    }

    await new Promise((resolve, reject) => {
      const notifSql = `INSERT INTO notifications (title, message, user_id, from_id, book_id) VALUES (?, ?, ?, ?, ?)`;
      db.query(notifSql, ['حجز جديد', `حجز جديد في الإعلان رقم ${place}`, placeData.owner_id, 1, bookingId], (err, result) => (err ? reject(err) : resolve(result)));
    });

    res.status(200).json({ message: 'تم إضافة الحجز بنجاح', bookingId });
  } catch (error) {
    console.error('خطأ في إضافة الحجز:', error);
    res.status(500).json({ error: 'خطأ داخلي في الخادم', details: error.message });
  }
}

async function getAllBookings(req, res) {
  try {
    const [bookingsRows] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT 
          bookings.id,
          bookings.place_id,
          bookings.check_in,
          bookings.check_out,
          bookings.no_of_guests,
          bookings.price,
          bookings.status,
          users.name AS user_name,
          users.phone,
          places.title AS place_title,
          places.id AS placeId,
          places.photos AS place_photos,
          places.home_type AS place_type,
          places.folderName
        FROM bookings
        INNER JOIN places ON bookings.place_id = places.id
        LEFT JOIN users ON places.owner_id = users.id
        ORDER BY bookings.check_in DESC`,
        (err, rows) => (err ? reject(err) : resolve([rows]))
      );
    });

    const formattedBookings = bookingsRows.map((booking) => ({
      id: booking.id,
      userName: booking.user_name || 'اسم المستخدم غير معرف',
      phone: booking.phone || 'رقم الهاتف غير متوفر',
      duration: calculateDuration(booking.check_in, booking.check_out),
      date: formatDate(booking.check_in),
      placeTitle: booking.place_title,
      image: booking.place_photos?.[0] || 'default.jpg',
      type: booking.place_type,
      placeId: booking.placeId,
      guests: booking.no_of_guests,
      rooms: 2,
      price: `${booking.price} JOD`,
      status: booking.status || 'Pending',
      folderName: booking.folderName,
      photos: booking.place_photos || null,
    }));

    res.status(200).json(formattedBookings);
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function getBookingsByUser(req, res) {
  const { userId } = req.body;
  try {
    const [placesRows] = await new Promise((resolve, reject) => {
      db.query('SELECT id, folderName, photos, title, home_type FROM places WHERE owner_id = ?', [userId], (err, rows) => (err ? reject(err) : resolve([rows])));
    });
    if (placesRows.length === 0) return res.status(200).json([]);

    const placeIds = placesRows.map((p) => p.id);
    const placeholders = placeIds.map(() => '?').join(',');

    const [bookingsRows] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT id, place_id, check_in, check_out, no_of_guests, price, name AS userName, phone, status 
         FROM bookings WHERE place_id IN (${placeholders}) ORDER BY check_in DESC`,
        placeIds,
        (err, rows) => (err ? reject(err) : resolve([rows]))
      );
    });

    const formattedBookings = bookingsRows
      .map((booking) => {
        const matchingPlace = placesRows.find((p) => p.id === Number(booking.place_id));
        if (!matchingPlace) return null;
        return {
          id: booking.id,
          userName: booking.userName || 'اسم المستخدم غير معرف',
          phone: booking.phone || 'رقم الهاتف غير متوفر',
          duration: calculateDuration(booking.check_in, booking.check_out),
          date: formatDate(booking.check_in),
          placeTitle: matchingPlace.title,
          image: matchingPlace.photos?.[0] || 'default.jpg',
          type: matchingPlace.home_type,
          guests: booking.no_of_guests,
          rooms: 2,
          price: `${booking.price} JOD`,
          status: booking.status || 'Pending',
          folderName: matchingPlace.folderName,
          photos: matchingPlace.photos || null,
        };
      })
      .filter(Boolean);

    res.status(200).json(formattedBookings);
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function getBookings(req, res) {
  const { costumerId } = req.query;
  db.query('SELECT * FROM bookings WHERE costumerId = ?', [costumerId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.json({ bookings: results });
  });
}

async function getBookingTitles(req, res) {
  const { place_id } = req.params;
  const query = 'SELECT id, check_in, check_out FROM bookings WHERE place_id = ?';
  db.query(query, [place_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query failed' });
    const formattedResults = results.map((booking) => ({ id: booking.id, ckeckIn: booking.check_in, chekcOut: booking.check_out }));
    res.json(formattedResults);
  });
}

async function getBookingById(req, res) {
  const { id } = req.params;
  db.query('SELECT * FROM bookings WHERE id = ?', [id], (err, bookingResult) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    if (bookingResult.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = bookingResult[0];
    db.query('SELECT * FROM places WHERE id = ?', [booking.place_id], (placeErr, placeResult) => {
      if (placeErr) return res.status(500).json({ error: 'Internal Server Error' });
      const place = placeResult[0];
      res.json({ ...booking, place });
    });
  });
}

async function updateBookingStatus(req, res) {
  const { bookingId, newStatus } = req.body;
  if (!bookingId || !newStatus) return res.status(400).json({ error: 'Missing required fields' });

  const [result] = await new Promise((resolve, reject) => {
    db.query(
      `UPDATE bookings b JOIN places p ON b.place_id = p.id SET b.status = ? WHERE b.id = ? AND p.owner_id = ?`,
      [newStatus, bookingId, req.body.userId],
      (err, results) => (err ? reject(err) : resolve([results]))
    );
  });

  if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found or unauthorized' });
  res.status(200).json({ message: 'Status updated successfully' });
}

async function deleteBooking(req, res) {
  const { id } = req.params;
  db.query('DELETE FROM bookings WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  });
}

function calculateDuration(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day} ${getMonthName(month)} ${year}`;
}

function getMonthName(month) {
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return months[month - 1];
}

module.exports = { addBooking, getAllBookings, getBookingsByUser, getBookings, getBookingTitles, getBookingById, updateBookingStatus, deleteBooking };
