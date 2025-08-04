from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.db_service import find_many, insert_one, update_one, delete_one
import datetime
from ..models.task import Task
from ..models.user import User
from ..models.comment import Comment
from ..utils import has_permission
from ..services.role_service import RoleService
import json
import logging

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

# Initialize db attribute
tasks_bp.db = None

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_db_connection():
    """Verify that the database connection is available"""
    if tasks_bp.db is None:
        logger.error("Database connection not available for tasks blueprint")
        raise Exception("Database connection not initialized")

@tasks_bp.route('/<task_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(task_id):
    try:
        check_db_connection()
        current_user_id = get_jwt_identity()
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)

        data = request.get_json()
        if 'comment_text' not in data:
            return jsonify({'error': 'Comment text is required'}), 400

        comment_model = Comment(tasks_bp.db)
        try:
            comment = comment_model.add_comment(task_id, current_user_id, data['comment_text'])
            return jsonify(comment), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Error in add_comment: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/<task_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(task_id):
    try:
        check_db_connection()
        current_user_id = get_jwt_identity()
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)

        comment_model = Comment(tasks_bp.db)
        comments = comment_model.get_comments_by_task_id(task_id)
        comments = [
            {
                '_id': str(comment['_id']),
                'task_id': str(comment['task_id']),
                'user_id': str(comment['user_id']),
                'comment_text': comment['comment_text'],
                'createdBy': {
                    'name': user_model.get_user_by_id(str(comment['user_id']))['name']
                },
                'created_at': comment['created_at'],
            }
            for comment in comments
        ]
        return jsonify(comments), 200
    except Exception as e:
        logger.error(f"Error in get_comments: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/debug/routes', methods=['GET'])
def list_routes():
    """Debug endpoint to list all registered routes"""
    from flask import current_app
    routes = []
    for rule in current_app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': list(rule.methods),
            'rule': str(rule)
        })
    return jsonify(routes)

@tasks_bp.route('/', methods=['POST'])
@tasks_bp.route('', methods=['POST'])  # Added route without trailing slash
@jwt_required()
def create_task():
    try:
        logger.info("Create task endpoint called")
        check_db_connection()
        current_user_id = get_jwt_identity()
        data = request.get_json()
        logger.info(f"User ID: {current_user_id}, Data: {data}")
        
        # Get current user info to check permissions and get department
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)
        logger.info(f"Current user: {current_user}")
        
        if not current_user:
            logger.error("User not found")
            return jsonify({'error': 'User not found'}), 404
            
        # Check if user has permission to create tasks
        has_perm = has_permission(current_user, 'create_task')
        logger.info(f"User has create_task permission: {has_perm}")
        if not has_perm:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Validate required fields
        if not data.get('title'):
            logger.error("Title is required")
            return jsonify({"error": "Title is required"}), 400
            
        if not data.get('department'):
            # Use current user's department if not specified
            data['department'] = current_user.get('department')
            logger.info(f"Using user department: {data['department']}")
            
        if not data['department']:
            logger.error("Department is required")
            return jsonify({"error": "Department is required"}), 400
        
        # Add created_by field
        data['created_by'] = current_user_id
        logger.info(f"Final task data: {data}")
        
        # Create task using the Task model
        task_model = Task(tasks_bp.db)
        task = task_model.create_task(data)
        logger.info(f"Task created successfully: {task}")
        
        return jsonify(task), 201
    except Exception as e:
        logger.error(f"Error in create_task: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/<task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    try:
        check_db_connection()
        current_user_id = get_jwt_identity()
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)
        
        task_model = Task(tasks_bp.db)
        task = task_model.get_task_by_id(task_id)
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Check permissions
        if not (has_permission(current_user, 'view_all_tasks') or
                task['department'] == current_user['department'] or
                task['created_by'] == current_user_id or
                task.get('assigned_to') == current_user_id):
            return jsonify({'error': 'Permission denied'}), 403
        
        return jsonify(task), 200
    except Exception as e:
        logger.error(f"Error in get_task: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/<task_id>', methods=['PUT','POST','DELETE'])
@jwt_required()
def update_task(task_id):
    try:
        check_db_connection()
        current_user_id = get_jwt_identity()
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)
        
        task_model = Task(tasks_bp.db)
        task = task_model.get_task_by_id(task_id)
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        data = request.get_json()
        updated_task = task_model.update_task(task_id, data, current_user_id)
        
        if not updated_task:
            return jsonify({'error': 'Failed to update task'}), 500
        
        return jsonify(updated_task), 200
    except Exception as e:
        logger.error(f"Error in update_task: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/department/<department>', methods=['GET'])
@jwt_required()
def get_department_tasks(department):
    try:
        check_db_connection()
        current_user_id = get_jwt_identity()
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)
        
        if not (has_permission(current_user, 'view_all_tasks') or
                current_user['department'] == department):
            return jsonify({'error': 'Permission denied'}), 403
        
        status = request.args.get('status')
        exclude_archived = request.args.get('exclude_archived', 'true').lower() == 'true'
        task_model = Task(tasks_bp.db)
        tasks = task_model.get_department_tasks(department, status, current_user, exclude_archived)
        
        return jsonify(tasks), 200
    except Exception as e:
        logger.error(f"Error in get_department_tasks: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/status/<status>', methods=['GET'])
@jwt_required()
def get_tasks_by_status(status):
    try:
        check_db_connection()
        current_user_id = get_jwt_identity()
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)
        
        task_model = Task(tasks_bp.db)
        exclude_archived = request.args.get('exclude_archived', 'true').lower() == 'true'
        
        # If user has permission to view all tasks, don't filter by department
        if has_permission(current_user, 'view_all_tasks'):
            tasks = task_model.get_tasks_by_status(status, exclude_archived=exclude_archived)
        else:
            tasks = task_model.get_tasks_by_status(status, current_user['department'], exclude_archived)
        
        return jsonify(tasks), 200
    except Exception as e:
        logger.error(f"Error in get_tasks_by_status: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/search', methods=['POST'])
@jwt_required()
def search_tasks():
    try:
        check_db_connection()
        current_user_id = get_jwt_identity()
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)
        
        filters = request.get_json()
        
        # If user doesn't have permission to view all tasks, restrict to their department
        if not has_permission(current_user, 'view_all_tasks'):
            filters['department'] = current_user['department']
        
        task_model = Task(tasks_bp.db)
        tasks = task_model.search_tasks(filters)
        
        return jsonify(tasks), 200
    except Exception as e:
        logger.error(f"Error in search_tasks: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/<task_id>/approve', methods=['POST'])
@jwt_required()
def approve_task(task_id):
    try:
        check_db_connection()
        current_user_id = get_jwt_identity()
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)
        
        if not has_permission(current_user, 'approve_task'):
            return jsonify({'error': 'Permission denied'}), 403
        
        task_model = Task(tasks_bp.db)
        task = task_model.get_task_by_id(task_id)
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        if task['status'] != Task.STATUS['PENDING_APPROVAL']:
            return jsonify({'error': 'Task is not pending approval'}), 400
        
        updated_task = task_model.update_task(
            task_id,
            {'status': Task.STATUS['DONE']},
            current_user_id
        )
        
        return jsonify(updated_task), 200
    except Exception as e:
        logger.error(f"Error in approve_task: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/<task_id>/archive', methods=['POST'])
@jwt_required()
def archive_task(task_id):
    try:
        check_db_connection()
        current_user_id = get_jwt_identity()
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)
        
        if not has_permission(current_user, 'access_archives'):
            return jsonify({'error': 'Permission denied'}), 403
        
        task_model = Task(tasks_bp.db)
        task = task_model.get_task_by_id(task_id)
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        if task['status'] != Task.STATUS['DONE']:
            return jsonify({'error': 'Only done tasks can be archived'}), 400
        
        archived_task = task_model.archive_task(task_id, current_user_id)
        
        if not archived_task:
            return jsonify({'error': 'Failed to archive task'}), 500
        
        return jsonify(archived_task), 200
    except Exception as e:
        logger.error(f"Error in archive_task: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/archived', methods=['GET'])
@jwt_required()
def get_archived_tasks():
    try:
        check_db_connection()
        current_user_id = get_jwt_identity()
        user_model = User(tasks_bp.db)
        current_user = user_model.get_user_by_id(current_user_id)

        task_model = Task(tasks_bp.db)
        tasks = task_model.get_tasks_by_status(Task.STATUS['ARCHIVED'])

        return jsonify(tasks), 200
    except Exception as e:
        logger.error(f"Error in get_archived_tasks: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@tasks_bp.route('/', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        check_db_connection()
        user_id = get_jwt_identity()
        
        # Get filter parameters
        status = request.args.get('status')
        priority = request.args.get('priority')
        
        # Build query
        query = {"user_id": user_id}
        if status:
            query["status"] = status
        if priority:
            query["priority"] = priority
            
        # Add pagination
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        skip = (page - 1) * per_page
        
        # Execute query with the db service
        tasks = find_many(
            'tasks',
            query,
            sort=[("created_at", -1)],
            limit=per_page,
            skip=skip
        )
        
        return jsonify(tasks), 200
    except Exception as e:
        logger.error(f"Error in get_tasks: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500
