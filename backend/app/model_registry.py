"""Loads each PPO model once and keeps it in memory."""
import threading

from stable_baselines3 import PPO

from .config import MODEL_FILES, MODELS_DIR


class ModelUnavailable(Exception):
    """The model id is unknown, or its zip file is missing or cannot be loaded."""


_cache: dict[str, PPO] = {}
_lock = threading.Lock()


def get_model(model_id: str) -> PPO:
    with _lock:
        if model_id in _cache:
            return _cache[model_id]
        filename = MODEL_FILES.get(model_id)
        if filename is None:
            raise ModelUnavailable(f"Unknown model id '{model_id}'.")
        path = MODELS_DIR / filename
        if not path.is_file():
            raise ModelUnavailable(f"Model file not found: {path}")
        try:
            _cache[model_id] = PPO.load(path, device="cpu")
        except Exception as e:  # noqa: BLE001
            raise ModelUnavailable(f"Could not load {filename}: {type(e).__name__}: {e}") from e
        return _cache[model_id]
