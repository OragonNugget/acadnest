import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { Component, GradeResult } from '../lib/calculationEngine';
import { computeGrades } from '../lib/calculationEngine';

interface Props {
  components: Component[];
  target: number;
}

interface DataPoint {
  label: string;
  grade: number;
  compName: string;
}

function buildHistoryPoints(components: Component[]): DataPoint[] {
  const points: DataPoint[] = [];

  // We replay adding entries one by one in order to show grade evolution
  // Collect all entries sorted by id (proxy for insertion order)
  const allEntries = components.flatMap(comp =>
    comp.entries.map(e => ({ ...e, compName: comp.name }))
  ).sort((a, b) => a.id - b.id);

  if (allEntries.length === 0) return [];

  // For each entry added, compute what the grade would be
  for (let i = 0; i < allEntries.length; i++) {
    const includedIds = new Set(allEntries.slice(0, i + 1).map(e => e.id));
    const simulated = components.map(comp => ({
      ...comp,
      entries: comp.entries.filter(e => includedIds.has(e.id)),
    }));
    const result = computeGrades(simulated);
    points.push({
      label: `${allEntries[i].compName}: ${allEntries[i].label || `#${i + 1}`}`,
      grade: parseFloat(result.currentGrade.toFixed(2)),
      compName: allEntries[i].compName,
    });
  }

  return points;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl bg-[#111118] border border-white/10 shadow-2xl text-[11px]">
      <p className="themed-text/40 mb-1 max-w-[160px] truncate">{payload[0]?.payload?.label}</p>
      <p className="text-yellow-300 font-bold text-sm">{payload[0]?.value?.toFixed(1)}%</p>
    </div>
  );
};

export default function GradeHistoryChart({ components, target }: Props) {
  const data = useMemo(() => buildHistoryPoints(components), [components]);

  if (data.length < 2) return null;

  const min = Math.max(0, Math.min(...data.map(d => d.grade)) - 10);
  const max = Math.min(100, Math.max(...data.map(d => d.grade)) + 10);
  const trend = data.length >= 2 ? data[data.length - 1].grade - data[0].grade : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-blue-500/[0.03] to-indigo-500/[0.02] border border-blue-500/[0.08] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400/70" />
          <h2 className="text-sm font-semibold themed-text/70">Grade History</h2>
        </div>
        <div className="flex items-center gap-3">
          {trend !== 0 && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              trend > 0
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-red-400 bg-red-500/10'
            }`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          )}
          <span className="text-[10px] themed-text/20">{data.length} entries</span>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD45A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#FFD45A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="label"
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[min, max]}
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
              tickCount={4}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={target}
              stroke="#FFD45A"
              strokeDasharray="4 3"
              strokeOpacity={0.4}
              label={{ value: `${target}%`, fill: 'rgba(255,212,90,0.5)', fontSize: 9, position: 'right' }}
            />
            <Area
              type="monotone"
              dataKey="grade"
              stroke="#FFD45A"
              strokeWidth={2}
              fill="url(#gradeGradient)"
              dot={{ fill: '#FFD45A', strokeWidth: 0, r: 2.5 }}
              activeDot={{ fill: '#FFD45A', strokeWidth: 0, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[9px] themed-text/20 text-center mt-2">
        Grade as each entry was added · dashed line = {target}% target
      </p>
    </motion.div>
  );
}
