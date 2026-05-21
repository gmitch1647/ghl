# Funnel 04 — Affiliate / Referral Partner Program

Recruit and onboard people who can send us funding-qualified leads. Open program — brokers,
existing clients, and content creators all welcome under one set of terms governed by the
**Dreamgate Affiliate Agreement** (`contract.docx`).

## Offer in one line

> Refer a business that funds with us. Once we collect our fee from the lender, you get
> paid 2% of the Amount Funded in our next weekly payout.

## Audience

| Segment | Source of referrals | Notes |
|---|---|---|
| Brokers / ISOs / loan officers | Their existing books | Highest-value referrers; expect fast payout and clean tracking |
| Existing clients | Personal network | Warm-trust referrals; need simple share tools |
| Content creators / small-biz influencers | Audience | Want swipe copy, links, social-friendly assets |

Same contract for all three.

## Components

1. **`contract.docx`** — the signed contract (source of truth). Affiliates e-sign this
   via GHL Documents & Contracts as part of Workflow 1.
2. **`contract.md`** — text version of the same contract, for code review.
3. **`config.md`** — single source of truth for commission %, payout cadence, attribution
   window. Plus the list of contract placeholders to resolve before launch.
4. **`landing-page.md`** — copy for `/affiliate`.
5. **`signup-form.md`** — application form spec. Collects everything the contract merge
   fields need.
6. **`ghl-resources.md`** — custom fields, tags, pipeline, custom values that need to exist
   in GHL before workflows run.
7. **`../../campaigns/affiliate-onboarding/`** — 7-email onboarding sequence sent after the
   affiliate signs the contract.
8. **`../../workflows/affiliate-onboarding.md`** — the 6 workflows that drive everything.

## Lifecycle

```
Apply (form submit)
  ↓
Workflow 1 → send contract via GHL Documents & Contracts (e-sign)
  ↓
Affiliate signs
  ↓
Workflow 2 → activate, generate Affiliate ID, send Welcome (email 1)
  ↓
Emails 2–6 over 10 days
  ↓
Day 14 — if no referred lead yet → email 7 (activation nudge)
  ↓
First referred lead → Workflow 3 (attribution + first-touch check)
  ↓
Deal funds → Workflow 4 (commission calculated, "pending receipt")
  ↓
Company collects fee from lender → Workflow 5 (commission released)
  ↓
Friday → Workflow 6 (weekly payout batch)
```

## Build status

**Spec phase — complete**

- [x] Funnel structure + landing-page copy
- [x] Signup form fields specced (includes contract-merge fields)
- [x] Real affiliate agreement uploaded (`contract.docx`)
- [x] `contract.md` text version saved for diffing
- [x] Email sequence written (7 emails)
- [x] Workflow spec written (6 workflows incl. contract e-sign and weekly payout)
- [x] Contract placeholders resolved (state, county, mailing address, signatory)

**GHL resources — done via `npm run build:affiliate`**

- [x] 8 custom values created (commission rate, payout cadence, contingency, etc.)
- [x] 29 custom fields created (Affiliate Title, Status, dates, counts, referred-side fields, etc.)
- [x] 17 tags created (lifecycle + type + referred-side)

**Manual UI work remaining (PIT auth can't cover these)**

- [ ] **Create pipeline "Affiliate Partners"** in GHL UI with 6 stages: Pending Application, Contract Sent, Active Affiliate, Stalled, Suspended, Terminated. (Build script returned 401 on `/opportunities/pipelines` — PIT doesn't have this scope.)
- [ ] Upload `contract.docx` to GHL Documents & Contracts as a template; sign the Company signature line once
- [ ] Build the Affiliate Application form (per `signup-form.md`)
- [ ] Build the W-9 + Payout Info form
- [ ] Build the landing page at `/affiliate` (per `landing-page.md`)
- [ ] Build the funding-side forms to capture `?aff=` URL param into `Referring Affiliate ID`
- [ ] Load 7 onboarding emails into GHL campaign builder
- [ ] Build 6 workflows (per `workflows/affiliate-onboarding.md`) as Draft
- [ ] End-to-end test (fake signup → signs contract → receives welcome → simulated funded deal)
- [ ] Workflows flipped from Draft → Published

## What I still need from Gary

Nothing blocking. All policy decisions resolved.

**Resolved:**
- Commission rate: 2% of Amount Funded (per signed contract §3, Schedule 1)
- Payout cadence: weekly, contingent on Company receipt of funds (per signed contract §3)
- Minimum payout: **$50**
- Self-referrals: **not allowed** — existing clients cannot earn on their own future deals
- Dispute / CS contact: **Gary** is sole point of contact
- Legal entity: Dreamgate Solutions LLC
- Brand on funding side: Dream Gate Financial (kept as marketing name)
- Contract §15 Governing law: Georgia
- Contract §16 Venue: Fulton County, Georgia
- Contract §25 Company mailing address: 8735 Dunwoody Place, Ste R, Atlanta, GA 30350
- Contract company signatory: Gary Mitchell, Managing Member
- Contract §25 Legal notices email: `affiliates@dreamgatesolutions.com` (stays in contract as long-term address; mailbox + domain mail can be set up later)
- **Operational from-sender (workflow emails, contract send, welcome, etc.):** `gmitch1647@gmail.com` for now. Switch to `affiliates@dreamgatesolutions.com` once that mailbox is live with DKIM/SPF/DMARC.
- Payout rail (v1): manual ACH/check; revisit Stripe Connect once volume justifies

**Contract status:** `contract.docx` is now fully populated and ready to upload as a GHL
Documents & Contracts template. The only remaining step before upload is Gary signing
the Company signature line once (becomes part of every affiliate's countersigned copy).
