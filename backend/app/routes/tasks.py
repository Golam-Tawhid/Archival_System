from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.task import Task
from ..models.user import User
from ..models.comment import Comment  # Import the Comment model
from ..utils import has_permission
from datetime import datetime
import json

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

# Initialize db attribute
tasks_bp.db = None

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.task import Task
from app.models.user import User
from app.models.comment import Comment  # Import the Comment model
from app.utils import has_permission
from datetime import datetime
import json

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

# Initialize db attribute
tasks_bp.db = None

def has_permission(user, permission):
    return permission in user.get('permissions', [])

@tasks_bp.route('/<task_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(task_id):
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

@tasks_bp.route('/<task_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(task_id):
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

@tasks_bp.route('/<task_id>', methods=['PUT','POST','DELETE'])
@jwt_required()
def update_task(task_id):
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

@tasks_bp.route('/department/<department>', methods=['GET'])
@jwt_required()
def get_department_tasks(department):
    current_user_id = get_jwt_identity()
    user_model = User(tasks_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    print(f"Current User Roles: {current_user.get('roles')}, Permissions: {current_user.get('permissions')}")

    
    if not (has_permission(current_user, 'view_all_tasks') or
            current_user['department'] == department):
        return jsonify({'error': 'Permission denied'}), 403
    
    status = request.args.get('status')
    exclude_archived = request.args.get('exclude_archived', 'true').lower() == 'true'
    task_model = Task(tasks_bp.db)
    tasks = task_model.get_department_tasks(department, status, current_user, exclude_archived)
    
    return jsonify(tasks), 200

@tasks_bp.route('/status/<status>', methods=['GET'])
@jwt_required()
def get_tasks_by_status(status):
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

@tasks_bp.route('/search', methods=['POST'])
@jwt_required()
def search_tasks():
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

@tasks_bp.route('/<task_id>/approve', methods=['POST'])
@jwt_required()
def approve_task(task_id):
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

@tasks_bp.route('/<task_id>/archive', methods=['POST'])
@jwt_required()
def archive_task(task_id):
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

@tasks_bp.route('/archived', methods=['GET'])
@jwt_required()
def get_archived_tasks():
    current_user_id = get_jwt_identity()
    user_model = User(tasks_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)

    task_model = Task(tasks_bp.db)
    tasks = task_model.get_tasks_by_status(Task.STATUS['ARCHIVED'])

    return jsonify(tasks), 200