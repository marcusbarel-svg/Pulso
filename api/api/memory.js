
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    const { data, error } = await supabase
      .from('memory')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) return res.status(200).json({ memory: null });
    return res.status(200).json({ memory: data });
  }

  if (req.method === 'POST') {
    const { user_id, razon_inicial, frases_clave, sin_resolver } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    const { data, error } = await supabase
      .from('memory')
      .upsert({
        user_id,
        razon_inicial,
        frases_clave,
        sin_resolver,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ memory: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
