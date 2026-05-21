const DEFAULT_BASE = 'https://services.leadconnectorhq.com';
const DEFAULT_VERSION = '2021-07-28';

export class GHLClient {
  constructor({ pit, locationId, baseUrl = DEFAULT_BASE, version = DEFAULT_VERSION } = {}) {
    if (!pit) throw new Error('GHLClient: pit is required');
    if (!locationId) throw new Error('GHLClient: locationId is required');
    this.pit = pit;
    this.locationId = locationId;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.version = version;
  }

  async request(method, path, { query, body, maxRetries = 4 } = {}) {
    const url = new URL(this.baseUrl + path);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, item));
        else url.searchParams.set(k, v);
      }
    }

    const headers = {
      Authorization: `Bearer ${this.pit}`,
      Version: this.version,
      Accept: 'application/json',
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    let attempt = 0;
    while (true) {
      let res;
      try {
        res = await fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
      } catch (networkErr) {
        if (attempt >= maxRetries) throw networkErr;
        await sleep(backoffMs(attempt));
        attempt++;
        continue;
      }

      if (res.status === 429 || res.status >= 500) {
        if (attempt >= maxRetries) return parseAndThrow(res, method, url);
        const retryAfter = Number(res.headers.get('Retry-After'));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : backoffMs(attempt);
        await sleep(wait);
        attempt++;
        continue;
      }

      const text = await res.text();
      const data = text ? safeJson(text) : null;
      if (!res.ok) {
        const err = new Error(`GHL ${method} ${url.pathname} -> ${res.status}: ${text || res.statusText}`);
        err.status = res.status;
        err.body = data ?? text;
        throw err;
      }
      return data;
    }
  }

  get(path, opts) { return this.request('GET', path, opts); }
  post(path, body, opts) { return this.request('POST', path, { ...opts, body }); }
  put(path, body, opts) { return this.request('PUT', path, { ...opts, body }); }
  delete(path, opts) { return this.request('DELETE', path, opts); }

  // ---------- Locations ----------
  getLocation() {
    return this.get(`/locations/${this.locationId}`);
  }

  // ---------- Pipelines & Opportunities ----------
  getPipelines() {
    return this.get('/opportunities/pipelines', { query: { locationId: this.locationId } });
  }
  searchOpportunities(params = {}) {
    return this.get('/opportunities/search', { query: { location_id: this.locationId, ...params } });
  }

  // ---------- Custom Fields ----------
  getCustomFields(model = 'contact') {
    return this.get(`/locations/${this.locationId}/customFields`, { query: { model } });
  }
  createCustomField(payload) {
    return this.post(`/locations/${this.locationId}/customFields`, payload);
  }

  // ---------- Tags ----------
  getTags() {
    return this.get(`/locations/${this.locationId}/tags`);
  }
  createTag(name) {
    return this.post(`/locations/${this.locationId}/tags`, { name });
  }

  // ---------- Custom Values ----------
  getCustomValues() {
    return this.get(`/locations/${this.locationId}/customValues`);
  }
  createCustomValue(payload) {
    return this.post(`/locations/${this.locationId}/customValues`, payload);
  }

  // ---------- Create pipeline ----------
  createPipeline(payload) {
    return this.post('/opportunities/pipelines', { locationId: this.locationId, ...payload });
  }

  // ---------- Users ----------
  getUsers() {
    return this.get('/users/', { query: { locationId: this.locationId } });
  }

  // ---------- Calendars ----------
  getCalendars() {
    return this.get('/calendars/', { query: { locationId: this.locationId } });
  }

  // ---------- Contacts ----------
  searchContacts(payload = {}) {
    return this.post('/contacts/search', { locationId: this.locationId, ...payload });
  }
  upsertContact(payload) {
    return this.post('/contacts/upsert', { locationId: this.locationId, ...payload });
  }

  // ---------- Workflows ----------
  getWorkflows() {
    return this.get('/workflows/', { query: { locationId: this.locationId } });
  }

  // ---------- Funnels ----------
  getFunnels() {
    return this.get('/funnels/funnel/list', { query: { locationId: this.locationId } });
  }

  // ---------- Email Templates ----------
  getEmailTemplates(params = {}) {
    return this.get('/emails/builder', { query: { locationId: this.locationId, ...params } });
  }

  // ---------- Forms ----------
  getForms() {
    return this.get('/forms/', { query: { locationId: this.locationId } });
  }
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return text; }
}

function parseAndThrow(res, method, url) {
  return res.text().then((text) => {
    const err = new Error(`GHL ${method} ${url.pathname} -> ${res.status}: ${text || res.statusText}`);
    err.status = res.status;
    err.body = safeJson(text);
    throw err;
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function backoffMs(attempt) { return Math.min(16000, 500 * 2 ** attempt); }

export function clientFromEnv(env = process.env) {
  return new GHLClient({
    pit: env.GHL_PIT,
    locationId: env.GHL_LOCATION_ID,
    baseUrl: env.GHL_API_BASE,
    version: env.GHL_API_VERSION,
  });
}
