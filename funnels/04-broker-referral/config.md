# Affiliate Program — Config

> Single source of truth for the numbers. Update these BEFORE building emails/landing page
> in GHL, because the values are referenced verbatim by every other file in this funnel.
> All terms here must match `contract.md` / `contract.docx` — the signed contract wins
> if anything drifts.

## Legal entity vs. brand

| | Value |
|---|---|
| Legal entity (on contract) | **Dreamgate Solutions LLC** |
| Brand / GHL location name | Dream Gate Financial |
| GHL location ID | `74naFh22UD4L1rfbPFMP` |

Affiliate-facing materials should generally use "Dreamgate Solutions" or "Dreamgate" to
match the contract. "Dream Gate Financial" stays as the public marketing brand on the
funding side.

## Commission

| Setting | Value | Source |
|---|---|---|
| Structure | Percentage of Amount Funded | Contract §3 |
| Rate | **2.0%** | Contract §3, Schedule 1 |
| Eligible products | Business funding (Funded Transactions only) | Contract §1(b), §3 |
| Contingency | **Payment contingent on Company actually receiving its commission in cleared funds** | Contract §3 — strict |
| Clawback / offset | Yes — refunds, chargebacks, defaults, lender clawbacks reverse the Fee | Contract §3 |

## Payout

| Setting | Value | Source |
|---|---|---|
| Cadence | **Weekly** — once corresponding funds received by Company | Contract §3, Schedule 1 |
| Methods | TBD — confirm with Gary. Default ACH, PayPal, Check (US only) | Not in contract |
| Minimum payout | TBD — confirm with Gary (was $50 placeholder; contract is silent) | Not in contract |
| W-9 / W-8 required | Yes — payment may be suspended pending receipt | Contract §3 |
| 1099-NEC | Issued by Jan 31 if annual Fees ≥ $600 | Standard IRS |

## Attribution

| Setting | Value | Notes |
|---|---|---|
| Tracking method | Unique referral Link per affiliate (URL param `?aff=<affiliate_id>` on funding landing pages) | Contract §1(d), §2 |
| Link integrity | If affiliate modifies or improperly installs Link, no Fee | Contract §2, Schedule 1 |
| Attribution window | 90 days from first touch (our policy — not in contract) | Internal policy |
| Self-referrals | Not allowed — affiliate cannot earn on own deals | Internal policy |
| Existing-lead conflicts | First-touch wins | Internal policy |

## Eligibility / disqualifiers

- Must be 18+, US resident (for now)
- Must complete signup form + sign the Dreamgate Affiliate Agreement (contract.docx)
- Must submit W-9 before first payout
- Cannot be a current Dreamgate Solutions employee
- Existing clients may refer others but cannot earn commission on their own deals

## Contract placeholders to fill before launch

The contract.docx is final on terms but has these template placeholders. Resolve all of
these and regenerate the .docx (or have Gary update the source) before uploading to GHL
Documents & Contracts:

| Placeholder | Where | Suggested value | Needs from Gary |
|---|---|---|---|
| `[Company Mailing Address]` | §25 Notices | 1647 Watersprings Way (from GHL location) — confirm | ✅ confirm |
| `[City, State, ZIP]` | §25 Notices | Dacula, GA 30019 — confirm | ✅ confirm |
| `affiliates@dreamgatesolutions.com` | §25 Notices | Decide: real `affiliates@` inbox OR use `gmitch1647@gmail.com` | ✅ decide |
| `[STATE]` (governing law) | §15 | Likely Georgia (based on location) | ✅ confirm |
| `[COUNTY, STATE]` (venue) | §16 | Likely Gwinnett County, Georgia | ✅ confirm |
| Company signature block | end of doc | Gary signs as Authorized Rep — provide printed name + title | ✅ provide |

## Links (replace with real values after pages built)

| Link | URL placeholder |
|---|---|
| Affiliate landing page | `https://[domain]/affiliate` |
| Affiliate signup form | `https://[domain]/affiliate/apply` |
| Funding offer landing page (referral target) | `https://[domain]/funding?aff=<affiliate_id>` |
| Affiliate dashboard | TBD — manual reporting in v1 |

## GHL Custom Values (account-level — referenced from emails + landing page)

| Custom value key | Value |
|---|---|
| `affiliate_commission_rate` | `2%` |
| `affiliate_payout_cadence` | `weekly, once funds are received by the Company` |
| `affiliate_payment_contingency` | `Payment is contingent on the Company actually receiving its commission from the lender in cleared funds.` |
| `affiliate_attribution_window` | `90 days` |
| `affiliate_program_email` | `gmitch1647@gmail.com` (or `affiliates@dreamgatesolutions.com` once set up) |
| `affiliate_program_phone` | `+1 (470) 981-3826` |
| `company_legal_name` | `Dreamgate Solutions LLC` |

## Brand voice (per project README)

Direct, results-focused, no fluff. Lead with money and action. Skip "We're excited to have you!"
openings — they belong in a different business.
