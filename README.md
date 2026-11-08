# Todo List App

A Flask and PostgreSQL todo-list app with task descriptions, deadlines, live countdowns, urgency colors, and in-place add/edit/delete actions.

## Features

- Add, edit, complete/reopen, and delete tasks.
- Add an optional description and a required due date/time.
- Enter deadlines in local time; the app stores them in PostgreSQL as UTC timestamps.
- See a countdown that uses minutes, hours, days, months, or years as appropriate.
- Tasks are sorted by nearest due date; tasks without deadlines appear last.
- Active tasks use urgency gradients: red under 24 hours (including overdue), yellow under 48 hours, green under 72 hours, then neutral.
- Add and edit forms open in dialogs. Adding, editing, and deleting update the list without a full-page refresh.

## Requirements

- Windows 10 or later (commands below use PowerShell).
- Python 3.10 or later.
- PostgreSQL 14 or later, running locally or reachable over the network.
- Node.js and npm are **not** required to run the app. A compiled Tailwind stylesheet is included. Node.js is only needed if you want to rebuild that stylesheet.

## Setup from scratch

Run these steps from the project directory (the directory containing `app.py`).

### 1. Create a PostgreSQL user and database

Install and start PostgreSQL, then open `psql` as a PostgreSQL administrator (often the `postgres` account). Create a dedicated app user and database:

```sql
CREATE USER todo_user WITH PASSWORD 'choose-a-strong-password';
CREATE DATABASE todo_db OWNER todo_user;
```

If you already created these, reuse them instead of running the statements again.

### 2. Configure the database connection

Create or edit the `.env` file next to `app.py`:

```env
DATABASE_URL=postgresql+psycopg://todo_user:choose-a-strong-password@localhost:5432/todo_db
```

Replace the example password with the password you chose. If it contains URL-reserved characters (for example `@`, `/`, `:` or `#`), percent-encode those characters in the connection URL.

Keep `.env` private. It is excluded by `.gitignore`; do not commit it or share its contents.

### 3. Create a Python virtual environment and install dependencies

In PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If PowerShell prevents environment activation, either allow local activation scripts for your user, or skip activation and run the commands using the virtual-environment interpreter explicitly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 4. Prepare the database schema

With the virtual environment active, run:

```powershell
python migrate_task_fields.py
```

Or, without activating it:

```powershell
.\.venv\Scripts\python.exe .\migrate_task_fields.py
```

This creates the task table if needed and safely adds the description and deadline columns. It is safe to run again.

### 5. Start the app

With the virtual environment active:

```powershell
python app.py
```

Or run it directly:

```powershell
.\.venv\Scripts\python.exe .\app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser. Keep the terminal running while you use the app. Press **Ctrl+C** in that terminal to stop it.

The app also calls `db.create_all()` when it starts, so a new empty database will have its task table created automatically. The schema-preparation command above handles databases that need the newer task columns.

## Optional: rebuild Tailwind CSS

The compiled CSS is included in `static/css/app.css`; this is not needed for a normal run. To rebuild it after changing templates or Tailwind styles, install Node.js, then run these commands from the project directory:

```powershell
npm install
npm run build:css
```

## Troubleshooting

- **`ModuleNotFoundError: No module named 'flask'`**: the app is running with a Python interpreter that does not have the project dependencies. Activate `.venv` or start it with `.\.venv\Scripts\python.exe .\app.py`.
- **`DATABASE_URL must be set`**: make sure `.env` exists next to `app.py` and defines `DATABASE_URL`.
- **Could not connect to PostgreSQL**: verify that PostgreSQL is running, the database and user exist, and the host, port, username, password, and database name in `.env` are correct.
- **Database URL parsing error**: check the `postgresql+psycopg://...` format and percent-encode reserved characters in the password.
- **Changes to CSS do not appear**: rebuild the stylesheet with `npm run build:css`, then hard-refresh the browser.

## Development and deployment notes

`python app.py` starts Flask's development server with debug mode enabled. Use it only for local development; do not expose it to an untrusted network or use it as a production server. Before deployment, disable debug mode, use a production-ready WSGI server, configure secrets outside the repository, and add CSRF protection to the forms.
