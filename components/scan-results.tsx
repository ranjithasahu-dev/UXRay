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

function getFindingIndex(result: ScanResult, findingId: string) {
  return result.findings.findIndex((finding) => finding.id === findingId) + 1;
}

function getChipPlacement(
  bounds: { x: number; y: number; width: number; height: number },
  screenshot: ScanResult["screenshot"]
) {
  const nearTop = bounds.y / screenshot.height < 0.08;
  const nearBottom = (bounds.y + bounds.height) / screenshot.height > 0.92;
  const nearLeft = bounds.x / screenshot.width < 0.06;
  const nearRight = (bounds.x + bounds.width) / screenshot.width > 0.94;
  const tinyBox = bounds.height < 36 || bounds.width < 88;

  return {
    vertical: (nearTop || tinyBox) && !nearBottom ? "bottom" : "top",
    horizontal: nearRight && !nearLeft ? "right" : "left",
    tinyBox,
  } as const;
}

function getVisibleBounds(
  bounds: { x: number; y: number; width: number; height: number },
  screenshot: ScanResult["screenshot"]
) {
  const minWidth = Math.min(120, screenshot.width);
  const minHeight = Math.min(34, screenshot.height);
  const paddedWidth = Math.max(bounds.width + 16, minWidth);
  const paddedHeight = Math.max(bounds.height + 12, minHeight);
  const centeredX = bounds.x - (paddedWidth - bounds.width) / 2;
  const centeredY = bounds.y - (paddedHeight - bounds.height) / 2;

  const clampedX = Math.max(0, Math.min(centeredX, screenshot.width - paddedWidth));
  const clampedY = Math.max(0, Math.min(centeredY, screenshot.height - paddedHeight));

  return {
    x: clampedX,
    y: clampedY,
    width: Math.min(paddedWidth, screenshot.width - clampedX),
    height: Math.min(paddedHeight, screenshot.height - clampedY),
  };
}

function getFindingMatchText(result: ScanResult, findingId: string) {
  const finding = result.findings.find((candidate) => candidate.id === findingId);

  if (!finding) {
    return null;
  }

  const matchedText = finding.elementIds
    .map((elementId) => result.elements.find((element) => element.id === elementId)?.text?.trim())
    .find((text) => text && text.length > 0);

  return matchedText ?? null;
}

function truncateMatchText(text: string, maxLength = 38) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

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
  const selectedMatchText = selectedFinding
    ? getFindingMatchText(result, selectedFinding.id)
    : null;
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
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                      {getFindingIndex(result, finding.id)}
                    </span>
                    <span className="text-base font-semibold text-white">
                      {finding.patternType}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getBadgeTone(
                      finding.severity
                    )}`}
                  >
                    {finding.severity}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{finding.explanation}</p>
                {getFindingMatchText(result, finding.id) ? (
                  <p className="mt-2 rounded-xl border border-white/8 bg-slate-950/40 px-3 py-2 text-xs leading-5 text-slate-300">
                    Matched text: “{truncateMatchText(getFindingMatchText(result, finding.id) ?? "", 120)}”
                  </p>
                ) : null}
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

        {showOverlayBoxes ? (
          <div className="flex flex-wrap gap-2">
            {result.findings.map((finding) => (
              <button
                key={`legend-${finding.id}`}
                type="button"
                onClick={() => onSelectFinding(finding.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedFinding?.id === finding.id
                    ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-100"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/30"
                }`}
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-slate-950 text-[11px] text-white">
                  {getFindingIndex(result, finding.id)}
                </span>
                <span>{finding.patternType}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="overflow-x-auto overflow-y-visible rounded-[1.25rem] border border-white/10 bg-slate-900 pt-4">
          <div
            className="relative min-w-full"
            style={{
              aspectRatio: `${result.screenshot.width} / ${result.screenshot.height}`,
              overflow: "visible",
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

                  const visibleBounds = getVisibleBounds(element.bounds, result.screenshot);
                  const placement = getChipPlacement(visibleBounds, result.screenshot);
                  const matchText = element.text?.trim();
                  const chipVerticalStyle =
                    placement.vertical === "top"
                      ? { top: "0.5rem" }
                      : { bottom: "0.5rem" };
                  const chipHorizontalStyle =
                    placement.horizontal === "left"
                      ? { left: "0.5rem" }
                      : { right: "0.5rem" };
                  const labelStyle =
                    placement.horizontal === "left"
                      ? {
                          left: "2.55rem",
                          right: "0.5rem",
                        }
                      : {
                          right: "2.55rem",
                          left: "0.5rem",
                        };
                  const sharedVerticalStyle =
                    placement.vertical === "top"
                      ? { top: "0.5rem" }
                      : { bottom: "0.5rem" };
                  const tooltipVerticalStyle =
                    placement.vertical === "top"
                      ? { top: "3.4rem" }
                      : { bottom: "3.4rem" };
                  const tooltipHorizontalStyle =
                    placement.horizontal === "left"
                      ? { left: "0.5rem" }
                      : { right: "0.5rem" };

                  return (
                    <button
                      key={`${finding.id}-${elementId}`}
                      type="button"
                      onClick={() => onSelectFinding(finding.id)}
                      className={`group absolute rounded-sm border-2 transition hover:scale-[1.01] ${getSeverityColor(
                        finding.severity
                      )} ${selectedFinding?.id === finding.id ? "shadow-lg shadow-cyan-500/20" : ""}`}
                      style={{
                        left: `${(visibleBounds.x / result.screenshot.width) * 100}%`,
                        top: `${(visibleBounds.y / result.screenshot.height) * 100}%`,
                        width: `${(visibleBounds.width / result.screenshot.width) * 100}%`,
                        height: `${(visibleBounds.height / result.screenshot.height) * 100}%`,
                        overflow: "visible",
                      }}
                      aria-label={`Highlight ${finding.patternType}`}
                    >
                      <span
                        className={`absolute z-10 flex min-w-7 items-center justify-center rounded-full px-2.5 py-1.5 text-[10px] leading-none font-semibold text-white shadow-lg ${
                          finding.severity === "high" ? "bg-red-600" : "bg-amber-500 text-slate-950"
                        }`}
                        style={{
                          ...chipVerticalStyle,
                          ...chipHorizontalStyle,
                          maxWidth: "calc(100% - 0.5rem)",
                        }}
                      >
                        {getFindingIndex(result, finding.id)}
                      </span>

                      {selectedFinding?.id === finding.id ? (
                        <span
                          className="absolute z-10 max-w-[min(14rem,calc(100%-3.25rem))] overflow-hidden rounded-full bg-slate-950/92 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-lg"
                          style={{
                            ...sharedVerticalStyle,
                            ...labelStyle,
                          }}
                        >
                          <span className="block truncate">{finding.patternType}</span>
                        </span>
                      ) : null}

                      {selectedFinding?.id === finding.id && matchText ? (
                        <span
                          className="pointer-events-none absolute z-20 hidden w-72 max-w-[calc(100vw-3rem)] rounded-2xl border border-white/10 bg-slate-950/96 px-3 py-3 text-left shadow-xl group-hover:block group-focus-visible:block"
                          style={{
                            ...tooltipVerticalStyle,
                            ...tooltipHorizontalStyle,
                          }}
                        >
                          <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Why It Was Flagged
                          </span>
                          <span className="mt-2 block text-xs leading-5 text-slate-100 whitespace-normal break-words">
                            “{matchText}”
                          </span>
                          <span className="mt-2 block text-xs leading-5 text-slate-300 whitespace-normal break-words">
                            {finding.explanation}
                          </span>
                        </span>
                      ) : null}

                      {placement.tinyBox ? (
                        <span className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-white/10" />
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
            {selectedMatchText ? (
              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Matched On Page
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-100">“{selectedMatchText}”</p>
              </div>
            ) : null}
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
