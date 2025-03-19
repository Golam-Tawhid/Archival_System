from datetime import datetime
from bson import ObjectId
from app.services.role_service import RoleService

class User:
    # Keep these for backward compatibility and reference
    ROLES = RoleService.ROLES
    
    DEPARTMENTS = {
        'CSE': 'Computer Science and Engineering',
        'ECE': 'Electronics and Communication Engineering',
        'ME': 'Mechanical Engineering',
        'RESEARCH': 'Research',
        'ADMIN': 'Administration'
    }

    def __init__(self, db):
        self.db = db
        self.collection = db.users

    def create_user(self, data):
        user = {
            'email': data['email'],
            'password': data['password'],
            'name': data['name'],
            'department': data['department'],
            'roles': data.get('roles', ['staff']),
            'permissions': self._get_permissions_for_roles(data.get('roles', ['staff'])),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        }
        result = self.collection.insert_one(user)
        user['_id'] = str(result.inserted_id)
        return user

    def get_user_by_email(self, email):
        user = self.collection.find_one({'email': email})
        if user:
            user['_id'] = str(user['_id'])
        return user

    def get_user_by_id(self, user_id):
        try:
            user = self.collection.find_one({'_id': ObjectId(user_id)})
            if user:
                user['_id'] = str(user['_id'])
            return user
        except:
            return None

    def update_user(self, user_id, data):
        data['updated_at'] = datetime.utcnow()
        if 'roles' in data:
            data['permissions'] = self._get_permissions_for_roles(data['roles'])
        
        result = self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': data}
        )
        return result.modified_count > 0

    def get_department_users(self, department):
        users = list(self.collection.find({'department': department}))
        for user in users:
            user['_id'] = str(user['_id'])
        return users

    def get_users_by_role(self, role):
        users = list(self.collection.find({'roles': role}))
        for user in users:
            user['_id'] = str(user['_id'])
        return users

    def _get_permissions_for_roles(self, roles):
        """Get all permissions for the given roles using the RoleService."""
        return RoleService.get_permissions_for_roles(roles)
