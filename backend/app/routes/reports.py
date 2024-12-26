from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.report import Report
from models.user import User
from datetime import datetime
import json
import io
import csv

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

# Initialize db attribute
reports_bp.db = None

def has_permission(user, permission):
    return permission in user.get('permissions', [])

@reports_bp.route('', methods=['GET'])  # No trailing slash
@reports_bp.route('/', methods=['GET'])  # With trailing slash
@jwt_required()
def get_reports():
    current_user_id = get_jwt_identity()
    user_model = User(reports_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    if not has_permission(current_user, 'generate_reports'):
        return jsonify({'error': 'Permission denied'}), 403
    
    report_model = Report(reports_bp.db)
    reports = report_model.get_templates()
    
    return jsonify(reports), 200

@reports_bp.route('/templates', methods=['GET'])
@jwt_required()
def get_report_templates():
    current_user_id = get_jwt_identity()
    user_model = User(reports_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    if not has_permission(current_user, 'generate_reports'):
        return jsonify({'error': 'Permission denied'}), 403
    
    report_model = Report(reports_bp.db)
    templates = report_model.get_templates()
    
    return jsonify(templates), 200

@reports_bp.route('/templates', methods=['POST'])
@jwt_required()
def create_report_template():
    current_user_id = get_jwt_identity()
    user_model = User(reports_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    if not has_permission(current_user, 'manage_roles'):  # Only admins can create templates
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    required_fields = ['name', 'description', 'type', 'fields', 'layout']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    report_model = Report(reports_bp.db)
    template = report_model.create_template(data)
    
    return jsonify(template), 201

@reports_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_report():
    current_user_id = get_jwt_identity()
    user_model = User(reports_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    if not has_permission(current_user, 'generate_reports'):
        return jsonify({'error': 'Permission denied'}), 403
    
    data = request.get_json()
    if 'template' not in data or 'filters' not in data:
        return jsonify({'error': 'Missing template or filters'}), 400
    
    report_model = Report(reports_bp.db)
    
    # Handle different report types
    if data['template'] == Report.TEMPLATES['TASK_SUMMARY']:
        # For non-admin users, restrict to their department
        department = None if has_permission(current_user, 'view_all_tasks') else current_user['department']
        report_data = report_model.generate_task_summary_report(data['filters'], department)
    
    elif data['template'] == Report.TEMPLATES['DEPARTMENT_PERFORMANCE']:
        if not data['filters'].get('department'):
            return jsonify({'error': 'Department is required for performance report'}), 400
        
        # Check if user has permission for the requested department
        if not (has_permission(current_user, 'view_all_tasks') or 
                data['filters']['department'] == current_user['department']):
            return jsonify({'error': 'Permission denied for requested department'}), 403
        
        report_data = report_model.generate_department_performance_report(
            data['filters']['department'],
            data['filters'].get('date_range', {
                'start': datetime.utcnow().replace(day=1),
                'end': datetime.utcnow()
            })
        )
    else:
        return jsonify({'error': 'Invalid report template'}), 400
    
    if not report_data:
        return jsonify({'error': 'No data available for the specified filters'}), 404
    
    # Create report record
    report = report_model.create_report({
        'title': data.get('title', f"Report {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"),
        'template': data['template'],
        'filters': data['filters'],
        'data': report_data,
        'department': current_user['department'] if not has_permission(current_user, 'view_all_tasks') else None
    }, current_user_id)
    
    return jsonify(report), 201

@reports_bp.route('/<report_id>', methods=['GET'])
@jwt_required()
def get_report(report_id):
    current_user_id = get_jwt_identity()
    user_model = User(reports_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    report_model = Report(reports_bp.db)
    report = report_model.get_report_by_id(report_id)
    
    if not report:
        return jsonify({'error': 'Report not found'}), 404
    
    # Check permissions
    if not (has_permission(current_user, 'view_all_tasks') or
            report['department'] == current_user['department'] or
            report['generated_by'] == current_user_id):
        return jsonify({'error': 'Permission denied'}), 403
    
    return jsonify(report), 200

@reports_bp.route('/<report_id>/export', methods=['GET'])
@jwt_required()
def export_report(report_id):
    current_user_id = get_jwt_identity()
    user_model = User(reports_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    report_model = Report(reports_bp.db)
    report = report_model.get_report_by_id(report_id)
    
    if not report:
        return jsonify({'error': 'Report not found'}), 404
    
    # Check permissions
    if not (has_permission(current_user, 'view_all_tasks') or
            report['department'] == current_user['department'] or
            report['generated_by'] == current_user_id):
        return jsonify({'error': 'Permission denied'}), 403
    
    # Get export format
    export_format = request.args.get('format', 'csv')
    
    if export_format == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        if isinstance(report['data'], dict):
            writer.writerow(report['data'].keys())
            writer.writerow(report['data'].values())
        elif isinstance(report['data'], list):
            if report['data']:
                writer.writerow(report['data'][0].keys())
                for row in report['data']:
                    writer.writerow(row.values())
        
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f"report_{report_id}.csv"
        )
    
    elif export_format == 'json':
        return send_file(
            io.BytesIO(json.dumps(report['data'], default=str).encode('utf-8')),
            mimetype='application/json',
            as_attachment=True,
            download_name=f"report_{report_id}.json"
        )
    
    else:
        return jsonify({'error': 'Unsupported export format'}), 400

@reports_bp.route('/department/<department>', methods=['GET'])
@jwt_required()
def get_department_reports(department):
    current_user_id = get_jwt_identity()
    user_model = User(reports_bp.db)
    current_user = user_model.get_user_by_id(current_user_id)
    
    if not (has_permission(current_user, 'view_all_tasks') or
            current_user['department'] == department):
        return jsonify({'error': 'Permission denied'}), 403
    
    report_model = Report(reports_bp.db)
    reports = report_model.get_department_reports(department)
    
    return jsonify(reports), 200
