const http = require('http');
const app = require('./app');
const env = require('./config/env');

const server = http.createServer(app);

// Handle port in use by retrying with a random available port
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.warn(`Port ${env.PORT} in use, trying a random free port...`);
    server.listen(0, () => {
      const addr = server.address();
      console.log(`Server started on port ${addr.port}`);
    });
  } else {
    throw err;
  }
});

server.listen(env.PORT, () => {
  console.log(`Server started on port ${env.PORT}`);
});
