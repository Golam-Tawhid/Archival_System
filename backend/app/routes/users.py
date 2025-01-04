from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
import bcrypt

users_bp = Blueprint('users', __name__)

# Initialize db attribute
users_bp.db = None

def has_permission(user, permission):
    return permission in user.get('permissions', [])

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    user_model = User(users_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    if not has_permission(current_user, 'manage_users'):
        return jsonify({'error': 'Permission denied'}), 403
    
    department = request.args.get('department')
    role = request.args.get('role')
    
    if department:
        users = user_model.get_department_users(department)
    elif role:
        users = user_model.get_users_by_role(role)
    else:
        # Only super admins can view all users
        if 'super_admin' not in current_user['roles']:
            return jsonify({'error': 'Permission denied'}), 403
        users = list(user_model.collection.find())
        for user in users:
            user['_id'] = str(user['_id'])
            del user['password']
    
    return jsonify(users), 200

@users_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user_id = get_jwt_identity()
    user_model = User(users_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    # Users can view their own profile or admins can view any profile
    if not (user_id == current_user_id or has_permission(current_user, 'manage_users')):
        return jsonify({'error': 'Permission denied'}), 403
    
    user = user_model.get_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    del user['password']
    return jsonify(user), 200

@users_bp.route('/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    user_model = User(users_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    # Check if user exists
    target_user = user_model.get_user_by_id(user_id)
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Handle different types of updates
    if 'roles' in data:
        # Only admins can update roles
        if not has_permission(current_user, 'manage_roles'):
            return jsonify({'error': 'Permission denied'}), 403
        
        # Super admin role can only be granted by other super admins
        if ('super_admin' in data['roles'] and 
            'super_admin' not in current_user['roles']):
            return jsonify({'error': 'Permission denied'}), 403
    
    elif 'department' in data:
        # Only admins can change departments
        if not has_permission(current_user, 'manage_users'):
            return jsonify({'error': 'Permission denied'}), 403
    
    else:
        # Users can update their own basic info, admins can update anyone
        if not (user_id == current_user_id or has_permission(current_user, 'manage_users')):
            return jsonify({'error': 'Permission denied'}), 403
    
    # Handle password updates
    if 'password' in data:
        data['password'] = bcrypt.hashpw(
            data['password'].encode('utf-8'),
            bcrypt.gensalt()
        )
    
    # Update user
    success = user_model.update_user(user_id, data)
    if not success:
        return jsonify({'error': 'Failed to update user'}), 500
    
    updated_user = user_model.get_user_by_id(user_id)
    del updated_user['password']
    return jsonify(updated_user), 200

@users_bp.route('/<user_id>/roles', methods=['PUT'])
@jwt_required()
def update_user_roles(user_id):
    current_user_id = get_jwt_identity()
    user_model = User(users_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    if not has_permission(current_user, 'manage_roles'):
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    if 'roles' not in data:
        return jsonify({'error': 'Roles not specified'}), 400
    
    # Check if target user exists
    target_user = user_model.get_user_by_id(user_id)
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Super admin role can only be granted by other super admins
    if ('super_admin' in data['roles'] and 
        'super_admin' not in current_user['roles']):
        return jsonify({'error': 'Permission denied'}), 403
    
    success = user_model.update_user(user_id, {'roles': data['roles']})
    if not success:
        return jsonify({'error': 'Failed to update roles'}), 500
    
    updated_user = user_model.get_user_by_id(user_id)
    del updated_user['password']
    return jsonify(updated_user), 200

@users_bp.route('/<user_id>/department', methods=['PUT'])
@jwt_required()
def update_user_department(user_id):
    current_user_id = get_jwt_identity()
    user_model = User(users_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    if not has_permission(current_user, 'manage_users'):
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    if 'department' not in data:
        return jsonify({'error': 'Department not specified'}), 400
    
    # Validate department
    if data['department'] not in User.DEPARTMENTS.keys():
        return jsonify({'error': 'Invalid department'}), 400
    
    success = user_model.update_user(user_id, {'department': data['department']})
    if not success:
        return jsonify({'error': 'Failed to update department'}), 500
    
    updated_user = user_model.get_user_by_id(user_id)
    del updated_user['password']
    return jsonify(updated_user), 200

@users_bp.route('/department/<department>', methods=['GET'])
@jwt_required()
def get_department_users(department):
    current_user_id = get_jwt_identity()
    user_model = User(users_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    # Users can view their own department, admins can view any department
    if not (department == current_user['department'] or 
            has_permission(current_user, 'manage_users')):
        return jsonify({'error': 'Permission denied'}), 403
    
    users = user_model.get_department_users(department)
    for user in users:
        del user['password']
    
    return jsonify(users), 200
