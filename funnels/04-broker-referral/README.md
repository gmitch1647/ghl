# Funnel 04 — Affiliate / Referral Partner Program

Recruit and onboard people who can send us funding-qualified leads. Open program — brokers,
existing clients, and content creators all welcome under one set of terms.

## Offer in one line

> Refer a business that funds with us, get paid a percentage of the funded amount.

## Audience

| Segment | Source of referrals | Notes |
|---|---|---|
| Brokers / ISOs / loan officers | Their existing books | Highest-value referrers; expect fast payout and clean tracking |
| Existing clients | Personal network | Warm-trust referrals; need simple share tools |
| Content creators / small-biz influencers | Audience | Want swipe copy, links, social-friendly assets |

Same commission structure for all three — no separate tiers in v1. Revisit tiering after
30 funded affiliate deals.

## Components

1. **Landing page** — `landing-page.md`
2. **Signup form** — `signup-form.md`
3. **Affiliate agreement** — `agreement.md`
4. **GHL resources** (custom fields, tags, pipeline) — `ghl-resources.md`
5. **Onboarding email sequence** — `../../campaigns/affiliate-onboarding/`
6. **Workflow automation** — `../../workflows/affiliate-onboarding.md`
7. **Config** (commission %, payout schedule, links) — `config.md`

## Build status

- [x] Funnel structure + copy specced
- [x] Signup form fields specced
- [x] Agreement drafted
- [x] Email sequence written (7 emails)
- [x] Workflow spec written
- [ ] GHL resources created (custom fields, tags, pipeline stages)
- [ ] Landing page built in GHL page builder
- [ ] Signup form built in GHL
- [ ] Emails loaded into GHL campaign builder
- [ ] Workflow built in GHL workflow builder
- [ ] End-to-end test (submit fake signup → receive email 1 → confirm tracking)
- [ ] Owner approves agreement language with attorney before launch

## Open questions (resolve before launch)

1. Final commission percentage (see `config.md` — placeholder is 2%).
2. Payout cadence — net-30 after funded? net-15? On receipt of W-9? (see `config.md`)
3. Tax form requirement threshold (W-9 required from $0 or only above $600/yr?)
4. Who owns affiliate disputes (Gary alone, or a CS contact)?
5. Are existing clients eligible to earn commission on their own future deals? (Default: no.)
