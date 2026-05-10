import supabase, { getUserClient, getAuthUser } from './_supabase.js';

// Anonymous grade distribution comparison
// Uses a shared table: grade_distributions (no user_id, just ranges)
// Users submit their grade range; we return the aggregated distribution.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Auth required to prevent spam, but we don't store user_id with grade data
  const { user, error: authError } = await getAuthUser(req.headers.authorization);
  if (authError) return res.status(401).json({ error: authError });

  try {
    if (req.method === 'GET') {
      // Return aggregated distribution across all submissions
      const { data, error } = await supabase
        .from('grade_compare')
        .select('grade_range, count')
        .order('grade_range');

      if (error) throw error;

      // Aggregate into distribution object
      const dist = {
        below60: 0,
        s60to75: 0,
        s75to85: 0,
        s85to95: 0,
        s95plus: 0,
        total: 0,
        avg: 0,
      };

      // If no data, return empty
      if (!data || data.length === 0) return res.status(200).json(dist);

      for (const row of data) {
        const range = row.grade_range;
        const cnt = row.count || 0;
        if (dist[range] !== undefined) {
          dist[range] += cnt;
          dist.total += cnt;
        }
      }

      // Approximate avg from ranges
      const midpoints = {
        below60: 50, s60to75: 67.5, s75to85: 80, s85to95: 90, s95plus: 97.5
      };
      let weightedSum = 0;
      for (const [range, count] of Object.entries(dist)) {
        if (range in midpoints) weightedSum += (midpoints[range] * count);
      }
      dist.avg = dist.total > 0 ? weightedSum / dist.total : 0;

      return res.status(200).json(dist);
    }

    if (req.method === 'POST') {
      const { grade } = req.body;
      if (typeof grade !== 'number' || grade < 0 || grade > 100) {
        return res.status(400).json({ error: 'Invalid grade' });
      }

      // Determine range
      let grade_range;
      if (grade < 60) grade_range = 'below60';
      else if (grade < 75) grade_range = 's60to75';
      else if (grade < 85) grade_range = 's75to85';
      else if (grade < 95) grade_range = 's85to95';
      else grade_range = 's95plus';

      // Use upsert to increment count for this range
      // The table has: grade_range (text, primary key), count (int)
      const { data: existing } = await supabase
        .from('grade_compare')
        .select('count')
        .eq('grade_range', grade_range)
        .single();

      if (existing) {
        await supabase
          .from('grade_compare')
          .update({ count: (existing.count || 0) + 1 })
          .eq('grade_range', grade_range);
      } else {
        await supabase
          .from('grade_compare')
          .insert({ grade_range, count: 1 });
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Compare API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
