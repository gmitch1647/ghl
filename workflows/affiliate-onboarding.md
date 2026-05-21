# Workflow — Affiliate Onboarding & Commission Tracking

Spec for the GHL workflows that power the affiliate program. Designed for the GHL workflow
builder (no-code). Each workflow listed separately because GHL prefers single-trigger
workflows over branching mega-workflows.

**Build all workflows as Draft first. Test end-to-end with a fake email. Only flip to
Published after Gary signs off.**

---

## Workflow 1 — Application Received → Send Contract

**Trigger:** Form submission — `Affiliate Application` form

**Actions (in order):**

1. **Find/Create contact** — by email.
2. **Filter:** Verify required fields for contract merge are present:
   - `firstName`, `lastName`, `email`
   - `address1`, `city`, `state`, `postalCode`
   - `Affiliate Title` (custom `affiliate_title`)
   - If any are missing → branch to "Send 'we need a bit more info'" email and exit.
3. **Set custom field** `Affiliate Application Date` = today.
4. **Set custom field** `Affiliate Status` = `Pending Application`.
5. **Add tag** `new-affiliate`.
6. **Add tag based on `Affiliate Type` field:**
   - "Broker / ISO / loan officer" → `affiliate-broker`
   - "Past or current client" → `affiliate-client`
   - "Content creator / influencer" → `affiliate-creator`
   - "Small biz consultant / coach" → `affiliate-consultant`
   - "Other" → `affiliate-other`
7. **Create opportunity** in pipeline `Affiliate Partners`, stage `Pending Application`,
   value = $0, contact = this contact.
8. **Internal notify Gary** — Email + in-app notification with summary:
   - Subject: `New affiliate application: {{contact.full_name}} ({{contact.affiliate_type}})`
   - Name, email, phone, country, affiliate type, audience description, referral volume,
     prior experience, link to contact in GHL.
9. **Action: Send Document for Signature** — using GHL Documents & Contracts
   - Template: Dreamgate Affiliate Agreement (uploaded per `funnels/04-broker-referral/ghl-resources.md` §5)
   - Recipient: `{{contact.email}}`
   - Sender: Gary Mitchell (or whoever Gary designates — see open questions below)
   - Subject: `Welcome to the Dreamgate Affiliate Program — please sign your agreement`
   - Body: short, friendly, with clear CTA button. Suggested body:
     ```
     {{contact.first_name}},

     You're in. Last step before we send your tracking link: sign the affiliate
     agreement below.

     [Sign the agreement →]

     It's a standard affiliate contract — 2% on every Funded Transaction we collect
     on, weekly payouts. Read it carefully and sign when you're ready.

     — Gary
     Dreamgate Solutions LLC
     ```
10. **Set custom field** `Affiliate Status` = `Contract Sent`.
11. **Set custom field** `Affiliate Contract Sent Date` = today.
12. **Add tag** `affiliate-agreement-sent`. Remove tag `new-affiliate`.
13. **Move opportunity** in `Affiliate Partners` to stage `Contract Sent`.
14. **Wait step:** Until document signed OR 7 days, whichever first.
    - **If signed within 7 days →** continue to Workflow 2 trigger (tag `affiliate-active`
      will be added there).
    - **If 7 days pass without signature →**
      - Send reminder email: subject `Quick reminder — your Dreamgate affiliate agreement is waiting`
      - Wait 7 more days (= 14 total).
      - If still unsigned → add tag `affiliate-agreement-stalled`, set
        `Affiliate Status` = `Stalled`, move opportunity to stage `Stalled`,
        notify Gary internally. Stop workflow.

---

## Workflow 2 — Contract Signed → Activate Affiliate

**Trigger:** Document signed event from GHL Documents & Contracts — template = Dreamgate
Affiliate Agreement.

(If GHL triggers on signed-document events aren't directly available, fall back to:
trigger on tag `affiliate-active` being added, and have the contract-completion event
add that tag via webhook or GHL's native automation.)

**Actions (in order):**

1. **Set custom field** `Affiliate Contract Signed Date` = today.
2. **Set custom field** `Affiliate Status` = `Active`.
3. **Generate Affiliate ID** — short unique code (e.g., first 2 letters of last name +
   4 random digits → `MI4729`). Store in `Affiliate ID` custom field.
   - GHL note: if native ID generation isn't available, use a webhook to a small Node
     helper (we can add to `scripts/`). v1 fallback: Gary assigns IDs by hand.
4. **Add tag** `affiliate-active`. Remove tag `affiliate-agreement-sent`.
5. **Move opportunity** in `Affiliate Partners` to stage `Active Affiliate`.
6. **Internal notify Gary** — affiliate is now active, contract signed and on file.
7. **Send Email 1** (Welcome) from `campaigns/affiliate-onboarding/01-welcome.md`.
   This includes their unique tracking link `https://[domain]/funding?aff={{contact.affiliate_id}}`
   and W-9 link.
8. **Enroll in email sequence:** "Affiliate Onboarding" (emails 2–6, see
   `campaigns/affiliate-onboarding/README.md` for cadence).
9. **Wait 14 days** then check: does this affiliate have any referred contacts where
   `Referring Affiliate ID` = their `Affiliate ID`?
   - **Yes** → skip email 7. Affiliate is engaged.
   - **No** → send email 7 (activation nudge) + add tag `affiliate-dormant`.

---

## Workflow 3 — Funding Lead Came In via Affiliate Link

**Trigger:** Form submission — any funding-side form (Funnels 01 MCA, 02 Consultation,
05 Business Credit Builder) where URL contained `?aff=<id>`.

**Required setup:** All funding-side forms must have a hidden field `aff` mapped from the
URL parameter into a custom field `Referring Affiliate ID` on the new contact.

**Actions (in order):**

1. **Find/Create contact** by email.
2. **Read** `Referring Affiliate ID` from submission.
3. **Find referring affiliate** — search contacts whose `Affiliate ID` matches.
4. **Branch:**
   - **No match** → stop (likely a tampered URL; log silently).
   - **Match but affiliate is `Suspended` or `Terminated`** → stop, log internally.
   - **Match valid** → continue.
5. **First-touch check:** if the referred contact was created BEFORE this form submission
   (i.e., already existed in GHL), set `Affiliate Commission Eligible` = `false` with note:
   "Pre-existing contact — first-touch ineligible. Original create date: {{contact.date_added}}"
6. **Else (eligible):**
   - Set `Affiliate Commission Eligible` = `true`
   - Set `Referring Affiliate Name` = name of the affiliate
   - Set `Affiliate Attribution Date` = now
   - Add tag `referred-by-affiliate`
   - Increment affiliate's `Affiliate Referred Count` by 1
7. **Notify the affiliate** via email + SMS (if phone available):
   - Email subject: `Referred lead in your pipeline: {{contact.first_name}}`
   - Email body: "{{contact.first_name}} just submitted a funding inquiry through your link.
     We'll let you know when they fund. Tracking is live."
   - SMS body: "Dreamgate: a referred lead just entered your pipeline. Check email for
     details. Reply STOP to opt out."

---

## Workflow 4 — Funded Deal → Calculate Commission (Pending Receipt)

**Trigger:** Opportunity stage change — pipeline `Sales Pipeline - Funding Offer`,
stage moved to `💰 Closed`.

**Important:** Per contract §3, commission is NOT earned until the Company actually
receives its commission from the lender. This workflow tags the commission as
"calculated and pending receipt." A separate workflow releases it once funds arrive.

**Actions (in order):**

1. **Get** the contact linked to the opportunity.
2. **Check** `Affiliate Commission Eligible` = `true` AND `Affiliate Attribution Date`
   is within last 90 days.
3. **If both true:**
   - Get opportunity `Monetary Value` (Amount Funded).
   - Compute commission: `Amount Funded × 0.02` (uses custom value `affiliate_commission_rate`).
   - Set referred contact's `Affiliate Commission Amount` = computed value.
   - Set `Affiliate Commission Pending Receipt` = `true`.
   - Add tag `referral-commission-eligible` and `referral-commission-pending-receipt`.
   - Find referring affiliate by `Referring Affiliate ID`.
   - Add to affiliate's `Affiliate Total Earned` field (accrual basis — not yet paid).
   - Send Gary internal notification: "Deal funded — affiliate commission of $X pending
     Company receipt of funds from lender. Once we collect, run Workflow 5 to release."
4. **If not eligible** → log internally, no commission, no notification to affiliate.

---

## Workflow 5 — Company Received Funds → Release Commission to Affiliate

**Trigger:** Tag added on referred contact — `company-funds-received` (Gary or ops adds
manually when the lender pays us our commission).

**Why manual:** GHL has no visibility into whether the lender has paid us. This is the
contract §3 contingency — until we have the money, the affiliate doesn't.

**Actions (in order):**

1. **Check** referred contact has `Affiliate Commission Pending Receipt` = `true`.
2. **Set** `Affiliate Commission Released` = `true`, `Affiliate Commission Pending Receipt`
   = `false`.
3. **Remove** tag `referral-commission-pending-receipt`. Add tag `referral-commission-released`.
4. **Increment** affiliate's `Affiliate Funded Count` by 1.
5. **Notify affiliate** via email + SMS:
   - Email subject: `You earned ${affiliate_commission_amount}`
   - Email body: "{{contact.first_name}} funded ${amount_funded}. Your commission:
     ${affiliate_commission_amount}. Pays out in this week's batch (Friday)."
   - SMS body: "Dreamgate: you earned ${affiliate_commission_amount}. Hits your account
     this Friday."

---

## Workflow 6 — Weekly Payout Run

**Trigger:** Scheduled — every Friday, 10:00 AM ET.

Per contract §3 / Schedule 1: Fees disbursed weekly once funds received by Company.

**Actions (in order):**

1. **Loop over all contacts with tag `affiliate-active`** AND any unpaid released
   commissions.
2. **For each affiliate:**
   - Sum all referred contacts where `Affiliate Commission Released` = `true` AND
     `referral-commission-paid` tag NOT present, that belong to this affiliate.
   - **If `Affiliate W9 Received` = false AND amount > 0:** send "we owe you $X, but
     we need your W-9 first" email. Skip payout. Hold balance.
   - **Else:** trigger payout via chosen rail (Stripe Connect / PayPal / manual ACH).
     - Add `referral-commission-paid` tag to each referred contact paid in this batch.
     - Increment affiliate's `Affiliate Total Paid`.
     - Send affiliate statement email itemizing the batch.
3. **If amount owed = $0** → no email, no action.

---

## Workflow 7 — Reactivate Dormant Affiliate (Optional, v2)

Build later. Re-engages affiliates tagged `affiliate-dormant` after 60 days of inactivity.

---

## Implementation order

1. Build **Workflow 1** first (application → contract send). Test with fake form
   submission — verify contract sends via Documents & Contracts.
2. Build **Workflow 2** (contract signed → activate). Sign the test contract; verify
   tags fire, opportunity moves, welcome email sends.
3. Build **Workflow 3** (funding lead came in via affiliate link). Test with
   `?aff=<test_id>` in URL on funding form.
4. Build **Workflow 4** (funded deal → commission pending). Manually drag the test
   opportunity to `💰 Closed`.
5. Build **Workflow 5** (release commission). Manually add `company-funds-received`
   tag; verify affiliate notification fires.
6. Build **Workflow 6** (weekly payout). Schedule for next Friday, but keep payout
   action in test mode until Gary verifies the dollar amounts.

## Open setup questions (per the setup doc Gary provided)

Resolve before Workflow 1 can run live:

1. **Which form** triggers Workflow 1 — confirm it's the `Affiliate Application` form
   per `signup-form.md` (we still need to build it in GHL).
2. **From sender** for the contract-send email — name + email. Default: Gary Mitchell /
   gmitch1647@gmail.com.
3. **Contract placeholders** — see `funnels/04-broker-referral/config.md` → "Contract
   placeholders to fill before launch."
4. **Document template ID** — populated after the contract is uploaded to GHL Documents
   & Contracts. Capture and store here once known.
5. **Custom field `Affiliate Title`** — must exist before contract send works, since
   `{{contact.title}}` merges from it.

## What can break (and what to monitor)

- **Contract merge field mismatch:** if GHL uses a different field key for "title" than
  `affiliate_title`, the contract will leave a blank where the affiliate's title should
  go. Test contract with a fake signup and verify all merge fields populate.
- **Required address fields missing on signup:** Workflow 1 will branch to "need more
  info" — make sure the signup form makes address fields required.
- **Document template not found:** if the workflow can't find the template ID, the
  Send-Document-for-Signature step will fail silently. Always log workflow errors.
- **Stage-change loops on funded deal:** if Gary moves a deal out of `💰 Closed` and back
  in, Workflow 4 could fire twice. Add tag `commission-calculated` after first fire as a
  guard.
- **Company-funds-received tag added prematurely:** if ops adds it before money arrives,
  the affiliate gets paid early. Contract allows clawback (§3), but better to gate
  manually with a confirmation step.
