"""
Backend settings: where the models are and which Gymnasium environment they use.

The env id is NOT stored inside the model zips (they were saved without an env).
It was inferred from the saved spaces and confirmed by scripts/verify_models.py.
"""
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = (BACKEND_DIR.parent / "models").resolve()

# Saved observation space = Box(8) with LunarLander bounds, action space = Discrete(4)
# -> discrete LunarLander. (LunarLanderContinuous would have a Box(2) action space.)
ENV_ID = "LunarLander-v3"

# Model id used by the API and the frontend -> zip file in ../models/ (confirmed by the project owner).
MODEL_FILES = {
    "original": "ppo_lunar_lander.zip",
    "hover_reward": "ppo_lunar_lander_hover.zip",
    "time_penalty": "ppo_lunar_lander_corrected.zip",
}

# Order of the 8 numbers in every observation (Gymnasium LunarLander-v3).
# All are the environment's NORMALISED values, not metres or seconds.
OBSERVATION_FIELDS = [
    "x",                  # horizontal position, 0 = centre of the landing pad, +-1 = edge of the world
    "y",                  # vertical position, 0 = height of the pad (lander centre when legs touch it)
    "vx",                 # horizontal velocity (normalised)
    "vy",                 # vertical velocity (normalised)
    "angle",              # body angle in radians (0 = upright)
    "angular_velocity",   # angular velocity (normalised)
    "left_leg_contact",   # 1.0 if the left leg touches the ground, else 0.0
    "right_leg_contact",  # 1.0 if the right leg touches the ground, else 0.0
]

# Meaning of each discrete action.
ACTION_MEANINGS = {
    0: "do nothing",
    1: "fire left orientation engine",
    2: "fire main engine",
    3: "fire right orientation engine",
}
