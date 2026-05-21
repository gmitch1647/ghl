# GHL Resources Needed — Affiliate Program

Everything that needs to be created in the Dream Gate Financial sub-account before
the funnel can be activated. Organized in build order.

## 1. Custom fields (contact)

All new fields. Add via Settings → Custom Fields → Folder: "Affiliate Program".

| Field name | Field key (auto) | Data type | Options | Purpose |
|---|---|---|---|---|
| Affiliate Title | `affiliate_title` | TEXT | — | **Required by contract merge field `{{contact.title}}`** — the affiliate's business title/role. Collected on signup form. |
| Affiliate Type | `affiliate_type` | RADIO | Broker / ISO / loan officer; Past or current client; Content creator / influencer; Small biz consultant / coach; Other | Set on signup |
| Affiliate Country | `affiliate_country` | SINGLE_OPTIONS | United States; Other | Set on signup |
| Affiliate Audience | `affiliate_audience` | LARGE_TEXT | — | Free-text from signup |
| Affiliate Referral Volume | `affiliate_referral_volume` | RADIO | 1–2; 3–5; 6–10; 10+; Not sure yet | Capacity estimate |
| Affiliate Prior Experience | `affiliate_prior_experience` | RADIO | Yes — actively; Yes — but it's been a while; No — first time | Vetting signal |
| Affiliate Link | `affiliate_link` | TEXT | — | Their IG/website/LinkedIn |
| Affiliate Notes | `affiliate_notes` | LARGE_TEXT | — | Anything else from signup |
| Affiliate Eligibility Attested | `affiliate_eligibility_attested` | CHECKBOX | — | "I'm 18+ and US resident" — required on form |
| Affiliate ID | `affiliate_id` | TEXT | — | Unique short code generated post-application (e.g., `MI4729`). Used in tracking link `?aff=MI4729` |
| Affiliate Status | `affiliate_status` | SINGLE_OPTIONS | Pending Application; Contract Sent; Active; Stalled; Suspended; Terminated | Workflow updates |
| Affiliate Application Date | `affiliate_application_date` | DATE | — | Set on form submit |
| Affiliate Contract Sent Date | `affiliate_contract_sent_date` | DATE | — | Set when GHL Documents & Contracts sends |
| Affiliate Contract Signed Date | `affiliate_contract_signed_date` | DATE | — | Set when contract returned signed (= `{{contact.signed_date}}` in template) |
| Affiliate W9 Received | `affiliate_w9_received` | CHECKBOX | — | Set when W-9 collected (separate form post-signing) |
| Affiliate Payout Method | `affiliate_payout_method` | SINGLE_OPTIONS | ACH; PayPal; Check | Collected after signing |
| Affiliate Payout Detail | `affiliate_payout_detail` | TEXT | — | Account info — store sensitive parts in GHL secure note, not plain field |
| Affiliate Referred Count | `affiliate_referred_count` | NUMERICAL | — | Total leads referred (workflow increments) |
| Affiliate Funded Count | `affiliate_funded_count` | NUMERICAL | — | Total funded deals (workflow increments) |
| Affiliate Total Earned | `affiliate_total_earned` | MONETORY | — | Lifetime commission accrued |
| Affiliate Total Paid | `affiliate_total_paid` | MONETORY | — | Lifetime commission paid |

**Standard contact fields used by the contract merge:**
`firstName`, `lastName`, `email`, `address1`, `city`, `state`, `postalCode`. All
exist as GHL standard fields — the signup form collects them so the contract merges
cleanly without manual data entry.

**For referred contacts (funding leads who came in through an affiliate):**

| Field name | Field key | Data type | Purpose |
|---|---|---|---|
| Referring Affiliate ID | `referring_affiliate_id` | TEXT | Captured from `?aff=` URL param on funding landing page |
| Referring Affiliate Name | `referring_affiliate_name` | TEXT | Workflow looks up + fills from the referring contact |
| Affiliate Attribution Date | `affiliate_attribution_date` | DATE | First touch — sets the 90-day window |
| Affiliate Commission Eligible | `affiliate_commission_eligible` | CHECKBOX | Workflow sets based on attribution + first-touch check |
| Affiliate Commission Amount | `affiliate_commission_amount` | MONETORY | 2% × Amount Funded, calculated when deal closes |
| Affiliate Commission Pending Receipt | `affiliate_commission_pending_receipt` | CHECKBOX | True if deal funded but Company has NOT yet received its commission (contract §3 contingency) |
| Affiliate Commission Released | `affiliate_commission_released` | CHECKBOX | True once Company receives funds — triggers payout to affiliate |

Naming convention: prefix with `Affiliate` for affiliate-side fields, `Referring Affiliate`
for fields on the referred-contact side.

## 2. Tags

Add via Settings → Tags. Use lowercase to match existing convention.

**Affiliate lifecycle (one of, in order):**
- `new-affiliate` — set immediately on form submit (triggers contract send)
- `affiliate-agreement-sent` — set when contract has been sent for signature
- `affiliate-active` — set when contract is signed; this is when the welcome email + tracking link fire
- `affiliate-agreement-stalled` — set if contract is unsigned 14+ days after send
- `affiliate-dormant` — active but no referred lead in 30 days
- `affiliate-suspended` — paused, may resume
- `affiliate-terminated` — permanent removal (contract termination per §9)

**Affiliate type (one of, set from form field):**
- `affiliate-broker`
- `affiliate-client`
- `affiliate-creator`
- `affiliate-consultant`
- `affiliate-other`

**Referred-lead side:**
- `referred-by-affiliate` — any lead with an affiliate attribution
- `referral-commission-eligible` — passed first-touch + attribution window check
- `referral-commission-pending-receipt` — deal funded, awaiting Company payment from lender
- `referral-commission-released` — Company received funds; affiliate payout queued
- `referral-commission-paid` — payout sent to affiliate

## 3. Pipeline

**New pipeline: "Affiliate Partners"** — visualizes the affiliate lifecycle. Recommended
because the contract-send workflow needs a place to put contacts post-signing.

Stages (in order):
1. `Pending Application` — opportunity created on form submit
2. `Contract Sent` — moved here when GHL Documents & Contracts sends agreement
3. `Active Affiliate` — moved here on signature (referenced by setup doc)
4. `Stalled` — auto-moved if unsigned in 14 days
5. `Suspended`
6. `Terminated`

**Existing pipelines — no changes needed:**
- `Sales Pipeline - Funding Offer` (ID `g2u4C0Z5A9ZAKBhxTBOu`) — the `💰 Closed` stage
  triggers commission calculation on referred deals.

## 4. Custom values (account-level)

Settings → Custom Values. Email templates and landing page reference these so we can change
terms without editing every file.

| Custom value | Value | Used in |
|---|---|---|
| `company_legal_name` | `Dreamgate Solutions LLC` | Contract send emails, footer |
| `affiliate_commission_rate` | `2%` | All affiliate emails + landing page |
| `affiliate_payout_cadence` | `weekly, once funds are received by the Company` | Welcome email, FAQ email |
| `affiliate_payment_contingency` | `Payment is contingent on the Company actually receiving its commission from the lender in cleared funds.` | Onboarding emails 2 and 6 |
| `affiliate_attribution_window` | `90 days` | How-it-works email |
| `affiliate_program_email` | `gmitch1647@gmail.com` (or `affiliates@dreamgatesolutions.com` once set up) | Footer of every affiliate email |
| `affiliate_program_phone` | `+1 (470) 981-3826` | Footer of every affiliate email |

## 5. Documents & Contracts

GHL has a built-in **Documents & Contracts** feature (Payments → Documents & Contracts).
Upload `contract.docx` here as a reusable template.

**Steps:**
1. Resolve all `[STATE]`, `[COUNTY, STATE]`, `[Company Mailing Address]`, etc. placeholders
   first (see `config.md` → "Contract placeholders").
2. Upload the resolved .docx. GHL should auto-detect merge fields `{{contact.full_name}}`,
   `{{contact.address1}}`, `{{contact.city}}`, `{{contact.state}}`, `{{contact.postal_code}}`,
   `{{contact.email}}`, `{{contact.title}}`.
3. Place signature + date elements visually on the page where `{{contact.signature}}` and
   `{{contact.signed_date}}` appear.
4. If GHL rejects .docx, convert to PDF first: `soffice --headless --convert-to pdf contract.docx`
5. Note the document template ID — needed by the workflow Action "Send Document for Signature".

## 6. Forms

- **Affiliate Application** (per `signup-form.md`) — primary intake. Note: also collects
  `Affiliate Title` (`affiliate_title`) so the contract merge field has a value.
- **Affiliate W-9 + Payout Info** — sent only after contract is signed. Separate form.

## 7. Calendar (optional)

Skip for v1.

## 8. Snippets / templates

Email signature snippet:

```
— Gary Mitchell
Dreamgate Solutions LLC
{{custom_values.affiliate_program_email}} · {{custom_values.affiliate_program_phone}}
```

## Build order

1. Custom values (commission rate, etc.) — referenced by everything else
2. Custom fields (including `Affiliate Title`)
3. Tags
4. Pipeline "Affiliate Partners" with all stages
5. Signup form (Affiliate Application)
6. Landing page
7. **Resolve contract placeholders** (state, county, mailing address, etc.) and
   upload `contract.docx` to Documents & Contracts → get document template ID
8. Email templates (paste from `campaigns/affiliate-onboarding/`)
9. Workflows (per `workflows/affiliate-onboarding.md`) — built as Draft
10. End-to-end test with fake email — verify contract sends, signs, and tags fire
11. Flip workflows from Draft → Published
