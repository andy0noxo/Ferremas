module.exports = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  },
  rateLimit: {
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutos
    max: process.env.RATE_LIMIT_MAX || 100
  },
  morganFormat: process.env.MORGAN_FORMAT || ':method :url :status :res[content-length] - :response-time ms',
  emailHost: process.env.EMAIL_HOST || 'smtp.example.com',
  emailPort: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 465,
  emailUser: process.env.EMAIL_USER || 'usuario@example.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'password',
  emailFromName: process.env.EMAIL_FROM_NAME || 'Ferremas',
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@ferremas.cl'
};