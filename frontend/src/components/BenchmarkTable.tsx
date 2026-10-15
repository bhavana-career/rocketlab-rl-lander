import SectionHeader from "./SectionHeader";
import { evaluationSettings, variants } from "../data/evaluation";
import { DASH, fmt, fmtCount } from "../lib/format";

const DOT: Record<string, string> = {
  original: "bg-secondary",
  hover_reward: "bg-on-surface",
  time_penalty: "bg-outline",
};
const BAR: Record<string, string> = {
  original: "bg-on-surface",
  hover_reward: "bg-secondary",
  time_penalty: "bg-outline",
};

/** Scales a value to a 0-100 bar width across the dataset span. Returns 0 when null. */
function barWidth(value: number | null, min: number, max: number): number {
  if (value === null) return 0;
  if (max === min) return 100;
  return Math.max(4, Math.min(100, ((value - min) / (max - min)) * 100));
}

export default function BenchmarkTable() {
  const { episodes, maxEpisodeSteps, scoreThreshold, seedRange } = evaluationSettings;

  const rewards = variants.map((v) => v.metrics.avgReward).filter((x): x is number => x !== null);
  const lengths = variants.map((v) => v.metrics.avgEpisodeLength).filter((x): x is number => x !== null);
  const rewardMin = Math.min(...rewards);
  const rewardMax = Math.max(...rewards);
  const lengthCap = maxEpisodeSteps ?? Math.max(...lengths);
  const hasAnyData = rewards.length > 0 || lengths.length > 0;

  return (
    <section className="w-full mb-space-xl" id="benchmark-results">
      <SectionHeader
        index="03"
        title="Benchmark Matrix"
        aside={<span className="font-code-sm text-code-sm text-outline">Deterministic 10-Episode Evaluation Suite</span>}
      />

      <p className="font-body-sm text-body-sm text-outline mb-space-md">
        <strong>Evaluation protocol:</strong> Metrics compiled over {episodes} deterministic seed-locked episodes
        (seeds {seedRange}) in <code className="font-code-sm text-code-sm px-1 py-0.5 border border-outline-variant/30 text-on-surface">LunarLander</code> using
        identical initial state conditions. Note: scoring ≥{scoreThreshold} points denotes the benchmark target reward threshold,
        distinguished from a physically verified landing confirmation. Newly generated demo runs in the arena above are separate
        single-episode trials and do not modify these recorded benchmark results.
        {!hasAnyData && " No results have been entered yet, so the table shows “—”."}
      </p>

      <div className="w-full overflow-x-auto border-t-2 border-b-2 border-on-surface">
        <table className="w-full text-left font-body-sm text-body-sm border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/40 text-outline font-code-sm text-code-sm uppercase">
              <th className="py-2.5 px-3 font-normal">Model Variant</th>
              <th className="py-2.5 px-3 text-right font-normal">Avg Reward</th>
              <th className="py-2.5 px-3 text-right font-normal">Avg Episode Length</th>
              <th className="py-2.5 px-3 text-center font-normal">Timeouts (1,000s)</th>
              <th className="py-2.5 px-3 text-center font-normal">
                Score ≥ {scoreThreshold}+ Rate
              </th>
              <th className="py-2.5 px-3 font-normal">Primary Failure Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-on-surface font-code-sm text-code-sm">
            {variants.map((v) => (
              <tr key={v.id} className="hover:bg-surface-container-low/40 transition-colors">
                <td className="py-3 px-3 font-medium">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className={"w-1.5 h-1.5 rounded-full " + DOT[v.id]}></span>
                    <span>{v.name}</span>
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-semibold">
                  {v.metrics.avgReward === null ? DASH : `${fmt(v.metrics.avgReward, 2, true)} pts`}
                </td>
                <td className="py-3 px-3 text-right text-outline">
                  {v.metrics.avgEpisodeLength === null ? DASH : `${fmt(v.metrics.avgEpisodeLength, 1)} steps`}
                </td>
                <td className="py-3 px-3 text-center text-outline">
                  {fmtCount(v.metrics.timeouts, episodes)}
                </td>
                <td className="py-3 px-3 text-center font-medium">
                  {fmtCount(v.metrics.episodesScoring200Plus, episodes)}
                </td>
                <td className="py-3 px-3 text-outline font-body-sm text-body-sm">
                  {v.metrics.primaryFailureMode ?? DASH}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-space-lg grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm">
        <div className="space-y-space-sm">
          <span className="font-code-sm text-code-sm text-outline uppercase tracking-wider block">
            Metric: Mean Reward Comparison
          </span>
          {variants.map((v) => (
            <Bar
              key={v.id}
              name={v.name}
              label={v.metrics.avgReward === null ? DASH : `${fmt(v.metrics.avgReward, 2, true)} pts`}
              width={barWidth(v.metrics.avgReward, Math.min(rewardMin, 0), Math.max(rewardMax, 0))}
              color={BAR[v.id]}
            />
          ))}
        </div>
        <div className="space-y-space-sm">
          <span className="font-code-sm text-code-sm text-outline uppercase tracking-wider block">
            Metric: Average Episode Duration{maxEpisodeSteps !== null && ` (Cap: ${maxEpisodeSteps})`}
          </span>
          {variants.map((v) => (
            <Bar
              key={v.id}
              name={v.name}
              label={v.metrics.avgEpisodeLength === null ? DASH : `${fmt(v.metrics.avgEpisodeLength, 1)} steps`}
              width={barWidth(v.metrics.avgEpisodeLength, 0, lengthCap)}
              color={BAR[v.id]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Bar({ name, label, width, color }: { name: string; label: string; width: number; color: string }) {
  return (
    <div className="border-t border-outline-variant/30 pt-1">
      <div className="flex justify-between font-code-sm text-code-sm mb-1">
        <span className="font-medium text-on-surface">{name}</span>
        <span className="text-outline">{label}</span>
      </div>
      <div className="w-full bg-outline-variant/20 h-1 overflow-hidden">
        <div className={color + " h-full"} style={{ width: `${width}%` }}></div>
      </div>
    </div>
  );
}
