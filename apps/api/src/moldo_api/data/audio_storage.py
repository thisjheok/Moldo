from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4


@dataclass(frozen=True)
class StoredAudio:
    key: str
    url: str
    file_name: str


@dataclass(frozen=True)
class AudioFile:
    key: str
    file_name: str
    content: bytes


class AudioStorage(ABC):
    @abstractmethod
    def save_attempt_answer_audio(
        self,
        *,
        attempt_id: str,
        question_id: str,
        content: bytes,
        mime_type: str | None,
        original_file_name: str | None = None,
    ) -> StoredAudio:
        pass

    @abstractmethod
    def read_audio(self, key: str) -> AudioFile:
        pass


class LocalAudioStorage(AudioStorage):
    def __init__(self, root_dir: Path, public_url_prefix: str = "/uploads") -> None:
        self.root_dir = root_dir
        self.public_url_prefix = public_url_prefix.rstrip("/")

    def save_attempt_answer_audio(
        self,
        *,
        attempt_id: str,
        question_id: str,
        content: bytes,
        mime_type: str | None,
        original_file_name: str | None = None,
    ) -> StoredAudio:
        extension = _extension_for_audio(mime_type, original_file_name)
        file_name = f"{question_id}-{uuid4().hex}{extension}"
        relative_path = Path("attempts") / attempt_id / file_name
        absolute_path = self.root_dir / relative_path

        absolute_path.parent.mkdir(parents=True, exist_ok=True)
        absolute_path.write_bytes(content)

        key = relative_path.as_posix()
        return StoredAudio(
            key=key,
            url=f"{self.public_url_prefix}/{key}",
            file_name=file_name,
        )

    def read_audio(self, key: str) -> AudioFile:
        relative_path = Path(key)
        absolute_path = self.root_dir / relative_path
        if not absolute_path.is_file():
            raise FileNotFoundError(f"Audio file not found for key: {key}")

        return AudioFile(
            key=key,
            file_name=absolute_path.name,
            content=absolute_path.read_bytes(),
        )


def _extension_for_audio(mime_type: str | None, file_name: str | None) -> str:
    if file_name and "." in file_name:
        suffix = Path(file_name).suffix.lower()
        if suffix in {".webm", ".m4a", ".mp4", ".mp3", ".wav", ".ogg"}:
            return suffix

    normalized_mime_type = (mime_type or "").lower()
    if "mp4" in normalized_mime_type:
        return ".m4a"
    if "mpeg" in normalized_mime_type or "mp3" in normalized_mime_type:
        return ".mp3"
    if "wav" in normalized_mime_type:
        return ".wav"
    if "ogg" in normalized_mime_type:
        return ".ogg"
    return ".webm"


REPO_ROOT = Path(__file__).resolve().parents[5]
DEFAULT_AUDIO_STORAGE = LocalAudioStorage(REPO_ROOT / "apps" / "api" / ".data" / "uploads")
