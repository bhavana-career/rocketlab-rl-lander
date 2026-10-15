import { useActiveSection } from "../hooks/useActiveSection";

/** Section ids in page order (used for highlighting the current nav item). */
const SECTION_ORDER = ["simulation-arena", "reward-variants", "benchmark-results", "analysis"];

const NAV_ITEMS = [
  { label: "Experiment", href: "#simulation-arena", sections: ["simulation-arena", "reward-variants"] },
  { label: "Compare Models", href: "#benchmark-results", sections: ["benchmark-results"] },
  { label: "Analysis", href: "#analysis", sections: ["analysis"] },
];

export default function Header() {
  const activeSection = useActiveSection(SECTION_ORDER);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-outline-variant/40">
      <div className="h-14 max-w-7xl mx-auto px-gutter flex items-center justify-between">
        <div className="flex items-center space-x-space-md">
          <span className="font-code-sm text-code-sm text-outline-variant select-none">§</span>
          <div className="flex items-baseline gap-2">
            <a
              href="#top"
              className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-normal"
            >
              RocketLab
            </a>
          </div>
          <span className="hidden sm:inline-block font-code-sm text-code-sm text-outline">
            / RL PORTFOLIO PROJECT
          </span>
        </div>

        <nav className="flex items-center space-x-space-lg">
          {NAV_ITEMS.map((item) => {
            const isActive = item.sections.includes(activeSection);
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  "font-code-sm text-code-sm uppercase tracking-wider whitespace-nowrap relative transition-colors " +
                  (isActive
                    ? "text-on-surface font-medium after:content-[''] after:absolute after:-bottom-[17px] after:left-0 after:right-0 after:h-[1.5px] after:bg-secondary"
                    : "text-outline hover:text-on-surface")
                }
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
