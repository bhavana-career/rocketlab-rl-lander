import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SimulationArena from "./components/SimulationArena";
import RewardVariants from "./components/RewardVariants";
import BenchmarkTable from "./components/BenchmarkTable";
import Analysis from "./components/Analysis";
import Footer from "./components/Footer";
import type { ModelId } from "./types";

export default function App() {
  // The selected model is shared by the arena and the variant cards.
  const [selectedModel, setSelectedModel] = useState<ModelId>("original");

  return (
    <>
      <Header />
      <main className="flex-1 w-full pt-14 max-w-7xl mx-auto px-gutter">
        <div className="flex flex-col w-full">
          <Hero />
          <SimulationArena selectedModel={selectedModel} onSelectModel={setSelectedModel} />
          <RewardVariants selectedModel={selectedModel} onSelectModel={setSelectedModel} />
          <BenchmarkTable />
          <Analysis />
        </div>
      </main>
      <Footer />
    </>
  );
}
