from flask import Flask
from flask_cors import CORS
from .extensions import mongo
from .routes import tasks, users

def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")
    CORS(app)
    mongo.init_app(app)

    # Register Blueprints
    app.register_blueprint(tasks.bp)
    app.register_blueprint(users.bp)

    return app
