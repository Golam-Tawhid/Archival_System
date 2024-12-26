from datetime import datetime
from bson import ObjectId

class Task:
    STATUS = {
        'NOT_STARTED': 'not_started',
        'IN_PROGRESS': 'in_progress',
        'PENDING_APPROVAL': 'pending_approval',
        'DONE': 'done',
        'ARCHIVED': 'archived'
    }

    def __init__(self, db):
        self.db = db
        self.collection = db.tasks

    def create_task(self, data):
        task = {
            'title': data['title'],
            'description': data['description'],
            'department': data['department'],
            'created_by': data['created_by'],  # User ID
            'assigned_to': data.get('assigned_to', None),  # User ID or None
            'status': data.get('status', self.STATUS['NOT_STARTED']),
            'priority': data.get('priority', 'medium'),
            'due_date': data.get('due_date', None),
            'attachments': data.get('attachments', []),
            'tags': data.get('tags', []),  # Initialize tags as empty array if not provided
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'change_log': [{
                'field': 'status',
                'old_value': None,
                'new_value': self.STATUS['NOT_STARTED'],
                'changed_by': data['created_by'],
                'changed_at': datetime.utcnow()
            }]
        }
        result = self.collection.insert_one(task)
        task['_id'] = str(result.inserted_id)
        return task

    def get_task_by_id(self, task_id):
        try:
            task = self.collection.find_one({'_id': ObjectId(task_id)})
            if task:
                task['_id'] = str(task['_id'])
                # Ensure tags is always an array
                if 'tags' not in task:
                    task['tags'] = []
            return task
        except:
            return None

    def update_task(self, task_id, data, user_id):
        current_task = self.get_task_by_id(task_id)
        if not current_task:
            return None

        update_data = {'updated_at': datetime.utcnow()}
        change_log = []

        # Track changes for each field
        trackable_fields = ['status', 'assigned_to', 'priority', 'description', 'due_date']
        for field in trackable_fields:
            if field in data and data[field] != current_task.get(field):
                change_log.append({
                    'field': field,
                    'old_value': current_task.get(field),
                    'new_value': data[field],
                    'changed_by': user_id,
                    'changed_at': datetime.utcnow()
                })
                update_data[field] = data[field]

        # Handle other fields
        for field in ['title', 'tags']:
            if field in data:
                update_data[field] = data[field]

        # Handle attachments separately (append new ones)
        if 'attachments' in data:
            update_data['attachments'] = current_task.get('attachments', []) + data['attachments']

        # Append new change log entries
        if change_log:
            update_data['$push'] = {'change_log': {'$each': change_log}}

        result = self.collection.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': update_data}
        )
        
        return self.get_task_by_id(task_id) if result.modified_count > 0 else None

    def get_department_tasks(self, department, status=None):
        query = {'department': department}
        if status:
            query['status'] = status
        
        tasks = list(self.collection.find(query).sort('created_at', -1))
        for task in tasks:
            task['_id'] = str(task['_id'])
            # Ensure tags is always an array
            if 'tags' not in task:
                task['tags'] = []
        return tasks

    def get_user_tasks(self, user_id, department=None):
        query = {
            '$or': [
                {'created_by': user_id},
                {'assigned_to': user_id}
            ]
        }
        if department:
            query['department'] = department

        tasks = list(self.collection.find(query).sort('created_at', -1))
        for task in tasks:
            task['_id'] = str(task['_id'])
            # Ensure tags is always an array
            if 'tags' not in task:
                task['tags'] = []
        return tasks

    def search_tasks(self, filters):
        query = {}
        
        if 'department' in filters:
            query['department'] = filters['department']
        
        if 'status' in filters:
            query['status'] = filters['status']
        
        if 'title' in filters:
            query['title'] = {'$regex': filters['title'], '$options': 'i'}
        
        if 'date_range' in filters:
            query['created_at'] = {
                '$gte': filters['date_range']['start'],
                '$lte': filters['date_range']['end']
            }
        
        if 'priority' in filters:
            query['priority'] = filters['priority']
        
        if 'tags' in filters:
            query['tags'] = {'$all': filters['tags']}

        tasks = list(self.collection.find(query).sort('created_at', -1))
        for task in tasks:
            task['_id'] = str(task['_id'])
            # Ensure tags is always an array
            if 'tags' not in task:
                task['tags'] = []
        return tasks

    def archive_task(self, task_id, user_id):
        return self.update_task(task_id, {
            'status': self.STATUS['ARCHIVED']
        }, user_id)

    def get_tasks_by_status(self, status, department=None):
        query = {'status': status}
        if department:
            query['department'] = department
            
        tasks = list(self.collection.find(query).sort('created_at', -1))
        for task in tasks:
            task['_id'] = str(task['_id'])
            # Ensure tags is always an array
            if 'tags' not in task:
                task['tags'] = []
        return tasks
