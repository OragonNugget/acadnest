import supabase, { getAuthUser } from './_supabase.js';

// Anonymous grade-range comparison, scoped per subject title.
//
// Tables:
//   grade_compare (subject_key, grade_range, count, subject_name)
//   grade_compare_submissions (user_id, subject_key, grade_range, submitted_at)
//
// See reset.sql for full schema.

const RANGES = ['below60', 's60to75', 's75to85', 's85to95', 's95plus'];
const MIDPOINTS = { below60: 50, s60to75: 67.5, s75to85: 80, s85to95: 90, s95plus: 97.5 };

function normalizeSubject(name) {
  return (name || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function gradeToRange(grade) {
  if (grade < 60) return 'below60';
  if (grade < 75) return 's60to75';
  if (grade < 85) return 's75to85';
  if (grade < 95) return 's85to95';
  return 's95plus';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { user, error: authError } = await getAuthUser(req.headers.authorization);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });

  try {
    // ── GET: fetch distribution + whether this user already submitted ──
    if (req.method === 'GET') {
      const subjectKey = normalizeSubject(req.query.subject);
      if (!subjectKey) return res.status(400).json({ error: 'subject query param required' });

      const [{ data: distData, error: distErr }, { data: subData }] = await Promise.all([
        supabase
          .from('grade_compare')
          .select('grade_range, count, subject_name')
          .eq('subject_key', subjectKey),
        supabase
          .from('grade_compare_submissions')
          .select('grade_range')
          .eq('user_id', user.id)
          .eq('subject_key', subjectKey)
          .maybeSingle(),
      ]);

      if (distErr) throw distErr;

      const dist = {
        below60: 0, s60to75: 0, s75to85: 0, s85to95: 0, s95plus: 0,
        total: 0, avg: 0, subject_name: subjectKey,
        already_submitted: !!subData,
        my_range: subData?.grade_range ?? null,
      };

      if (distData?.length > 0) {
        dist.subject_name = distData[0].subject_name || subjectKey;
        for (const row of distData) {
          const cnt = row.count || 0;
          if (dist[row.grade_range] !== undefined) {
            dist[row.grade_range] += cnt;
            dist.total += cnt;
          }
        }
        let ws = 0;
        for (const range of RANGES) ws += MIDPOINTS[range] * dist[range];
        dist.avg = dist.total > 0 ? ws / dist.total : 0;
      }

      return res.status(200).json(dist);
    }

    // ── POST: submit or update grade range ──
    if (req.method === 'POST') {
      const { grade, subject } = req.body;
      if (typeof grade !== 'number' || grade < 0 || grade > 100)
        return res.status(400).json({ error: 'Invalid grade' });
      if (!subject?.trim())
        return res.status(400).json({ error: 'subject is required' });

      const subjectKey = normalizeSubject(subject);
      const newRange = gradeToRange(grade);

      // Check if user already submitted for this subject
      const { data: existing } = await supabase
        .from('grade_compare_submissions')
        .select('grade_range')
        .eq('user_id', user.id)
        .eq('subject_key', subjectKey)
        .maybeSingle();

      if (existing) {
        const oldRange = existing.grade_range;

        if (oldRange === newRange) {
          // Same range — nothing to do
          return res.status(200).json({ ok: true, updated: false });
        }

        // Different range — decrement old, increment new
        const { data: oldRow } = await supabase
          .from('grade_compare')
          .select('count')
          .eq('subject_key', subjectKey)
          .eq('grade_range', oldRange)
          .maybeSingle();

        if (oldRow) {
          const newCount = Math.max(0, (oldRow.count || 1) - 1);
          await supabase
            .from('grade_compare')
            .update({ count: newCount })
            .eq('subject_key', subjectKey)
            .eq('grade_range', oldRange);
        }

        // Increment new range
        const { data: newRow } = await supabase
          .from('grade_compare')
          .select('count')
          .eq('subject_key', subjectKey)
          .eq('grade_range', newRange)
          .maybeSingle();

        if (newRow) {
          await supabase
            .from('grade_compare')
            .update({ count: (newRow.count || 0) + 1 })
            .eq('subject_key', subjectKey)
            .eq('grade_range', newRange);
        } else {
          await supabase
            .from('grade_compare')
            .insert({ subject_key: subjectKey, subject_name: subject.trim(), grade_range: newRange, count: 1 });
        }

        // Update submission record
        await supabase
          .from('grade_compare_submissions')
          .update({ grade_range: newRange, submitted_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('subject_key', subjectKey);

        return res.status(200).json({ ok: true, updated: true });
      }

      // First submission — insert submission record + increment count
      await supabase
        .from('grade_compare_submissions')
        .insert({ user_id: user.id, subject_key: subjectKey, grade_range: newRange });

      const { data: existingRow } = await supabase
        .from('grade_compare')
        .select('count')
        .eq('subject_key', subjectKey)
        .eq('grade_range', newRange)
        .maybeSingle();

      if (existingRow) {
        await supabase
          .from('grade_compare')
          .update({ count: (existingRow.count || 0) + 1 })
          .eq('subject_key', subjectKey)
          .eq('grade_range', newRange);
      } else {
        await supabase
          .from('grade_compare')
          .insert({ subject_key: subjectKey, subject_name: subject.trim(), grade_range: newRange, count: 1 });
      }

      return res.status(200).json({ ok: true, updated: false });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Compare API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
