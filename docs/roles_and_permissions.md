# Roles and Permissions System

## Overview

The Archival System implements a hierarchical role-based access control system that defines what actions users can perform within the application. This document outlines the available roles, permissions, and how they interact.

## Role Hierarchy

Roles are organized in a hierarchy from highest to lowest privilege:

1. **Super Admin** - Complete system control
2. **Admin** - System administration with limitations
3. **Department Head** - Management of a specific department
4. **Faculty** - Advanced department member capabilities
5. **Staff** - Basic system usage

Higher-level roles inherit permissions from lower-level roles where appropriate.

## Role Definitions

### Super Admin

- Has all permissions in the system
- Can manage other Super Admins
- Cannot be assigned by regular Admins

### Admin

- Can manage users, roles, and departments
- Can view and approve all tasks
- Can generate reports
- Cannot modify Super Admin accounts

### Department Head

- Can manage tasks within their department
- Can approve tasks in their department
- Can generate reports for their department
- Can view all department members' tasks

### Faculty

- Can create and edit tasks
- Can approve certain tasks
- Can generate basic reports
- Inherits Staff permissions

### Staff

- Can create and edit own tasks
- Can view assigned tasks
- Can generate basic personal reports

## Permissions List

| Permission            | Description                              |
| --------------------- | ---------------------------------------- |
| manage_users          | Create, update, and manage user accounts |
| manage_roles          | Assign and modify user roles             |
| manage_departments    | Create and modify departments            |
| create_task           | Create new tasks in the system           |
| edit_task             | Modify existing tasks                    |
| delete_task           | Remove tasks from the system             |
| view_all_tasks        | See tasks across all departments         |
| view_department_tasks | See all tasks within a department        |
| view_assigned_tasks   | See tasks assigned to the user           |
| approve_task          | Mark tasks as approved/complete          |
| generate_reports      | Create system reports                    |
| access_archives       | View and restore archived content        |

## Implementation Details

The role system is implemented through:

1. `RoleService` - Centralized role and permission management
2. User model integration - Stores assigned roles per user
3. Permission checks - Using the `has_permission` utility function

## Best Practices

When extending the role system:

1. Add new permissions to the `RoleService.ROLE_PERMISSIONS` dictionary
2. Update route handlers to check for the new permissions
3. Consider the role hierarchy when assigning new permissions
4. Document new permissions in this guide
