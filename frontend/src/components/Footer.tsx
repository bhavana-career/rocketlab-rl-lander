import { project } from "../data/project";

export default function Footer() {
  const left = [project.environment && `RL-ENV: ${project.environment}`, project.algorithm]
    .filter(Boolean)
    .join(" • ");

  return (
    <footer className="w-full border-t border-outline-variant/30 py-space-lg mt-margin">
      <div className="max-w-7xl mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-space-sm text-outline font-code-sm text-code-sm">
        <div className="flex items-center space-x-2">
          <span className="text-outline-variant">§</span>
          <span>{left}</span>
        </div>
        <div className="tracking-wider uppercase">
          {project.owner ? `Portfolio project by ${project.owner}` : "Personal portfolio project"}
        </div>
      </div>
    </footer>
  );
}
