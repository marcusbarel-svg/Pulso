const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'presente' : 'FALTA');
  console.log('SUPABASE_KEY:', SUPABASE_KEY ? 'presente' : 'FALTA');
  console.log('Method:', req.method);

  try {
    if (req.method === 'GET') {
      const { user_id } = req.query;
      const url = SUPABASE_URL + '/rest/v1/memory?user_id=eq.' + user_id + '&limit=1';
      console.log('GET URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        }
      });
      
      console.log('GET status:', response.status);
      const text = await response.text();
      console.log('GET body:', text);
      
      const data = text ? JSON.parse(text) : [];
      const memory = data && data.length > 0 ? data[0] : null;
      return res.status(200).json({ memory });
    }

  if (req.method === 'POST') {
  const { user_id, razon_inicial, frases_clave, sin_resolver } = req.body;
  if (!user_id) return res.status(200).json({ ok: true });

  const response = await fetch(SUPABASE_URL + '/rest/v1/memory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      user_id,
      razon_inicial,
      frases_clave: Array.isArray(frases_clave) ? frases_clave : [],
      sin_resolver: Array.isArray(sin_resolver) ? sin_resolver : [],
      updated_at: new Date().toISOString()
    })
  });

  console.log('POST status:', response.status);
  const text = await response.text();
  console.log('POST response:', text);

  return res.status(200).json({ ok: true });
}
    }

    return res.status(200).json({ memory: null });
  } catch(e) {
    console.log('ERROR:', e.message);
    return res.status(200).json({ memory: null, error: e.message });
  }
}
