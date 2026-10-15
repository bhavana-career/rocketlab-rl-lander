"""
Tests the running API (start it first:  python -m uvicorn app.main:app --port 8000).
Run from the backend folder:   python scripts/test_api.py [base_url]
Uses only the standard library.
"""
import json
import math
import sys
import urllib.error
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000").rstrip("/")
MODEL_IDS = ["original", "hover_reward", "time_penalty"]
failures = []


def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        return e.code, json.load(e)


def check(cond, msg):
    print(("  ok   " if cond else "  FAIL ") + msg)
    if not cond:
        failures.append(msg)


s, h = call("GET", "/api/health")
check(s == 200 and h["status"] == "ok", f"/api/health -> {s} {h}")
s, m = call("GET", "/api/models")
check(s == 200 and [x["id"] for x in m["models"]] == MODEL_IDS and all(x["loaded"] for x in m["models"]),
      "/api/models lists the 3 ids, all loaded")

results = {}
for mid in MODEL_IDS:
    print(f"\n== {mid}")
    s, ep = call("POST", "/api/episodes", {"model_id": mid, "seed": 0})
    check(s == 200, f"POST /api/episodes -> {s}")
    if s != 200:
        print("   ", ep)
        continue
    f = ep["frames"]
    results[mid] = ep
    check(len(f) == ep["steps"] + 1, f"frames ({len(f)}) == steps ({ep['steps']}) + 1")
    check([x["step"] for x in f] == list(range(len(f))), "frame steps are 0..N in order")
    check(all(len(x["observation"]) == 8 for x in f), "every observation has 8 values")
    check(f[0]["action"] is None and f[0]["reward"] is None, "frame 0 is the initial observation")
    check(all(x["action"] in (0, 1, 2, 3) for x in f[1:]), "every later frame has an action 0-3")
    check(math.isclose(sum(x["reward"] for x in f[1:]), ep["total_reward"], abs_tol=1e-6)
          and math.isclose(f[-1]["cumulative_reward"], ep["total_reward"], abs_tol=1e-6),
          "total_reward == sum of step rewards")
    check(f[-1]["terminated"] == ep["terminated"] and f[-1]["truncated"] == ep["truncated"]
          and (ep["terminated"] or ep["truncated"]) and not any(x["terminated"] or x["truncated"] for x in f[:-1]),
          "end flags only on the last frame and match the response")
    check(ep["env_id"] == "LunarLander-v3" and ep["seed"] == 0 and ep["seed_used"] == 0, "env id and seed echoed")
    check(ep["terrain"] is not None and len(ep["terrain"]["points"]) == 11, "terrain returned (11 points)")
    print(f"   steps={ep['steps']} reward={ep['total_reward']:.2f} terminated={ep['terminated']} truncated={ep['truncated']}")

    s2, again = call("POST", "/api/episodes", {"model_id": mid, "seed": 0, "deterministic": True})
    check(s2 == 200 and again["frames"] == ep["frames"], "same seed + deterministic -> identical episode")

s, ep = call("POST", "/api/episodes", {"model_id": "original", "seed": 3, "deterministic": False})
check(s == 200 and ep["deterministic"] is False and len(ep["frames"]) == ep["steps"] + 1, "stochastic episode works")
s, ep = call("POST", "/api/episodes", {"model_id": "original"})
check(s == 200 and ep["seed"] is None and isinstance(ep["seed_used"], int), "no seed -> seed null, seed_used set")

print("\n== validation")
for body in [{"model_id": "nope"}, {"model_id": "original", "seed": -1}, {"model_id": "original", "seed": "x"},
             {"model_id": "original", "extra": 1}, {}]:
    s, _ = call("POST", "/api/episodes", body)
    check(s == 422, f"{body} -> {s} (expected 422)")

print("\nRESULT:", "all checks passed" if not failures else f"{len(failures)} check(s) FAILED")
sys.exit(1 if failures else 0)
