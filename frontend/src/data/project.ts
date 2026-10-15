/**
 * PROJECT DETAILS — edit this file to describe your project.
 *
 * Anything set to `null` is simply hidden on the page, so nothing is invented.
 * Fill these in when you want them to appear.
 */
export const project = {
  name: "RocketLab",
  /** Your name, e.g. "Jane Doe". Shown in the footer if set. */
  owner: null as string | null,
  /** The Gymnasium environment id you trained on, discrete action space. */
  environment: "LunarLander-v3" as string | null,
  /** Random seed used for evaluation, e.g. "42". */
  evaluationSeed: null as string | null,
  /** Date of your evaluation run, e.g. "2025-01-31". */
  evaluationDate: null as string | null,
  algorithm: "Stable-Baselines3 PPO",
};
