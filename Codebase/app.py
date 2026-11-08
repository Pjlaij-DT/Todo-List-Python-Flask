import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from flask import Flask, abort, jsonify, redirect, render_template, request, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Text
from werkzeug.exceptions import HTTPException

load_dotenv()

app = Flask(__name__)
database_url = os.getenv("DATABASE_URL")
if not database_url or not database_url.strip():
    raise RuntimeError("DATABASE_URL must be set in the environment or .env file")

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, nullable=False, default=False)
    description = db.Column(Text, nullable=False, default="")
    due_at = db.Column(db.DateTime(timezone=True), nullable=True)


def validated_title():
    title = request.form.get("title", "").strip()
    if not title:
        abort(400, description="Task title cannot be empty")
    if len(title) > 200:
        abort(400, description="Task title must be 200 characters or fewer")
    return title


def validated_description():
    description = request.form.get("description", "").strip()
    if len(description) > 2000:
        abort(400, description="Task description must be 2000 characters or fewer")
    return description


def validated_due_at():
    value = request.form.get("due_at", "").strip()
    if not value:
        abort(400, description="A task deadline is required")
    try:
        due_at = datetime.fromisoformat(value)
    except ValueError:
        abort(400, description="Enter a valid task deadline")
    if due_at.tzinfo is None:
        offset_value = request.form.get("timezone_offset_minutes", "0").strip()
        try:
            offset_minutes = int(offset_value)
        except ValueError:
            abort(400, description="Invalid browser timezone offset")
        if not -840 <= offset_minutes <= 840:
            abort(400, description="Invalid browser timezone offset")
        local_timezone = timezone(timedelta(minutes=-offset_minutes))
        due_at = due_at.replace(tzinfo=local_timezone)
    return due_at.astimezone(timezone.utc)


def as_utc(value):
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def deadline_color(due_at, now):
    if due_at is None:
        return "bg-gradient-to-r from-slate-50 to-white border-slate-200"
    hours_left = (as_utc(due_at) - now).total_seconds() / 3600
    if hours_left < 24:
        return "bg-gradient-to-r from-red-200 via-red-50 to-white border-red-300"
    if hours_left < 48:
        return "bg-gradient-to-r from-amber-200 via-amber-50 to-white border-amber-300"
    if hours_left < 72:
        return "bg-gradient-to-r from-green-200 via-green-50 to-white border-green-300"
    return "bg-gradient-to-r from-slate-50 to-white border-slate-200"


def due_at_input_value(due_at):
    if due_at is None:
        return ""
    return as_utc(due_at).strftime("%Y-%m-%dT%H:%M")


app.jinja_env.globals["deadline_color"] = deadline_color
app.jinja_env.globals["due_at_input_value"] = due_at_input_value


def wants_json():
    return request.accept_mimetypes["application/json"] > request.accept_mimetypes["text/html"]


@app.errorhandler(HTTPException)
def handle_http_error(error):
    if wants_json():
        return jsonify(error=error.description), error.code
    return error


def task_card_html(task):
    return render_template(
        "_task_card.html",
        task=task,
        now=datetime.now(timezone.utc),
    )


@app.get("/")
def index():
    tasks = db.session.execute(
        db.select(Task).order_by(
            Task.due_at.is_(None),
            Task.due_at.asc(),
            Task.id.asc(),
        )
    ).scalars().all()
    return render_template(
        "index.html",
        tasks=tasks,
        now=datetime.now(timezone.utc),
    )


@app.post("/tasks")
def add_task():
    task = Task(
        title=validated_title(),
        description=validated_description(),
        due_at=validated_due_at(),
    )
    db.session.add(task)
    db.session.commit()
    if wants_json():
        return jsonify(
            id=task.id,
            card_html=task_card_html(task),
        ), 201
    return redirect(url_for("index"))


@app.route("/tasks/<int:task_id>/edit", methods=["GET", "POST"])
def edit_task(task_id):
    task = db.get_or_404(Task, task_id)

    if request.method == "POST":
        task.title = validated_title()
        task.description = validated_description()
        task.due_at = validated_due_at()
        db.session.commit()
        if wants_json():
            return jsonify(
                id=task.id,
                card_html=task_card_html(task),
            )
        return redirect(url_for("index"))

    return render_template("edit.html", task=task)


@app.post("/tasks/<int:task_id>/complete")
def toggle_complete(task_id):
    task = db.get_or_404(Task, task_id)
    task.completed = not task.completed
    db.session.commit()
    return redirect(url_for("index"))


@app.post("/tasks/<int:task_id>/delete")
def delete_task(task_id):
    task = db.get_or_404(Task, task_id)
    db.session.delete(task)
    db.session.commit()
    if wants_json():
        return jsonify(id=task_id)
    return redirect(url_for("index"))


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
