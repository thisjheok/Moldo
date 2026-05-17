from abc import ABC, abstractmethod
from typing import Any
import importlib

from moldo_api.config import OpenAISettings, get_openai_settings
from moldo_api.data.audio_storage import DEFAULT_AUDIO_STORAGE, AudioStorage
from moldo_api.schemas.attempt import AttemptAnswerMetadata


class TranscriptionService(ABC):
    @abstractmethod
    def transcribe(self, answer: AttemptAnswerMetadata) -> str:
        pass


class MockTranscriptionService(TranscriptionService):
    def transcribe(self, answer: AttemptAnswerMetadata) -> str:
        return (
            "This is a mock transcript generated from the uploaded audio. "
            f"The answer was recorded for {answer.durationSeconds} seconds."
        )


class OpenAITranscriptionService(TranscriptionService):
    def __init__(
        self,
        *,
        storage: AudioStorage = DEFAULT_AUDIO_STORAGE,
        settings: OpenAISettings | None = None,
    ) -> None:
        self.storage = storage
        self.settings = settings or get_openai_settings()

    def transcribe(self, answer: AttemptAnswerMetadata) -> str:
        if not self.settings.api_key:
            return MockTranscriptionService().transcribe(answer)
        if not answer.audioStorageKey:
            return ""

        audio_file = self.storage.read_audio(answer.audioStorageKey)
        client = _create_openai_client(self.settings.api_key)
        transcription = client.audio.transcriptions.create(
            model=self.settings.stt_model,
            file=(audio_file.file_name, audio_file.content, answer.mimeType or "audio/webm"),
        )
        text = getattr(transcription, "text", "")
        return str(text).strip()


def _create_openai_client(api_key: str) -> Any:
    openai_module = importlib.import_module("openai")
    return openai_module.OpenAI(api_key=api_key)
