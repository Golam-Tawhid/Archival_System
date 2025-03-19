import os
import datetime
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'hard-to-guess-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-hard-to-guess-key')
    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(hours=1)
    
    # MongoDB Atlas connection string
    # Format: mongodb+srv://username:password@cluster-address/database?options
    MONGO_USER = os.environ.get('MONGO_USER', 'User1')
    MONGO_PASSWORD = os.environ.get('MONGO_PASSWORD', 'user1')  # Better to use environment variable
    MONGO_CLUSTER = os.environ.get('MONGO_CLUSTER', 'cluster0.bhfuz.mongodb.net')
    MONGO_DATABASE = os.environ.get('MONGO_DATABASE', 'archival_system')
    MONGO_URI = os.environ.get('MONGO_URI', f'mongodb+srv://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_CLUSTER}/{MONGO_DATABASE}?retryWrites=true&w=majority&appName=Cluster0')
    
    # Database connection config - Atlas optimized
    MONGO_MAX_POOL_SIZE = int(os.environ.get('MONGO_MAX_POOL_SIZE', 10))  # Reduced for Atlas
    MONGO_MIN_POOL_SIZE = int(os.environ.get('MONGO_MIN_POOL_SIZE', 5))
    MONGO_CONNECT_TIMEOUT_MS = int(os.environ.get('MONGO_CONNECT_TIMEOUT_MS', 10000))  # Increased for Atlas
    MONGO_SERVER_SELECTION_TIMEOUT_MS = int(os.environ.get('MONGO_SERVER_SELECTION_TIMEOUT_MS', 10000))
    MONGO_SOCKET_TIMEOUT_MS = int(os.environ.get('MONGO_SOCKET_TIMEOUT_MS', 20000))
    
    # CORS settings
    ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '*').split(',')

class DevelopmentConfig(Config):
    DEBUG = True
    # Override any default settings for development

class TestingConfig(Config):
    TESTING = True
    MONGO_URI = os.environ.get('TEST_MONGO_URI', 'mongodb://localhost:27017/archival_system_test')
    # Smaller pool size for tests
    MONGO_MAX_POOL_SIZE = 5
    MONGO_MIN_POOL_SIZE = 1

class ProductionConfig(Config):
    DEBUG = False
    # Production-specific settings
    # Ensure proper security in production
    MONGO_URI = os.environ.get('MONGO_URI')  # Required in production
    
    def __init__(self):
        if not self.MONGO_URI:
            raise ValueError("MONGO_URI environment variable is required for production")

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
