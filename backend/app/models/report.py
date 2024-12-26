from datetime import datetime
from bson import ObjectId

class Report:
    TEMPLATES = {
        'TASK_SUMMARY': 'task_summary',
        'DEPARTMENT_PERFORMANCE': 'department_performance',
        'USER_ACTIVITY': 'user_activity',
        'ARCHIVE_SUMMARY': 'archive_summary'
    }

    DEFAULT_TEMPLATES = [
        {
            'name': 'Task Summary Report',
            'description': 'Overview of all tasks and their statuses',
            'type': TEMPLATES['TASK_SUMMARY'],
            'fields': ['status', 'department', 'date_range'],
            'layout': {
                'sections': [
                    {'type': 'summary', 'title': 'Task Statistics'},
                    {'type': 'chart', 'title': 'Task Status Distribution'},
                    {'type': 'table', 'title': 'Task Details'}
                ]
            }
        },
        {
            'name': 'Department Performance Report',
            'description': 'Detailed analysis of department task completion and efficiency',
            'type': TEMPLATES['DEPARTMENT_PERFORMANCE'],
            'fields': ['department', 'date_range'],
            'layout': {
                'sections': [
                    {'type': 'summary', 'title': 'Department Overview'},
                    {'type': 'chart', 'title': 'Task Completion Rate'},
                    {'type': 'table', 'title': 'Task Details by Status'}
                ]
            }
        },
        {
            'name': 'User Activity Report',
            'description': 'Analysis of user task creation and completion',
            'type': TEMPLATES['USER_ACTIVITY'],
            'fields': ['user', 'date_range'],
            'layout': {
                'sections': [
                    {'type': 'summary', 'title': 'User Activity Overview'},
                    {'type': 'chart', 'title': 'Task Creation vs Completion'},
                    {'type': 'table', 'title': 'Task History'}
                ]
            }
        },
        {
            'name': 'Archive Summary Report',
            'description': 'Summary of archived tasks and their metadata',
            'type': TEMPLATES['ARCHIVE_SUMMARY'],
            'fields': ['department', 'date_range'],
            'layout': {
                'sections': [
                    {'type': 'summary', 'title': 'Archive Overview'},
                    {'type': 'chart', 'title': 'Archive Distribution'},
                    {'type': 'table', 'title': 'Archived Tasks'}
                ]
            }
        }
    ]

    def __init__(self, db):
        self.db = db
        self.collection = db.reports
        self.templates_collection = db.report_templates
        self._ensure_default_templates()

    def _ensure_default_templates(self):
        """Ensure default report templates exist in the database"""
        existing_templates = list(self.templates_collection.find())
        if not existing_templates:
            # Add created_at and updated_at to each template
            for template in self.DEFAULT_TEMPLATES:
                template['created_at'] = datetime.utcnow()
                template['updated_at'] = datetime.utcnow()
            
            # Insert all default templates
            self.templates_collection.insert_many(self.DEFAULT_TEMPLATES)

    def create_report(self, data, user_id):
        report = {
            'title': data['title'],
            'template': data['template'],
            'filters': data.get('filters', {}),
            'generated_by': user_id,
            'created_at': datetime.utcnow(),
            'data': data['data'],
            'department': data.get('department', None)
        }
        result = self.collection.insert_one(report)
        report['_id'] = str(result.inserted_id)
        return report

    def get_report_by_id(self, report_id):
        try:
            report = self.collection.find_one({'_id': ObjectId(report_id)})
            if report:
                report['_id'] = str(report['_id'])
            return report
        except:
            return None

    def get_department_reports(self, department):
        reports = list(self.collection.find({'department': department}).sort('created_at', -1))
        for report in reports:
            report['_id'] = str(report['_id'])
        return reports

    def get_user_reports(self, user_id):
        reports = list(self.collection.find({'generated_by': user_id}).sort('created_at', -1))
        for report in reports:
            report['_id'] = str(report['_id'])
        return reports

    def get_template(self, template_id):
        try:
            template = self.templates_collection.find_one({'_id': ObjectId(template_id)})
            if template:
                template['_id'] = str(template['_id'])
            return template
        except:
            return None

    def get_templates(self):
        templates = list(self.templates_collection.find())
        for template in templates:
            template['_id'] = str(template['_id'])
        return templates

    def create_template(self, data):
        template = {
            'name': data['name'],
            'description': data['description'],
            'type': data['type'],
            'fields': data['fields'],
            'layout': data['layout'],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.templates_collection.insert_one(template)
        template['_id'] = str(result.inserted_id)
        return template

    def update_template(self, template_id, data):
        data['updated_at'] = datetime.utcnow()
        result = self.templates_collection.update_one(
            {'_id': ObjectId(template_id)},
            {'$set': data}
        )
        return result.modified_count > 0

    def generate_task_summary_report(self, filters, department=None):
        """Generate a summary report of tasks based on filters"""
        pipeline = []
        
        # Match stage based on filters
        match = {}
        if department:
            match['department'] = department
        if filters.get('status'):
            match['status'] = filters['status']
        if filters.get('date_range'):
            match['created_at'] = {
                '$gte': filters['date_range']['start'],
                '$lte': filters['date_range']['end']
            }
        if match:
            pipeline.append({'$match': match})
        
        # Group stage for summary statistics
        pipeline.append({
            '$group': {
                '_id': None,
                'total_tasks': {'$sum': 1},
                'completed_tasks': {
                    '$sum': {'$cond': [{'$eq': ['$status', 'done']}, 1, 0]}
                },
                'in_progress_tasks': {
                    '$sum': {'$cond': [{'$eq': ['$status', 'in_progress']}, 1, 0]}
                },
                'pending_approval_tasks': {
                    '$sum': {'$cond': [{'$eq': ['$status', 'pending_approval']}, 1, 0]}
                },
                'departments': {'$addToSet': '$department'},
                'avg_completion_time': {'$avg': '$completion_time'}
            }
        })
        
        result = list(self.db.tasks.aggregate(pipeline))
        return result[0] if result else None

    def generate_department_performance_report(self, department, date_range):
        """Generate a performance report for a specific department"""
        pipeline = [
            {
                '$match': {
                    'department': department,
                    'created_at': {
                        '$gte': date_range['start'],
                        '$lte': date_range['end']
                    }
                }
            },
            {
                '$group': {
                    '_id': '$status',
                    'count': {'$sum': 1},
                    'avg_completion_time': {'$avg': '$completion_time'},
                    'tasks': {'$push': {
                        'title': '$title',
                        'priority': '$priority',
                        'created_at': '$created_at'
                    }}
                }
            }
        ]
        
        return list(self.db.tasks.aggregate(pipeline))
