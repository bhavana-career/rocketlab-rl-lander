import { project } from "../data/project";

export default function Hero() {
  // Only show metadata that has actually been filled in (see src/data/project.ts)
  const meta = [
    project.evaluationDate && `DATE: ${project.evaluationDate}`,
    project.environment && `ENV: ${project.environment}`,
    project.evaluationSeed && `SEED: ${project.evaluationSeed}`,
    `ALGO: ${project.algorithm}`,
  ].filter(Boolean) as string[];

  return (
    <section id="top" className="w-full pt-8 pb-space-lg border-b border-outline-variant/30">
      <div className="flex items-center justify-between text-outline font-code-sm text-code-sm mb-space-md select-none">
        <div className="flex items-center space-x-2">
          <span className="text-secondary font-bold">+</span>
          <span className="tracking-widest uppercase text-on-surface-variant">RL RESEARCH NOTE</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4">
          {meta.map((item, i) => (
            <span key={item} className="flex items-center space-x-4">
              {i > 0 && <span>•</span>}
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-end pb-space-md">
        <div className="lg:col-span-8 space-y-space-sm">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="font-code-sm text-code-sm uppercase text-secondary tracking-widest">
              PHYSICAL CONTROL &amp; REWARD SHAPING
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl tracking-tight text-on-surface text-balance font-normal">
            Teaching an AI to land a rocket.
          </h1>
          <p className="font-headline-sm text-headline-sm text-on-surface-variant italic font-normal pt-1">
            What happens when an agent learns to optimise the wrong reward?
          </p>
        </div>

        <div className="lg:col-span-4 space-y-space-md text-on-surface-variant">
          <p className="font-body-md text-body-md leading-relaxed text-outline">
            In reinforcement learning, reward functions specify goals, not actions. This project
            compares three PPO agents trained with different reward designs to see how small changes
            to the reward can change how a rocket learns to land.
          </p>
          <div className="flex items-center gap-space-md pt-space-xs">
            <a
              className="inline-flex items-center gap-2 border border-on-surface px-space-md py-1.5 text-on-surface font-code-sm text-code-sm whitespace-nowrap hover:bg-on-surface hover:text-surface transition-colors"
              href="#simulation-arena"
            >
              <span>Inspect replay</span>
              <span className="material-symbols-outlined text-sm">arrow_downward</span>
            </a>
            <a
              className="font-code-sm text-code-sm tracking-wider text-outline hover:text-on-surface transition-colors flex items-center gap-1 whitespace-nowrap"
              href="#benchmark-results"
            >
              <span>Benchmark data</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
