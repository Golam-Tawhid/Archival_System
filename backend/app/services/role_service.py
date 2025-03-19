"""
Role and permission management service for the application.
Centralizes role definitions, hierarchies, and permission checks.
"""
from functools import lru_cache

class RoleService:
    # Role definitions
    ROLES = {
        'SUPER_ADMIN': 'super_admin',
        'ADMIN': 'admin',
        'DEPARTMENT_HEAD': 'department_head',
        'FACULTY': 'faculty',
        'STAFF': 'staff'
    }

    # Role hierarchy (each role inherits permissions from roles listed here)
    ROLE_HIERARCHY = {
        'super_admin': [],  # Top level, no inheritance
        'admin': [],
        'department_head': [],
        'faculty': ['staff'],  # Faculty inherits staff permissions
        'staff': []
    }

    # Direct permissions for each role (without inheritance)
    ROLE_PERMISSIONS = {
        'super_admin': {
            'manage_users', 'manage_roles', 'manage_departments',
            'create_task', 'edit_task', 'delete_task', 'view_all_tasks',
            'approve_task', 'generate_reports', 'access_archives',
            'view_department_tasks', 'view_assigned_tasks'
        },
        'admin': {
            'manage_users', 'manage_roles',
            'create_task', 'edit_task', 'view_all_tasks',
            'approve_task', 'generate_reports', 'access_archives',
            'view_department_tasks', 'view_assigned_tasks'
        },
        'department_head': {
            'create_task', 'edit_task', 'view_department_tasks',
            'approve_task', 'generate_reports', 'generate_department_reports',
            'view_assigned_tasks'
        },
        'faculty': {
            'create_task', 'edit_task', 'view_department_tasks',
            'approve_task', 'generate_reports'
        },
        'staff': {
            'create_task', 'edit_task', 'view_assigned_tasks',
            'generate_reports'
        }
    }
    
    @staticmethod
    @lru_cache(maxsize=128)  # Cache results for performance
    def get_all_permissions_for_role(role):
        """Get all permissions for a role including inherited permissions."""
        permissions = set(RoleService.ROLE_PERMISSIONS.get(role, set()))
        
        # Add permissions from inherited roles
        for inherited_role in RoleService.ROLE_HIERARCHY.get(role, []):
            permissions.update(RoleService.get_all_permissions_for_role(inherited_role))
            
        return permissions
    
    @staticmethod
    @lru_cache(maxsize=1024)  # Cache results for performance
    def get_permissions_for_roles(roles):
        """Get all permissions for a list of roles including inherited permissions."""
        permissions = set()
        for role in roles:
            permissions.update(RoleService.get_all_permissions_for_role(role))
        return list(permissions)
    
    @staticmethod
    def has_permission(user, permission):
        """Check if a user has a specific permission."""
        if not user:
            return False
            
        # Get roles from user
        user_roles = user.get('roles', [])
        
        # Super admin has all permissions
        if 'super_admin' in user_roles:
            return True
            
        # Check if the permission is in the user's derived permissions
        # First try to use cached permissions if available
        if 'permissions' in user and permission in user['permissions']:
            return True
            
        # Otherwise compute permissions from roles
        permissions = set()
        for role in user_roles:
            permissions.update(RoleService.get_all_permissions_for_role(role))
            
        return permission in permissions
    
    @staticmethod
    def is_role_higher_than(role1, role2):
        """Check if role1 is higher in hierarchy than role2."""
        if role1 == 'super_admin':
            return True
        if role2 == 'super_admin':
            return False
            
        hierarchy_order = ['super_admin', 'admin', 'department_head', 'faculty', 'staff']
        try:
            return hierarchy_order.index(role1) < hierarchy_order.index(role2)
        except ValueError:
            return False
