import logging
from flask import current_app, g
from pymongo.errors import ConnectionFailure, OperationFailure
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

def get_db():
    """Get database connection from the current app context"""
    if current_app:
        return current_app.get_db()
    else:
        from app import get_db as app_get_db
        return app_get_db()

def get_collection(collection_name):
    """Get a MongoDB collection by name"""
    db = get_db()
    return db[collection_name]

# Common database operations with error handling
def find_one(collection_name, query, projection=None):
    """Find a single document with error handling"""
    try:
        collection = get_collection(collection_name)
        return collection.find_one(query, projection)
    except Exception as e:
        logger.error(f"Database error in find_one: {str(e)}")
        raise

def find_many(collection_name, query=None, projection=None, sort=None, limit=0, skip=0):
    """Find multiple documents with error handling"""
    try:
        collection = get_collection(collection_name)
        cursor = collection.find(query or {}, projection)
        
        if sort:
            cursor = cursor.sort(sort)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
            
        return list(cursor)
    except Exception as e:
        logger.error(f"Database error in find_many: {str(e)}")
        raise

def insert_one(collection_name, document):
    """Insert a single document with error handling"""
    try:
        collection = get_collection(collection_name)
        return collection.insert_one(document)
    except Exception as e:
        logger.error(f"Database error in insert_one: {str(e)}")
        raise

def insert_many(collection_name, documents):
    """Insert multiple documents with error handling"""
    try:
        collection = get_collection(collection_name)
        return collection.insert_many(documents)
    except Exception as e:
        logger.error(f"Database error in insert_many: {str(e)}")
        raise

def update_one(collection_name, query, update, upsert=False):
    """Update a single document with error handling"""
    try:
        collection = get_collection(collection_name)
        return collection.update_one(query, update, upsert=upsert)
    except Exception as e:
        logger.error(f"Database error in update_one: {str(e)}")
        raise

def delete_one(collection_name, query):
    """Delete a single document with error handling"""
    try:
        collection = get_collection(collection_name)
        return collection.delete_one(query)
    except Exception as e:
        logger.error(f"Database error in delete_one: {str(e)}")
        raise

def update_by_id(collection_name, id, data, upsert=False):
    """Update a document by its ID"""
    try:
        return update_one(
            collection_name,
            {"_id": ObjectId(id)},
            {"$set": data},
            upsert
        )
    except Exception as e:
        logger.error(f"Database error in update_by_id: {str(e)}")
        raise

def find_by_id(collection_name, id, projection=None):
    """Find a document by its ID"""
    try:
        return find_one(
            collection_name,
            {"_id": ObjectId(id)},
            projection
        )
    except Exception as e:
        logger.error(f"Database error in find_by_id: {str(e)}")
        raise
