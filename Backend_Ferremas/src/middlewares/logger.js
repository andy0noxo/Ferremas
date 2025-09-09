const morgan = require('morgan');

const logger = {
  http: (msg) => console.log(msg),
  info: (msg) => console.info(msg),
  warn: (msg) => console.warn(msg),
  error: (msg) => console.error(msg),
  debug: (msg) => console.debug(msg)
};

const stream = {
  write: (message) => logger.http(message.trim())
};

const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

module.exports = logger;