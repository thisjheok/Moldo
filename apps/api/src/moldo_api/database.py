from collections.abc import Iterator
from contextlib import contextmanager
import sqlite3

from moldo_api.config import AuthUserSettings, get_auth_settings, get_database_settings
from moldo_api.password_hashing import hash_password, is_password_hash


def initialize_database() -> None:
    database_path = get_database_settings().path
    database_path.parent.mkdir(parents=True, exist_ok=True)

    with connect() as connection:
        connection.executescript(
            """
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS attempts (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                exam_id TEXT NOT NULL,
                status TEXT NOT NULL,
                result_id TEXT,
                started_at TEXT NOT NULL,
                current_question_order INTEGER NOT NULL,
                answers_json TEXT NOT NULL,
                submitted_at TEXT
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                exam_id TEXT NOT NULL,
                status TEXT NOT NULL,
                result_id TEXT,
                started_at TEXT NOT NULL,
                current_question_order INTEGER NOT NULL,
                answers_json TEXT NOT NULL,
                submitted_at TEXT
            );

            CREATE TABLE IF NOT EXISTS results (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                payload_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS grading_jobs (
                id TEXT PRIMARY KEY,
                attempt_id TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                last_error TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        _ensure_user_schema(connection)
        _ensure_owner_schema(connection)
        _seed_auth_users(connection, get_auth_settings().users)


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    connection = sqlite3.connect(get_database_settings().path)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _seed_auth_users(connection: sqlite3.Connection, users: list[AuthUserSettings]) -> None:
    for user in users:
        password = user.password if is_password_hash(user.password) else hash_password(user.password)
        connection.execute(
            """
            INSERT INTO users (id, username, email, password, name)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                username = excluded.username,
                email = excluded.email,
                password = excluded.password,
                name = excluded.name,
                updated_at = CURRENT_TIMESTAMP
            """,
            (user.id, user.username, user.email.strip().lower(), password, user.name),
        )


def _ensure_user_schema(connection: sqlite3.Connection) -> None:
    columns = {
        row["name"]
        for row in connection.execute("PRAGMA table_info(users)").fetchall()
    }
    if "username" not in columns:
        connection.execute("ALTER TABLE users ADD COLUMN username TEXT")

    if "email" not in columns:
        connection.execute("ALTER TABLE users ADD COLUMN email TEXT")

    used_usernames: set[str] = set()
    rows = connection.execute("SELECT id, username, email FROM users ORDER BY created_at").fetchall()
    for row in rows:
        current_username = row["username"]
        if isinstance(current_username, str) and current_username.strip():
            used_usernames.add(current_username.strip().lower())
            continue

        candidate = row["id"]
        normalized_candidate = candidate.strip().lower()
        if not normalized_candidate or normalized_candidate in used_usernames:
            candidate = row["id"]
            normalized_candidate = candidate.strip().lower()

        used_usernames.add(normalized_candidate)
        connection.execute(
            "UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (candidate, row["id"]),
        )
    rows = connection.execute("SELECT id, username, email FROM users ORDER BY created_at").fetchall()
    for row in rows:
        current_email = row["email"]
        if isinstance(current_email, str) and current_email.strip():
            continue

        fallback_email = f"{row['username']}@local.moldo"
        connection.execute(
            "UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (fallback_email, row["id"]),
        )

    connection.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_unique
        ON users(lower(username))
        WHERE username IS NOT NULL
        """
    )
    connection.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
        ON users(lower(email))
        WHERE email IS NOT NULL
        """
    )


def _ensure_owner_schema(connection: sqlite3.Connection) -> None:
    for table_name in ("attempts", "sessions", "results"):
        columns = {
            row["name"]
            for row in connection.execute(f"PRAGMA table_info({table_name})").fetchall()
        }
        if "user_id" not in columns:
            connection.execute(f"ALTER TABLE {table_name} ADD COLUMN user_id TEXT")
