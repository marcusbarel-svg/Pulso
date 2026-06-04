const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      if (!user_id) return res.status(200).json({ memory: null });

      const response = await fetch(
        SUPABASE_URL + '/rest/v1/memory?user_id=eq.' + user_id + '&limit=1',
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY
          }
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      const memory = data && data.length > 0 ? data[0] : null;
      return res.status(200).json({ memory });
    }

    if (req.method === 'POST') {
      const { user_id, razon_inicial, frases_clave, sin_resolver } = req.body;
      if (!user_id) return res.status(200).json({ ok: true });

      const payload = {
        user_id,
        razon_inicial,
        frases_clave: Array.isArray(frases_clave) ? frases_clave : [],
        sin_resolver: Array.isArray(sin_resolver) ? sin_resolver : [],
        updated_at: new Date().toISOString()
      };

      // Try PATCH first (update existing)
      const patch = await fetch(
        SUPABASE_URL + '/rest/v1/memory?user_id=eq.' + user_id,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY
          },
          body: JSON.stringify({
            razon_inicial,
            frases_clave: Array.isArray(frases_clave) ? frases_clave : [],
            sin_resolver: Array.isArray(sin_resolver) ? sin_resolver : [],
            updated_at: new Date().toISOString()
          })
        }
      );

      // If no rows updated, do INSERT
      const patchText = await patch.text();
      const patchData = patchText ? JSON.parse(patchText) : [];
      
      if (!patchData || patchData.length === 0) {
        await fetch(SUPABASE_URL + '/rest/v1/memory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY
          },
          body: JSON.stringify(payload)
        });
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ memory: null });
  } catch(e) {
    return res.status(200).json({ memory: null, error: e.message });
  }
}
