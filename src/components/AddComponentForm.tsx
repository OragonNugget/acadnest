import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface Props {
  onAdd: (name: string, weight: number) => void | Promise<void>;
}

export default function AddComponentForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedWeight = parseFloat(weight);
    if (!trimmedName || isNaN(parsedWeight)) return;

    setSubmitting(true);
    try {
      await onAdd(trimmedName, parsedWeight);
    } catch (err) {
      console.error('AddComponentForm error:', err);
    }
    setName('');
    setWeight('');
    setSubmitting(false);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed themed-border-subtle hover:themed-border-subtle themed-surface hover:themed-surface themed-text/30 hover:themed-text/50 text-sm transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Add Component
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl themed-surface border themed-border-subtle p-4">
      <h3 className="text-sm font-medium themed-text/60 mb-3">New Grading Component</h3>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="text-[10px] themed-text/30 block mb-1">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Midterm Exam"
            className="w-full themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-sm themed-text placeholder:themed-text/20 focus:outline-none focus:border-yellow-300/40"
            autoFocus
            disabled={submitting}
          />
        </div>
        <div className="w-24">
          <label className="text-[10px] themed-text/30 block mb-1">Weight (%)</label>
          <input
            value={weight}
            onChange={e => setWeight(e.target.value)}
            type="number"
            min={0}
            max={100}
            step="any"
            placeholder="25"
            className="w-full themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-sm themed-text placeholder:themed-text/20 focus:outline-none focus:border-yellow-300/40"
            disabled={submitting}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          disabled={submitting || !name.trim() || !weight}
          className="px-4 py-2 rounded-lg bg-yellow-300/20 themed-accent-soft text-sm font-medium hover:bg-yellow-300/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {submitting ? 'Adding...' : 'Add'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={submitting}
          className="px-4 py-2 rounded-lg themed-surface-h themed-text/30 text-sm hover:themed-surface-raised transition-colors cursor-pointer disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
