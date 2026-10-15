"""
Verifies that the three PPO zips load and really predict.

Run from the backend folder:   python scripts/verify_models.py
For every model it: loads it, compares the saved spaces with the Gymnasium env,
asks for one prediction, then runs one full deterministic episode.
Nothing is trained or modified.
"""
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import gymnasium as gym
import numpy as np
import stable_baselines3 as sb3
import torch

from app.config import ENV_ID, MODELS_DIR

print(f"Python {sys.version.split()[0]} | SB3 {sb3.__version__} | Gymnasium {gym.__version__} "
      f"| torch {torch.__version__} | numpy {np.__version__}")
print(f"Models folder: {MODELS_DIR}")
print(f"Env under test: {ENV_ID}")

# Other env ids the models could conceivably have used
for other in ("LunarLander-v2", "LunarLanderContinuous-v3"):
    try:
        gym.make(other).close()
        print(f"  note: {other} is available here")
    except Exception as e:  # noqa: BLE001
        print(f"  note: {other} not usable here ({type(e).__name__})")

failures = 0
for path in sorted(MODELS_DIR.glob("*.zip")):
    print(f"\n=== {path.name}")
    try:
        with zipfile.ZipFile(path) as z:
            print("  trained with SB3", z.read("_stable_baselines3_version").decode())
        model = sb3.PPO.load(path, device="cpu")
        env = gym.make(ENV_ID)
        same_obs = model.observation_space.shape == env.observation_space.shape and np.allclose(
            model.observation_space.low, env.observation_space.low) and np.allclose(
            model.observation_space.high, env.observation_space.high)
        same_act = model.action_space == env.action_space
        print(f"  saved obs space : {model.observation_space}")
        print(f"  saved action    : {model.action_space}")
        print(f"  matches {ENV_ID}: observations={same_obs}, actions={same_act}")
        if not (same_obs and same_act):
            raise RuntimeError("space mismatch")

        obs, _ = env.reset(seed=0)
        action, _ = model.predict(obs, deterministic=True)
        print(f"  first prediction: obs[:3]={np.round(obs[:3], 3)} -> action {int(action)}")

        total, steps, outcome = 0.0, 0, "running"
        while True:
            action, _ = model.predict(obs, deterministic=True)
            obs, r, terminated, truncated, _ = env.step(int(action))
            total += r
            steps += 1
            if terminated or truncated:
                outcome = "terminated" if terminated else "truncated (step limit)"
                break
        print(f"  one episode (seed 0): {steps} steps, reward {total:.2f}, ended: {outcome}")
        env.close()
    except Exception as e:  # noqa: BLE001
        failures += 1
        print(f"  FAILED: {type(e).__name__}: {e}")

print("\nRESULT:", "all models loaded and predicted" if failures == 0 else f"{failures} model(s) failed")
sys.exit(1 if failures else 0)
