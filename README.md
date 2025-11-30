# Archival_System

## Project Overview

Archival_System is a full-stack web application for managing, archiving, and reporting on tasks and related user activity. It provides user authentication, role-based access control, task creation and management, reporting, and archival workflows.

## Objectives

- Provide a secure system for creating, tracking, and archiving tasks.
- Support role-based permissions for user management and access control (see `docs/roles_and_permissions.md`).
- Offer reporting features to export or review task histories and reports.
- Maintain a clean separation between backend API and a modern React frontend.

## Repo Structure

- `backend/` - Python backend (Flask-style app)
  - `requirements.txt` - Python dependencies
  - `wsgi.py` - WSGI entrypoint
  - `app/` - application package
    - `models/` - models for `user`, `task`, `comment`, `report`
    - `routes/` - API route modules (`auth.py`, `users.py`, `tasks.py`, `reports.py`)
    - `services/` - business logic and DB services
    - `extensions.py`, `config.py`, `utils.py` - app helpers

- `frontend/` - React app
  - `package.json` - frontend dependencies and scripts
  - `src/` - source code (components, pages, store)
  - `public/` - static assets

- `docs/` - documentation (including `roles_and_permissions.md`)

## Key Features

- Authentication (login, register)
- Role-based access control (admins, regular users, etc.)
- Task CRUD operations and archival flows
- Reporting endpoints and UI pages
- React-based frontend with Redux slices (`store/slices/`)

## Getting Started (Development)

Prerequisites:
- Python 3.8+ and `pip`
- Node.js 14+ and `npm` or `pnpm`

Backend (PowerShell):

```powershell
# create a virtual environment
python -m venv .venv; 
# activate it
.\.venv\Scripts\Activate.ps1; 
# install dependencies
pip install -r backend\requirements.txt; 
# run the backend (development)
python backend\wsgi.py
```

Notes: If your backend uses `flask run` or another server, adapt the last command accordingly. `wsgi.py` is the entrypoint provided in this repo.

Frontend (PowerShell):

```powershell
cd frontend; 
npm install; 
npm start
```

Frontend tests:

```powershell
cd frontend; 
npm test
```

## Configuration

- Backend config values are located in `backend/app/config.py`.
- Environment variables (DB connection string, secret keys) should be set in your shell or a `.env` file depending on your setup.
- Role and permission details are documented in `docs/roles_and_permissions.md`.

## Running in Production

- Serve the backend with a WSGI server (e.g., `gunicorn`) or configure with your platform (Docker, reverse proxy).
- Build the frontend with `npm run build` and serve static files with a web server or via the backend.

## Contributing

- Follow the existing code style, add tests for new features, and update documentation in `docs/`.
- Open issues or pull requests to propose changes.

## References

- `docs/roles_and_permissions.md` — details on allowed actions per role.
- Backend routes: `backend/app/routes/` — quick map of API endpoints.
- Frontend pages: `frontend/src/pages/` — UI entry points for each view.

## Contact

For questions about this repository or how to run it, open an issue or contact the maintainer.

---

README generated on 2025-11-30.
