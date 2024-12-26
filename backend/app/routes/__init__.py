# Initialize routes package
from .auth import auth_bp
from .tasks import tasks_bp
from .users import users_bp
from .reports import reports_bp

__all__ = ['auth_bp', 'tasks_bp', 'users_bp', 'reports_bp']
