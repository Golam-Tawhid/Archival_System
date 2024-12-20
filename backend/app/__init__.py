from flask import Flask
from .extensions import db
from flask_cors import CORS
from .routes import users_bp, tasks_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # Initialize Extensions
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}},supports_credentials=True)
    db.init_app(app)

    # Register Routes
    app.register_blueprint(users_bp)
    app.register_blueprint(tasks_bp)

    return app
