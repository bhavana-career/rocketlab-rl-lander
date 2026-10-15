import SectionHeader from "./SectionHeader";

/**
 * Analysis section reflecting empirical findings from the 10-episode benchmark evaluation.
 * Note: Exact training reward formulas remain undocumented, but observed empirical outcomes
 * highlight clear policy divergence across reward formulations.
 */
export default function Analysis() {
  return (
    <section className="w-full mb-space-xl" id="analysis">
      <SectionHeader
        index="04"
        title="Reward Design & Reward Hacking Analysis"
        aside={<span className="font-code-sm text-code-sm text-outline">Empirical Benchmark Takeaways</span>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <article className="lg:col-span-6 space-y-space-md pr-0 lg:pr-space-md">
          <div className="flex items-center space-x-2 text-outline">
            <span className="font-code-sm text-code-sm uppercase font-semibold text-secondary">Finding A</span>
            <span className="text-outline-variant">/</span>
            <span className="font-code-sm text-code-sm uppercase text-outline">Hover Reward</span>
          </div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-normal">
            Hover-Bonus Incentive Induced Total Timeout
          </h3>
          <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
            In our 10-episode benchmark evaluation (seeds 2000–2009), the Hover-Reward PPO agent timed out
            in all 10 out of 10 episodes (100% timeout rate), averaging a full 1,000.0 steps and a negative mean
            reward of -122.29. None of its benchmark runs achieved a score of 200+.
          </p>
          <p className="font-body-md text-body-md text-outline leading-relaxed">
            This demonstrates classic reinforcement learning reward hacking: when the agent is granted positive
            incremental returns for lingering near ground elevation, it learns that landing carries terminal risks
            whereas maintaining an endless hover accumulates local step incentives. The policy locks into perpetual
            loitering until hitting the environment&apos;s step ceiling.
          </p>
        </article>

        <article className="lg:col-span-6 space-y-space-md pl-0 lg:pl-space-md border-t lg:border-t-0 lg:border-l border-outline-variant/30 pt-space-md lg:pt-0">
          <div className="flex items-center space-x-2 text-outline">
            <span className="font-code-sm text-code-sm uppercase font-semibold text-on-surface">Finding B</span>
            <span className="text-outline-variant">/</span>
            <span className="font-code-sm text-code-sm uppercase text-outline">Time Penalty</span>
          </div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-normal">
            Time Penalty Failed to Outperform Baseline
          </h3>
          <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
            Introducing an ongoing step-based time penalty did not improve performance. Over the 10 benchmark episodes,
            the Time-Penalty model averaged an episode reward of +85.39 and 511.9 steps, with only 2 of 10 episodes
            reaching the 200+ threshold.
          </p>
          <p className="font-body-md text-body-md text-outline leading-relaxed">
            By comparison, the Original PPO baseline significantly outperformed it, averaging +176.69 points,
            423.6 steps, and an 80% rate of scoring 200+ (8/10 episodes). Pressuring the agent to minimize duration
            altered descent throttle management and degraded terminal touchdown control rather than yielding cleaner landings.
          </p>
        </article>
      </div>

      <div className="mt-space-xl p-space-lg border-t border-b border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div className="space-y-1">
          <span className="font-code-sm text-code-sm uppercase text-secondary tracking-widest block">
            Core Scientific Takeaway // Goodhart&apos;s Law in RL
          </span>
          <blockquote className="font-headline-sm text-headline-sm text-on-surface italic font-normal">
            “Agents do not do what you want them to do; they do what you reward them for doing.”
          </blockquote>
          <p className="font-code-sm text-code-sm text-outline">
            Empirically documented across our benchmark suite (seeds 2000–2009). Exact mathematical reward formulas
            remain undocumented in training logs, yet the observed behavioral divergence between baseline and shaped models is stark.
          </p>
        </div>
        <div className="flex-shrink-0">
          <a
            className="inline-flex items-center gap-2 border border-on-surface px-space-md py-2 text-on-surface font-code-sm text-code-sm whitespace-nowrap hover:bg-on-surface hover:text-surface transition-colors tracking-wider"
            href="#simulation-arena"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Back to arena</span>
          </a>
        </div>
      </div>
    </section>
  );
}
