const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const env = require('./config/env');
const routes = require('./routes');
const { scheduleVipExpiryJob } = require('./jobs/vipExpiry');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static directories
app.use('/uploads/profiles', express.static(path.join(process.cwd(), 'uploads/profiles')));
app.use('/uploads/sliders', express.static(path.join(process.cwd(), 'uploads/sliders')));
app.use('/uploads/services', express.static(path.join(process.cwd(), 'uploads/services')));
app.use('/uploads/icons', express.static(path.join(process.cwd(), 'uploads/icons')));

// API routes
app.use('/', routes);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

// Schedule background jobs
scheduleVipExpiryJob();

module.exports = app;
