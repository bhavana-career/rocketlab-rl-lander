# RocketLab backend (FastAPI + Stable-Baselines3 + Gymnasium)

Runs your three trained PPO models in a real `LunarLander-v3` environment and returns recorded episodes.

## Windows setup (one time)

Needs Python 3.11 (3.10–3.12 should also work). In PowerShell:

```powershell
cd path\to\stitch_rocketlab_rl_lander\backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
```

If activation is blocked: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or skip activation and prefix commands with `.\.venv\Scripts\python -m`.

The install is large (PyTorch) and takes several minutes. `gymnasium[box2d]` installs without a C++ compiler.

## Start the API

```powershell
cd path\to\stitch_rocketlab_rl_lander\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --port 8000
```

Interactive docs: http://localhost:8000/docs

## Checks

```powershell
python scripts\verify_models.py      # loads each zip, predicts, plays one episode (no server needed)
python scripts\test_api.py           # tests the running API (start the server first)
```

`verify_models.py` should end with `RESULT: all models loaded and predicted`; `test_api.py` with `RESULT: all checks passed`. A Gymnasium "LunarLander-v2" deprecation warning is harmless (PowerShell may show it as red text).

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Server status and env id |
| GET | `/api/models` | Each model's file and whether it loads (models are cached after the first load) |
| POST | `/api/episodes` | Run one full episode and return every frame |

`POST /api/episodes` body:

```json
{ "model_id": "original", "seed": 0, "deterministic": true }
```

- `model_id`: `original`, `hover_reward` or `time_penalty` (anything else returns 422)
- `seed`: optional integer 0 to 2147483647. If omitted a random seed is used and reported as `seed_used`
- `deterministic`: optional, default `true`

Errors: 422 for invalid input, 503 if a model file is missing or cannot load, 500 for an unexpected failure. The environment is always closed.

The response holds `total_reward`, `steps`, `terminated`, `truncated`, `terrain`, and `frames`. Frame 0 is the initial observation (`action` and `reward` are `null`). Frame *i* > 0 is the state after step *i*, with the action the model chose from frame *i−1* and the reward the environment returned. `len(frames) == steps + 1`.

### Observation order (8 values, normalised units, not metres)

| Index | Field | Meaning |
|---|---|---|
| 0 | `x` | Horizontal position; 0 = pad centre, ±1 = edge of the world |
| 1 | `y` | Vertical position; 0 = lander height when its legs touch the pad |
| 2 | `vx` | Horizontal velocity (normalised) |
| 3 | `vy` | Vertical velocity (normalised) |
| 4 | `angle` | Body angle in radians (0 = upright) |
| 5 | `angular_velocity` | Angular velocity (normalised) |
| 6 | `left_leg_contact` | 1.0 if the left leg touches the ground |
| 7 | `right_leg_contact` | 1.0 if the right leg touches the ground |

Actions: 0 do nothing, 1 fire left orientation engine, 2 fire main engine, 3 fire right orientation engine.

The environment does not report fuel, throttle or landing success, so the API does not either.

## What the models expect

`LunarLander-v3` (discrete), observation `Box(8,)`, action `Discrete(4)`. Trained with SB3 2.9.0, PyTorch 2.11 and Gymnasium 1.3.0, which are pinned in `requirements.txt`. The env id is not stored in the zips; it was inferred from their saved spaces and confirmed by running real episodes.
