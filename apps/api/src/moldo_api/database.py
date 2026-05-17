from collections.abc import Iterator
from contextlib import contextmanager
import sqlite3

from moldo_api.config import AuthUserSettings, get_auth_settings, get_database_settings


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
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS attempts (
                id TEXT PRIMARY KEY,
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
        connection.execute(
            """
            INSERT INTO users (id, email, password, name)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                email = excluded.email,
                password = excluded.password,
                name = excluded.name,
                updated_at = CURRENT_TIMESTAMP
            """,
            (user.id, user.email, user.password, user.name),
        )
