require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  sms: {
    baseUrl: 'http://82.212.81.40:8080/websmpp/websms',
    user: 'JbuyApp1',
    pass: '429J@NewY',
    sid: 'Jbuy.App',
    type: '4' // Unicode for Arabic messages
  },
  expo: {
    accessToken: process.env.EXPO_ACCESS_TOKEN
  },
  upload: {
    tempDir: 'uploads/temp',
    profilesDir: 'uploads/profiles',
    placesDir: 'uploads/places',
    slidesDir: 'uploads/slides',
    iconsDir: 'uploads/icons',
    servicesDir: 'uploads/services'
  }
};

module.exports = config;