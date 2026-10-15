import SectionHeader from "./SectionHeader";
import { evaluationSettings, variants } from "../data/evaluation";
import { DASH, fmtCount, fmtPercent } from "../lib/format";
import type { ModelId } from "../types";

interface Props {
  selectedModel: ModelId;
  onSelectModel: (id: ModelId) => void;
}

export default function RewardVariants({ selectedModel, onSelectModel }: Props) {
  const { episodes, scoreThreshold } = evaluationSettings;

  return (
    <section className="w-full mb-space-xl" id="reward-variants">
      <SectionHeader
        index="02"
        title="Experimental Formulations & Reward Design"
        aside={
          <span className="text-outline font-code-sm text-code-sm hidden md:inline">
            Click a card to select that model in arena
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/30">
        {variants.map((v, i) => {
          const selected = v.id === selectedModel;
          const padding = i === 0 ? "pr-0 md:pr-space-md" : i === 1 ? "px-0 md:px-space-md" : "pl-0 md:pl-space-md";
          const scoreRate = fmtPercent(v.metrics.episodesScoring200Plus, episodes);
          return (
            <div
              key={v.id}
              className={`${padding} py-space-md md:py-0 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span
                    className={
                      "font-code-sm text-code-sm uppercase tracking-wider " +
                      (selected ? "text-secondary" : "text-outline")
                    }
                  >
                    Variant {v.letter}
                    {selected && " · selected"}
                  </span>
                  <span className="font-code-sm text-code-sm text-outline font-medium">
                    {scoreRate === DASH ? "200+ rate: not recorded" : `${scoreRate} scored ${scoreThreshold}+`}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-normal">
                  {v.name}
                </h3>
                <p className="font-code-sm text-code-sm text-outline uppercase tracking-wider mb-space-md">
                  {v.subtitle}
                </p>
                <div className="space-y-space-sm text-on-surface-variant font-body-sm text-body-sm">
                  <div
                    className={
                      "p-2.5 border " +
                      (selected ? "border-secondary/30 bg-secondary/5" : "border-outline-variant/30 bg-surface-container-low/50")
                    }
                  >
                    <span
                      className={
                        "font-code-sm text-code-sm block mb-1 uppercase " + (selected ? "text-secondary" : "text-outline")
                      }
                    >
                      Reward Formulation
                    </span>
                    <code className="font-code-sm text-code-sm text-on-surface block">
                      {v.rewardFormula ?? "Undocumented"}
                    </code>
                  </div>
                  <p className="leading-relaxed text-outline">{v.description}</p>
                </div>
              </div>

              <div className="mt-space-md pt-space-sm border-t border-outline-variant/20">
                <span className="font-code-sm text-code-sm text-outline uppercase block mb-1">Benchmark Finding</span>
                <p className="font-body-sm text-body-sm text-on-surface">
                  {v.resultNote ?? "No result has been recorded yet."}
                </p>
                <p className="font-code-sm text-code-sm text-outline mt-1">
                  {fmtCount(v.metrics.episodesScoring200Plus, episodes) === DASH
                    ? ""
                    : `Score ≥${scoreThreshold}+: ${fmtCount(v.metrics.episodesScoring200Plus, episodes)}`}
                </p>
                <button
                  onClick={() => onSelectModel(v.id)}
                  disabled={selected}
                  className={
                    "mt-space-sm inline-flex items-center gap-2 border px-space-md py-1.5 font-code-sm text-code-sm whitespace-nowrap transition-colors " +
                    (selected
                      ? "border-outline-variant/40 text-outline cursor-default"
                      : "border-on-surface text-on-surface hover:bg-on-surface hover:text-surface")
                  }
                >
                  {selected ? "Selected in arena" : "Select in arena"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
