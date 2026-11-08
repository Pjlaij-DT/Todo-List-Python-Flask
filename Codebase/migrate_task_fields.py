from sqlalchemy import text

from app import app, db


with app.app_context():
    db.create_all()
    with db.engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE task "
                "ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''"
            )
        )
        connection.execute(
            text(
                "ALTER TABLE task "
                "ADD COLUMN IF NOT EXISTS due_at TIMESTAMP WITH TIME ZONE"
            )
        )

print("Task description and deadline columns are ready.")
