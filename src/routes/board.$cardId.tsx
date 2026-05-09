import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { Radio, Wifi, Copy, Check, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/board/$cardId")({
  component: Board,
});

type Session = {
  card_id: string;
  active_content_url: string | null;
  content_type: string | null;
  title: string | null;
};

function Board() {
  const { cardId } = Route.useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.from("sessions").select("*").eq("card_id", cardId).maybeSingle().then(({ data }) => {
      if (active) setSession(data as Session | null);
    });

    const channel = supabase
      .channel(`session-${cardId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions", filter: `card_id=eq.${cardId}` },
        (payload) => {
          if (payload.eventType === "DELETE") setSession(null);
          else setSession(payload.new as Session);
        }
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [cardId]);

  const url = session?.active_content_url;
  const type = session?.content_type;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground">
            Board · {cardId}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <Wifi className={`w-3.5 h-3.5 ${connected ? "text-primary" : "text-muted-foreground"}`} />
          <span className={connected ? "text-primary" : "text-muted-foreground"}>
            {connected ? "LIVE" : "CONNECTING"}
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 pt-16">
        {!url && <EmptyState cardId={cardId} />}
        {url && <LinkQR url={url} title={session?.title} type={type} />}
      </main>
    </div>
  );
}

function EmptyState({ cardId }: { cardId: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card glow-ring mb-6">
        <Radio className="w-8 h-8 text-primary animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Awaiting transmission</h1>
      <p className="text-muted-foreground">
        Push content to <span className="font-mono text-foreground">{cardId}</span> from the owner dashboard.
      </p>
    </div>
  );
}

function LinkQR({ url, title }: { url: string; title?: string | null }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="text-center max-w-2xl">
      {title && <h2 className="text-2xl font-semibold mb-2">{title}</h2>}
      <div className="inline-block p-8 bg-white rounded-2xl glow-ring mb-6">
        <QRCodeSVG value={url} size={320} level="M" />
      </div>
      <p className="text-muted-foreground text-sm font-mono break-all max-w-lg mx-auto mb-4">{url}</p>
      <div className="flex gap-2 justify-center max-w-lg mx-auto">
        <button
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-accent transition text-sm font-medium"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy URL"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" /> Open here
        </a>
      </div>
    </div>
  );
}
