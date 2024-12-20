from app.extensions import db
from datetime import datetime
from pymongo import MongoClient 

client = MongoClient('mongodb://localhost:27017/')
db = client['archival_db']
users_collection = db['tasks']

class Task:
    @staticmethod
    def create_task(data):
        task = {
            "title": data["title"],
            "description": data["description"],
            "priority": data.get("priority", "Medium"),
            "status": "Not Started",
            "assigned_department": data.get("assigned_department"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        db.db.tasks.insert_one(task)  # Use PyMongo's insert_one
        return task

    @staticmethod
    def update_task(task_id, data):
        update_fields = {
            "title": data.get("title"),
            "description": data.get("description"),
            "priority": data.get("priority"),
            "status": data.get("status"),
            "assigned_department": data.get("assigned_department"),
            "updated_at": datetime.utcnow(),
        }
        db.db.tasks.update_one({"_id": task_id}, {"$set": update_fields})
