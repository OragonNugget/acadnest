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
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border hover:border-border-hover bg-background hover:bg-surface text-muted hover:text-foreground text-sm transition-all cursor-pointer shadow-sm"
      >
        <Plus className="w-4 h-4" /> Add Component
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-surface border border-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">New Grading Component</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[140px]">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-1.5">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Midterm Exam"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
            autoFocus
            disabled={submitting}
          />
        </div>
        <div className="w-24">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-1.5">Weight (%)</label>
          <input
            value={weight}
            onChange={e => setWeight(e.target.value)}
            type="number"
            min={0}
            max={100}
            step="any"
          placeholder="25"
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
          disabled={submitting}
        />
      </div>
    </div>
    <div className="flex gap-2 mt-5">
      <button
        type="submit"
        disabled={submitting || !name.trim() || !weight}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary-hover shadow-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        {submitting ? 'Adding...' : 'Add Component'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        disabled={submitting}
        className="px-4 py-2 rounded-md bg-surface border border-border text-muted font-medium text-sm hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
      >
        Cancel
      </button>
    </div>
  </form>
  );
}
