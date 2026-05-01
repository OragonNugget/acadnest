// ============================================================
// GPA SCALE — Philippine 1.00 to 5.00 system
// ============================================================

export interface GPAEntry {
  gpa: number;
  label: string;
  minPercent: number;
  maxPercent: number;
}

// Standard Philippine university GPA scale
export const GPA_TABLE: GPAEntry[] = [
  { gpa: 1.00, label: 'Excellent',       minPercent: 97, maxPercent: 100 },
  { gpa: 1.25, label: 'Excellent',       minPercent: 94, maxPercent: 96.99 },
  { gpa: 1.50, label: 'Very Good',       minPercent: 91, maxPercent: 93.99 },
  { gpa: 1.75, label: 'Very Good',       minPercent: 88, maxPercent: 90.99 },
  { gpa: 2.00, label: 'Good',            minPercent: 85, maxPercent: 87.99 },
  { gpa: 2.25, label: 'Good',            minPercent: 82, maxPercent: 84.99 },
  { gpa: 2.50, label: 'Satisfactory',    minPercent: 79, maxPercent: 81.99 },
  { gpa: 2.75, label: 'Satisfactory',    minPercent: 76, maxPercent: 78.99 },
  { gpa: 3.00, label: 'Passing',         minPercent: 75, maxPercent: 75.99 },
  { gpa: 5.00, label: 'Failing',         minPercent: 0,  maxPercent: 74.99 },
];

export function percentToGPA(percent: number): number {
  for (const entry of GPA_TABLE) {
    if (percent >= entry.minPercent && percent <= entry.maxPercent) {
      return entry.gpa;
    }
  }
  return 5.00;
}

export function percentToGPALabel(percent: number): string {
  for (const entry of GPA_TABLE) {
    if (percent >= entry.minPercent && percent <= entry.maxPercent) {
      return entry.label;
    }
  }
  return 'Failing';
}

export function gpaToColor(gpa: number): string {
  if (gpa <= 1.25) return '#22c55e'; // green
  if (gpa <= 1.75) return '#4ade80'; // light green
  if (gpa <= 2.25) return '#a3e635'; // lime
  if (gpa <= 2.75) return '#f0abfc'; // yellow
  if (gpa <= 3.00) return '#f9a8c9'; // rose
  return '#ef4444'; // red — failing
}

export function formatGPA(gpa: number): string {
  return gpa.toFixed(2);
}

// Calculate GWA from courses: Σ(grade × units) / Σ(units)
export function calculateGWA(courses: { gpa: number; units: number }[]): number {
  const totalUnits = courses.reduce((s, c) => s + c.units, 0);
  if (totalUnits === 0) return 0;
  const weightedSum = courses.reduce((s, c) => s + c.gpa * c.units, 0);
  return weightedSum / totalUnits;
}
