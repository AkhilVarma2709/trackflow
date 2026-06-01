# TrackFlow

### Know what your competitors are doing. Before they do it to you.

---

## The Problem

Every founder has been there.

You're heads down building. Shipping. Focused.

Then one day a competitor launches the exact feature you were planning.
Raises a round you didn't see coming. Hires the VP of Sales from your
biggest customer. Cuts their pricing by 30%.

You find out on Twitter. Three weeks late.

Not because you weren't paying attention. Because manually tracking
competitors is a full time job nobody has time for.

Enterprise teams pay $1,000/month for tools like Crayon and Klue.
Everyone else just hopes they don't miss anything important.

TrackFlow is the gap in between.

---

## What TrackFlow Does

Add any company. TrackFlow researches it automatically across 6 sources:

- **Website** — positioning, features, pricing, messaging changes
- **Changelog** — every product update they ship
- **Hiring** — what roles they're filling and what it signals
- **LinkedIn** — headcount, growth, team changes
- **Web Search** — latest news, funding, partnerships, press
- **Twitter/X** — real-time announcements and reactions

Groq's Llama 3.3 70B synthesises everything into a structured
intelligence report with zero hallucinations — only what the data
actually says.

Every report gives you:

| Section | What it tells you |
|---|---|
| Overview | What they do and who they serve |
| Website Signals | How they're positioning and what changed |
| Hiring Signals | Where they're investing their headcount |
| LinkedIn Signals | Team size and growth trajectory |
| Twitter Signals | What they're saying publicly right now |
| Recent News | Funding, launches, partnerships, press |
| Key Intelligence | 5 critical insights from all sources |
| Strategic Summary | The full picture in plain language |

---

## How It Works

```
You add a company
      ↓
TrackFlow scrapes their website, changelog, and careers page
simultaneously searches LinkedIn, Twitter, and web news
      ↓
All sources fed to Groq (Llama 3.3 70B)
with strict anti-hallucination prompting
      ↓
Structured intelligence report saved to your dashboard
      ↓
Refresh anytime. History kept.
```

Research that took 3 hours manually now takes 90 seconds.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + TanStack Router + TanStack Start |
| Styling | Tailwind CSS + Framer Motion |
| Database + Auth | Supabase |
| Web Scraping | Firecrawl |
| AI Search | Tavily |
| AI Synthesis | Groq (Llama 3.3 70B) |
| Deployment | Vercel |

---

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/yourusername/trackflow.git
cd trackflow
npm install
```

**2. Set up environment variables**

Copy .env.example to .env.local and fill in your keys:
```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| VITE_SUPABASE_URL | supabase.com → Project Settings → API |
| VITE_SUPABASE_ANON_KEY | supabase.com → Project Settings → API |
| VITE_FIRECRAWL_API_KEY | firecrawl.dev → API Keys |
| VITE_GROQ_API_KEY | console.groq.com → API Keys |
| VITE_TAVILY_API_KEY | tavily.com → API Keys |

**3. Set up Supabase**

Run the SQL in supabase-schema.sql in your Supabase SQL editor.
This creates the companies and reports tables with Row Level Security.

**4. Run locally**
```bash
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts          ← Supabase client
│   ├── companies.ts         ← Company CRUD operations
│   └── research/
│       ├── scrape.ts        ← Firecrawl scraping
│       ├── tavily.ts        ← Tavily search
│       ├── synthesise.ts    ← Groq synthesis
│       └── pipeline.ts      ← Research orchestrator
├── hooks/
│   ├── useAuth.ts           ← Auth state
│   └── useResearch.ts       ← Pipeline status polling
├── routes/
│   ├── index.tsx            ← Landing page
│   ├── login.tsx            ← Login
│   ├── signup.tsx           ← Signup
│   └── dashboard/
│       ├── index.tsx        ← Dashboard
│       ├── companies/
│       │   └── [id].tsx     ← Company report
│       ├── reports.tsx      ← Reports history
│       └── alerts.tsx       ← Intelligence alerts
└── server/
    └── research.ts          ← Server functions
```

---

## Anti-Hallucination Design

Most AI tools make things up when data is missing.

TrackFlow doesn't.

Every Groq prompt is built with strict grounding rules:
- Only use information explicitly present in the provided sources
- If a field has no data return exactly: "No data available"
- Never infer, assume, speculate, or fill gaps
- Every statement must be traceable to a specific source
- Sources are cited inline on every intelligence point

If TrackFlow can't find something, it says so.
That honesty is the product.

---

## Deployment

TrackFlow deploys to Vercel in one click.

Push to GitHub → connect to Vercel → add environment
variables → deploy.

All API calls run client-side. No serverless functions needed.
Vercel free tier is sufficient for personal and demo use.

---

## Built By

Built by Vegesna Naga Venkata Akhil Varma — first year CS student
at BITS Pilani via NXTWAVE, Hyderabad.

Part of the BRAVE challenge — building real products and finding
real clients while in college.

Portfolio: akhilvarma-potfolio.vercel.app
LinkedIn: linkedin.com/in/akhilvarmavegesna
Email: akhilvarma270908@gmail.com

---

## License

MIT — use it, fork it, build on it.
