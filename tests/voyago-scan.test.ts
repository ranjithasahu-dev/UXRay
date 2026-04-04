import { describe, expect, it } from "vitest";

import { runUxRayScan } from "@/lib/uxray/scan";

describe("Generic scan pipeline", () => {
  it("detects suspicious patterns from extracted elements without a site-specific fixture", async () => {
    const url = "https://example.test";
    const result = await runUxRayScan({
      url,
      extractedPage: {
        url,
        title: "Example test page",
        screenshot: {
          src: "data:image/png;base64,test",
          width: 1200,
          height: 900,
        },
        elements: [
          {
            id: "urgency",
            kind: "text",
            text: "URGENT: Only 2 rooms left at this price!",
            isVisible: true,
            bounds: { x: 40, y: 120, width: 340, height: 28 },
            styles: { fontSize: 28, fontWeight: 700 },
          },
          {
            id: "countdown",
            kind: "timer",
            text: "Offer expires in 02:00",
            isVisible: true,
            bounds: { x: 40, y: 156, width: 220, height: 24 },
            styles: { fontSize: 24 },
          },
          {
            id: "primary",
            kind: "button",
            text: "Start now",
            isVisible: true,
            bounds: { x: 40, y: 220, width: 220, height: 48 },
            styles: {
              fontSize: 20,
              fontWeight: 700,
              isPrimary: true,
              prominentColor: "#2563eb",
            },
          },
          {
            id: "secondary",
            kind: "link",
            text: "Maybe later, I will pay more",
            isVisible: true,
            bounds: { x: 40, y: 282, width: 240, height: 20 },
            styles: {
              fontSize: 14,
              opacity: 0.6,
              isMuted: true,
            },
          },
          {
            id: "signup",
            kind: "modal",
            text: "Create an account to continue",
            isVisible: true,
            bounds: { x: 420, y: 180, width: 380, height: 220 },
            metadata: {
              interruptsFlow: true,
              autoOpened: true,
            },
          },
          {
            id: "confirm-shame",
            kind: "link",
            text: "No thanks, I like paying more",
            isVisible: true,
            bounds: { x: 430, y: 430, width: 260, height: 20 },
            styles: {
              fontSize: 16,
              opacity: 0.8,
              isMuted: true,
            },
          },
          {
            id: "unsubscribe",
            kind: "link",
            text: "unsubscribe",
            isVisible: true,
            bounds: { x: 44, y: 840, width: 90, height: 14 },
            styles: {
              fontSize: 12,
              opacity: 0.35,
              isMuted: true,
            },
          },
        ],
      },
    });

    expect(
      result.findings.some(
        (finding) =>
          finding.patternType === "Fake Urgency" &&
          finding.elementIds.includes("urgency")
      )
    ).toBe(true);

    expect(
      result.findings.some(
        (finding) =>
          finding.patternType === "Confirm Shaming" &&
          finding.elementIds.includes("confirm-shame")
      )
    ).toBe(true);

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.score).toBeLessThanOrEqual(90);
    expect(result.riskLevel).toBe("High");
  });
});
