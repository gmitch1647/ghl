import 'dotenv/config';
import { clientFromEnv } from '../api/client.js';

const c = clientFromEnv();
const NAME = '__probe__';
const EMAIL = 'probe@example.invalid';

async function tryDelete(label, fn) {
  try { await fn(); console.log(`[OK ] cleaned ${label}`); }
  catch (e) { console.log(`[err] ${label} — ${e.status} ${typeof e.body === 'string' ? e.body : JSON.stringify(e.body).slice(0, 200)}`); }
}

// Custom field
{
  const r = await c.getCustomFields('contact');
  const f = (r?.customFields ?? []).find((x) => x.name === NAME);
  if (f) await tryDelete(`customField ${f.id}`, () => c.delete(`/locations/${c.locationId}/customFields/${f.id}`));
  else console.log('[--]  no probe custom field');
}

// Custom value
{
  const r = await c.getCustomValues();
  const v = (r?.customValues ?? r?.values ?? r ?? []).find?.((x) => x.name === NAME);
  if (v) await tryDelete(`customValue ${v.id}`, () => c.delete(`/locations/${c.locationId}/customValues/${v.id}`));
  else console.log('[--]  no probe custom value');
}

// Tag
{
  const r = await c.getTags();
  const t = (r?.tags ?? []).find((x) => (x.name ?? x) === NAME);
  if (t) await tryDelete(`tag ${t.id}`, () => c.delete(`/locations/${c.locationId}/tags/${t.id}`));
  else console.log('[--]  no probe tag');
}

// Contact
try {
  const r = await c.searchContacts({ query: EMAIL, pageLimit: 20 });
  for (const ct of r?.contacts ?? []) {
    await tryDelete(`contact ${ct.id} (${ct.email})`, () => c.delete(`/contacts/${ct.id}`));
  }
  if (!(r?.contacts ?? []).length) console.log('[--]  no probe contact');
} catch (e) {
  console.log('[err] search contact —', e.status, JSON.stringify(e.body).slice(0, 200));
}

// Email template
{
  const r = await c.getEmailTemplates({ limit: 200 });
  const probes = (r?.builders ?? []).filter((x) => x.name === NAME || x.name === 'New Template');
  // Only delete the most-recent "New Template" since GHL silently renames POST-created ones
  probes.sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
  for (const p of probes.slice(0, 1)) {
    await tryDelete(`emailTemplate ${p.id} (${p.name})`, () => c.delete(`/emails/builder/${c.locationId}/${p.id}`));
  }
  if (!probes.length) console.log('[--]  no probe email template');
}

// Calendar
{
  const r = await c.getCalendars();
  const cal = (r?.calendars ?? []).find((x) => x.name === NAME);
  if (cal) await tryDelete(`calendar ${cal.id}`, () => c.delete(`/calendars/${cal.id}`));
  else console.log('[--]  no probe calendar');
}

// Link (Trigger Link)
{
  try {
    const r = await c.get('/links/', { query: { locationId: c.locationId } });
    const link = (r?.links ?? []).find((x) => x.name === NAME);
    if (link) await tryDelete(`link ${link.id}`, () => c.delete(`/links/${link.id}`));
    else console.log('[--]  no probe link');
  } catch (e) {
    console.log('[err] list links —', e.status, JSON.stringify(e.body).slice(0, 150));
  }
}

// Product
{
  try {
    const r = await c.get('/products/', { query: { locationId: c.locationId } });
    const prod = (r?.products ?? []).find((x) => x.name === NAME);
    if (prod) await tryDelete(`product ${prod._id ?? prod.id}`, () => c.delete(`/products/${prod._id ?? prod.id}?locationId=${c.locationId}`));
    else console.log('[--]  no probe product');
  } catch (e) {
    console.log('[err] list products —', e.status, JSON.stringify(e.body).slice(0, 150));
  }
}
