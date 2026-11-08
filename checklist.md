# Python Todo-List App Implementation Checklist

Build a small web app with Flask and PostgreSQL. The minimum features are adding, editing, deleting, and marking tasks complete.

## 1. Prepare the project

- [x] Create a project folder named `todo-app`.
- [x] Create this file structure:

  ```text
  todo-app/
  ├── app.py
  ├── .env
  ├── .gitignore
  ├── migrate_task_fields.py
  ├── package-lock.json
  ├── package.json
  ├── requirements.txt
  ├── src/
  │   └── css/
  │       └── input.css
  ├── static/
  │   └── css/
  │       └── app.css
  └── templates/
      ├── index.html
      ├── _task_card.html
      └── edit.html
  ```

- [x] Create a Python virtual environment.
- [ ] Activate it in the terminal session where you will run the app:

  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```

  On macOS/Linux, activate it with `source .venv/bin/activate`.

- [x] Install the required packages:

  ```bash
  pip install Flask Flask-SQLAlchemy "psycopg[binary]" python-dotenv
  ```

- [x] Save the installed dependencies:

  ```bash
  pip freeze > requirements.txt
  ```

- [x] Add `.venv/`, `.env`, and `__pycache__/` to `.gitignore`.

## 2. Set up PostgreSQL

- [x] Install PostgreSQL if it is not already available, and start the PostgreSQL service.
- [x] Connect to PostgreSQL using `psql` or a database client.
- [x] Create a dedicated app user and database:

  ```sql
  CREATE USER todo_user WITH PASSWORD 'replace-with-a-strong-password';
  CREATE DATABASE todo_db OWNER todo_user;
  ```

- [x] Add the database URL to `.env`:

  ```env
  DATABASE_URL=postgresql+psycopg://todo_user:replace-with-a-strong-password@localhost:5432/todo_db
  ```

- [x] Confirm `.env` is listed in `.gitignore`. Never commit the real database password.

## 3. Configure Flask and define the task model

- [x] In `app.py`, import `os`, `Flask`, `abort`, `redirect`, `render_template`, `request`, `url_for`, `SQLAlchemy`, and `load_dotenv`.
- [x] Load `.env` with `load_dotenv()`.
- [x] Create the Flask app and read `DATABASE_URL` from the environment.
- [x] Stop startup with a clear error if `DATABASE_URL` is missing or blank.
- [x] Configure Flask-SQLAlchemy with the PostgreSQL URL and disable modification tracking.
- [x] Create the `Task` model with:
  - [x] `id`: integer primary key.
  - [x] `title`: required string with a maximum length of 200 characters.
  - [x] `completed`: required boolean, defaulting to `False`.

## 4. Implement the task-list and add-task routes

- [x] Add a `GET /` route that fetches tasks ordered by newest first and renders `index.html`.
- [x] Add a `POST /tasks` route that:
  - [x] Reads the `title` form field and trims whitespace.
  - [x] Rejects an empty title.
  - [x] Rejects a title longer than 200 characters.
  - [x] Adds the task to the database and commits the transaction.
  - [x] Redirects to the task list.

## 5. Implement editing

- [x] Add `GET` and `POST` handlers at `/tasks/<task_id>/edit`.
- [x] Return a 404 if the requested task does not exist.
- [x] On `GET`, render `edit.html` with the current task.
- [x] On `POST`, trim and validate the new title using the same rules as task creation.
- [x] Save the updated title and redirect to the task list.

## 6. Implement completion and deletion

- [x] Add a `POST /tasks/<task_id>/complete` route.
- [x] Return a 404 if the task does not exist.
- [x] Toggle `completed`, commit the change, and redirect to the task list.
- [x] Add a `POST /tasks/<task_id>/delete` route.
- [x] Return a 404 if the task does not exist.
- [x] Delete the task, commit the change, and redirect to the task list.

## 7. Build the task-list template

- [x] In `templates/index.html`, add a page title and a form that posts a new task title to `/tasks`.
- [x] Add the `required` and `maxlength="200"` attributes to the title input.
- [x] Display a friendly message when there are no tasks.
- [x] For each task, display its title and visually distinguish completed tasks (for example, with `<s>`).
- [x] Add a POST form button to mark a task complete or incomplete.
- [x] Add an edit link for each task.
- [x] Add a POST form button to delete each task.
- [x] Use Flask's `url_for()` in form actions and links rather than hard-coding URLs.

## 8. Build the edit template

- [x] In `templates/edit.html`, show the current task title in a form input.
- [x] Post the form back to the edit route.
- [x] Add `required` and `maxlength="200"` to the input.
- [x] Add a save button and a link to return to the task list without saving.

## 9. Initialize and run the app

- [x] Create the database tables inside a Flask application context using `db.create_all()`.
- [x] Ensure the app starts only when `app.py` is run directly.
- [x] Start the development server and confirm it starts without errors:

  ```bash
  python app.py
  ```

- [x] Open `http://127.0.0.1:5000` and confirm the task list responds.

## 10. Verify the required features

- [x] Add a task with a normal title and confirm it appears in the list.
- [x] Try submitting an empty or whitespace-only title and confirm it is rejected.
- [x] Edit a task and confirm its title changes.
- [x] Mark a task complete and confirm the completed state is visible.
- [x] Mark it incomplete again and confirm the state changes back.
- [x] Delete a task and confirm it is removed.
- [x] Restart the app and confirm remaining tasks persist in PostgreSQL.
- [x] Try opening an edit, complete, or delete URL with a nonexistent task ID and confirm it returns 404.

## 11. Enrich the UI with Tailwind CSS and task deadlines

- [x] Add Tailwind CSS with a local input stylesheet and compiled CSS in `static/css/app.css`; after installing Node.js, build it with `npm install` and `npm run build:css`. Node.js is needed only to rebuild the stylesheet, not to run Flask.
- [x] Add an idempotent PostgreSQL schema update in `migrate_task_fields.py` for existing task tables. Run it from the project folder with `.venv\Scripts\python.exe migrate_task_fields.py`.
- [x] Add a task description field to the SQLAlchemy model and PostgreSQL schema.
- [x] Add task description inputs to the add and edit forms, display descriptions on task cards, and validate their length.
- [x] Add a required local due date and time field to task creation and editing; store it as a timezone-aware UTC timestamp.
- [x] Validate submitted deadlines and display each task's due date and time.
- [x] Show an active task's time remaining in hours and refresh the countdown once per minute.
- [x] Warn when a deadline is in the past while still allowing the task to be saved.
- [x] Display long countdowns in days, approximate months, and years when appropriate.
- [x] Sort tasks by nearest due date, with tasks that have no deadline at the end.
- [x] Move task creation into a modal opened by the “+ Add” button beside the task-list heading.
- [x] Open task editing in a modal and save updates and deletions in the background without refreshing the page.
- [x] Color active task cards with red, yellow, and green gradients by time remaining: red for under 24 hours (including overdue), yellow for 24 to under 48 hours, green for 48 to under 72 hours, and a neutral style for 72 hours or more.
- [x] Keep completed tasks visually distinct and stop their countdown.
- [x] Verify descriptions and deadlines persist in PostgreSQL and can be edited; test each color threshold, overdue tasks, and completed tasks.

## 12. Prepare for production

- [ ] Replace `db.create_all()`-based schema management with Flask-Migrate when the schema needs to evolve.
- [ ] Add CSRF protection to forms, for example with Flask-WTF.
- [ ] Turn off Flask debug mode in production.
- [ ] Configure production secrets and the PostgreSQL URL through the deployment environment, not committed files.
- [ ] Run the app behind a production-ready WSGI server.
