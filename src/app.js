const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const healthRoutes = require('./routes/healthRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const vipRoutes = require('./routes/vipRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const interestRoutes = require('./routes/interestRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static folders matching legacy behavior
app.use('/uploads/sliders', express.static(path.join(process.cwd(), 'uploads/sliders')));

// Routes
app.use(healthRoutes);
app.use(notificationRoutes);
app.use(userRoutes);
app.use(vipRoutes);
app.use(authRoutes);
app.use(profileRoutes);
app.use(searchRoutes);
app.use(bookingRoutes);
app.use(settingsRoutes);
app.use(interestRoutes);
app.use(fileRoutes);

module.exports = app;
