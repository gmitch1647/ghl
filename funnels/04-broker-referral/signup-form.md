# Affiliate Signup Form — Spec

URL: `/affiliate/apply`
GHL object: Form (NOT Survey — we want one-page, fast submit)
Submit action: Create/update contact + tag `affiliate-pending` + trigger workflow

## Fields (in order)

| # | Label | Type | Required | GHL field | Notes |
|---|---|---|---|---|---|
| 1 | First name | TEXT | Yes | Standard `firstName` | |
| 2 | Last name | TEXT | Yes | Standard `lastName` | |
| 3 | Email | EMAIL | Yes | Standard `email` | Used for all program comms |
| 4 | Mobile phone | PHONE | Yes | Standard `phone` | SMS-capable; we send commission alerts via SMS |
| 5 | Country | SINGLE_OPTIONS | Yes | Custom `affiliate_country` | Options: United States, Other (Other → auto-decline in v1) |
| 6 | State (if US) | SINGLE_OPTIONS | Conditional | Standard `state` | Show only if Country = US |
| 7 | Which best describes you? | RADIO | Yes | Custom `affiliate_type` | Options: Broker / ISO / loan officer, Past or current client, Content creator / influencer, Small biz consultant / coach, Other |
| 8 | What's your audience or network? | LARGE_TEXT | Yes | Custom `affiliate_audience` | One paragraph. We're filtering quality here. |
| 9 | How many business owners can you realistically refer in a month? | RADIO | Yes | Custom `affiliate_referral_volume` | Options: 1–2, 3–5, 6–10, 10+, Not sure yet |
| 10 | Have you referred business funding before? | RADIO | Yes | Custom `affiliate_prior_experience` | Options: Yes — actively, Yes — but it's been a while, No — first time |
| 11 | Website, IG, LinkedIn, or other link (optional) | TEXT | No | Custom `affiliate_link` | |
| 12 | Anything else we should know? | LARGE_TEXT | No | Custom `affiliate_notes` | |
| 13 | I have read and agree to the Affiliate Agreement | CHECKBOX | Yes | Custom `affiliate_agreement_accepted` | Link to `/affiliate/agreement` opens in new tab |
| 14 | I'm 18+ and a US resident | CHECKBOX | Yes | Custom `affiliate_eligibility_attested` | |

## Hidden fields

| Field | Source | Purpose |
|---|---|---|
| `utm_source` | URL param | Attribution for affiliate-signup traffic |
| `utm_medium` | URL param | |
| `utm_campaign` | URL param | |
| `referrer_url` | JS injection | Where they came from |

## On submit

1. Create/update contact in GHL.
2. Tag contact: `affiliate-pending` (+ tag for type: `affiliate-broker` / `affiliate-client` / `affiliate-creator` / etc. derived from field 7).
3. Trigger workflow: `affiliate-onboarding` (see `../../workflows/affiliate-onboarding.md`).
4. Redirect to `/affiliate/thanks` confirmation page (copy below).

## Confirmation page copy

**Headline:** Got it. We'll review and respond within one business day.

**Body:**
You'll get an email at the address you provided. If you're approved, that email contains:

- Your unique tracking link
- The swipe copy pack
- W-9 instructions for payout

If we have questions, we'll email or text you first.

— Gary Mitchell, Dream Gate Financial

**Optional CTA:** `Check your inbox →` (dummy button, opens default mail client to `mailto:`)

## Validation rules

- Email: standard email regex + reject disposable domains (mailinator, 10minutemail, guerrillamail)
- Phone: must be valid format (libphonenumber if GHL supports), default country US
- All required fields enforced client-side AND server-side (GHL handles)
- Anti-spam: hCaptcha or GHL's native bot protection enabled

## What we are NOT collecting at signup

- W-9 / SSN / EIN → collected after approval, via separate document upload link
- Address → collected after approval (only needed for check payouts)
- Banking info → collected after approval, via secure ACH form (Stripe Connect or similar)

Keeping the signup form short = higher application completion rate.
