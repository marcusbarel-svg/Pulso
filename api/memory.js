const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

async function supabaseQuery(method, body, params) {
  const url = SUPABASE_URL + '/rest/v1/memory' + (params ? '?' + params : '');
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Prefer': method === 'POST' ? 'resolution=merge-duplicates' : ''
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export default async function handler(req, res) {
  try { res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'GET') {
      const { user_id } = req.query;
      if (!user_id) return res.status(200).json({ memory: null });

      const data = await supabaseQuery('GET', null, 'user_id=eq.' + user_id + '&limit=1');
      const memory = data && data.length > 0 ? data[0] : null;
      return res.status(200).json({ memory });res.setHeader('Cache-Control', 'no-store');
    }

    if (req.method === 'POST') {
      const { user_id, razon_inicial, frases_clave, sin_resolver } = req.body;
      if (!user_id) return res.status(200).json({ ok: true });

      await supabaseQuery('POST', {
        user_id,
        razon_inicial,
        frases_clave,
        sin_resolver,
        updated_at: new Date().toISOString()
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ memory: null });
  } catch(e) {
    return res.status(200).json({ memory: null, error: e.message });
  }
}
