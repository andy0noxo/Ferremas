module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_ferremas_2025',
    expiration: process.env.JWT_EXPIRATION || '8h',
    algorithm: 'HS256'
  },
  password: {
    saltRounds: 8,
    minLength: 8,
    maxAttempts: 5,
    lockTime: 15 * 60 * 1000 // 15 minutos
  }
};