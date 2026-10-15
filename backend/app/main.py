"""RocketLab backend API."""
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import ENV_ID, MODEL_FILES
from .episodes import run_episode
from .model_registry import ModelUnavailable, get_model
from .schemas import EpisodeRequest, EpisodeResponse

log = logging.getLogger("rocketlab")

app = FastAPI(title="RocketLab backend")

# Allow local development and Vercel production/preview deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "env_id": ENV_ID}


@app.get("/api/models")
def models():
    """Reports each model's file and whether it loads (models are cached after the first load)."""
    result = []
    for model_id, filename in MODEL_FILES.items():
        entry = {"id": model_id, "file": filename}
        try:
            model = get_model(model_id)
            entry.update(
                loaded=True,
                observation_shape=list(model.observation_space.shape),
                action_space=str(model.action_space),
            )
        except ModelUnavailable as e:
            entry.update(loaded=False, error=str(e))
        result.append(entry)
    return {"env_id": ENV_ID, "models": result}


@app.post("/api/episodes", response_model=EpisodeResponse)
def create_episode(request: EpisodeRequest):
    """
    Runs one complete episode of the chosen PPO model in a fresh LunarLander-v3 environment
    and returns every recorded frame. This is a recording, not a streaming session.
    """
    try:
        return run_episode(request.model_id, request.seed, request.deterministic)
    except ModelUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        log.exception("Episode failed")
        raise HTTPException(status_code=500, detail=f"Episode failed: {type(e).__name__}: {e}") from e
