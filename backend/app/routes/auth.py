from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from models.user import User
import bcrypt

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Initialize db attribute
auth_bp.db = None

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        print("Registration endpoint hit")
        print("Request headers:", dict(request.headers))
        print("Request method:", request.method)
        
        data = request.get_json()
        print(f"Registration request received: {data}")
        
        # Validate required fields
        required_fields = ['email', 'password', 'name', 'department']
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            error_msg = f'Missing required fields: {", ".join(missing_fields)}'
            print(f"Validation error: {error_msg}")
            return jsonify({'error': error_msg}), 400
            
        # Validate department
        if data['department'] not in User.DEPARTMENTS:
            error_msg = f'Invalid department. Must be one of: {", ".join(User.DEPARTMENTS.keys())}'
            print(f"Validation error: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        user_model = User(auth_bp.db)
        
        # Check if user already exists
        if user_model.get_user_by_email(data['email']):
            return jsonify({'error': 'Email already registered'}), 409
        
        # Hash password
        data['password'] = hash_password(data['password'])
        
        # Set default role if not provided
        if 'roles' not in data:
            data['roles'] = ['staff']
        
        # Create user
        try:
            user = user_model.create_user(data)
            del user['password']  # Remove password from response
            print(f"User created successfully: {user}")
            return jsonify(user), 201
        except Exception as e:
            print(f"Error creating user: {str(e)}")
            return jsonify({'error': f'Failed to create user: {str(e)}'}), 500
            
    except Exception as e:
        print(f"Unexpected error in registration: {str(e)}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing email or password'}), 400
    
    user_model = User(auth_bp.db)
    user = user_model.get_user_by_email(data['email'])
    
    if not user or not check_password(data['password'], user['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if not user.get('is_active', True):
        return jsonify({'error': 'Account is deactivated'}), 403
    
    # Create tokens
    access_token = create_access_token(identity=str(user['_id']))
    refresh_token = create_refresh_token(identity=str(user['_id']))
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user['_id'],
            'email': user['email'],
            'name': user['name'],
            'department': user['department'],
            'roles': user['roles'],
            'permissions': user['permissions']
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
    user_model = User(auth_bp.db)
    user = user_model.get_user_by_id(current_user_id)
    
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
    user_model = User(auth_bp.db)
    user = user_model.get_user_by_id(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    has_permission = data['permission'] in user.get('permissions', [])
    return jsonify({'has_permission': has_permission}), 200
