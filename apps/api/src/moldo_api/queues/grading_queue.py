from dataclasses import dataclass
from uuid import uuid4

from moldo_api.database import connect


@dataclass(frozen=True)
class GradingJob:
    id: str
    attempt_id: str
    status: str
    attempts: int
    last_error: str | None


def enqueue_grading_job(attempt_id: str) -> GradingJob:
    job_id = f"grading-job-{uuid4()}"
    with connect() as connection:
        connection.execute(
            """
            INSERT INTO grading_jobs (id, attempt_id, status, attempts, last_error)
            VALUES (?, ?, 'pending', 0, NULL)
            ON CONFLICT(attempt_id) DO UPDATE SET
                status = 'pending',
                last_error = NULL,
                updated_at = CURRENT_TIMESTAMP
            """,
            (job_id, attempt_id),
        )
        row = connection.execute(
            """
            SELECT id, attempt_id, status, attempts, last_error
            FROM grading_jobs
            WHERE attempt_id = ?
            """,
            (attempt_id,),
        ).fetchone()

    if row is None:
        raise RuntimeError(f"Failed to enqueue grading job for attempt {attempt_id}.")

    return GradingJob(
        id=row["id"],
        attempt_id=row["attempt_id"],
        status=row["status"],
        attempts=row["attempts"],
        last_error=row["last_error"],
    )


def claim_next_grading_job() -> GradingJob | None:
    with connect() as connection:
        row = connection.execute(
            """
            UPDATE grading_jobs
            SET status = 'running',
                attempts = attempts + 1,
                last_error = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = (
                SELECT id
                FROM grading_jobs
                WHERE status = 'pending'
                ORDER BY created_at ASC
                LIMIT 1
            )
            RETURNING id, attempt_id, status, attempts, last_error
            """
        ).fetchone()

        if row is None:
            return None

    return GradingJob(
        id=row["id"],
        attempt_id=row["attempt_id"],
        status=row["status"],
        attempts=row["attempts"],
        last_error=row["last_error"],
    )


def complete_grading_job(job_id: str) -> None:
    with connect() as connection:
        connection.execute(
            """
            UPDATE grading_jobs
            SET status = 'completed',
                last_error = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (job_id,),
        )


def fail_grading_job(job_id: str, error: str) -> None:
    with connect() as connection:
        connection.execute(
            """
            UPDATE grading_jobs
            SET status = 'failed',
                last_error = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (error[:1000], job_id),
        )
