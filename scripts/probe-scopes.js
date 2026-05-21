import 'dotenv/config';
import { clientFromEnv } from '../api/client.js';

const client = clientFromEnv();

// Probe write endpoints to see which scopes our PIT has.
// We use deliberately malformed/minimal payloads — we don't WANT them to succeed
// (we'd create junk), we just want to see the response code: 401/403 = no scope,
// 400/422 = scope OK but bad payload (good news for us — means we can build).

const probes = [
  {
    name: 'POST /opportunities/pipelines',
    fn: () => client.post('/opportunities/pipelines', { locationId: client.locationId, name: '__probe__', stages: [] }),
  },
  {
    name: 'POST /forms',
    fn: () => client.post('/forms', { locationId: client.locationId, name: '__probe__' }),
  },
  {
    name: 'GET  /forms',
    fn: () => client.getForms(),
  },
  {
    name: 'POST /emails/builder',
    fn: () => client.post('/emails/builder', { locationId: client.locationId, name: '__probe__' }),
  },
  {
    name: 'GET  /emails/builder',
    fn: () => client.getEmailTemplates(),
  },
  {
    name: 'POST /documents/templates',
    fn: () => client.post('/documents/templates', { locationId: client.locationId, name: '__probe__' }),
  },
  {
    name: 'POST /workflows',
    fn: () => client.post('/workflows/', { locationId: client.locationId, name: '__probe__' }),
  },
  {
    name: 'POST /funnels/funnel',
    fn: () => client.post('/funnels/funnel', { locationId: client.locationId, name: '__probe__' }),
  },
];

for (const p of probes) {
  try {
    await p.fn();
    console.log(`[201?] ${p.name} — succeeded (unexpected; may have created junk — investigate)`);
  } catch (e) {
    const status = e.status ?? '???';
    const body = typeof e.body === 'string' ? e.body : JSON.stringify(e.body);
    const verdict =
      status === 401 ? 'NO SCOPE (PIT lacks permission)' :
      status === 403 ? 'FORBIDDEN (auth model wrong)' :
      status === 404 ? 'NOT FOUND (endpoint may not exist)' :
      status === 400 || status === 422 ? 'SCOPE OK — endpoint exists, payload invalid' :
      `status=${status}`;
    console.log(`[${status}] ${p.name} — ${verdict}`);
    console.log(`        ${(body ?? '').slice(0, 200)}`);
  }
}
