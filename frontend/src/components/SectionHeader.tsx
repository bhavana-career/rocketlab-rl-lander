import type { ReactNode } from "react";

interface Props {
  index: string; // e.g. "01"
  title: string;
  aside?: ReactNode; // right-hand annotation
  borderBottom?: boolean;
}

/** The "[01] TITLE ........ annotation" row that opens each section. */
export default function SectionHeader({ index, title, aside, borderBottom = true }: Props) {
  return (
    <div
      className={
        "flex items-center justify-between pb-space-xs mb-space-md " +
        (borderBottom ? "border-b border-outline-variant/30" : "")
      }
    >
      <div className="flex items-baseline space-x-2">
        <span className="font-code-sm text-code-sm text-outline uppercase">[{index}]</span>
        <h2 className="font-title-md text-title-md text-on-surface tracking-tight uppercase font-medium">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
