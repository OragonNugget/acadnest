import supabase, { getAuthUser } from './_supabase.js';

// Anonymous grade-range comparison, scoped per subject title.
//
// Table: grade_compare
//   subject_key  text        — normalized subject name (lowercase, trimmed)
//   subject_name text        — display name as submitted by first user
//   grade_range  text        — 'below60' | 's60to75' | 's75to85' | 's85to95' | 's95plus'
//   count        integer     — number of students in this range for this subject
//   PRIMARY KEY (subject_key, grade_range)
//
// Run in Supabase SQL editor:
//   DROP TABLE IF EXISTS grade_compare;
//   CREATE TABLE grade_compare (
//     subject_key  text    NOT NULL,
//     subject_name text    NOT NULL DEFAULT '',
//     grade_range  text    NOT NULL,
//     count        integer NOT NULL DEFAULT 0,
//     PRIMARY KEY (subject_key, grade_range)
//   );
//   -- No RLS needed — intentionally public aggregate data. Enable if desired.

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
    if (req.method === 'GET') {
      const subjectKey = normalizeSubject(req.query.subject);
      if (!subjectKey) return res.status(400).json({ error: 'subject query param required' });

      const { data, error } = await supabase
        .from('grade_compare')
        .select('grade_range, count, subject_name')
        .eq('subject_key', subjectKey);

      if (error) throw error;

      const dist = { below60: 0, s60to75: 0, s75to85: 0, s85to95: 0, s95plus: 0, total: 0, avg: 0, subject_name: subjectKey };

      if (data && data.length > 0) {
        dist.subject_name = data[0].subject_name || subjectKey;
        for (const row of data) {
          const cnt = row.count || 0;
          if (dist[row.grade_range] !== undefined) {
            dist[row.grade_range] += cnt;
            dist.total += cnt;
          }
        }
        let ws = 0;
        for (const range of RANGES) ws += (MIDPOINTS[range] * dist[range]);
        dist.avg = dist.total > 0 ? ws / dist.total : 0;
      }

      return res.status(200).json(dist);
    }

    if (req.method === 'POST') {
      const { grade, subject } = req.body;
      if (typeof grade !== 'number' || grade < 0 || grade > 100)
        return res.status(400).json({ error: 'Invalid grade' });
      if (!subject || typeof subject !== 'string' || !subject.trim())
        return res.status(400).json({ error: 'subject is required' });

      const subjectKey = normalizeSubject(subject);
      const grade_range = gradeToRange(grade);

      // Upsert: increment count for this subject+range
      const { data: existing } = await supabase
        .from('grade_compare')
        .select('count')
        .eq('subject_key', subjectKey)
        .eq('grade_range', grade_range)
        .single();

      if (existing) {
        await supabase
          .from('grade_compare')
          .update({ count: (existing.count || 0) + 1 })
          .eq('subject_key', subjectKey)
          .eq('grade_range', grade_range);
      } else {
        await supabase
          .from('grade_compare')
          .insert({ subject_key: subjectKey, subject_name: subject.trim(), grade_range, count: 1 });
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Compare API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
