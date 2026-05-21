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

- [x] Funnel structure + landing-page copy
- [x] Signup form fields specced (includes contract-merge fields)
- [x] **Real affiliate agreement uploaded** (`contract.docx` from Gary)
- [x] `contract.md` text version saved for diffing
- [x] Email sequence written (7 emails)
- [x] Workflow spec written (6 workflows incl. contract e-sign and weekly payout)
- [x] Contract placeholders resolved (state, county, mailing address, signatory)
- [ ] Final `.docx` uploaded to GHL Documents & Contracts as a template (needs Gary's one-time Company e-signature on the template before publishing)
- [ ] GHL custom fields, tags, custom values, pipeline created
- [ ] Signup form built in GHL
- [ ] Landing page built in GHL page builder
- [ ] Emails loaded into GHL campaign builder
- [ ] Workflows built in GHL workflow builder (as Draft)
- [ ] End-to-end test (fake signup → signs contract → receives welcome → simulated funded deal)
- [ ] Workflows flipped from Draft → Published

## What I still need from Gary before this can go live

1. **Email infrastructure** — `affiliates@dreamgatesolutions.com` mailbox + DKIM/SPF/DMARC for `dreamgatesolutions.com` so contract-send emails don't go to spam.
2. **Minimum payout amount** — contract is silent; pick a number (default placeholder: $50).
3. **Existing clients earning on own deals** — default is no; confirm.
4. **CS/dispute contact** — Gary alone, or someone else?

**Resolved:**
- Commission rate: 2% of Amount Funded (per signed contract §3, Schedule 1)
- Payout cadence: weekly, contingent on Company receipt of funds (per signed contract §3)
- Legal entity: Dreamgate Solutions LLC
- Brand on funding side: Dream Gate Financial (kept as marketing name)
- Contract §15 Governing law: Georgia
- Contract §16 Venue: Fulton County, Georgia
- Contract §25 Company mailing address: 8735 Dunwoody Place, Ste R, Atlanta, GA 30350
- Contract company signatory: Gary Mitchell, Managing Member
- From-sender: `affiliates@dreamgatesolutions.com` (placeholder is `gmitch1647@gmail.com` until mailbox is live)
- Payout rail (v1): manual ACH/check; revisit Stripe Connect once volume justifies

**Contract status:** `contract.docx` is now fully populated and ready to upload as a GHL
Documents & Contracts template. The only remaining step before upload is Gary signing
the Company signature line once (becomes part of every affiliate's countersigned copy).
