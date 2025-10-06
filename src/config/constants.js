module.exports = {
  PORT: process.env.PORT || 5000,
  SMS_CONFIG: {
    BASE_URL: 'http://82.212.81.40:8080/websmpp/websms',
    USER: 'JbuyApp1',
    PASS: '429J@NewY',
    SID: 'Jbuy.App',
    TYPE: '4' // Unicode for Arabic messages
  },
  UPLOAD_PATHS: {
    TEMP: 'uploads/temp',
    PROFILES: 'uploads/profiles',
    PLACES: 'uploads/places',
    SLIDES: 'uploads/slides',
    ICONS: 'uploads/icons'
  }
};