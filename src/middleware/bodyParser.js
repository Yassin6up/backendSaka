const bodyParser = require('body-parser');

const bodyParserMiddleware = [
  bodyParser.urlencoded({ extended: true }),
  bodyParser.json()
];

module.exports = bodyParserMiddleware;