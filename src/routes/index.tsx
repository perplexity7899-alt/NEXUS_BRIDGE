import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Radio, Monitor, Settings2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus-Bridge — Real-time Wireless Document Hub" },
      { name: "description", content: "Push links, images, and PDFs to any board in real-time." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [cardId, setCardId] = useState("");

  const generateId = () => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    setCardId(id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-2 text-primary mb-6">
          <Radio className="w-5 h-5 animate-pulse" />
          <span className="font-mono text-xs tracking-[0.3em] uppercase">Nexus-Bridge</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Wireless document <span className="text-primary">hub</span>.
        </h1>
        <p className="text-muted-foreground text-lg mb-12 max-w-xl">
          Push links, images, and PDFs to any screen instantly. Realtime sync across every connected board.
        </p>

        <div className="bg-card glow-ring rounded-2xl p-6 md:p-8 mb-6">
          <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Card ID
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={cardId}
              onChange={(e) => setCardId(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
              placeholder="ENTER-CARD-ID"
              className="flex-1 bg-input rounded-lg px-4 py-3 font-mono text-lg outline-none focus:ring-2 focus:ring-ring transition"
            />
            <button
              onClick={generateId}
              className="px-4 py-3 rounded-lg bg-secondary hover:bg-accent transition font-medium text-sm"
            >
              Generate
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            <button
              disabled={!cardId}
              onClick={() => navigate({ to: "/dashboard/$cardId", params: { cardId } })}
              className="group flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
            >
              <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> Owner Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button
              disabled={!cardId}
              onClick={() => navigate({ to: "/board/$cardId", params: { cardId } })}
              className="group flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-secondary hover:bg-accent font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <span className="flex items-center gap-2"><Monitor className="w-4 h-4" /> Open Board View</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          Share the Board URL with any screen. Push content from your dashboard.
        </p>
      </div>
    </div>
  );
}
