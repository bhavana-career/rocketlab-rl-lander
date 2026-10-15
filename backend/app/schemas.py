"""Request/response shapes for the API (FastAPI validates requests with these)."""
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

ModelId = Literal["original", "hover_reward", "time_penalty"]


class EpisodeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")  # reject unknown fields instead of ignoring them

    model_id: ModelId
    seed: Optional[int] = Field(default=None, ge=0, le=2**31 - 1, description="Environment reset seed")
    deterministic: bool = True


class Frame(BaseModel):
    """
    Frame 0 is the initial observation (action/reward are null).
    Frame i > 0 is the state AFTER step i: `action` is the action the model chose
    from frame i-1's observation, and `reward` is what the environment returned for it.
    """

    step: int
    observation: list[float]
    action: Optional[int]
    reward: Optional[float]
    cumulative_reward: float
    terminated: bool
    truncated: bool


class Terrain(BaseModel):
    """Real terrain of this episode, in the same normalised coordinates as the observation."""

    points: list[list[float]]  # [[x, y], ...] left to right
    pad_x: list[float]  # [x_left, x_right] of the landing pad


class EpisodeResponse(BaseModel):
    model_id: str
    env_id: str
    seed: Optional[int]  # as supplied in the request (null if none was given)
    seed_used: int  # the seed actually passed to env.reset (random if none was supplied)
    deterministic: bool
    total_reward: float
    steps: int
    terminated: bool
    truncated: bool
    max_episode_steps: Optional[int]
    observation_fields: list[str]
    action_meanings: dict[int, str]
    terrain: Optional[Terrain]
    frames: list[Frame]
