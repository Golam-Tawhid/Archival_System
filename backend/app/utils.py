from app.services.role_service import RoleService

def has_permission(user, permission):
    """Check if a user has a specific permission using the RoleService."""
    return RoleService.has_permission(user, permission)
