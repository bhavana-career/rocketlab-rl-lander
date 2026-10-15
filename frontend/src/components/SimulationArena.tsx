import { useCallback, useEffect, useRef, useState } from "react";
import SectionHeader from "./SectionHeader";
import { variants } from "../data/evaluation";
import { ACTION_NAMES, drawScene } from "../lib/drawScene";
import { fetchModels, runEpisode } from "../lib/api";
import { DASH, fmt } from "../lib/format";
import type { BackendModelInfo, Episode, ModelId } from "../types";

interface Props {
  selectedModel: ModelId;
  onSelectModel: (id: ModelId) => void;
}

const MODEL_DOT: Record<ModelId, string> = {
  original: "bg-secondary",
  hover_reward: "bg-on-surface",
  time_penalty: "bg-outline",
};

/** Recorded frames are replayed at the environment's own 50 steps per second. */
const FRAME_MS = 20;
const MAX_SEED = 2 ** 31 - 1;

type BackendState =
  | { status: "loading" }
  | { status: "ready"; models: BackendModelInfo[] }
  | { status: "error"; message: string };

type RunState = { status: "idle" } | { status: "running" } | { status: "error"; message: string };

export default function SimulationArena({ selectedModel, onSelectModel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const [backend, setBackend] = useState<BackendState>({ status: "loading" });
  const [run, setRun] = useState<RunState>({ status: "idle" });
  // Latest recorded episode for each model (kept separate from the benchmark data)
  const [episodes, setEpisodes] = useState<Partial<Record<ModelId, Episode>>>({});
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [seedText, setSeedText] = useState("");
  const [deterministic, setDeterministic] = useState(true);

  const episode = episodes[selectedModel] ?? null;
  const lastFrame = episode ? episode.frames.length - 1 : 0;
  const current = episode ? episode.frames[Math.min(frame, lastFrame)] : null;

  // ---- backend connection -------------------------------------------------
  const loadBackend = useCallback(() => {
    setBackend({ status: "loading" });
    fetchModels()
      .then((r) => setBackend({ status: "ready", models: r.models }))
      .catch((e: Error) => setBackend({ status: "error", message: e.message }));
  }, []);
  useEffect(loadBackend, [loadBackend]);

  const modelInfo = (id: ModelId) => (backend.status === "ready" ? backend.models.find((m) => m.id === id) : undefined);
  const modelUsable = (id: ModelId) => backend.status === "ready" && modelInfo(id)?.loaded === true;
  const loadedCount = backend.status === "ready" ? backend.models.filter((m) => m.loaded).length : 0;

  // ---- seed validation ----------------------------------------------------
  const seedTrimmed = seedText.trim();
  const seedValue = seedTrimmed === "" ? null : Number(seedTrimmed);
  const seedInvalid =
    seedValue !== null && (!Number.isInteger(seedValue) || seedValue < 0 || seedValue > MAX_SEED);

  // ---- canvas size and drawing -------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || size.w === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawScene(ctx, size.w, size.h, episode, Math.min(frame, lastFrame));
  }, [episode, frame, lastFrame, size]);

  // ---- playback of the RECORDED frames -----------------------------------
  useEffect(() => {
    if (!playing || !episode) return;
    let id = 0;
    let previous = performance.now();
    let carry = 0;
    const tick = (now: number) => {
      carry = Math.min(carry + (now - previous), 250);
      previous = now;
      const advance = Math.floor(carry / FRAME_MS);
      if (advance > 0) {
        carry -= advance * FRAME_MS;
        setFrame((f) => Math.min(episode.frames.length - 1, f + advance));
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, episode]);

  useEffect(() => {
    if (episode && frame >= lastFrame) setPlaying(false);
  }, [episode, frame, lastFrame]);

  // ---- actions ------------------------------------------------------------
  const startRun = async () => {
    if (seedInvalid || run.status === "running") return;
    setPlaying(false);
    setRun({ status: "running" });
    try {
      const result = await runEpisode(selectedModel, seedValue, deterministic);
      setEpisodes((prev) => ({ ...prev, [result.model_id]: result }));
      setFrame(0);
      setRun({ status: "idle" });
      setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) {
      setRun({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  };

  const togglePlay = () => {
    if (!episode) return;
    if (playing) {
      setPlaying(false);
    } else {
      if (frame >= lastFrame) setFrame(0); // replays the SAME recording; never starts a new episode
      setPlaying(true);
    }
  };
  const stepOnce = () => {
    if (!episode) return;
    setPlaying(false);
    setFrame((f) => Math.min(lastFrame, f + 1));
  };
  const restart = () => setFrame(0);
  const chooseModel = (id: ModelId) => {
    onSelectModel(id);
    setFrame(0);
    setPlaying(false);
    setRun({ status: "idle" });
  };

  // ---- values for display -------------------------------------------------
  const selected = variants.find((v) => v.id === selectedModel)!;
  const obs = current?.observation;
  const atEnd = episode !== null && frame >= lastFrame;
  const endLabel = episode?.terminated ? "TERMINATED" : "TRUNCATED (STEP LIMIT)";
  const stateLabel = !episode ? "NO EPISODE RECORDED" : atEnd ? `ENDED: ${endLabel}` : "RECORDED REPLAY";
  const controlsDisabled = "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-outline-variant/60";
  const controlButton =
    "inline-flex items-center justify-center w-7 h-7 border border-outline-variant/60 text-on-surface hover:border-on-surface transition-colors " +
    controlsDisabled;

  let backendPill: string;
  if (backend.status === "loading") backendPill = "● Connecting to backend…";
  else if (backend.status === "error") backendPill = "● Backend offline";
  else backendPill = `● Backend connected · ${loadedCount}/${backend.models.length} models loaded`;

  return (
    <section className="w-full mt-space-xl mb-margin" id="simulation-arena">
      <SectionHeader
        index="01"
        title="Landing Arena"
        borderBottom={false}
        aside={
          <div className="flex items-center gap-2 text-outline font-code-sm text-code-sm">
            <span
              className={
                "inline-block w-1.5 h-1.5 rounded-full " + (episode ? "bg-secondary" : "bg-outline-variant")
              }
            ></span>
            <span className="hidden sm:inline">
              {episode ? "Recorded model episode · replay, not live inference" : "No episode recorded yet"}
            </span>
          </div>
        }
      />

      <div className="border border-outline-variant/40 bg-surface">
        {/* Control bar */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm px-space-md py-2 border-b border-outline-variant/30 bg-surface-container-low/40">
          <div className="flex items-center gap-1">
            <button
              onClick={togglePlay}
              disabled={!episode}
              title={playing ? "Pause" : atEnd ? "Replay the recorded episode" : "Play"}
              aria-label={playing ? "Pause replay" : "Play replay"}
              className={controlButton}
            >
              <span className="material-symbols-outlined text-sm">{playing ? "pause" : "play_arrow"}</span>
            </button>
            <button
              onClick={stepOnce}
              disabled={!episode || frame >= lastFrame}
              title="Step forward one recorded frame"
              aria-label="Step forward one recorded frame"
              className={controlButton}
            >
              <span className="material-symbols-outlined text-sm">step_over</span>
            </button>
            <button
              onClick={restart}
              disabled={!episode}
              title="Restart the recorded episode"
              aria-label="Restart the recorded episode"
              className={controlButton}
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
            </button>
            <span className="text-outline-variant px-2 select-none font-code-sm">/</span>
            <span className="font-code-sm text-code-sm text-outline">
              STEP{" "}
              <span className="text-on-surface font-medium">{String(current?.step ?? 0).padStart(4, "0")}</span>{" "}
              <span className="text-outline-variant">/ {episode ? String(episode.steps).padStart(4, "0") : DASH}</span>
            </span>
          </div>

          {/* Model selector */}
          <div className="flex items-center border border-outline-variant/40 divide-x divide-outline-variant/30">
            {variants.map((v) => {
              const active = v.id === selectedModel;
              const unusable = backend.status === "ready" && !modelUsable(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => chooseModel(v.id)}
                  aria-pressed={active}
                  title={unusable ? modelInfo(v.id)?.error ?? "Model not available" : v.name}
                  className={
                    "px-2.5 py-1 text-code-sm font-code-sm whitespace-nowrap transition-all flex items-center gap-1.5 " +
                    (unusable ? "opacity-50 " : "") +
                    (active
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low")
                  }
                >
                  <span className={"w-1 h-1 rounded-full " + (active ? "bg-surface" : MODEL_DOT[v.id])}></span>
                  <span>{v.name.replace(" PPO", "")}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span
              className={"font-code-sm text-code-sm " + (backend.status === "error" ? "text-error" : "text-outline")}
            >
              {backendPill}
            </span>
          </div>
        </div>

        {/* Run bar */}
        <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-sm px-space-md py-2 border-b border-outline-variant/30">
          <button
            onClick={startRun}
            disabled={run.status === "running" || seedInvalid || !modelUsable(selectedModel)}
            className="inline-flex items-center gap-2 border border-on-surface bg-on-surface text-surface px-space-md py-1.5 font-code-sm text-code-sm whitespace-nowrap hover:bg-secondary hover:border-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-on-surface disabled:hover:border-on-surface"
          >
            <span className="material-symbols-outlined text-sm">
              {run.status === "running" ? "hourglass_top" : "rocket_launch"}
            </span>
            <span>{run.status === "running" ? "Running episode…" : `Run episode: ${selected.name}`}</span>
          </button>

          <label className="flex items-center gap-2 font-code-sm text-code-sm text-outline">
            SEED
            <input
              value={seedText}
              onChange={(e) => setSeedText(e.target.value)}
              inputMode="numeric"
              placeholder="random"
              aria-invalid={seedInvalid}
              className={
                "w-28 bg-surface-container-lowest border px-2 py-1 text-on-surface font-code-sm text-code-sm focus:outline-none focus:border-on-surface " +
                (seedInvalid ? "border-error" : "border-outline-variant/60")
              }
            />
          </label>

          <label className="flex items-center gap-2 font-code-sm text-code-sm text-outline cursor-pointer select-none">
            <input
              type="checkbox"
              checked={deterministic}
              onChange={(e) => setDeterministic(e.target.checked)}
              className="accent-secondary"
            />
            DETERMINISTIC ACTIONS
          </label>

          {seedInvalid && (
            <span className="font-code-sm text-code-sm text-error">Seed must be a whole number from 0 to {MAX_SEED}.</span>
          )}
          {backend.status === "error" && (
            <span className="font-code-sm text-code-sm text-error flex items-center gap-2">
              {backend.message}
              <button onClick={loadBackend} className="underline text-on-surface">
                Retry
              </button>
            </span>
          )}
          {run.status === "error" && (
            <span className="font-code-sm text-code-sm text-error">Episode failed: {run.message}</span>
          )}
        </div>

        {/* Canvas */}
        <div className="relative w-full h-96 sm:h-[480px] lg:h-[520px] bg-surface-container-lowest overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            role="img"
            aria-label={
              episode
                ? "Replay of a recorded LunarLander episode from a trained PPO model."
                : "Empty landing site. No episode has been recorded yet."
            }
          />
          <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-0.5">
            <span className="font-code-sm text-code-sm text-outline tracking-wider">
              MODEL: <span className="text-on-surface font-medium">{selected.name.toUpperCase()}</span>
            </span>
            <span className="font-code-sm text-code-sm text-outline-variant">
              {episode
                ? `${episode.env_id} · seed ${episode.seed_used}${episode.seed === null ? " (random)" : ""} · ${
                    episode.deterministic ? "deterministic" : "sampled"
                  } actions`
                : "LunarLander-v3 · discrete actions"}
            </span>
          </div>
          <div className="absolute top-3 right-3 pointer-events-none text-right">
            <span className="font-code-sm text-code-sm text-outline tracking-wider block">STATE</span>
            <span
              className={
                "font-code-sm text-code-sm font-medium " + (atEnd ? "text-on-surface" : "text-secondary")
              }
            >
              {stateLabel}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <span className="font-code-sm text-code-sm text-outline">
              {episode
                ? "Recorded model episode: real PPO predictions in a real LunarLander-v3 run, replayed here. Not live inference."
                : "Press “Run episode” to record one episode from the selected model."}
            </span>
          </div>
          {run.status === "running" && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/70">
              <span className="font-code-sm text-code-sm text-on-surface">
                Running the episode on the backend…
              </span>
            </div>
          )}
        </div>

        {/* Telemetry */}
        <div className="border-t border-outline-variant/30 px-space-md py-3 bg-surface">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y lg:divide-y-0 sm:divide-x divide-outline-variant/30">
            <Tile
              label="POSITION (x, y)"
              value={obs ? `${fmt(obs[0], 2, true)}, ${fmt(obs[1], 2, true)}` : DASH}
              unit="norm."
            />
            <Tile label="HORIZ. VEL (Vx)" value={obs ? fmt(obs[2], 2, true) : DASH} unit="norm." />
            <Tile label="VERT. VEL (Vy)" value={obs ? fmt(obs[3], 2, true) : DASH} unit="norm." />
            <Tile
              label="ATTITUDE (θ)"
              value={obs ? fmt(obs[4], 2, true) : DASH}
              unit="rad"
              note={obs ? `ω ${fmt(obs[5], 2, true)}` : undefined}
            />
            <Tile
              label="TOTAL REWARD"
              value={current ? fmt(current.cumulative_reward, 2, true) : DASH}
              unit="pts"
              note={current && current.reward !== null ? `this step ${fmt(current.reward, 2, true)}` : undefined}
            />
            <Tile
              label="ACTION · LEGS"
              value={current ? (current.action === null ? "initial" : ACTION_NAMES[current.action]) : DASH}
              unit=""
              note={obs ? `legs L/R: ${obs[6] > 0.5 ? "touch" : "air"} / ${obs[7] > 0.5 ? "touch" : "air"}` : undefined}
            />
          </div>
          <div className="flex flex-col gap-1 text-outline text-code-sm font-code-sm pt-3 mt-1 border-t border-outline-variant/20">
            {episode && (
              <span className="text-on-surface">
                Recorded run: {episode.steps} steps · total reward {fmt(episode.total_reward, 2, true)} · env reported{" "}
                {episode.terminated ? "TERMINATED" : "TRUNCATED"}
                {episode.truncated && episode.max_episode_steps ? ` (${episode.max_episode_steps}-step limit)` : ""}
              </span>
            )}
            <span>
              * Values are the environment&apos;s normalised observation units, not metres. Fuel and throttle are not
              part of the observation, so they are not shown. “Terminated” = the environment ended the episode
              (rest, crash or leaving the world); “truncated” = the step limit was reached. Neither flag alone says
              whether a landing succeeded. This is one demo episode, separate from the benchmark results below.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({ label, value, unit, note }: { label: string; value: string; unit: string; note?: string }) {
  return (
    <div className="p-2">
      <span className="font-code-sm text-code-sm text-outline block mb-0.5 uppercase">{label}</span>
      <div className="flex items-baseline justify-between gap-1">
        <span className="font-code-lg text-code-lg text-on-surface font-semibold">{value}</span>
        <span className="font-code-sm text-code-sm text-outline">{unit}</span>
      </div>
      <span className="font-code-sm text-code-sm text-outline block mt-0.5 min-h-[16px]">{note}</span>
    </div>
  );
}
