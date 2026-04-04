"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Radar,
  ScanSearch,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { ScanResults } from "@/components/scan-results";
import { Button } from "@/components/ui/button";
import type { ScanResult } from "@/lib/uxray/types";

const progressSteps = [
  "Extracting interface elements",
  "Checking urgency language",
  "Evaluating button hierarchy",
] as const;

export function UxRayDashboard() {
  const [url, setUrl] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % progressSteps.length);
    }, 900);

    return () => window.clearInterval(interval);
  }, [isPending]);

  useEffect(() => {
    if (!result) {
      return;
    }

    resultsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [result]);

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
    const normalizedUrl = scanUrl.trim();

    if (!normalizedUrl) {
      setError("Paste a website URL to start the scan.");
      return;
    }

    setActiveStep(0);
    startTransition(async () => {
      try {
        await submitScan(normalizedUrl);
        setActiveStep(0);
      } catch (scanError) {
        setActiveStep(0);
        setResult(null);
        setError(scanError instanceof Error ? scanError.message : "Scan failed.");
      }
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_24%),radial-gradient(circle_at_80%_12%,_rgba(34,211,238,0.16),_transparent_26%),linear-gradient(180deg,_#07111f_0%,_#0c1627_42%,_#0d1421_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.86),rgba(16,24,39,0.72))] px-6 py-6 shadow-[0_30px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:px-8 sm:py-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute inset-y-0 left-[8%] w-px bg-white/8" />
            <div className="absolute inset-y-0 left-[42%] w-px bg-white/6" />
            <div className="absolute inset-x-0 top-[28%] h-px bg-white/6" />
          </div>

          <div className="relative flex items-center justify-between gap-4 border-b border-white/8 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#22d3ee)] text-slate-950 shadow-lg shadow-cyan-500/20">
                <ScanSearch className="size-5" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-white">UXRay</p>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  Interface Risk Observatory
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 md:flex">
              <ShieldAlert className="size-4 text-amber-300" />
              Trust friction, urgency, and coercive CTA analysis
            </div>
          </div>

          <div className="relative mt-8 grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-100">
                <Radar className="size-4" />
                Product safety review for growth pages and checkout flows
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-[5.5rem]">
                  See where your interface starts pushing instead of guiding.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Run a live scan on any public page and get a sharper read on coercive copy,
                  hidden exits, interruptive signup moments, and visually imbalanced calls to
                  action.
                </p>
              </div>

              <form
                className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-3 shadow-xl shadow-slate-950/30"
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
                      placeholder="Paste a website URL"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </label>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 rounded-[1.35rem] bg-[linear-gradient(135deg,#22d3ee,#06b6d4)] px-6 text-slate-950 hover:opacity-95"
                    disabled={isPending}
                  >
                    {isPending ? "Scanning..." : "Scan"}
                  </Button>
                </div>
              </form>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.6rem] border border-white/8 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Detects
                  </p>
                  <p className="mt-3 text-xl font-semibold text-white">Five manipulation patterns</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/8 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Returns
                  </p>
                  <p className="mt-3 text-xl font-semibold text-white">Score, risk, and evidence</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/8 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Highlights
                  </p>
                  <p className="mt-3 text-xl font-semibold text-white">Clickable issue overlays</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,20,34,0.96),rgba(16,24,39,0.88))] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-cyan-100">
                    <Sparkles className="size-5" />
                    <span className="text-sm uppercase tracking-[0.28em]">Scan Sequence</span>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Live
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {progressSteps.map((step, index) => {
                    const isActive = isPending && index === activeStep;
                    const isComplete = result && !isPending;

                    return (
                      <motion.div
                        key={step}
                        layout
                        className={`rounded-[1.4rem] border px-4 py-4 ${
                          isActive
                            ? "border-cyan-300/40 bg-cyan-300/10"
                            : isComplete
                              ? "border-emerald-300/20 bg-emerald-300/8"
                              : "border-white/8 bg-white/4"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`size-2.5 rounded-full ${
                                isActive
                                  ? "bg-cyan-300"
                                  : isComplete
                                    ? "bg-emerald-300"
                                    : "bg-slate-600"
                              }`}
                            />
                            <p className="text-sm text-slate-100">{step}</p>
                          </div>
                          <ArrowUpRight className="size-4 text-slate-500" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.8rem] border border-white/10 bg-[#111827]/80 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Signal Layers
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
                      Copy pressure and urgency framing
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
                      Visually hidden declines and exits
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
                      Dominant versus weakened CTA treatment
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(15,23,42,0.3))] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Review Output
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-3xl font-semibold text-white">Risk-scored</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        Findings land with clear severity and traceable evidence.
                      </p>
                    </div>
                    <div className="h-px bg-white/10" />
                    <p className="text-sm leading-6 text-slate-300">
                      Designed for audits, launch reviews, and fast stakeholder walkthroughs.
                    </p>
                  </div>
                </div>
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
              ref={resultsRef}
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
