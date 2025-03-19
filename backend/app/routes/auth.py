from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from bson.objectid import ObjectId
import logging
from app.services.db_service import find_one, insert_one, update_by_id, find_by_id

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
            'roles': data.get('roles', ['staff']),
            'permissions': ['view_tasks', 'create_tasks'],  # Basic permissions
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        }
        
        # Insert user and get the inserted ID
        result = insert_one('users', new_user)
        user_id = str(result.inserted_id)
        
        # Create access token
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user_id,
                'name': new_user['name'],
                'email': new_user['email'],
                'department': new_user['department'],
                'roles': new_user['roles']
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Unexpected error in registration: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        user = find_one('users', {'email': data.get('email')})
        if not user or not check_password_hash(user['password'], data.get('password')):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=str(user['_id']))
        refresh_token = create_refresh_token(identity=str(user['_id']))
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'department': user['department'],
                'roles': user.get('roles', [])
            }
        }), 200
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        user_id = get_jwt_identity()
        user = find_by_id('users', user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'department': user['department'],
            'roles': user.get('roles', []),
            'notificationPreferences': user.get('notificationPreferences', {
                'email': True,
                'inApp': True
            })
        }), 200
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        return jsonify({'error': 'Failed to get user profile'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Restrict which fields can be updated via this endpoint
        allowed_updates = {
            'name': data.get('name'),
            'notificationPreferences': data.get('notificationPreferences'),
            'updated_at': datetime.utcnow()
        }
        
        # Remove None values
        update_data = {k: v for k, v in allowed_updates.items() if v is not None}
        
        result = update_by_id('users', user_id, update_data)
        if result.modified_count == 0:
            return jsonify({'error': 'Profile update failed'}), 500
            
        # Get updated user
        updated_user = find_by_id('users', user_id)
        
        return jsonify({
            'id': str(updated_user['_id']),
            'name': updated_user['name'],
            'email': updated_user['email'],
            'department': updated_user['department'],
            'roles': updated_user.get('roles', []),
            'notificationPreferences': updated_user.get('notificationPreferences', {})
        }), 200
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Profile update failed'}), 500

@auth_bp.route('/password', methods=['PUT'])
@jwt_required()
def update_password():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        user = find_by_id('users', user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Verify current password
        if not check_password_hash(user['password'], data.get('currentPassword')):
            return jsonify({'error': 'Current password is incorrect'}), 400
            
        # Update password
        hashed_password = generate_password_hash(data.get('newPassword'))
        result = update_by_id('users', user_id, {
            'password': hashed_password,
            'updated_at': datetime.utcnow()
        })
        
        if result.modified_count == 0:
            return jsonify({'error': 'Password update failed'}), 500
            
        return jsonify({'message': 'Password updated successfully'}), 200
    except Exception as e:
        logger.error(f"Error updating password: {str(e)}")
        return jsonify({'error': 'Password update failed'}), 500
