"use client";

import { useMemo, useState } from "react";

import type { ScanResult, SeverityLevel } from "@/lib/uxray/types";

function getSeverityColor(severity: SeverityLevel) {
  return severity === "high"
    ? "border-red-500/95 bg-red-500/8 text-red-50"
    : "border-amber-400/95 bg-amber-400/8 text-amber-50";
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
  const [imageFailed, setImageFailed] = useState(false);
  const selectedFinding = useMemo(
    () =>
      result.findings.find((finding) => finding.id === selectedFindingId) ??
      result.findings[0],
    [result.findings, selectedFindingId]
  );
  const showOverlayBoxes = !result.meta.note && !imageFailed && result.findings.length > 0;
  const showEmptyOverlay = !result.meta.note && !imageFailed && result.findings.length === 0;

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
          {result.findings.length > 0 ? (
            result.findings.map((finding) => (
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
            ))
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-5">
              <p className="text-base font-semibold text-white">No matching patterns detected</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                UXRay completed the scan, but this page did not match the five currently tracked
                dark-pattern categories.
              </p>
            </div>
          )}
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

        {result.meta.note ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
            {result.meta.note}
          </div>
        ) : null}

        <div className="overflow-auto rounded-[1.25rem] border border-white/10 bg-slate-900">
          <div
            className="relative min-w-full"
            style={{
              aspectRatio: `${result.screenshot.width} / ${result.screenshot.height}`,
            }}
          >
            {imageFailed ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950 p-6 text-center">
                <div className="max-w-xl rounded-2xl border border-white/10 bg-white/4 px-5 py-4">
                  <p className="text-base font-semibold text-white">Screenshot preview failed to render</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    UXRay completed the analysis, but the returned image could not be displayed in
                    the preview panel.
                  </p>
                </div>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={result.screenshot.src}
                alt={`Captured scan result for ${result.url}`}
                className="absolute inset-0 block h-full w-full object-fill object-top align-top"
                onError={() => setImageFailed(true)}
              />
            )}

            <div className="absolute inset-0">
              {showOverlayBoxes
                ? result.findings.flatMap((finding) =>
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
                      className={`absolute rounded-sm border-2 transition hover:scale-[1.01] ${getSeverityColor(
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
                      {selectedFinding?.id === finding.id ? (
                        <span className="absolute -top-7 left-0 max-w-[10rem] rounded-full bg-slate-950/92 px-2 py-1 text-[11px] font-medium text-white">
                          {finding.patternType}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )
                : null}
            </div>

            {showEmptyOverlay ? (
              <div className="pointer-events-none absolute inset-x-6 top-6 rounded-2xl border border-white/10 bg-slate-950/78 px-4 py-3 text-sm leading-6 text-slate-200 backdrop-blur">
                No highlighted elements were found for the currently supported dark-pattern
                categories on this page.
              </div>
            ) : null}
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
        ) : result.findings.length === 0 ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Scan Status</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              The page was analyzed, but there are no highlighted elements to show for the
              current detection categories.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
