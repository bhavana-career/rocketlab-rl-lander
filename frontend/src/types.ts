/** Shared types used across the app. */

/** The three trained PPO models. Ids match the backend (backend/app/config.py). */
export type ModelId = "original" | "hover_reward" | "time_penalty";

/** One recorded frame of an episode. Frame 0 is the initial observation (action/reward are null). */
export interface EpisodeFrame {
  step: number;
  /**
   * The raw 8-value LunarLander-v3 observation, in this order:
   * [x, y, vx, vy, angle, angular_velocity, left_leg_contact, right_leg_contact]
   * Values are the environment's normalised units, not metres.
   */
  observation: number[];
  /** Action the model chose to reach this frame (0..3), null for frame 0. */
  action: number | null;
  reward: number | null;
  cumulative_reward: number;
  terminated: boolean;
  truncated: boolean;
}

/** Terrain of the recorded episode, in the observation's normalised coordinates. */
export interface EpisodeTerrain {
  points: number[][];
  pad_x: number[];
}

/** Response of POST /api/episodes. */
export interface Episode {
  model_id: ModelId;
  env_id: string;
  seed: number | null;
  seed_used: number;
  deterministic: boolean;
  total_reward: number;
  steps: number;
  terminated: boolean;
  truncated: boolean;
  max_episode_steps: number | null;
  observation_fields: string[];
  action_meanings: Record<string, string>;
  terrain: EpisodeTerrain | null;
  frames: EpisodeFrame[];
}

/** One entry of GET /api/models. */
export interface BackendModelInfo {
  id: ModelId;
  file: string;
  loaded: boolean;
  error?: string;
}
