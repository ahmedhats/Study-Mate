require('dotenv').config();
const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    mongo: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/study-mate',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES || 30,
        refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS || 30,
    },
    email: {
        smtp: {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.SMTP_USERNAME || 'ahmedhatdev@gmail.com',
                pass: process.env.SMTP_PASSWORD || 'wqjf qvqk qvqk qvqk',
            },
            secure: false,
            requireTLS: true,
        },
        from: process.env.EMAIL_FROM || 'ahmedhatdev@gmail.com',
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },
};


module.exports = config; 