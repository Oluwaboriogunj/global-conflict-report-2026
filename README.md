# The World at War — March 2026

> An interactive editorial data-journalism page tracking all major global armed conflicts as of March 2026.

![Screenshot of The World at War report](static/images/preview.png)

---

## Overview

A fully self-contained, client-side web report built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — just open `index.html` in a browser.

**Features:**
- Animated hero section with scroll indicator
- Sticky masthead with scroll-shadow effect
- Active section navigation spy
- Intersection-observer-powered fade-up animations
- **Interactive conflict table** — filterable by Tier I / II / III, sortable by any column
- **6 interactive Chart.js charts**, each with toggle controls:
  - Global conflict trend — switch between line and bar view
  - Ukraine casualties — split vs stacked mode
  - Equipment losses — grouped vs loss-ratio mode
  - Monthly territorial gains/losses — filter by year
  - Iran war casualties — donut vs bar mode
  - Cumulative Russian territorial control
- Animated loading screen
- Fully responsive (mobile-friendly)
- All data in a single JSON file (`data/conflicts.json`) — easy to update

---

## Project Structure

```
world-at-war-2026/
├── index.html              # Main page
├── data/
│   └── conflicts.json      # All chart & table data
├── static/
│   ├── css/
│   │   └── style.css       # Full stylesheet
│   └── js/
│       └── main.js         # All interactivity & charts
├── charts/                 # (optional) Python-generated static PNGs
├── README.md
└── requirements.txt        # Python deps (for static chart generation)
```

---

## Quick Start

### Option 1 — Open directly in browser

```bash
git clone https://github.com/YOUR_USERNAME/world-at-war-2026.git
cd world-at-war-2026
open index.html   # macOS
# or: xdg-open index.html  (Linux)
# or: start index.html      (Windows)
```

> **Note:** Some browsers block `fetch()` on `file://` URLs. If charts don't load, use Option 2.

### Option 2 — Local dev server (recommended)

**Python:**
```bash
cd world-at-war-2026
python -m http.server 8080
# Open http://localhost:8080
```

**Node.js (npx):**
```bash
npx serve .
```

**VS Code:** Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension and click "Go Live".

---

## Updating Data

All data lives in `data/conflicts.json`. Edit it to update any chart or table value — no JavaScript knowledge needed.

```jsonc
{
  "conflicts": [
    {
      "name": "Russia – Ukraine",
      "region": "Eastern Europe",
      "tier": 1,          // 1, 2, or 3 — controls filter & badge colour
      "intensity": 100,   // 0–100 — controls bar width
      "status": "Year 4 — Attrition",
      "since": 2022
    }
    // ...
  ]
}
```

---

## Python Charts (static export)

The `world_at_war_2026.py` script regenerates all charts as high-resolution PNGs using matplotlib — useful for print or embedding elsewhere.

```bash
pip install -r requirements.txt
python world_at_war_2026.py
# Output: ./war_charts/
```

---

## Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| [Chart.js](https://www.chartjs.org/) | 4.4.1 | Interactive charts (CDN) |
| [Google Fonts](https://fonts.google.com/) | — | Playfair Display, Source Serif 4, DM Sans (CDN) |
| [matplotlib](https://matplotlib.org/) | ≥3.8 | Static PNG export (Python only) |
| [numpy](https://numpy.org/) | ≥1.26 | Static PNG export (Python only) |

No npm. No build step. No framework.

---

## Data Sources

- [Council on Foreign Relations Preventive Priorities Survey 2026](https://www.cfr.org/report/preventive-priorities-survey-2026)
- [Center for Strategic and International Studies (CSIS), January 2026](https://www.csis.org)
- [Russia Matters / Institute for the Study of War (ISW)](https://www.understandingwar.org/)
- [Al Jazeera, February 2026](https://www.aljazeera.com)
- [ICRC Humanitarian Outlook 2026](https://www.icrc.org)
- [Britannica — 2026 Iran War](https://www.britannica.com)
- [ACLED Armed Conflict Location & Event Data](https://acleddata.com)
- OHCHR Ukraine Civilian Casualties Report

> **Disclaimer:** All casualty figures are estimates. Methodology varies by source. Military casualty counts are particularly difficult to verify independently.

---

## License

MIT — free to use, adapt, and redistribute with attribution.
