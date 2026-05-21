import 'dotenv/config';
import { clientFromEnv } from '../api/client.js';

const client = clientFromEnv();

// ============================================================================
// Desired state (matches funnels/04-broker-referral/ghl-resources.md)
// ============================================================================

const CUSTOM_VALUES = [
  { name: 'company_legal_name',           value: 'Dreamgate Solutions LLC' },
  { name: 'affiliate_commission_rate',    value: '2%' },
  { name: 'affiliate_payout_cadence',     value: 'weekly, once funds are received by the Company' },
  { name: 'affiliate_payment_contingency',value: 'Payment is contingent on the Company actually receiving its commission from the lender in cleared funds.' },
  { name: 'affiliate_attribution_window', value: '90 days' },
  { name: 'affiliate_minimum_payout',     value: '$50' },
  { name: 'affiliate_program_email',      value: 'gmitch1647@gmail.com' },
  { name: 'affiliate_program_phone',      value: '+1 (470) 981-3826' },
];

const TAGS = [
  // Lifecycle
  'new-affiliate',
  'affiliate-agreement-sent',
  'affiliate-active',
  'affiliate-agreement-stalled',
  'affiliate-dormant',
  'affiliate-suspended',
  'affiliate-terminated',
  // Affiliate type
  'affiliate-broker',
  'affiliate-client',
  'affiliate-creator',
  'affiliate-consultant',
  'affiliate-other',
  // Referred-lead side
  'referred-by-affiliate',
  'referral-commission-eligible',
  'referral-commission-pending-receipt',
  'referral-commission-released',
  'referral-commission-paid',
];

const CUSTOM_FIELDS = [
  // Affiliate-side
  { name: 'Affiliate Title',                       dataType: 'TEXT' },
  { name: 'Affiliate Type',                        dataType: 'RADIO',
    options: ['Broker / ISO / loan officer', 'Past or current client', 'Content creator / influencer', 'Small biz consultant / coach', 'Other'] },
  { name: 'Affiliate Country',                     dataType: 'SINGLE_OPTIONS',
    options: ['United States', 'Other'] },
  { name: 'Affiliate Audience',                    dataType: 'LARGE_TEXT' },
  { name: 'Affiliate Referral Volume',             dataType: 'RADIO',
    options: ['1–2', '3–5', '6–10', '10+', 'Not sure yet'] },
  { name: 'Affiliate Prior Experience',            dataType: 'RADIO',
    options: ['Yes — actively', 'Yes — but it’s been a while', 'No — first time'] },
  { name: 'Affiliate Link',                        dataType: 'TEXT' },
  { name: 'Affiliate Notes',                       dataType: 'LARGE_TEXT' },
  { name: 'Affiliate Eligibility Attested',        dataType: 'CHECKBOX',
    options: ['I am 18+ and a US resident'] },
  { name: 'Affiliate Signup Acknowledged',         dataType: 'CHECKBOX',
    options: ['I understand the next step is signing the Dreamgate Affiliate Agreement via email'] },
  { name: 'Affiliate ID',                          dataType: 'TEXT' },
  { name: 'Affiliate Status',                      dataType: 'SINGLE_OPTIONS',
    options: ['Pending Application', 'Contract Sent', 'Active', 'Stalled', 'Suspended', 'Terminated'] },
  { name: 'Affiliate Application Date',            dataType: 'DATE' },
  { name: 'Affiliate Contract Sent Date',          dataType: 'DATE' },
  { name: 'Affiliate Contract Signed Date',        dataType: 'DATE' },
  { name: 'Affiliate W9 Received',                 dataType: 'CHECKBOX',
    options: ['W-9 received'] },
  { name: 'Affiliate Payout Method',               dataType: 'SINGLE_OPTIONS',
    options: ['ACH', 'PayPal', 'Check'] },
  { name: 'Affiliate Payout Detail',               dataType: 'TEXT' },
  { name: 'Affiliate Referred Count',              dataType: 'NUMERICAL' },
  { name: 'Affiliate Funded Count',                dataType: 'NUMERICAL' },
  { name: 'Affiliate Total Earned',                dataType: 'MONETORY' },
  { name: 'Affiliate Total Paid',                  dataType: 'MONETORY' },
  // Referred-contact side
  { name: 'Referring Affiliate ID',                dataType: 'TEXT' },
  { name: 'Referring Affiliate Name',              dataType: 'TEXT' },
  { name: 'Affiliate Attribution Date',            dataType: 'DATE' },
  { name: 'Affiliate Commission Eligible',         dataType: 'CHECKBOX',
    options: ['Eligible'] },
  { name: 'Affiliate Commission Amount',           dataType: 'MONETORY' },
  { name: 'Affiliate Commission Pending Receipt',  dataType: 'CHECKBOX',
    options: ['Pending receipt from lender'] },
  { name: 'Affiliate Commission Released',         dataType: 'CHECKBOX',
    options: ['Released for payout'] },
];

const PIPELINE = {
  name: 'Affiliate Partners',
  stages: [
    'Pending Application',
    'Contract Sent',
    'Active Affiliate',
    'Stalled',
    'Suspended',
    'Terminated',
  ],
};

// ============================================================================
// Helpers
// ============================================================================

const counts = { created: 0, skipped: 0, failed: 0 };

function log(prefix, msg) {
  console.log(`[${prefix}] ${msg}`);
}

function summarize(label, fn) {
  const before = { ...counts };
  return fn().then(() => {
    const c = counts.created - before.created;
    const s = counts.skipped - before.skipped;
    const f = counts.failed  - before.failed;
    console.log(`\n${label}: ${c} created, ${s} skipped, ${f} failed\n`);
  });
}

function describeErr(e) {
  if (e.status && e.body) {
    const body = typeof e.body === 'string' ? e.body : JSON.stringify(e.body);
    return `HTTP ${e.status} — ${body.slice(0, 300)}`;
  }
  return e.message;
}

// ============================================================================
// Builders
// ============================================================================

async function buildCustomValues() {
  console.log('=== Custom Values ===');
  const existing = await client.getCustomValues().catch((e) => {
    log('FAIL', `getCustomValues — ${describeErr(e)}`);
    return null;
  });
  const list = existing?.customValues ?? existing?.values ?? existing ?? [];
  const byName = new Map(list.map?.((v) => [v.name?.toLowerCase(), v]) ?? []);

  for (const cv of CUSTOM_VALUES) {
    if (byName.has(cv.name.toLowerCase())) {
      log('SKIP', `custom value "${cv.name}" already exists`);
      counts.skipped++;
      continue;
    }
    try {
      const res = await client.createCustomValue(cv);
      const id = res?.customValue?.id ?? res?.id ?? '(no id)';
      log('OK  ', `created "${cv.name}" → ${id}`);
      counts.created++;
    } catch (e) {
      log('FAIL', `create "${cv.name}" — ${describeErr(e)}`);
      counts.failed++;
    }
  }
}

async function buildCustomFields() {
  console.log('=== Custom Fields (contact) ===');
  const existing = await client.getCustomFields('contact').catch((e) => {
    log('FAIL', `getCustomFields — ${describeErr(e)}`);
    return null;
  });
  const list = existing?.customFields ?? [];
  const byName = new Map(list.map((f) => [f.name?.toLowerCase(), f]));

  for (const cf of CUSTOM_FIELDS) {
    if (byName.has(cf.name.toLowerCase())) {
      log('SKIP', `custom field "${cf.name}" already exists`);
      counts.skipped++;
      continue;
    }
    const payload = {
      name: cf.name,
      dataType: cf.dataType,
      model: 'contact',
    };
    if (cf.options) {
      payload.options = cf.options.slice();
    }
    try {
      const res = await client.createCustomField(payload);
      const id = res?.customField?.id ?? res?.id ?? '(no id)';
      log('OK  ', `created "${cf.name}" [${cf.dataType}] → ${id}`);
      counts.created++;
    } catch (e) {
      log('FAIL', `create "${cf.name}" — ${describeErr(e)}`);
      counts.failed++;
    }
  }
}

async function buildTags() {
  console.log('=== Tags ===');
  const existing = await client.getTags().catch((e) => {
    log('FAIL', `getTags — ${describeErr(e)}`);
    return null;
  });
  const list = existing?.tags ?? [];
  const have = new Set(list.map((t) => (t.name ?? t)?.toLowerCase?.()).filter(Boolean));

  for (const name of TAGS) {
    if (have.has(name.toLowerCase())) {
      log('SKIP', `tag "${name}" already exists`);
      counts.skipped++;
      continue;
    }
    try {
      const res = await client.createTag(name);
      const id = res?.tag?.id ?? res?.id ?? '(no id)';
      log('OK  ', `created tag "${name}" → ${id}`);
      counts.created++;
    } catch (e) {
      log('FAIL', `create tag "${name}" — ${describeErr(e)}`);
      counts.failed++;
    }
  }
}

async function buildPipeline() {
  console.log('=== Pipeline: Affiliate Partners ===');
  const existing = await client.getPipelines().catch((e) => {
    log('FAIL', `getPipelines — ${describeErr(e)}`);
    return null;
  });
  const list = existing?.pipelines ?? [];
  const found = list.find((p) => p.name?.toLowerCase() === PIPELINE.name.toLowerCase());
  if (found) {
    log('SKIP', `pipeline "${PIPELINE.name}" already exists [${found.id}]`);
    counts.skipped++;
    return;
  }
  const payload = {
    name: PIPELINE.name,
    stages: PIPELINE.stages.map((name, i) => ({ name, position: i })),
  };
  try {
    const res = await client.createPipeline(payload);
    const id = res?.pipeline?.id ?? res?.id ?? '(no id)';
    log('OK  ', `created pipeline "${PIPELINE.name}" with ${PIPELINE.stages.length} stages → ${id}`);
    counts.created++;
  } catch (e) {
    log('FAIL', `create pipeline — ${describeErr(e)}`);
    log('NOTE', 'GHL v2 sometimes blocks pipeline creation via PIT auth. If this fails with 401/403, create the pipeline manually in the GHL UI (see funnels/04-broker-referral/ghl-resources.md §3 for stages).');
    counts.failed++;
  }
}

// ============================================================================
// Main
// ============================================================================

console.log(`Building affiliate program resources in location ${client.locationId}\n`);

await summarize('Custom Values', buildCustomValues);
await summarize('Custom Fields', buildCustomFields);
await summarize('Tags',          buildTags);
await summarize('Pipeline',      buildPipeline);

console.log('=== Final Summary ===');
console.log(`Created: ${counts.created}`);
console.log(`Skipped: ${counts.skipped}`);
console.log(`Failed:  ${counts.failed}`);
process.exit(counts.failed > 0 ? 1 : 0);
