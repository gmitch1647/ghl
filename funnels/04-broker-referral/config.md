# Affiliate Program — Config

> Single source of truth for the numbers. Update these BEFORE building emails/landing page
> in GHL, because the values are referenced verbatim by every other file in this funnel.

## Commission

| Setting | Value | Notes |
|---|---|---|
| Structure | Percentage of funded amount | Confirmed |
| Rate | **2.0%** | Confirmed. 2% of the gross funded amount on every Qualifying Referral. |
| Minimum payout | $50 | Below this we hold until next deal |
| Maximum per single deal | None | Open ceiling |
| Eligible products | Business funding only (MCA + 0% biz funding) | Credit repair NOT in v1 |

## Payout

| Setting | Value | Notes |
|---|---|---|
| Cadence | Net-30 from funded date | Funded date = deal moves to "💰 Closed" in Sales Pipeline - Funding Offer |
| Methods | ACH (Stripe / Wise), PayPal, Check (US only) | ACH preferred — fewer fees |
| W-9 required | Yes, before first payout | Required by IRS for $600+/yr but we collect upfront to avoid hold-ups |
| Statement frequency | Monthly via email | Workflow sends on the 1st |

## Attribution

| Setting | Value | Notes |
|---|---|---|
| Tracking method | Unique referral source string per affiliate, stored on the referred contact | Set via URL param `?aff=<affiliate_id>` on funding landing page |
| Attribution window | 90 days from first touch | Last-touch within window wins |
| Self-referrals | Not allowed | If affiliate's own email/phone matches submitted lead, flag for manual review |
| Existing-lead conflicts | First-touch wins | If contact already exists in GHL, no commission |

## Eligibility / disqualifiers

- Must be 18+, US resident (for now)
- Must complete signup form + agreement + W-9
- Cannot be a current Dream Gate Financial employee
- Existing clients eligible to refer OTHERS but cannot earn commission on their own future deals

## Links (replace with real values after pages built)

| Link | URL placeholder |
|---|---|
| Affiliate landing page | `https://[domain]/affiliate` |
| Affiliate signup form | `https://[domain]/affiliate/apply` |
| Affiliate agreement (public link) | `https://[domain]/affiliate/agreement` |
| Funding offer landing page (for referrals) | `https://[domain]/funding?aff=<affiliate_id>` |
| Affiliate dashboard (if/when built) | TBD — manual reporting via email in v1 |

## Brand voice (per project README)

Direct, results-focused, no fluff. Lead with money and action. Skip "We're excited to have you!"
openings — they belong in a different business.
