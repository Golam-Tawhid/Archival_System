import os
from flask import Flask, g
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import config
import logging
import atexit

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.FileHandler("app.log"),
                        logging.StreamHandler()
                    ])
logger = logging.getLogger(__name__)

# Global client variable
mongo_client = None

def get_db():
    """Retrieve database connection from the global scope or current application context"""
    if 'db' not in g:
        g.db = mongo_client.get_default_database()
    return g.db

def create_app(config_name='default'):
    global mongo_client
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize CORS
    CORS(app, 
         resources={r"/api/*": {"origins": app.config.get('ALLOWED_ORIGINS', "*")}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Initialize MongoDB connection with improved error handling
    try:
        logger.info("Attempting to connect to MongoDB Atlas...")
        # Configure connection with Atlas-optimized parameters
        mongo_client = MongoClient(
            app.config['MONGO_URI'],
            maxPoolSize=app.config.get('MONGO_MAX_POOL_SIZE', 10),
            minPoolSize=app.config.get('MONGO_MIN_POOL_SIZE', 5),
            serverSelectionTimeoutMS=app.config.get('MONGO_SERVER_SELECTION_TIMEOUT_MS', 10000),
            connectTimeoutMS=app.config.get('MONGO_CONNECT_TIMEOUT_MS', 10000),
            socketTimeoutMS=app.config.get('MONGO_SOCKET_TIMEOUT_MS', 20000),
            retryWrites=True,
            retryReads=True
        )
        # Force a connection to verify it works
        mongo_client.admin.command('ping')
        db = mongo_client.get_default_database()
        logger.info("Successfully connected to MongoDB Atlas")
    except ConnectionFailure as e:
        logger.critical(f"Failed to connect to MongoDB Atlas: {str(e)}")
        raise
    except ServerSelectionTimeoutError as e:
        logger.critical(f"MongoDB Atlas server selection timeout: {str(e)}")
        raise
    except Exception as e:
        logger.critical(f"Unexpected error connecting to MongoDB Atlas: {str(e)}")
        raise
    
    # Register teardown to close connections
    @app.teardown_appcontext
    def close_db_connection(exception):
        db = g.pop('db', None)
        # The actual client connection will be handled by the global teardown
    
    # Register clean shutdown
    def close_mongo_client():
        if mongo_client:
            logger.info("Closing MongoDB connection pool")
            mongo_client.close()
    
    atexit.register(close_mongo_client)
    
    # Register the get_db function with app context
    app.get_db = get_db
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.tasks import tasks_bp
    from app.routes.users import users_bp
    from app.routes.reports import reports_bp
    
    # Register blueprints with the app
    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(reports_bp)
    
    return app
