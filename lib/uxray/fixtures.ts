import type { ExtractedPage } from "@/lib/uxray/types";

export function getGenericFixture(url: string): ExtractedPage {
  return {
    url,
    title: "Capture unavailable",
    screenshot: {
      src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect x="70" y="70" width="1140" height="580" rx="32" fill="#10192b" stroke="#334155"/>
  <rect x="110" y="124" width="180" height="18" rx="9" fill="#22d3ee" fill-opacity="0.35"/>
  <text x="110" y="214" fill="#f8fafc" font-size="50" font-family="Arial" font-weight="700">Live capture unavailable</text>
  <text x="110" y="280" fill="#94a3b8" font-size="28" font-family="Arial">UXRay could not retrieve a browser screenshot for this page.</text>
  <rect x="110" y="338" width="540" height="154" rx="24" fill="#0b1220" stroke="#334155"/>
  <text x="140" y="390" fill="#e2e8f0" font-size="24" font-family="Arial" font-weight="700">Possible reasons</text>
  <text x="140" y="430" fill="#94a3b8" font-size="22" font-family="Arial">• The page blocks automated browsing</text>
  <text x="140" y="464" fill="#94a3b8" font-size="22" font-family="Arial">• The site needs cookies, auth, or interaction</text>
  <text x="140" y="498" fill="#94a3b8" font-size="22" font-family="Arial">• The destination timed out while loading</text>
</svg>
      `)}`,
      width: 1280,
      height: 720,
    },
    elements: [
      {
        id: "generic-title",
        kind: "text",
        text: "Live capture unavailable",
        isVisible: true,
        bounds: { x: 110, y: 170, width: 520, height: 60 },
        styles: { fontSize: 50, fontWeight: 700 },
      },
    ],
  };
}
