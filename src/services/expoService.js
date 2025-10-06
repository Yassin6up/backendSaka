const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotifications(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return 0;
  await expo.sendPushNotificationsAsync(messages);
  return messages.length;
}

module.exports = { sendPushNotifications };
