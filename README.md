# GHL Build-Out — Credit & Funding

GoHighLevel sub-account scaffolding for a credit and funding business based in Atlanta, GA.
Tone: direct, results-focused, no fluff.

## Stack

- Node.js 18+ (native `fetch`)
- `dotenv` for env loading
- GHL v2 API (`services.leadconnectorhq.com`, version header `2021-07-28`)
- Auth: Private Integration Token (PIT)

## Setup

```bash
npm install
cp .env.example .env   # then fill in GHL_PIT and GHL_LOCATION_ID
npm run test:connection
```

The connection test prints location info, pipelines, custom fields, tags, users, and calendars
so we have a full inventory of what already exists in the sub-account before building.

## Project layout

```
api/          GHL API client + endpoint helpers
scripts/      One-off CLI scripts (connection test, build scripts)
funnels/      One folder per funnel (landing pages, forms, copy)
campaigns/    Email + SMS sequences (nurture, sales, transactional)
workflows/    Automation JSON exports / build specs
```

## Build status

### Foundation
- [x] Project structure
- [x] `.env` + `.gitignore` (creds not committed)
- [x] GHL API client (`api/client.js`) with auth, retries, rate-limit handling
- [x] Connection test script

### Funnels
- [ ] **1. MCA / Business Funding Application** — small business owners, working capital
- [ ] **2. Consultation Booking** — qualified leads → calendar
- [ ] **3. Credit Repair Lead Magnet** — consumer audience
- [ ] **4. Broker / Referral Partner Signup** — partner recruitment
- [ ] **5. Business Credit Builder** — entrepreneurs building business credit
- [ ] **6. Webinar / Lead Magnet Opt-in** — top-of-funnel capture

Each funnel includes: landing pages, opt-in forms, nurture + sales + transactional email,
SMS follow-up, pipeline stages, and workflow automations.

## Useful commands

```bash
npm run test:connection   # verify PIT + location ID work, list current resources
```
