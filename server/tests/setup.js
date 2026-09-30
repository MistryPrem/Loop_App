process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/loop_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_super_secure_key_12345';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_super_secure_key_12345';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.LOG_LEVEL = 'silent';
