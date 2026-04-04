import type { ExtractedPage } from "@/lib/uxray/types";

const demoScreenshot = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1100" viewBox="0 0 1440 1100">
  <defs>
    <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="card" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#fff7ed"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1440" height="1100" fill="#f8fafc"/>
  <rect x="0" y="0" width="1440" height="400" fill="url(#sky)"/>
  <text x="110" y="120" fill="#ffffff" font-size="58" font-family="Arial" font-weight="700">Explore Goa This Summer</text>
  <text x="110" y="188" fill="#fde68a" font-size="34" font-family="Arial" font-weight="700">Only 2 rooms left at this price</text>
  <text x="110" y="235" fill="#e2e8f0" font-size="28" font-family="Arial">Offer expires in 02:14</text>
  <rect x="110" y="276" width="230" height="62" rx="31" fill="#f97316"/>
  <text x="164" y="316" fill="#ffffff" font-size="28" font-family="Arial" font-weight="700">Book now</text>
  <rect x="90" y="470" width="1260" height="250" rx="28" fill="url(#card)" stroke="#e2e8f0"/>
  <text x="126" y="530" fill="#0f172a" font-size="40" font-family="Arial" font-weight="700">Join Voyago Rewards</text>
  <rect x="126" y="580" width="220" height="54" rx="27" fill="#2563eb"/>
  <text x="177" y="615" fill="#ffffff" font-size="25" font-family="Arial" font-weight="700">Sign up free</text>
  <text x="1290" y="512" fill="#64748b" font-size="24" font-family="Arial">×</text>
  <rect x="110" y="780" width="1220" height="160" rx="26" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="140" y="844" fill="#0f172a" font-size="30" font-family="Arial" font-weight="700">Get exclusive fare alerts</text>
  <text x="140" y="894" fill="#475569" font-size="24" font-family="Arial">No thanks, I like paying more</text>
  <text x="1120" y="1018" fill="#94a3b8" font-size="14" font-family="Arial">unsubscribe</text>
</svg>
`);

export function getVoyagoFixture(url: string): ExtractedPage {
  return {
    url,
    title: "Voyago | Goa Escape Deals",
    screenshot: {
      src: `data:image/svg+xml;charset=utf-8,${demoScreenshot}`,
      width: 1440,
      height: 1100,
    },
    elements: [
      {
        id: "hero-headline",
        kind: "text",
        text: "Explore Goa This Summer",
        bounds: { x: 110, y: 76, width: 690, height: 58 },
        isVisible: true,
        styles: { fontSize: 58, fontWeight: 700 },
      },
      {
        id: "fake-urgency-copy",
        kind: "text",
        text: "Only 2 rooms left at this price",
        bounds: { x: 110, y: 156, width: 480, height: 40 },
        isVisible: true,
        styles: { fontSize: 34, prominentColor: "#fde68a", fontWeight: 700 },
      },
      {
        id: "countdown-timer",
        kind: "timer",
        text: "Offer expires in 02:14",
        bounds: { x: 110, y: 212, width: 330, height: 32 },
        isVisible: true,
        styles: { fontSize: 28, prominentColor: "#e2e8f0" },
      },
      {
        id: "primary-booking-cta",
        kind: "button",
        text: "Book now",
        bounds: { x: 110, y: 276, width: 230, height: 62 },
        isVisible: true,
        styles: {
          fontSize: 28,
          fontWeight: 700,
          isPrimary: true,
          prominentColor: "#f97316",
        },
      },
      {
        id: "muted-secondary-cta",
        kind: "button",
        text: "View details",
        bounds: { x: 360, y: 286, width: 120, height: 34 },
        isVisible: true,
        styles: {
          fontSize: 16,
          opacity: 0.7,
          isMuted: true,
        },
      },
      {
        id: "signup-modal",
        kind: "modal",
        text: "Join Voyago Rewards",
        bounds: { x: 90, y: 470, width: 1260, height: 250 },
        isVisible: true,
        styles: { prominentColor: "#ffffff" },
        metadata: { interruptsFlow: true, autoOpened: true },
      },
      {
        id: "signup-button",
        kind: "button",
        text: "Sign up free",
        bounds: { x: 126, y: 580, width: 220, height: 54 },
        isVisible: true,
        styles: {
          fontSize: 25,
          fontWeight: 700,
          isPrimary: true,
          prominentColor: "#2563eb",
        },
      },
      {
        id: "close-icon",
        kind: "button",
        text: "Close modal",
        bounds: { x: 1278, y: 490, width: 24, height: 24 },
        isVisible: true,
        styles: { fontSize: 12, opacity: 0.65, isMuted: true },
      },
      {
        id: "newsletter-heading",
        kind: "text",
        text: "Get exclusive fare alerts",
        bounds: { x: 140, y: 820, width: 380, height: 36 },
        isVisible: true,
        styles: { fontSize: 30, fontWeight: 700 },
      },
      {
        id: "confirm-shaming-link",
        kind: "link",
        text: "No thanks, I like paying more",
        bounds: { x: 140, y: 872, width: 340, height: 24 },
        isVisible: true,
        styles: { fontSize: 24, opacity: 0.85, isMuted: true },
      },
      {
        id: "hidden-unsubscribe",
        kind: "link",
        text: "unsubscribe",
        bounds: { x: 1120, y: 1002, width: 80, height: 18 },
        isVisible: true,
        styles: { fontSize: 14, opacity: 0.35, isMuted: true },
      },
    ],
  };
}

export function getGenericFixture(url: string): ExtractedPage {
  return {
    url,
    title: "Scanned page",
    screenshot: {
      src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#f8fafc"/>
  <rect x="64" y="64" width="1152" height="592" rx="32" fill="#ffffff" stroke="#cbd5e1"/>
  <text x="120" y="170" fill="#0f172a" font-size="52" font-family="Arial" font-weight="700">UXRay Demo Scan</text>
  <text x="120" y="240" fill="#475569" font-size="28" font-family="Arial">No suspicious interface patterns were preloaded for this URL.</text>
</svg>
      `)}`,
      width: 1280,
      height: 720,
    },
    elements: [
      {
        id: "generic-title",
        kind: "text",
        text: "UXRay Demo Scan",
        isVisible: true,
        bounds: { x: 120, y: 120, width: 400, height: 60 },
        styles: { fontSize: 52, fontWeight: 700 },
      },
    ],
  };
}
