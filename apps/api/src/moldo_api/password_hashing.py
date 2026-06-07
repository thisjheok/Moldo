from base64 import b64decode, b64encode
from hashlib import pbkdf2_hmac
from hmac import compare_digest
from secrets import token_bytes


PASSWORD_HASH_SCHEME = "pbkdf2_sha256"
PASSWORD_HASH_ITERATIONS = 210_000
SALT_BYTES = 16


def hash_password(password: str) -> str:
    salt = token_bytes(SALT_BYTES)
    digest = pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_HASH_ITERATIONS,
    )
    return "$".join(
        [
            PASSWORD_HASH_SCHEME,
            str(PASSWORD_HASH_ITERATIONS),
            b64encode(salt).decode("ascii"),
            b64encode(digest).decode("ascii"),
        ]
    )


def is_password_hash(value: str) -> bool:
    return value.startswith(f"{PASSWORD_HASH_SCHEME}$")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        scheme, iterations_value, salt_value, digest_value = password_hash.split("$", 3)
        iterations = int(iterations_value)
        salt = b64decode(salt_value.encode("ascii"), validate=True)
        expected_digest = b64decode(digest_value.encode("ascii"), validate=True)
    except (ValueError, TypeError):
        return False

    if scheme != PASSWORD_HASH_SCHEME:
        return False

    actual_digest = pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return compare_digest(actual_digest, expected_digest)
