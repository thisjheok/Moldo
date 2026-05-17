from argparse import ArgumentParser
import logging
from time import sleep

from moldo_api.database import initialize_database
from moldo_api.queues.grading_queue import (
    claim_next_grading_job,
    complete_grading_job,
    fail_grading_job,
)
from moldo_api.repositories.mock_repository import get_attempt
from moldo_api.services.mock_grading import run_mock_grading_worker

logger = logging.getLogger("moldo_api.worker")


def run_grading_worker(*, once: bool = False, poll_interval_seconds: float = 1.0) -> None:
    initialize_database()
    logger.info("Grading worker started. once=%s poll_interval=%ss", once, poll_interval_seconds)

    while True:
        job = claim_next_grading_job()
        if job is None:
            if once:
                logger.info("No pending grading job found. Exiting.")
                return
            sleep(poll_interval_seconds)
            continue

        logger.info("Claimed grading job %s for attempt %s", job.id, job.attempt_id)
        try:
            run_mock_grading_worker(job.attempt_id)
            attempt = get_attempt(job.attempt_id)

            if attempt is not None and attempt.status == "completed" and attempt.resultId:
                complete_grading_job(job.id)
                logger.info(
                    "Completed grading job %s for attempt %s with result %s",
                    job.id,
                    job.attempt_id,
                    attempt.resultId,
                )
            else:
                fail_grading_job(job.id, "Grading finished without a completed attempt result.")
                logger.error(
                    "Failed grading job %s for attempt %s: grading finished without a result",
                    job.id,
                    job.attempt_id,
                )
        except Exception as error:
            fail_grading_job(job.id, str(error))
            logger.exception("Failed grading job %s for attempt %s", job.id, job.attempt_id)


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    parser = ArgumentParser(description="Run the Moldo async grading worker.")
    parser.add_argument(
        "--once",
        action="store_true",
        help="Process at most one pending grading job and exit.",
    )
    parser.add_argument(
        "--poll-interval",
        type=float,
        default=1.0,
        help="Seconds to wait between polling attempts when no job is pending.",
    )
    args = parser.parse_args()

    run_grading_worker(once=args.once, poll_interval_seconds=args.poll_interval)


if __name__ == "__main__":
    main()
