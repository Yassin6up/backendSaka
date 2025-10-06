const http = require('http');
const env = require('./config/env');
const { connectDb } = require('./config/db');
const { registerVipExpiryJob } = require('./jobs/vipExpiryJob');
const app = require('./app');

connectDb();
registerVipExpiryJob();

const server = http.createServer(app);
server.listen(env.port, () => {
  console.log(`Server started on port ${env.port}`);
});
