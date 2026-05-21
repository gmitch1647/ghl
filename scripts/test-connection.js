import 'dotenv/config';
import { clientFromEnv } from '../api/client.js';

const client = clientFromEnv();

console.log('Pinging GHL (' + client.baseUrl + ')');
console.log('Location ID: ' + client.locationId);
console.log('');

const probes = [
  ['Location',      () => client.getLocation()],
  ['Pipelines',     () => client.getPipelines()],
  ['Custom Fields', () => client.getCustomFields('contact')],
  ['Tags',          () => client.getTags()],
  ['Users',         () => client.getUsers()],
  ['Calendars',     () => client.getCalendars()],
];

const results = await Promise.all(
  probes.map(async ([name, fn]) => {
    try { return { name, ok: true, data: await fn() }; }
    catch (e) { return { name, ok: false, error: e.message, status: e.status, body: e.body }; }
  })
);

const byName = Object.fromEntries(results.map((r) => [r.name, r]));

// ---------- Summary ----------
console.log('=== Connection Summary ===');
for (const r of results) {
  console.log((r.ok ? 'OK   ' : 'FAIL ') + r.name + (r.ok ? '' : '  (' + (r.status ?? 'err') + ') ' + r.error));
}
console.log('');

// ---------- Detail ----------
const loc = byName.Location;
if (loc.ok) {
  const l = loc.data?.location ?? loc.data;
  console.log('--- Location ---');
  console.log('  Name:     ' + (l?.name ?? '-'));
  console.log('  Company:  ' + (l?.companyId ?? '-'));
  console.log('  Address:  ' + [l?.address, l?.city, l?.state, l?.postalCode].filter(Boolean).join(', '));
  console.log('  Timezone: ' + (l?.timezone ?? '-'));
  console.log('  Website:  ' + (l?.website ?? '-'));
  console.log('  Phone:    ' + (l?.phone ?? '-'));
  console.log('  Email:    ' + (l?.email ?? '-'));
  console.log('');
}

const pipes = byName.Pipelines;
if (pipes.ok) {
  const list = pipes.data?.pipelines ?? [];
  console.log('--- Pipelines (' + list.length + ') ---');
  for (const p of list) {
    console.log('  - ' + p.name + '  [' + p.id + ']');
    for (const s of p.stages ?? []) console.log('      * ' + s.name);
  }
  if (list.length === 0) console.log('  (none yet)');
  console.log('');
}

const cf = byName['Custom Fields'];
if (cf.ok) {
  const list = cf.data?.customFields ?? [];
  console.log('--- Custom Fields - contact (' + list.length + ') ---');
  for (const f of list) console.log('  - ' + f.name + '  (' + f.dataType + ')  key=' + (f.fieldKey ?? f.key ?? '-'));
  if (list.length === 0) console.log('  (none yet)');
  console.log('');
}

const tags = byName.Tags;
if (tags.ok) {
  const list = tags.data?.tags ?? [];
  console.log('--- Tags (' + list.length + ') ---');
  for (const t of list.slice(0, 30)) console.log('  - ' + (t.name ?? t));
  if (list.length > 30) console.log('  ... (+' + (list.length - 30) + ' more)');
  if (list.length === 0) console.log('  (none yet)');
  console.log('');
}

const users = byName.Users;
if (users.ok) {
  const list = users.data?.users ?? [];
  console.log('--- Users (' + list.length + ') ---');
  for (const u of list) console.log('  - ' + (u.name ?? (u.firstName + ' ' + u.lastName).trim()) + '  <' + u.email + '>  [' + u.id + ']');
  if (list.length === 0) console.log('  (none yet)');
  console.log('');
}

const cals = byName.Calendars;
if (cals.ok) {
  const list = cals.data?.calendars ?? [];
  console.log('--- Calendars (' + list.length + ') ---');
  for (const c of list) console.log('  - ' + c.name + '  [' + c.id + ']');
  if (list.length === 0) console.log('  (none yet)');
  console.log('');
}

const anyFail = results.some((r) => !r.ok);
if (anyFail) {
  console.log('One or more probes failed. Details:');
  for (const r of results.filter((x) => !x.ok)) {
    console.log('\n[' + r.name + '] status=' + r.status);
    console.log(typeof r.body === 'string' ? r.body : JSON.stringify(r.body, null, 2));
  }
  process.exit(1);
}

console.log('Connection OK.');
