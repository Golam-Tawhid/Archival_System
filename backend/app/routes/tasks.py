from flask import Blueprint, request, jsonify
from app.extensions import db
from bson.objectid import ObjectId
from datetime import datetime

bp = Blueprint('tasks', __name__, url_prefix='/tasks')

@bp.route('/', methods=['POST','OPTIONS'])
def create_task():
    """Create a new task"""
    if request.method == 'OPTIONS':
        return '', 200 
    data = request.json
    task = {
        "title": data['title'],
        "description": data['description'],
        "priority": data.get('priority', 'Medium'),
        "status": "Not Started",
        "assigned_department": data.get('assigned_department'),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = db.db.tasks.insert_one(task)  # Insert the task into MongoDB
    task["_id"] = str(result.inserted_id)  # Convert ObjectId to string for JSON
    return jsonify({"message": "Task created successfully", "task": task}), 201

@bp.route('/<task_id>', methods=['PUT'])
def update_task(task_id):
    """Update an existing task"""
    try:
        task_id = ObjectId(task_id)  # Convert to ObjectId
    except:
        return jsonify({"message": "Invalid task ID"}), 400

    data = request.json
    update_fields = {
        "title": data.get('title'),
        "description": data.get('description'),
        "priority": data.get('priority'),
        "status": data.get('status'),
        "assigned_department": data.get('assigned_department'),
        "updated_at": datetime.utcnow()
    }
    update_fields = {k: v for k, v in update_fields.items() if v is not None}  # Remove None values

    result = db.db.tasks.update_one({"_id": task_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"message": "Task not found"}), 404

    updated_task = db.db.tasks.find_one({"_id": task_id})  # Retrieve updated task
    updated_task["_id"] = str(updated_task["_id"])  # Convert ObjectId to string
    return jsonify({"message": "Task updated successfully", "task": updated_task}), 200

@bp.route('/', methods=['GET'])
def get_tasks():
    """Get all tasks with optional filters"""
    filters = request.args.to_dict()
    if "_id" in filters:  # Convert _id to ObjectId if filtering by ID
        try:
            filters["_id"] = ObjectId(filters["_id"])
        except:
            return jsonify({"message": "Invalid task ID in filters"}), 400

    tasks = list(db.db.tasks.find(filters))  # Retrieve tasks from MongoDB
    for task in tasks:
        task["_id"] = str(task["_id"])  # Convert ObjectId to string
    return jsonify({"tasks": tasks}), 200
