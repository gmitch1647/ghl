# Workflow — Affiliate Onboarding & Commission Tracking

Spec for the GHL workflows that power the affiliate program. Designed for the GHL workflow
builder (no-code). Each workflow listed separately because GHL prefers single-trigger
workflows over branching mega-workflows.

---

## Workflow 1 — Affiliate Application Received

**Trigger:** Form submission — `Affiliate Application` form

**Actions (in order):**

1. **Find/Create contact** — by email
2. **Add tag** — `affiliate-pending`
3. **Add tag based on `Affiliate Type` field:**
   - "Broker / ISO / loan officer" → tag `affiliate-broker`
   - "Past or current client" → tag `affiliate-client`
   - "Content creator / influencer" → tag `affiliate-creator`
   - "Small biz consultant / coach" → tag `affiliate-consultant`
   - "Other" → tag `affiliate-other`
4. **Set custom field** `Affiliate Status` = `Pending`
5. **Internal notify Gary** — Email + in-app notification with summary:
   - Name, email, phone, country, affiliate type
   - Audience description (the LARGE_TEXT field)
   - Referral volume estimate
   - Prior experience
   - Link to their contact in GHL
   - Subject: `New affiliate application: {{contact.full_name}} ({{contact.affiliate_type}})`
6. **Send applicant the auto-reply email:**
   - Subject: `Application received — we'll respond within 1 business day`
   - Body: Short confirmation; tells them to watch for an email from gmitch1647@gmail.com.
7. **Wait condition** — Stop the workflow here. Approval is manual.

---

## Workflow 2 — Affiliate Approved

**Trigger:** Tag added — `affiliate-approved` (Gary adds manually after reviewing application)

**Actions (in order):**

1. **Remove tag** — `affiliate-pending`
2. **Generate Affiliate ID** — Use a workflow action to create a unique short ID
   (e.g., first 2 letters of last name + 4 random digits → `MI4729`). Store in
   `Affiliate ID` custom field.
   - GHL note: if native ID generation isn't available, use a webhook to a small Node
     script (we can add to `scripts/`) or manually set IDs during launch. v1 fallback:
     Gary assigns IDs by hand.
3. **Set custom field** `Affiliate Status` = `Approved`
4. **Set custom field** `Affiliate Approval Date` = today
5. **Send Email 1** (Welcome) from `campaigns/affiliate-onboarding/01-welcome.md`
6. **Add to email sequence:** "Affiliate Onboarding" (configured to send emails 2–6 on the
   timing schedule in `campaigns/affiliate-onboarding/README.md`)
7. **Wait 14 days**, then:
   - **If** contact has any contacts linked by `Referring Affiliate ID` = their `Affiliate ID`:
     - Add tag `affiliate-active`
     - Skip email 7
   - **Else:**
     - Send Email 7 (Activation nudge)
     - Add tag `affiliate-dormant`

---

## Workflow 3 — Funding Lead Came In via Affiliate Link

**Trigger:** Form submission — any funding-side form (Funnel 01 MCA, Funnel 02 Consultation,
Funnel 05 Business Credit Builder) where the URL contained `?aff=<id>`

**Required:** All funding-side forms must have a hidden field `aff` mapped from the URL
parameter into a custom field `Referring Affiliate ID` on the new contact.

**Actions (in order):**

1. **Find/Create contact** — by email
2. **Read** `Referring Affiliate ID` from the form submission
3. **Find referring affiliate** — Search contacts for one whose `Affiliate ID` matches
4. **Branch:**
   - **If** no matching affiliate found → stop (likely a tampered URL; log silently)
   - **If** matching affiliate is found AND has status `Suspended` or `Terminated` → stop
     (log internally)
   - **Else** continue
5. **First-touch check:** if the referred contact was created BEFORE this form submission
   (i.e., contact already existed in GHL prior to this affiliate click), set custom field
   `Affiliate Commission Eligible` = `false` and add a note:
   "Pre-existing contact — first-touch ineligible. Original create date: {{contact.date_added}}"
6. **Else (eligible):**
   - Set `Affiliate Commission Eligible` = `true`
   - Set `Referring Affiliate Name` = name of the affiliate
   - Set `Affiliate Attribution Date` = now
   - Add tag `referred-by-affiliate`
   - Increment affiliate's `Affiliate Referred Count` by 1
7. **Notify the affiliate via email + SMS (if phone available):**
   - Email subject: `Referred lead in your pipeline: {{contact.first_name}}`
   - Email body: One paragraph. "{{contact.first_name}} just submitted a funding inquiry
     through your link. We'll let you know when they fund. Tracking is live."
   - SMS body: "Dream Gate: a referred lead just entered your pipeline. Email sent with
     details. Reply STOP to opt out."

---

## Workflow 4 — Funded Deal Triggers Commission

**Trigger:** Opportunity stage change — pipeline `Sales Pipeline - Funding Offer`,
stage moved to `💰 Closed`

**Actions (in order):**

1. **Get the contact** linked to the opportunity
2. **Check** if contact has `Affiliate Commission Eligible` = `true`
3. **Check** if `Affiliate Attribution Date` is within the last 90 days
4. **If both true:**
   - Get the opportunity's `Monetary Value` (funded amount)
   - Compute commission: funded amount × 0.02 (use custom value `affiliate_commission_rate`)
   - Find the referring affiliate by `Referring Affiliate ID`
   - Add tag `referral-commission-eligible` to the referred contact
   - Increment affiliate's `Affiliate Funded Count` by 1
   - Add to affiliate's `Affiliate Total Earned` field
   - Send affiliate email + SMS:
     - Email subject: `You earned ${commission_amount}`
     - Email body: One paragraph. "{{contact.first_name}} just funded $XX,XXX. Your
       commission: $X,XXX. Pays out on the next monthly cycle (1st of next month, net-30
       from funded date)."
   - Send Gary an internal notification with payout amount, affiliate name, deal ID
5. **If not eligible** → log internally, no payout

---

## Workflow 5 — Monthly Commission Statement

**Trigger:** Scheduled — 1st of each month, 9:00 AM ET

**Actions (in order):**

1. **Loop over all contacts with tag `affiliate-active`**
2. **For each affiliate:**
   - Query all opportunities from the prior calendar month where:
     - Referred contact's `Referring Affiliate ID` = this affiliate's `Affiliate ID`
     - Opportunity stage = `💰 Closed`
     - Funded date is in the prior calendar month
   - Sum up commissions
   - Send statement email with itemized list and total owed
3. **If `Affiliate W9 Received` = false AND amount owed > $0:**
   - Append note to email: "We can't pay until your W-9 is on file. Submit here: [W9 link]"
4. **If amount owed ≥ $50:**
   - Trigger Stripe Connect transfer (or manual payout queue in v1)
5. **If amount owed < $50:**
   - Email notes that balance rolls to next month

---

## Workflow 6 — Reactivate Dormant Affiliate (Optional, v2)

Build later. Re-engages affiliates tagged `affiliate-dormant` after 60 days of inactivity.
Sequence + workflow TBD.

---

## Implementation order

1. Build Workflow 1 first → test with a fake application.
2. Build Workflow 2 → manually approve the fake application, verify Email 1 sends and the
   email sequence enrolls correctly.
3. Build Workflow 3 → test by submitting a funding lead with `?aff=<test_id>` in the URL.
4. Build Workflow 4 → manually drag the fake opportunity to `💰 Closed`, verify the
   affiliate gets the earnings notification.
5. Build Workflow 5 last → schedule for the 1st of the next month, verify it pulls the
   right numbers.

## What can break (and what to monitor)

- **Affiliate ID collisions** — if auto-generating IDs, add uniqueness check
- **Form not passing `?aff=` param** — verify the funding landing pages have the hidden
  field mapping configured
- **First-touch contact match** — depends on email being the matching key; if a referred
  lead uses a different email than the existing contact, the system may incorrectly count
  it as new. Edge case; accept for v1.
- **Stage-change loops** — if Gary moves a deal back out of `💰 Closed` and back in, the
  workflow could fire twice. Add a tag `commission-fired` after first firing as a guard.
