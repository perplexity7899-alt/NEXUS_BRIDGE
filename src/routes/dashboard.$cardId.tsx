import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Send, Link as LinkIcon, Image as ImageIcon, FileText, ExternalLink, Loader2, Check, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export const Route = createFileRoute("/dashboard/$cardId")({
  component: Dashboard,
});

type ContentType = "image" | "pdf" | "link";

function detectType(url: string): ContentType {
  const u = url.toLowerCase().split("?")[0];
  if (/\.(png|jpe?g|gif|webp|svg|avif)$/.test(u)) return "image";
  if (/\.pdf$/.test(u)) return "pdf";
  return "link";
}

function Dashboard() {
  const { cardId } = Route.useParams();
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ContentType>("link");
  const [title, setTitle] = useState("");
  const [pushing, setPushing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pushedAt, setPushedAt] = useState<number | null>(null);
  const [current, setCurrent] = useState<{ url: string | null; type: string | null } | null>(null);

  useEffect(() => {
    supabase
      .from("sessions")
      .select("active_content_url, content_type")
      .eq("card_id", cardId)
      .maybeSingle()
      .then(({ data }) => setCurrent(data ? { url: data.active_content_url, type: data.content_type } : null));
  }, [cardId, pushedAt]);

  useEffect(() => {
    if (url) setType(detectType(url));
  }, [url]);

  const push = async () => {
    if (!url) return;
    setPushing(true);
    const { error } = await supabase.from("sessions").upsert(
      {
        card_id: cardId,
        active_content_url: url,
        content_type: type,
        title: title || null,
      },
      { onConflict: "card_id" }
    );
    setPushing(false);
    if (!error) {
      setPushedAt(Date.now());
    }
  };

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${cardId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("nexus").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (!error) {
      const { data } = supabase.storage.from("nexus").getPublicUrl(path);
      setUrl(data.publicUrl);
      setTitle(file.name);
      setType(file.type.includes("pdf") ? "pdf" : file.type.startsWith("image/") ? "image" : "link");
    }
    setUploading(false);
  };

  const boardUrl = typeof window !== "undefined" ? `${window.location.origin}/board/${cardId}` : "";

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition">
          ← Nexus-Bridge
        </Link>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Owner Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Card <span className="font-mono text-primary">{cardId}</span>
            </p>
          </div>
          <a
            href={boardUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition font-mono"
          >
            Open board <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-card glow-ring rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Content URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-input rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Title (optional)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My document"
              className="w-full bg-input rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["image", "pdf", "link"] as const).map((t) => {
                const Icon = t === "image" ? ImageIcon : t === "pdf" ? FileText : LinkIcon;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium capitalize transition ${
                      type === t ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="cursor-pointer flex items-center justify-center gap-2 py-3 rounded-lg bg-secondary hover:bg-accent transition text-sm font-medium">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading..." : "Upload file"}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              />
            </label>
            <button
              onClick={push}
              disabled={!url || pushing}
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : pushedAt && Date.now() - pushedAt < 2000 ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              Push to Board
            </button>
          </div>
        </div>

        {current?.url && (
          <div className="mt-6 bg-card border border-border rounded-2xl p-5">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Currently on board
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-0.5 rounded bg-secondary text-xs uppercase font-mono">{current.type}</span>
              <span className="truncate text-muted-foreground">{current.url}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
