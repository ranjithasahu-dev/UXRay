import { describe, expect, it } from "vitest";

import { getVoyagoFixture } from "@/lib/uxray/fixtures";
import { runUxRayScan } from "@/lib/uxray/scan";

describe("Voyago integration scan", () => {
  it("detects fake urgency and confirm shaming and yields a high-risk score", async () => {
    const url = "https://voyago-demo.local";
    const result = await runUxRayScan({
      url,
      extractedPage: getVoyagoFixture(url),
    });

    expect(
      result.findings.some(
        (finding) =>
          finding.patternType === "Fake Urgency" &&
          finding.elementIds.includes("fake-urgency-copy")
      )
    ).toBe(true);

    expect(
      result.findings.some(
        (finding) =>
          finding.patternType === "Confirm Shaming" &&
          finding.elementIds.includes("confirm-shaming-link")
      )
    ).toBe(true);

    expect(result.score).toBeGreaterThanOrEqual(78);
    expect(result.score).toBeLessThanOrEqual(86);
    expect(result.riskLevel).toBe("High");
  });
});
