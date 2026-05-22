# GHL AI Workflow Builder — Prompts

One prompt per workflow. Paste them one at a time into GHL's AI workflow builder
(Automations → Workflows → "Create with AI" or similar — the button name has changed a
few times across GHL releases).

## How to use these

1. **Build in order — don't skip.** Workflow 2 expects Workflow 1's outputs (tags,
   pipeline stage). Don't generate 2 until 1 is built and saved as Draft.
2. **Expect 70–80% accuracy, not 100%.** The AI builder is best at single-trigger
   workflows with linear steps. It struggles with: loops, math, cross-contact lookups
   (workflows 4/5/6 will need the most manual cleanup).
3. **Keep generated workflows as Draft.** Do not publish until end-to-end test (Step 9
   of `build-playbook.md`).
4. **After generation, spot-check:**
   - Trigger matches the prompt exactly
   - All tag names match GHL exactly (case-sensitive; e.g. `affiliate-active` not `Affiliate Active`)
   - All custom-field names match exactly (e.g. `Affiliate Status` not `Status`)
   - Pipeline + stage names match exactly
5. **If the AI builder generates something obviously wrong** (wrong trigger, missing
   actions, hallucinated fields), don't fight it — delete the draft and either re-prompt
   with a clearer hint or fall back to building that one manually. The complex ones (4,
   5, 6) are usually faster to build by hand than to AI-then-fix.

---

## Workflow 1 — Send Contract

Difficulty for the AI builder: **easy**. Trigger + linear actions.

```
Build a workflow named "Affiliate — Send Contract".

Trigger: when someone submits the form "Affiliate Application".

Actions, in order:
1. Set custom field "Affiliate Application Date" to today's date.
2. Set custom field "Affiliate Status" to "Pending Application".
3. Add tag "new-affiliate".
4. Look at the "Affiliate Type" custom field and conditionally add a tag:
   - "Broker / ISO / loan officer" → add tag "affiliate-broker"
   - "Past or current client" → add tag "affiliate-client"
   - "Content creator / influencer" → add tag "affiliate-creator"
   - "Small biz consultant / coach" → add tag "affiliate-consultant"
   - "Other" → add tag "affiliate-other"
5. Create an opportunity in pipeline "Affiliate Partners", stage "Pending Application",
   value $0, linked to this contact.
6. Send an internal email to gmitch1647@gmail.com — subject "New affiliate application:
   {{contact.full_name}}" — body listing name, email, phone, country, affiliate type,
   audience, referral volume, prior experience.
7. Send the document template "Dreamgate Affiliate Agreement" to {{contact.email}} for
   signature. From: Gary Mitchell. Subject: "Welcome to the Dreamgate Affiliate Program —
   please sign your agreement". Short friendly body asking them to sign so we can send
   their tracking link, mentioning 2% commission and weekly payouts.
8. After sending: set "Affiliate Status" to "Contract Sent", set "Affiliate Contract
   Sent Date" to today, add tag "affiliate-agreement-sent", remove tag "new-affiliate",
   move the opportunity to stage "Contract Sent".
9. Wait 7 days. If the document is still unsigned, send a reminder email subject
   "Quick reminder — your Dreamgate affiliate agreement is waiting", body asking them
   to sign. Wait another 7 days. If still unsigned: add tag "affiliate-agreement-stalled",
   set "Affiliate Status" to "Stalled", move opportunity to stage "Stalled", send Gary
   an internal notification.
```

---

## Workflow 2 — Activate Affiliate

Difficulty: **easy–medium**. The "trigger on document signed" event may or may not
exist in your GHL plan — if not, the fallback is "trigger on tag added: affiliate-active",
and you add that tag from the document workflow.

```
Build a workflow named "Affiliate — Activate".

Trigger: when a document with template "Dreamgate Affiliate Agreement" is signed by
the contact. (If that trigger isn't available, use: when the tag "affiliate-active"
is added to a contact.)

Actions, in order:
1. Set custom field "Affiliate Contract Signed Date" to today.
2. Set custom field "Affiliate Status" to "Active".
3. Add tag "affiliate-active". Remove tag "affiliate-agreement-sent".
4. Move this contact's opportunity in the "Affiliate Partners" pipeline to stage
   "Active Affiliate".
5. Send Gary an internal notification — subject "{{contact.full_name}} just signed the
   affiliate agreement", body confirming the contract is countersigned and on file.
6. Send the email template "Affiliate — 01 Welcome".
7. Wait 14 days. Then check: does any contact in this account have "Referring Affiliate
   ID" equal to this contact's "Affiliate ID"?
   - If YES, end the workflow (affiliate is engaged).
   - If NO, send the email template "Affiliate — 07 Activation Reminder" and add tag
     "affiliate-dormant".
```

---

## Workflow 3 — Referred Lead Tracking

Difficulty: **medium**. Cross-contact lookup. The AI builder probably won't get the
"find affiliate by Affiliate ID" step right — you'll need to refine in the UI using
the "Find Contact" action.

```
Build a workflow named "Affiliate — Referred Lead Tracking".

Trigger: any funding-side form submission (start with the "Funding Application" form;
also enroll any other funding-side forms you have).

Filter: only continue if the contact's "Referring Affiliate ID" custom field is not
empty.

Actions, in order:
1. Find the affiliate contact whose "Affiliate ID" custom field equals the new contact's
   "Referring Affiliate ID".
2. If no affiliate is found, end the workflow.
3. If the affiliate has tag "affiliate-suspended" or "affiliate-terminated", end the
   workflow.
4. Otherwise, on the referred contact (the new lead):
   - Set "Affiliate Commission Eligible" to true
   - Set "Referring Affiliate Name" to the affiliate's full name
   - Set "Affiliate Attribution Date" to today
   - Add tag "referred-by-affiliate"
5. On the affiliate, increment "Affiliate Referred Count" by 1.
6. Send the affiliate an email — subject "Referred lead in your pipeline:
   {{contact.first_name}}", body "{{contact.first_name}} just submitted a funding
   inquiry through your link. We'll let you know when they fund. Tracking is live. —
   Dreamgate Financial".
7. If the affiliate has a phone number, send SMS: "Dreamgate: a referred lead just
   entered your pipeline. Check email for details. Reply STOP to opt out."
```

---

## Workflow 4 — Funded Deal → Commission Pending

Difficulty: **hard**. Math + cross-contact field update. Expect the AI to skip the
multiplication step. Build it manually if the generation is rough.

```
Build a workflow named "Funded Deal → Commission Calc (Pending Receipt)".

Trigger: when an opportunity in pipeline "Sales Pipeline - Funding Offer" is moved to
stage "💰 Closed".

Filter: only continue if the opportunity's contact has "Affiliate Commission Eligible"
= true AND "Affiliate Attribution Date" is within the last 90 days.

Actions, in order:
1. Read the opportunity's Monetary Value (Amount Funded).
2. Calculate 2% of Amount Funded (multiply by 0.02). This is the commission amount.
3. On the referred contact:
   - Set "Affiliate Commission Amount" to the computed value.
   - Set "Affiliate Commission Pending Receipt" to true.
   - Add tags "referral-commission-eligible" and "referral-commission-pending-receipt".
4. Find the affiliate contact whose "Affiliate ID" equals this contact's "Referring
   Affiliate ID". Add the commission amount to the affiliate's "Affiliate Total Earned"
   field.
5. Send Gary an internal email — subject "Deal funded — {{contact.full_name}},
   commission ${{contact.affiliate_commission_amount}} pending receipt", body:
   "Once the lender pays us our commission, add the tag 'company-funds-received' to
   this contact to release the commission to the affiliate."
```

---

## Workflow 5 — Release Commission

Difficulty: **medium**. Simple tag-triggered, but it does a cross-contact field update.

```
Build a workflow named "Affiliate — Release Commission".

Trigger: when the tag "company-funds-received" is added to a contact.

Filter: only continue if "Affiliate Commission Pending Receipt" = true on this contact.

Actions, in order:
1. Set "Affiliate Commission Released" to true. Set "Affiliate Commission Pending
   Receipt" to false.
2. Remove tag "referral-commission-pending-receipt". Add tag "referral-commission-released".
3. Find the affiliate contact whose "Affiliate ID" equals this contact's "Referring
   Affiliate ID". Increment that affiliate's "Affiliate Funded Count" by 1.
4. Send the affiliate an email — subject "You earned ${{contact.affiliate_commission_amount}}",
   body "{{contact.first_name}} funded their deal. Your commission:
   ${{contact.affiliate_commission_amount}}. Pays out in this Friday's batch."
5. If the affiliate has a phone number and SMS-opted-in, also send SMS:
   "Dreamgate: you earned ${{contact.affiliate_commission_amount}}. Hits your account
   this Friday."
```

---

## Workflow 6 — Weekly Payout Report

Difficulty: **very hard**. GHL workflows can't natively do group-by-and-sum across
contacts. The AI builder will almost certainly produce something wrong. Recommendation:
do not use the AI builder for this — build a simpler version manually that just sends
Gary an email listing all contacts with `referral-commission-released` and no
`referral-commission-paid` tag, and Gary builds the report from the list.

If you still want to try the AI builder, here's a prompt:

```
Build a workflow named "Affiliate — Weekly Payout Report".

Trigger: scheduled — every Friday at 10:00 AM Eastern Time.

Action: send Gary an email at gmitch1647@gmail.com.

Email subject: "Friday Affiliate Payout Run".

Email body: include a list of every contact in this account that has the tag
"referral-commission-released" AND does NOT have the tag "referral-commission-paid".
For each contact, list: contact name, contact's "Referring Affiliate Name",
contact's "Referring Affiliate ID", and contact's "Affiliate Commission Amount".
Also list a separate group: any affiliates (contacts with tag "affiliate-active")
whose "Affiliate W9 Received" is false, with a note that their commissions are held
pending W-9.
```

**Manual cleanup needed after generation:** the AI won't actually build the loop. You'll
need to either accept a flat "list all matching contacts" output, or write a small Node
script that does the grouping/sum and posts the report via GHL conversation message.
I can write that script when you're ready — it lives in `scripts/` and runs on a cron.

---

## What "fall back to manual" looks like

If the AI builder produces nothing usable for a given workflow:

1. Tell me which workflow and what the AI generated (screenshot or paste).
2. I'll write a tighter manual checklist for that one workflow — click-by-click, ~10
   minutes to execute in the UI.
3. We move on to the next one.

The goal here is to reduce your UI clicks, not to chase a perfect AI generation.
