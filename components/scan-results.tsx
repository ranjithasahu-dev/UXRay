"use client";

import { useMemo } from "react";

import type { ScanResult, SeverityLevel } from "@/lib/uxray/types";

function getSeverityColor(severity: SeverityLevel) {
  return severity === "high"
    ? "border-red-500 bg-red-500/10 text-red-50"
    : "border-amber-400 bg-amber-400/10 text-amber-50";
}

function getBadgeTone(severity: SeverityLevel) {
  return severity === "high"
    ? "bg-red-500/15 text-red-200 ring-red-400/40"
    : "bg-amber-400/15 text-amber-100 ring-amber-300/30";
}

function getRiskTone(riskLevel: ScanResult["riskLevel"]) {
  if (riskLevel === "High") {
    return "border-red-400/30 bg-red-500/12 text-red-100";
  }

  if (riskLevel === "Medium") {
    return "border-amber-400/30 bg-amber-500/12 text-amber-100";
  }

  return "border-emerald-400/30 bg-emerald-500/12 text-emerald-100";
}

function getScoreTone(riskLevel: ScanResult["riskLevel"]) {
  if (riskLevel === "High") {
    return "text-red-100";
  }

  if (riskLevel === "Medium") {
    return "text-amber-100";
  }

  return "text-emerald-100";
}

type ScanResultsProps = {
  result: ScanResult;
  selectedFindingId: string | null;
  onSelectFinding: (findingId: string) => void;
};

export function ScanResults({
  result,
  selectedFindingId,
  onSelectFinding,
}: ScanResultsProps) {
  const selectedFinding = useMemo(
    () =>
      result.findings.find((finding) => finding.id === selectedFindingId) ??
      result.findings[0],
    [result.findings, selectedFindingId]
  );

  return (
    <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">
              Manipulation Score
            </p>
            <div className="mt-3 flex items-end gap-3">
              <span className={`text-6xl font-semibold ${getScoreTone(result.riskLevel)}`}>
                {result.score}
              </span>
              <span className="pb-2 text-lg text-slate-400">/100</span>
            </div>
          </div>
          <div
            className={`rounded-full border px-4 py-2 text-sm font-medium ${getRiskTone(
              result.riskLevel
            )}`}
          >
            {result.riskLevel} Risk
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(result.breakdown).map(([patternType, points]) => (
            <div
              key={patternType}
              className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
            >
              <p className="text-sm text-slate-300">{patternType}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{points} pts</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Findings</p>
          {result.findings.map((finding) => (
            <button
              key={finding.id}
              type="button"
              onClick={() => onSelectFinding(finding.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition hover:border-cyan-300/50 hover:bg-cyan-300/8 ${
                selectedFinding?.id === finding.id
                  ? "border-cyan-300/60 bg-cyan-300/10"
                  : "border-white/8 bg-white/4"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-white">
                  {finding.patternType}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getBadgeTone(
                    finding.severity
                  )}`}
                >
                  {finding.severity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{finding.explanation}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">X-Ray View</p>
            <p className="mt-1 text-sm text-slate-400">{result.title}</p>
          </div>
          <p className="max-w-xs text-right text-xs leading-5 text-slate-500">
            Click a box or a finding card to inspect why UXRay flagged it.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.screenshot.src}
            alt={`Captured scan result for ${result.url}`}
            className="h-auto w-full"
          />

          <div className="absolute inset-0">
            {result.findings.flatMap((finding) =>
              finding.elementIds.map((elementId) => {
                const element = result.elements.find((candidate) => candidate.id === elementId);

                if (!element?.bounds) {
                  return null;
                }

                return (
                  <button
                    key={`${finding.id}-${elementId}`}
                    type="button"
                    onClick={() => onSelectFinding(finding.id)}
                    className={`absolute rounded-xl border-2 transition hover:scale-[1.02] ${getSeverityColor(
                      finding.severity
                    )} ${selectedFinding?.id === finding.id ? "shadow-lg shadow-cyan-500/20" : ""}`}
                    style={{
                      left: `${(element.bounds.x / result.screenshot.width) * 100}%`,
                      top: `${(element.bounds.y / result.screenshot.height) * 100}%`,
                      width: `${(element.bounds.width / result.screenshot.width) * 100}%`,
                      height: `${(element.bounds.height / result.screenshot.height) * 100}%`,
                    }}
                    aria-label={`Highlight ${finding.patternType}`}
                  >
                    <span className="absolute -top-7 left-0 max-w-[10rem] rounded-full bg-slate-950/90 px-2 py-1 text-[11px] font-medium text-white">
                      {finding.patternType}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {selectedFinding ? (
          <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/8 p-4">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/70">
              Selected Explanation
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {selectedFinding.patternType}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {selectedFinding.explanation}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
