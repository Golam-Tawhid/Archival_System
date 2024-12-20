from flask import Blueprint, request, jsonify
from app.models.user import User
from pymongo import MongoClient

bp = Blueprint('users', __name__, url_prefix='/users')

@bp.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the University Archival System!"})

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.find_by_email(data['email']):
        return jsonify({"error": "User already exists"}), 400
    user_id = User.create(data)
    return jsonify({"message": "User registered successfully", "user_id": user_id}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.find_by_email(data['email'])
    if not user or not User.check_password(user['password_hash'], data['password']):
        return jsonify({"error": "Invalid email or password"}), 401
    return jsonify({"message": "Login successful", "user_id": str(user['_id']), "role": user['role']}), 200