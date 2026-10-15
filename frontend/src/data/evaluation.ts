import type { ModelId } from "../types";

/**
 * EVALUATION DATA — the single source of truth for every benchmark metric on the page.
 *
 * Evaluation suite: 10 deterministic seed-locked episodes per model (seeds 2000–2009)
 * evaluated in LunarLander with discrete actions.
 *
 * NOTE: Episodes scoring >= 200 points represent the standard LunarLander solved score threshold,
 * which is distinct from a physically verified landing criterion.
 */

export interface VariantMetrics {
  /** Mean episode reward over the evaluation episodes. */
  avgReward: number | null;
  /** Mean episode length in steps. */
  avgEpisodeLength: number | null;
  /** Episodes that ended by hitting the step limit. */
  timeouts: number | null;
  /** Episodes scoring >= 200 points threshold. */
  episodesScoring200Plus: number | null;
  /** Free text description of observed failure mode. */
  primaryFailureMode: string | null;
}

export interface Variant {
  id: ModelId;
  /** Letter shown on the card ("Variant A"). */
  letter: string;
  name: string;
  /** Short tag line under the name. */
  subtitle: string;
  /** What the reward change was meant to do (design intent). */
  description: string;
  /** Exact reward formula. If unverified from code, marked as undocumented. */
  rewardFormula: string | null;
  /** Observed result in words based on the 10-episode benchmark evaluation. */
  resultNote: string | null;
  metrics: VariantMetrics;
}

export const evaluationSettings = {
  /** Number of evaluation episodes per model. */
  episodes: 10,
  /** Seeds evaluated across all models. */
  seedRange: "2000–2009",
  /** Episode step limit. */
  maxEpisodeSteps: 1000,
  /** Score threshold for high-scoring benchmark episodes. */
  scoreThreshold: 200,
};

export const variants: Variant[] = [
  {
    id: "original",
    letter: "A",
    name: "Original PPO",
    subtitle: "Baseline reward",
    description:
      "The baseline agent, trained with LunarLander's standard reward formulation without extra reward shaping.",
    rewardFormula: "Undocumented (Standard environment reward)",
    resultNote:
      "Highest overall performance in the benchmark suite, achieving an average reward of +176.69 and scoring 200+ in 8 of 10 episodes with no timeouts.",
    metrics: {
      avgReward: 176.69,
      avgEpisodeLength: 423.6,
      timeouts: 0,
      episodesScoring200Plus: 8,
      primaryFailureMode: "Occasional tilt or uneven descent on rocky terrain",
    },
  },
  {
    id: "hover_reward",
    letter: "B",
    name: "Hover-Reward PPO",
    subtitle: "Reward shaping experiment I",
    description:
      "Reward shaping variant introducing an incentive designed to encourage hovering/reducing vertical speed near the surface.",
    rewardFormula: "Undocumented (Hover bonus shaping)",
    resultNote:
      "Severe reward hacking: the agent learned to exploit the hover incentive, hovering continuously until hitting the 1,000-step limit in all 10 evaluation episodes (average reward -122.29).",
    metrics: {
      avgReward: -122.29,
      avgEpisodeLength: 1000.0,
      timeouts: 10,
      episodesScoring200Plus: 0,
      primaryFailureMode: "Perpetual hover lock causing 100% episode timeout (1,000 steps)",
    },
  },
  {
    id: "time_penalty",
    letter: "C",
    name: "Time-Penalty PPO",
    subtitle: "Reward shaping experiment II",
    description:
      "Reward shaping variant applying an ongoing step penalty intended to incentivize quicker descent.",
    rewardFormula: "Undocumented (Time penalty shaping)",
    resultNote:
      "Did not outperform the baseline: achieved an average reward of +85.39 and an average duration of 511.9 steps, with only 2 of 10 episodes reaching 200+ points.",
    metrics: {
      avgReward: 85.39,
      avgEpisodeLength: 511.9,
      timeouts: 0,
      episodesScoring200Plus: 2,
      primaryFailureMode: "Sub-optimal descent timing and harder touchdowns",
    },
  },
];

export function getVariant(id: ModelId): Variant {
  return variants.find((v) => v.id === id) ?? variants[0];
}
