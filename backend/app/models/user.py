from werkzeug.security import generate_password_hash, check_password_hash
# from flask import current_app
from app.extensions import db
from bson import ObjectId
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['archival_db']
users_collection = db['users']

class User:
    @staticmethod
    def get_collection():
        # Access the 'users' get_collection within the app context
        return db['users']

    @staticmethod
    def create(data):
        # Hash password before saving
        hashed_password = generate_password_hash(data['password'])
        user = {
            "name": data['name'],
            "email": data['email'],
            "password_hash": hashed_password,
            "role": data.get('role', 'User'),  # Default role is 'User'
            "department": data['department'],
        }
        result = User.get_collection().insert_one(user)
        return str(result.inserted_id)

    @staticmethod
    def find_by_email(email):
        return User.get_collection().find_one({"email": email})

    @staticmethod
    def check_password(stored_password, provided_password):
        return check_password_hash(stored_password, provided_password)
