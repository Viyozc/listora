# Listora — 1-Page PRD

> Wedge validated 2026-07-21 (research/2026-07-21-etsy-ai-listing-tool-market-research.md → GO, wedge A).
> P0 landing + free audit built. This PRD locks the product decision before MVP.

---

## 1. Problem
Etsy digital-product sellers are discovered almost entirely through **searchable text** (title, 13 tags, description) — not photos. Yet most *guess* rather than engineer that text. A planner bundle can be 40+ listings, so manual optimization is effectively impossible. The result: listings that never rank, sales left on the table.

## 2. Wedge (decided)
**Vertical: digital-goods Listing generator** (printables, planners, templates, digital art, SVGs, clipart).
- Pure overseas, fully compliant, no Chinese cross-border complexity.
- Avoids the horizontal red ocean (eRank/Marmalead/EverBee already own keyword research; ListifyAI/ListsGenie own "photo→listing"). We win by going *deep* on one vertical's long-tail phrases.

## 3. Target user
Etsy digital-download sellers. Core paying segment = the ~900k "serious" sellers earning $2k+/mo. Non-technical, high listing volume, near-100% margin (no shipping/inventory) → SEO improvement pays back instantly.

## 4. Product
- **Input**: a few product bullets / rough description + optional target keyword.
- **Output**: optimized **title (≤140 chars)** + **13 tags** (multi-word, unique) + **SEO-rich description** + **0–100 score** with prioritized fix list.
- **Funnel**: free on-page Audit (built, P0) → free generator trial (N uses) → paid for unlimited / bulk catalog mode.

## 5. MVP scope (Next.js + Supabase + LLM)
- Generator API (LLM, single-gen cost **<$0.02**).
- Reuse P0 audit as top-of-funnel lead magnet.
- Email/waitlist capture (Web3Forms; Supabase for MVP).
- Dashboard: paste → generate → copy, with score before/after.
- **Out of MVP**: auth-heavy teams, multi-platform distribution, physical goods, Chinese cross-border.

## 6. Business model (to validate)
Freemium. Free audit + a small number of free generations; paid unlocks unlimited + bulk/catalog mode.
Industry benchmark pricing exists at $5.99–$79/mo; we anchor low ($9/mo or $19 one-time per bundle) to win the price-sensitive long tail, then tier up.

## 7. Validation gate (must clear before MVP build)
Deploy landing → run traffic ~2 weeks. Proceed to MVP **only if**:
- **≥ 200 audits run**, AND
- **≥ 50 email subscribers**.
Otherwise: iterate on message/wedge, do not build MVP yet.

## 8. Success metrics
1. Traffic (unique visitors to landing)
2. Audit runs (activation)
3. Email subscribers (intent)
4. (post-MVP) Paid conversion & MRR

## 9. Risks & mitigations
- **Horizontal competition**: stay vertical; own long-tail phrases competitors ignore.
- **Etsy ToS**: independent tool, never asks for Etsy login; clear "not affiliated" disclaimer.
- **LLM cost/quality**: cap generations, cache, use cheap model; quality gate on output.
- **AI-content compliance**: mark AI-assisted output; follow platform labeling rules.

## 10. Next actions
- [x] P0 landing + free audit (done 2026-07-21)
- [ ] Deploy + 2-week traffic validation (gate)
- [ ] P2 MVP dev (gated)
- [ ] P2 acquisition content (Xiaohongshu / YouTube, leveraging zc's accounts)
