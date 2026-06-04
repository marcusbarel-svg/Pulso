import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    );

    if (req.method === 'GET') {
      const { user_id } = req.query;
      if (!user_id) return res.status(200).json({ memory: null });

      const { data } = await supabase
        .from('memory')
        .select('*')
        .eq('user_id', user_id)
        .single();

      return res.status(200).json({ memory: data || null });
    }

    if (req.method === 'POST') {
      const { user_id, razon_inicial, frases_clave, sin_resolver } = req.body;
      if (!user_id) return res.status(200).json({ ok: true });

      await supabase
        .from('memory')
        .upsert({
          user_id,
          razon_inicial,
          frases_clave,
          sin_resolver,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ memory: null });
  } catch(e) {
    return res.status(200).json({ memory: null, error: e.message });
  }
}
