# GHL Resources Needed — Affiliate Program

Everything that needs to be created in the Dream Gate Financial sub-account before
the funnel can be activated. Organized in build order.

## 1. Custom fields (contact)

All new fields. Add via Settings → Custom Fields → Folder: "Affiliate Program".

| Field name | Data type | Options | Purpose |
|---|---|---|---|
| Affiliate Type | RADIO | Broker / ISO / loan officer; Past or current client; Content creator / influencer; Small biz consultant / coach; Other | Set on signup |
| Affiliate Country | SINGLE_OPTIONS | United States; Other | Set on signup |
| Affiliate Audience | LARGE_TEXT | — | Free-text from signup |
| Affiliate Referral Volume | RADIO | 1–2; 3–5; 6–10; 10+; Not sure yet | Capacity estimate |
| Affiliate Prior Experience | RADIO | Yes — actively; Yes — but it's been a while; No — first time | Vetting signal |
| Affiliate Link | TEXT | — | Their IG/website/LinkedIn |
| Affiliate Notes | LARGE_TEXT | — | Anything else from signup |
| Affiliate Agreement Accepted | CHECKBOX | — | Required on form |
| Affiliate Eligibility Attested | CHECKBOX | — | Required on form |
| Affiliate ID | TEXT | — | Unique short code we generate (e.g., GM01, AB02). Used in tracking link `?aff=GM01` |
| Affiliate Status | SINGLE_OPTIONS | Pending; Approved; Active; Dormant; Suspended; Terminated | Workflow updates |
| Affiliate Approval Date | DATE | — | Set when status → Approved |
| Affiliate W9 Received | CHECKBOX | — | Set when W-9 collected |
| Affiliate Payout Method | SINGLE_OPTIONS | ACH; PayPal; Check | Collected after approval |
| Affiliate Payout Detail | TEXT | — | Account info encrypted in GHL secure note (do NOT store in plain field) |
| Affiliate Referred Count | NUMERICAL | — | Total leads referred (workflow increments) |
| Affiliate Funded Count | NUMERICAL | — | Total funded deals (workflow increments) |
| Affiliate Total Earned | MONETORY | — | Lifetime commission earned |
| Affiliate Total Paid | MONETORY | — | Lifetime commission paid |

**For referred contacts (funding leads who came in through an affiliate):**

| Field name | Data type | Purpose |
|---|---|---|
| Referring Affiliate ID | TEXT | Captured from `?aff=` URL param on funding landing page |
| Referring Affiliate Name | TEXT | Workflow looks up + fills from the referring contact |
| Affiliate Attribution Date | DATE | First touch — sets the 90-day window |
| Affiliate Commission Eligible | CHECKBOX | Workflow sets based on attribution + first-touch check |

Naming convention: prefix with `Affiliate` for affiliate-side fields, `Referring Affiliate`
for fields on the referred-contact side. Keeps them grouped alphabetically.

## 2. Tags

Add via Settings → Tags. Use lowercase to match existing convention.

**Affiliate side:**
- `affiliate-pending` — set on signup, before approval
- `affiliate-approved` — set on manual approval
- `affiliate-active` — has at least one funded referral
- `affiliate-dormant` — approved but no referral in 30 days
- `affiliate-suspended` — paused, may resume
- `affiliate-terminated` — permanent removal

**Affiliate type (one of):**
- `affiliate-broker`
- `affiliate-client`
- `affiliate-creator`
- `affiliate-consultant`
- `affiliate-other`

**Referred-lead side:**
- `referred-by-affiliate` — any lead with an affiliate attribution
- `referral-commission-eligible` — passed first-touch + attribution window check
- `referral-commission-paid` — workflow marks after payout

## 3. Pipeline changes

**Sales Pipeline - Funding Offer** (existing, ID `g2u4C0Z5A9ZAKBhxTBOu`) — no stage changes
needed. The funded stage `💰 Closed` is the trigger we use to fire the commission workflow.

**New pipeline (optional, v2):** "Affiliate Partners" — to visualize affiliate lifecycle.
Skip for v1; tags + status field are enough.

## 4. Custom values (account-level)

Settings → Custom Values. These get referenced in email templates and let us swap commission
% without editing every email.

| Custom value | Value | Used in |
|---|---|---|
| `affiliate_commission_rate` | `2%` | All affiliate emails + landing page |
| `affiliate_payout_cadence` | `net-30 from funded date` | Welcome email, FAQ email |
| `affiliate_minimum_payout` | `$50` | Welcome email |
| `affiliate_attribution_window` | `90 days` | How-it-works email |
| `affiliate_program_email` | `gmitch1647@gmail.com` | Footer of every affiliate email |
| `affiliate_program_phone` | `+1 (470) 981-3826` | Footer of every affiliate email |

## 5. Calendar (optional)

Consider creating a 15-minute "Affiliate Intro Call" calendar for new top-tier brokers.
v1: skip. Just respond to high-volume signups manually.

## 6. Forms

Build one form: **Affiliate Application** — fields per `signup-form.md`.
Build one separate form: **Affiliate W-9 + Payout Info** — sent only after approval.

## 7. Snippets / templates

Create a snippet for the affiliate email signature so it can be updated once and propagated:

```
— Gary Mitchell
Dream Gate Financial
{{custom_values.affiliate_program_email}} · {{custom_values.affiliate_program_phone}}
```

## Build order recommendation

1. Custom values (commission rate, etc.) — so everything else can reference them
2. Custom fields
3. Tags
4. Signup form
5. Landing page
6. Email templates (paste from `campaigns/affiliate-onboarding/`)
7. Workflow (per `workflows/affiliate-onboarding.md`)
8. End-to-end test with a fake email address
