# Build Playbook — Affiliate Program

Execute these steps in order. Each step depends on the ones before it. With everything
in front of you, end-to-end is roughly **90 minutes of UI work**.

The data-model layer (custom values, fields, tags) is already live — provisioned via
`npm run build:affiliate`. This playbook covers the builder-content layer that the v2
API can't reach with PIT auth (pipelines, forms, pages, emails, workflows, document
templates).

---

## Step 1 — Pipeline (1 min)

**Path:** Opportunities → Pipelines → New Pipeline

- Name: `Affiliate Partners`
- Stages (add in this order):
  1. `Pending Application`
  2. `Contract Sent`
  3. `Active Affiliate`
  4. `Stalled`
  5. `Suspended`
  6. `Terminated`
- Save.

**Verify:** `npm run test:connection` and confirm "Affiliate Partners" shows in the
Pipelines list with 6 stages.

---

## Step 2 — Upload contract template (3 min)

**Path:** Payments → Documents & Contracts → Templates → New Template

- Upload: `funnels/04-broker-referral/contract.docx`
- Template name: `Dreamgate Affiliate Agreement`
- Place merge tags on the document where the affiliate signs/dates/initials:
  - Affiliate Signature → `{{contact.signature}}` block
  - Affiliate Printed Name → already pre-merged in the .docx via `{{contact.full_name}}`
  - Affiliate Date → `{{contact.signed_date}}`
- **One-time:** Sign the Company signature line at the bottom (Gary's signature). This
  signature becomes part of every affiliate's countersigned copy — you only do this once.
- Save & Publish.

**Verify:** Send a test agreement to yourself; confirm it arrives with your signature
already on it and the affiliate-side blocks are mergeable.

---

## Step 3 — Affiliate-tracker JS (1 min)

**Path:** Sub-Account Settings → Business Profile → Tracking Code → Footer Tracking Code

- Paste the contents of `funnels/04-broker-referral/snippets/aff-tracker.js`
  wrapped in `<script>…</script>` tags.
- Save.

**What this does:** captures `?aff=<id>` from URL on any page across the sub-account,
saves it to a 90-day first-party cookie (`dgf_aff`), then prefills `Referring Affiliate
ID` and `Affiliate Attribution Date` on every GHL form iframe loaded on subsequent pages.
First-touch wins.

**Verify:** Open `https://dreamgatefinancial.com/?aff=TEST-001`, then navigate to any
funding form. Open browser devtools → Application → Cookies. Confirm `dgf_aff=TEST-001`
exists. Submit the form with a fake email; confirm the resulting contact has
`Referring Affiliate ID = TEST-001`.

---

## Step 4 — Affiliate Application form (10 min)

**Path:** Sites → Forms → New Form → Blank Form
**Name:** `Affiliate Application`

Add the 18 fields per `funnels/04-broker-referral/signup-form.md`. All custom-field
references already exist in your sub-account (Step 0 created them). Map each form
field to its custom field via the field picker; do NOT create new custom fields here.

- Redirect-on-submit URL: `/affiliate/thanks` (you'll build that page in Step 6, or
  point at a temporary thank-you URL for now).
- Save.

**Verify:** Open the form preview, scroll through all sections. The eligibility
attestation and signup acknowledgment checkboxes should be required.

---

## Step 5 — W-9 + Payout Info form (8 min)

**Path:** Sites → Forms → New Form → Blank Form
**Name:** `Affiliate W-9 + Payout Info`

Fields (all required):
- First Name, Last Name (standard contact fields)
- Legal entity name (free text) — for sole proprietors, same as their name
- Mailing address (standard contact: address1, city, state, postal, country)
- Tax classification (single-options: Sole Proprietor / LLC / Corporation / Partnership / Other)
- SSN or EIN (free text — encrypted at rest in GHL)
- Payout method → maps to custom field `Affiliate Payout Method` (ACH / PayPal / Check)
- Payout details → maps to custom field `Affiliate Payout Detail` (routing+account
  number for ACH, PayPal email, or "mail check to address above")
- W-9 PDF upload (file upload field)
- Affiliate W9 Received → maps to custom field `Affiliate W9 Received` (auto-checked
  on submit via the form action; see workflow spec)

Save.

---

## Step 6 — Landing page (15 min)

**Path:** Sites → Funnels → New Funnel → Single Page Funnel
**Name:** `Affiliate Program`
**Path:** `/affiliate`

Build from `funnels/04-broker-referral/landing-page.md`. The doc is structured as 8
sections you can paste into the page builder one block at a time:

1. Hero (headline + subhead + primary CTA "Apply to be an affiliate")
2. How it works (3 steps)
3. Commission math (2% example with $50k deal → $1,000)
4. Who this is for (4 affiliate types)
5. Social proof / brand intro
6. FAQs (8 questions)
7. Eligibility checklist
8. Final CTA + application form embed

Embed the Affiliate Application form (Step 4) inline in section 8.

Add a thank-you page at `/affiliate/thanks` with: "Application received. Check your
inbox for the affiliate agreement — usually within 5 minutes." Wire the form's
redirect (Step 4) to this URL.

Publish.

---

## Step 7 — Email templates (15 min)

**Path:** Marketing → Emails → Templates → New Template (Builder)

For each file in `campaigns/affiliate-onboarding/`, create one template:

| File | Template name in GHL |
|---|---|
| `01-welcome.md` | `Affiliate — 01 Welcome` |
| `02-how-it-works.md` | `Affiliate — 02 How It Works` |
| `03-ideal-client.md` | `Affiliate — 03 Ideal Client` |
| `04-your-tools.md` | `Affiliate — 04 Your Tools` |
| `05-first-referral.md` | `Affiliate — 05 First Referral` |
| `06-faqs.md` | `Affiliate — 06 FAQs` |
| `07-activation.md` | `Affiliate — 07 Activation Reminder` |

For each: paste the subject from the file's frontmatter, then paste the body. All
custom-value merge tags (`{{custom_values.affiliate_commission_rate}}`,
`{{custom_values.affiliate_program_email}}`, etc.) already resolve because Step 0
created the values.

Save.

---

## Step 8 — Workflows (30–60 min, draft only)

**Path:** Marketing → Workflows → New Workflow → Start from Scratch

Build all 6 workflows specified in `workflows/affiliate-onboarding.md`. **Save each as
Draft — do not publish until end-to-end test passes (Step 9).**

The spec file is the source of truth for triggers, conditions, and actions. Quick
inventory:

| # | Workflow name | Trigger | Purpose |
|---|---|---|---|
| 1 | Affiliate — Send Contract | Form submit: Affiliate Application | Send contract via Documents & Contracts, move opportunity to Contract Sent |
| 2 | Affiliate — Activate | Contract signed event | Tag affiliate-active, send W-9 form link, fire welcome email, move to Active Affiliate stage |
| 3 | Affiliate — Onboarding Drip | Tag added: affiliate-active | 7-email sequence over ~3 weeks (Emails 2–7) |
| 4 | Affiliate — Stalled Reminder | 14 days in Contract Sent | Reminder email + move to Stalled |
| 5 | Funded Deal → Commission Calc | Opportunity moved to 💰 Closed (Funding pipeline) | Compute commission, populate fields, tag referral-commission-pending-receipt |
| 6 | Weekly Payout Run | Schedule: every Monday 9am | Find contacts tagged referral-commission-released, generate payout report, email Gary |

Workflow 5 is the most complex (multi-step math + custom field updates). Workflow 6
generates a report — Gary executes payouts manually in v1.

---

## Step 9 — End-to-end test (10 min)

Before publishing any workflow:

1. Sign up via the landing page using a real-ish email you control (e.g.,
   `gmitch1647+afftest@gmail.com`).
2. Check the new contact in GHL — verify all 18 form fields populated correctly.
3. Manually trigger Workflow 1 on that contact → confirm the contract arrives.
4. Sign the contract → confirm Workflow 2 fires (W-9 link sent, tag `affiliate-active`
   added, opportunity moved to Active Affiliate).
5. Submit a fake W-9 form → confirm `Affiliate W9 Received` is checked.
6. Confirm Workflow 3 starts drip emails on schedule.
7. Manually drag an opportunity in the Funding Offer pipeline to `💰 Closed` for a
   referred contact → confirm Workflow 5 calculates commission correctly (2% of Amount
   Funded) and tags `referral-commission-pending-receipt`.
8. Manually flip the `Affiliate Commission Released` checkbox on that contact →
   confirm Workflow 6 picks it up on next Monday (or trigger it on demand for the test).

---

## Step 10 — Publish (1 min)

Once Step 9 is clean:

- Marketing → Workflows → for each of the 6 workflows: toggle `Draft` → `Published`.
- Delete the test contact (or move it to a "test" tag so it doesn't pollute future analytics).

You're live.

---

## What runs unsupervised after launch

- Affiliate signup → contract email is fully automated (Workflows 1, 2, 3, 4)
- Commission attribution on funded deals is fully automated (Workflow 5)
- Weekly payout report lands in Gary's inbox; **payout execution is manual in v1**

## What needs Gary's weekly attention

- Read the Monday payout report from Workflow 6
- Execute ACH/PayPal/check payouts manually
- For each payout: flag the contact's `Affiliate Commission Released` checkbox AND
  tag `referral-commission-paid` so it doesn't repeat next week
- (Future) When volume justifies, swap manual payouts for Stripe Connect — that
  changes Workflow 6 from "report" to "execute" and is the biggest v2 lift.
