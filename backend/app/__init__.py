from flask import Flask
from .extensions import db
from flask_cors import CORS
from .routes import bp, tasks

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # Initialize Extensions
    db.init_app(app)
    CORS(app)

    # Register Routes
    app.register_blueprint(bp)
    # app.register_blueprint(tasks.bp)

    return app
