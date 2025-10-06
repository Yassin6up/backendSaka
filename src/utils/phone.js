function normalizePhone(phone) {
  if (!phone) return phone;
  return phone.replace(/^\+9620/, '+962');
}

module.exports = { normalizePhone };
