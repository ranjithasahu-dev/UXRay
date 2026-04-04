"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { ScanResults } from "@/components/scan-results";
import { Button } from "@/components/ui/button";
import type { ScanResult } from "@/lib/uxray/types";

const progressSteps = [
  "Extracting interface elements",
  "Checking urgency language",
  "Evaluating button hierarchy",
] as const;

const demoUrl = "https://voyago-demo.local";

export function UxRayDashboard() {
  const [url, setUrl] = useState(demoUrl);
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % progressSteps.length);
    }, 900);

    return () => window.clearInterval(interval);
  }, [isPending]);

  async function submitScan(scanUrl: string) {
    setError(null);
    setSelectedFindingId(null);

    const response = await fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: scanUrl }),
    });

    const payload = (await response.json()) as ScanResult | { error: string };

    if (!response.ok || "error" in payload) {
      throw new Error("error" in payload ? payload.error : "Scan failed.");
    }

    setResult(payload);
    setSelectedFindingId(payload.findings[0]?.id ?? null);
  }

  function handleScan(scanUrl: string) {
    setActiveStep(0);
    startTransition(async () => {
      try {
        await submitScan(scanUrl);
        setActiveStep(0);
      } catch (scanError) {
        setActiveStep(0);
        setResult(null);
        setError(scanError instanceof Error ? scanError.message : "Scan failed.");
      }
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/6 px-6 py-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                <ShieldAlert className="size-4" />
                Dark pattern scanner for product teams
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  UXRay exposes manipulative UI patterns before they slip into production.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Paste a product URL, trigger the scan, and review AI-backed findings with
                  scoring, severity, and screenshot-level evidence.
                </p>
              </div>

              <form
                className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-3 shadow-xl shadow-slate-950/30"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleScan(url);
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="flex flex-1 items-center gap-3 rounded-[1.35rem] border border-white/10 bg-white/6 px-4 py-3">
                    <Search className="size-5 text-cyan-200" />
                    <input
                      type="url"
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </label>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 rounded-[1.35rem] bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
                    disabled={isPending}
                  >
                    {isPending ? "Scanning..." : "Scan"}
                  </Button>
                </div>
              </form>

              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                <button
                  type="button"
                  className="rounded-full border border-white/12 bg-white/6 px-4 py-2 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                  onClick={() => {
                    setUrl(demoUrl);
                    handleScan(demoUrl);
                  }}
                >
                  Demo scan Voyago
                </button>
                <span className="rounded-full border border-white/8 px-4 py-2 text-slate-400">
                  Groq-powered classification with deterministic fallback
                </span>
              </div>
            </div>

            <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/55 p-5">
              <div className="rounded-[1.6rem] border border-cyan-300/15 bg-cyan-300/8 p-5">
                <div className="flex items-center gap-3 text-cyan-100">
                  <Sparkles className="size-5" />
                  <span className="text-sm uppercase tracking-[0.28em]">Live Scan Flow</span>
                </div>
                <div className="mt-5 space-y-3">
                  {progressSteps.map((step, index) => {
                    const isActive = isPending && index === activeStep;
                    const isComplete = result && !isPending;

                    return (
                      <motion.div
                        key={step}
                        layout
                        className={`rounded-2xl border px-4 py-3 ${
                          isActive
                            ? "border-cyan-300/50 bg-cyan-300/12"
                            : isComplete
                              ? "border-emerald-300/25 bg-emerald-300/8"
                              : "border-white/8 bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-3 rounded-full ${
                              isActive
                                ? "bg-cyan-300"
                                : isComplete
                                  ? "bg-emerald-300"
                                  : "bg-slate-600"
                            }`}
                          />
                          <p className="text-sm text-slate-100">{step}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/8 bg-white/5 p-5 text-sm leading-7 text-slate-300">
                UXRay currently ships with a deterministic Voyago demo extraction so the
                dashboard, scoring model, and highlighting flow are ready even before the
                browser automation step is wired in.
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-[2rem] border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm text-red-100"
            >
              {error}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.section
              key="scanning"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-slate-950/30"
            >
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Scanning</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {progressSteps[activeStep]}
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-cyan-300"
                  initial={{ x: "-100%" }}
                  animate={{ x: ["-100%", "0%", "100%"] }}
                  transition={{
                    duration: 1.6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.section>
          ) : result ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <ScanResults
                result={result}
                selectedFindingId={selectedFindingId}
                onSelectFinding={setSelectedFindingId}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
