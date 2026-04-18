# Pawan Engineering · Business Copilot

A grounded AI copilot + dashboard demo for **Pawan Engineering** (workbook entity: *Infinity Die Tools*), built by **ARQ ONE AI Labs**.

All figures are parsed from the supplied FY 25-26 sales and purchase workbooks. No invented numbers.

## What's inside

- **Founder dashboard** — KPI cards, monthly sales vs purchases, gross profit trend, top customers / vendors / products / input materials, auto-flagged alerts, data quality notes.
- **WhatsApp-style AI Copilot** — Hinglish chat assistant grounded in the actual books. Answers questions like "Top 5 customers", "March mein kya hua?", "Yash Seals ke baare mein", etc.

## Tech

Plain HTML + CSS + vanilla JavaScript. No build step. No framework. No external chart library — charts are hand-rolled SVG with hover tooltips.

The only network request is for the Inter font from Google Fonts. Everything else is local.

## File structure

```
pawan-copilot-demo/
├── index.html       # entry point
├── styles.css       # WhatsApp white + green theme
├── app.js           # rendering + copilot logic + custom SVG charts
├── data.js          # all parsed business data (single source of truth)
├── vercel.json      # Vercel static deploy config
└── README.md        # this file
```

## Run locally

**Option A — easiest:** double-click `index.html`. It opens in any modern browser. Done.

**Option B — local server (recommended for clean preview):**

```bash
# Python
python3 -m http.server 8080
# then open http://localhost:8080

# OR Node
npx serve .
```

## Deploy to Vercel

Three options, pick whichever you prefer:

**1. Drag & drop**
- Go to https://vercel.com/new
- Drag the `pawan-copilot-demo` folder into the upload area
- Click **Deploy**. Done.

**2. Vercel CLI**
```bash
npm i -g vercel
cd pawan-copilot-demo
vercel
# follow prompts; accept defaults
```

**3. GitHub → Vercel**
- Push this folder to a GitHub repo
- Import the repo on Vercel — it auto-detects as a static site
- Deploy

No build command, no output directory — `vercel.json` handles everything.

## Updating the data

All numbers live in `data.js`. To refresh with new books, replace the values in `window.PE_DATA`. The UI re-renders automatically.

If you want me (ARQ ONE) to wire up an Excel upload that auto-parses and refreshes the dashboard, that's a natural next step.

## Next enhancements ARQ ONE can offer

- **Live Excel upload** — drop a new monthly file, dashboard refreshes automatically
- **Real LLM-backed copilot** — replace the deterministic answer logic with a small Claude-powered backend that can answer arbitrary questions over the books
- **WhatsApp delivery** — same copilot, delivered as a real WhatsApp Business agent the founder can chat with directly
- **Anomaly auto-alerts** — daily summary delivered to WhatsApp at 9am: what changed, what to check
- **Receivables / payables module** — when invoice + payment data is provided, add cashflow timing and outstanding tracking
- **Margin by product / customer** — when costing data is added, drill into where the real profit comes from

## Credits

Built by **ARQ ONE AI Labs** · grounded in the supplied workbooks.

Demo only. Figures show trading-level gross — overheads (salaries, rent, electricity, transport, finance, tax) are not modelled.
