"""Runs one full episode: real env, real model.predict() at every step."""
import random
import threading
from typing import Optional

import gymnasium as gym
import numpy as np

from .config import ACTION_MEANINGS, ENV_ID, OBSERVATION_FIELDS
from .model_registry import get_model
from .schemas import EpisodeResponse, Frame, Terrain

# PyTorch inference and the model objects are shared, so run one episode at a time.
_inference_lock = threading.Lock()

# LunarLander-v3 constants used to express terrain in the same normalised units as the observation
# (see gymnasium/envs/box2d/lunar_lander.py).
_W = 600 / 30.0
_H = 400 / 30.0
_LEG_DOWN = 18 / 30.0


def _terrain(env: gym.Env) -> Optional[Terrain]:
    """Reads the episode's real terrain from the environment (None if unavailable)."""
    u = env.unwrapped
    polys = getattr(u, "sky_polys", None)
    helipad_y = getattr(u, "helipad_y", None)
    x1, x2 = getattr(u, "helipad_x1", None), getattr(u, "helipad_x2", None)
    if not polys or helipad_y is None or x1 is None or x2 is None:
        return None

    def norm(x: float, y: float) -> list[float]:
        return [(x - _W / 2) / (_W / 2), (y - (helipad_y + _LEG_DOWN)) / (_H / 2)]

    pts = [p[0] for p in polys] + [polys[-1][1]]
    return Terrain(
        points=[norm(float(x), float(y)) for x, y in pts],
        pad_x=[norm(float(x1), 0)[0], norm(float(x2), 0)[0]],
    )


def run_episode(model_id: str, seed: Optional[int], deterministic: bool) -> EpisodeResponse:
    model = get_model(model_id)  # raises ModelUnavailable
    seed_used = seed if seed is not None else random.randrange(2**31)

    env = gym.make(ENV_ID)
    try:
        with _inference_lock:
            if not deterministic:
                model.set_random_seed(seed_used)  # makes sampled actions repeatable per seed
            obs, _ = env.reset(seed=seed_used)
            terrain = _terrain(env)

            frames = [
                Frame(
                    step=0,
                    observation=[float(v) for v in obs],
                    action=None,
                    reward=None,
                    cumulative_reward=0.0,
                    terminated=False,
                    truncated=False,
                )
            ]
            total = 0.0
            terminated = truncated = False
            while not (terminated or truncated):
                action, _ = model.predict(obs, deterministic=deterministic)  # real PPO prediction
                action = int(np.asarray(action).reshape(-1)[0])
                obs, reward, terminated, truncated, _ = env.step(action)
                total += float(reward)
                frames.append(
                    Frame(
                        step=len(frames),
                        observation=[float(v) for v in obs],
                        action=action,
                        reward=float(reward),
                        cumulative_reward=total,
                        terminated=bool(terminated),
                        truncated=bool(truncated),
                    )
                )
            max_steps = env.spec.max_episode_steps if env.spec else None
    finally:
        env.close()

    return EpisodeResponse(
        model_id=model_id,
        env_id=ENV_ID,
        seed=seed,
        seed_used=seed_used,
        deterministic=deterministic,
        total_reward=total,
        steps=len(frames) - 1,
        terminated=bool(terminated),
        truncated=bool(truncated),
        max_episode_steps=max_steps,
        observation_fields=OBSERVATION_FIELDS,
        action_meanings=ACTION_MEANINGS,
        terrain=terrain,
        frames=frames,
    )
