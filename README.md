# Listora — Etsy Listing SEO Audit (landing + free hook)

Zero-cost validation landing page for an Etsy **digital-product** listing optimizer.
Wedge: vertical digital-goods Listing generator (per research `research/2026-07-21-etsy-ai-listing-tool-market-research.md`, wedge A — pure overseas, compliant).

This is the **P0 validation artifact**: a working on-page "Listing SEO Audit" that scores any Etsy listing
0–100 against the signals Etsy search rewards, plus an email capture to collect demand signals.
No backend, no LLM cost — runs 100% in the browser.

## What's inside
- `index.html` — landing page (hero, audit tool, how-it-works, why digital sellers, FAQ).
- `assets/style.css` — responsive styling (Etsy-warm palette).
- `assets/audit.js` — the SEO scoring engine + email capture (Formspree free tier, demo fallback).

## Run locally
```bash
cd etsy-listing-ai
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to GitHub Pages (zero cost, real URL)
GitHub connector is connected, so this is the fastest path to a live test URL.

```bash
cd etsy-listing-ai
git init && git add -A && git commit -m "Listora landing + free audit hook"
gh repo create listora --public --source=. --push
# In repo Settings → Pages → deploy from branch main / root
```

## Activate real email capture
The audit + lead capture works out of the box in **demo mode** (leads saved to `localStorage`).
To receive real emails (Formspree free tier, no payment):
1. Get a FREE form ID at https://formspree.io
2. In `assets/audit.js` and `index.html`, replace `YOUR_FORMSPREE_FORM_ID` with your form ID.

## Validation gate (from research)
Ship traffic for ~2 weeks. Proceed to MVP (Next.js + Supabase + LLM) if:
- ≥ 200 audits run, AND
- ≥ 50 email subscribers.

## Next steps
- P1: write 1-page PRD (vertical digital-goods Listing generator: title + 13 tags + description + SEO score).
- P2: MVP dev (Next.js + Supabase + LLM, single-generation cost < $0.02).
- P2: acquisition content on Xiaohongshu / YouTube leveraging zc's existing accounts.
