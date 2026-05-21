# Affiliate Signup Form — Spec

URL: `/affiliate/apply`
GHL object: Form (NOT Survey — one-page, fast submit)
Submit action: Create/update contact + tag `new-affiliate` + trigger Workflow 1 (which
sends the Dreamgate Affiliate Agreement for e-signature)

## Why these specific fields

The Dreamgate Affiliate Agreement uses merge fields that pull from the contact record
(`{{contact.full_name}}`, `{{contact.address1}}`, `{{contact.city}}`,
`{{contact.state}}`, `{{contact.postal_code}}`, `{{contact.email}}`, `{{contact.title}}`).
Every one of those needs to be populated BEFORE the workflow can send the contract for
signature — otherwise the contract is emailed with blanks where addresses should be. So
every merge-field input is required on this form.

## Fields (in order)

| # | Label | Type | Required | GHL field | Notes |
|---|---|---|---|---|---|
| 1 | First name | TEXT | Yes | Standard `firstName` | Merges into `{{contact.full_name}}` |
| 2 | Last name | TEXT | Yes | Standard `lastName` | Merges into `{{contact.full_name}}` |
| 3 | Email | EMAIL | Yes | Standard `email` | Contract sent here for signature |
| 4 | Mobile phone | PHONE | Yes | Standard `phone` | SMS-capable; we send commission alerts via SMS |
| 5 | Business / personal title | TEXT | Yes | Custom `affiliate_title` | **Required for contract merge field `{{contact.title}}`**. Example: "Loan Broker", "Founder", "Content Creator", "Self" |
| 6 | Street address | TEXT | Yes | Standard `address1` | Required for contract §25 Notices |
| 7 | City | TEXT | Yes | Standard `city` | Required for contract §25 Notices |
| 8 | State | SINGLE_OPTIONS | Yes | Standard `state` | US states dropdown |
| 9 | ZIP code | TEXT | Yes | Standard `postalCode` | 5 digits |
| 10 | Country | SINGLE_OPTIONS | Yes | Custom `affiliate_country` | Options: United States, Other (Other → auto-decline in v1) |
| 11 | Which best describes you? | RADIO | Yes | Custom `affiliate_type` | Options: Broker / ISO / loan officer, Past or current client, Content creator / influencer, Small biz consultant / coach, Other |
| 12 | What's your audience or network? | LARGE_TEXT | Yes | Custom `affiliate_audience` | One paragraph. We're filtering quality here. |
| 13 | How many business owners can you realistically refer in a month? | RADIO | Yes | Custom `affiliate_referral_volume` | Options: 1–2, 3–5, 6–10, 10+, Not sure yet |
| 14 | Have you referred business funding before? | RADIO | Yes | Custom `affiliate_prior_experience` | Options: Yes — actively, Yes — but it's been a while, No — first time |
| 15 | Website, IG, LinkedIn, or other link (optional) | TEXT | No | Custom `affiliate_link` | |
| 16 | Anything else we should know? | LARGE_TEXT | No | Custom `affiliate_notes` | |
| 17 | I'm 18+ and a US resident | CHECKBOX | Yes | Custom `affiliate_eligibility_attested` | |
| 18 | I understand the next step is signing the Dreamgate Affiliate Agreement via the email I'll receive | CHECKBOX | Yes | Custom `affiliate_signup_acknowledged` | Replaces the "agree to terms" checkbox — actual legal acceptance happens at e-signature, not here |

## Hidden fields

| Field | Source | Purpose |
|---|---|---|
| `utm_source` | URL param | Attribution for affiliate-signup traffic |
| `utm_medium` | URL param | |
| `utm_campaign` | URL param | |
| `referrer_url` | JS injection | Where they came from |

## On submit

1. Create/update contact in GHL.
2. Tag contact: `new-affiliate` (+ tag for type derived from field 11: `affiliate-broker` /
   `affiliate-client` / `affiliate-creator` / `affiliate-consultant` / `affiliate-other`).
3. Trigger workflow: Workflow 1 — Application Received (see
   `../../workflows/affiliate-onboarding.md`).
4. Redirect to `/affiliate/thanks` confirmation page (copy below).

## Confirmation page copy

**Headline:** Got it. Check your email for the agreement.

**Body:**
In the next few minutes, you'll get an email from {{custom_values.affiliate_program_email}}
with the Dreamgate Affiliate Agreement. Read it, sign it electronically, and you're in.

The agreement covers:

- 2% commission on every Funded Transaction
- Weekly payouts (Fridays) once we've collected on the deal
- Standard independent-contractor terms

After you sign, you'll get a second email with your unique tracking link, swipe pack,
and W-9 instructions.

If the agreement email doesn't show up in 10 minutes, check spam. Still nothing? Reply
to me directly: {{custom_values.affiliate_program_email}}.

— Gary Mitchell, Dreamgate Solutions LLC

**Optional CTA:** `Check your inbox →` (mailto link)

## Validation rules

- Email: standard email regex + reject disposable domains (mailinator, 10minutemail, guerrillamail)
- Phone: must be valid format (libphonenumber if GHL supports), default country US
- ZIP: 5-digit US ZIP regex
- All required fields enforced client-side AND server-side (GHL handles)
- Anti-spam: hCaptcha or GHL's native bot protection enabled

## What we are NOT collecting at signup

- W-9 / SSN / EIN → collected after contract is signed, via separate document upload link
- Banking info → collected after contract is signed, via secure ACH form (Stripe Connect or similar)
- Signature on the agreement → handled by GHL Documents & Contracts e-sign in Workflow 1, NOT this form

Keeping the signup form lean keeps completion rate high. Everything sensitive is gated
behind a signed contract.
