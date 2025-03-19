from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from bson.objectid import ObjectId
import logging
from app.services.db_service import find_one, insert_one

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        logger.info("Registration endpoint hit")
        logger.info(f"Request headers: {request.headers}")
        logger.info(f"Request method: {request.method}")
        
        data = request.get_json()
        logger.info(f"Registration request received: {data}")
        
        # Check if user already exists
        existing_user = find_one('users', {'email': data.get('email')})
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        hashed_password = generate_password_hash(data.get('password'))
        new_user = {
            'name': data.get('name'),
            'email': data.get('email'),
            'password': hashed_password,
            'department': data.get('department'),
            'role': 'user'  # Default role
        }
        
        # Insert user and get the inserted ID
        result = insert_one('users', new_user)
        user_id = str(result.inserted_id)
        
        # Create access token
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'id': user_id,
                'name': new_user['name'],
                'email': new_user['email'],
                'department': new_user['department'],
                'role': new_user['role']
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Unexpected error in registration: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = find_one('users', {'email': data.get('email')})
    
    if not user or not check_password_hash(user['password'], data.get('password')):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if not user.get('is_active', True):
        return jsonify({'error': 'Account is deactivated'}), 403
    
    # Create tokens
    access_token = create_access_token(identity=str(user['_id']))
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': str(user['_id']),
            'email': user['email'],
            'name': user['name'],
            'department': user['department'],
            'role': user['role']
        }
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = find_one('users', {'_id': ObjectId(current_user_id)})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    del user['password']
    return jsonify(user), 200

@auth_bp.route('/check-permission', methods=['POST'])
@jwt_required()
def check_permission():
    data = request.get_json()
    if not data or 'permission' not in data:
        return jsonify({'error': 'Permission not specified'}), 400
    
    current_user_id = get_jwt_identity()
    user = find_one('users', {'_id': ObjectId(current_user_id)})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    has_permission = data['permission'] in user.get('permissions', [])
    return jsonify({'has_permission': has_permission}), 200
