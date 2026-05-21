# Campaign — Affiliate Onboarding

7-email sequence sent to newly approved affiliates. Goal: get them from "approved" to
"first referral sent" inside 14 days.

## Sequence

| # | File | Send delay | Trigger | Subject | Primary CTA |
|---|---|---|---|---|---|
| 1 | `01-welcome.md` | Immediate (on approval) | Tag added: `affiliate-approved` | Welcome — here's your link | Click to view your link |
| 2 | `02-how-it-works.md` | +1 day | Time delay | How you get paid (in 60 seconds) | View commission terms |
| 3 | `03-ideal-client.md` | +3 days | Time delay | The exact business owner to send us | Save the ideal-client one-pager |
| 4 | `04-your-tools.md` | +5 days | Time delay | Your swipe pack (copy + paste) | Open the swipe pack |
| 5 | `05-first-referral.md` | +7 days | Time delay | The fastest path to your first $1,000 | Send your link now |
| 6 | `06-faqs.md` | +10 days | Time delay | "Wait, what about ___?" | Reply with questions |
| 7 | `07-activation.md` | +14 days | Conditional: no referred lead yet | One question | Reply or unsubscribe |

## Send rules

- Sender name: **Gary Mitchell** (personal, not "Dream Gate Financial Team")
- From address: `gmitch1647@gmail.com` (or `gary@[domain]` once domain is set up)
- Reply-to: same as from
- All emails plain-text style — no big headers, no stock photos. Looks like a real email.
- Send time: 9:00 AM ET, recipient's local timezone if available
- Skip weekends: yes, push to next Monday if delay lands on Sat/Sun

## Variables used (custom values)

| Token | Source |
|---|---|
| `{{contact.first_name}}` | Standard |
| `{{custom_values.affiliate_commission_rate}}` | "2%" |
| `{{custom_values.affiliate_payout_cadence}}` | "net-30 from funded date" |
| `{{custom_values.affiliate_minimum_payout}}` | "$50" |
| `{{custom_values.affiliate_attribution_window}}` | "90 days" |
| `{{contact.affiliate_id}}` | Per-affiliate unique code |
| `{{custom_values.affiliate_program_email}}` | Reply-to email |
| `{{custom_values.affiliate_program_phone}}` | Footer phone |

## Footer (every email)

```
—
Gary Mitchell
Dream Gate Financial
{{custom_values.affiliate_program_email}} · {{custom_values.affiliate_program_phone}}

You're getting this because you joined the Dream Gate Financial affiliate program.
Unsubscribe: {{unsubscribe_url}}
```

## Voice rules

- No "Hope you're well" or "Hope this finds you" openings
- Lead with the action or the number
- Short paragraphs — 1 to 3 sentences max
- One CTA per email, not three
- No exclamation points except in the welcome subject (one allowed)
- US English

## Exit conditions

A contact exits this sequence early if any of these fire:
- Tag added: `affiliate-suspended` or `affiliate-terminated`
- They reply to any email (workflow pauses sequence, notifies Gary)
- They send their first referred lead (sequence pauses, drops them into the "Active
  Affiliate" maintenance segment — built later)
