"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ScanSearch, Search, Sparkles } from "lucide-react";
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
    <main className="min-h-screen bg-[#435a78] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1a2c] px-6 py-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#60a5fa,#22d3ee)] text-slate-950">
                <ScanSearch className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-white">UXRay</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Interface Risk Observatory
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-10 text-sm text-slate-300 md:flex">

            </nav>

            <Button
              type="button"
              className="rounded-xl bg-[linear-gradient(135deg,#60a5fa,#38bdf8)] px-5 text-slate-950 hover:opacity-95"
              onClick={() =>
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                })
              }
            >
              View results
            </Button>
          </div>

          <div className="relative mt-12 text-center">
            <div className="pointer-events-none absolute left-1/2 top-8 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border border-white/6 opacity-60 sm:h-[34rem] sm:w-[34rem]" />
            <div className="pointer-events-none absolute left-1/2 top-16 h-[20rem] w-[20rem] -translate-x-1/2 rounded-full border border-white/6 opacity-40 sm:h-[24rem] sm:w-[24rem]" />

            <div className="relative mx-auto max-w-4xl space-y-5">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
                Scan websites for manipulative UX patterns in seconds
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                UXRay reviews high-pressure copy, hidden exits, forced prompts, and misleading
                call-to-action hierarchy, then returns a clear manipulation score.
              </p>
            </div>

            <form
              className="relative mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white p-2 shadow-xl"
              onSubmit={(event) => {
                event.preventDefault();
                handleScan(url);
              }}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-slate-900">
                  <Search className="size-5 text-slate-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="Paste your website URL to start scanning..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </label>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 rounded-xl bg-[linear-gradient(135deg,#60a5fa,#38bdf8)] px-6 text-slate-950 hover:opacity-95"
                  disabled={isPending}
                >
                  {isPending ? "Scanning..." : "Start scan"}
                </Button>
              </div>
            </form>

            <div className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-2xl">
              <div className="grid min-h-[22rem] gap-0 md:grid-cols-[240px_1fr]">
                <div className="border-b border-slate-200 bg-slate-50 p-5 md:border-b-0 md:border-r">
                  <div className="flex items-center gap-2 text-slate-900">
                    <div className="size-3 rounded-full bg-sky-500" />
                    <span className="text-lg font-semibold">UXRay</span>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-900">
                      Latest scan
                    </div>
                    <div className="rounded-xl px-4 py-3 text-sm text-slate-500">History</div>
                    <div className="rounded-xl px-4 py-3 text-sm text-slate-500">Reports</div>
                    <div className="rounded-xl px-4 py-3 text-sm text-slate-500">Settings</div>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Website scan overview</p>
                      <p className="text-sm text-slate-500">Risk summary with explanation-ready output</p>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                      Updated now
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Risk score</p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex size-16 items-center justify-center rounded-full border-8 border-emerald-400 text-lg font-semibold text-slate-900">
                          B
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-slate-900">Moderate</p>
                          <p className="text-sm text-slate-500">Some friction signals detected</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Scan summary</p>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm text-slate-700">
                          <span>Critical</span>
                          <span>1</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-700">
                          <span>Moderate</span>
                          <span>3</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-700">
                          <span>Low</span>
                          <span>2</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Scan flow</p>
                      <div className="mt-4 space-y-3">
                        {progressSteps.map((step, index) => {
                          const isActive = isPending && index === activeStep;
                          const isComplete = result && !isPending;

                          return (
                            <motion.div
                              key={step}
                              layout
                              className={`rounded-xl px-3 py-2 text-left text-sm ${isActive
                                  ? "bg-sky-100 text-sky-900"
                                  : isComplete
                                    ? "bg-emerald-50 text-emerald-900"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-4" />
                                <span>{step}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
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
