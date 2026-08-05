import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Legend,
  ComposedChart,
} from 'recharts';

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(p.dataKey === 'walking_speed' ? 2 : 0) : p.value}
        </p>
      ))}
    </div>
  );
}

export function HsiRiskChart({ data, height = 280 }) {
  if (!data?.length) {
    return <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">Start tracking to see trends</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
        <XAxis dataKey="time" stroke="#64748b" fontSize={10} interval="preserveStartEnd" />
        <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <ReferenceLine y={70} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: 'Risk threshold', fontSize: 10, fill: '#d97706' }} />
        <Area type="monotone" dataKey="hsi" fill="rgba(14,165,233,0.1)" stroke="#0ea5e9" strokeWidth={2} name="Health Stability" dot={false} />
        <Line type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2.5} name="Risk Score" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function MetricLiveChart({ data, dataKey, label, color, baseline, height = 200, unit = '' }) {
  if (!data?.length) {
    return <div className="flex items-center justify-center text-xs text-slate-500" style={{ height }}>No data yet</div>;
  }
  const upperBand = baseline ? baseline * 1.2 : null;
  const lowerBand = baseline ? baseline * 0.8 : null;

  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-700">{label}</p>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} interval="preserveStartEnd" />
          <YAxis stroke="#94a3b8" fontSize={10} />
          <Tooltip content={<CustomTooltip />} />
          {upperBand && <ReferenceLine y={upperBand} stroke="#fbbf24" strokeDasharray="3 3" label={{ value: '+20%', fontSize: 9, fill: '#d97706' }} />}
          {baseline && <ReferenceLine y={baseline} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Baseline', fontSize: 9, fill: '#059669' }} />}
          {lowerBand && <ReferenceLine y={lowerBand} stroke="#fbbf24" strokeDasharray="3 3" label={{ value: '-20%', fontSize: 9, fill: '#d97706' }} />}
          <Area type="monotone" dataKey={dataKey} fill={`${color}22`} stroke={color} strokeWidth={2} name={`${label}${unit ? ' (' + unit + ')' : ''}`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MultiMetricGrid({ history, baseline }) {
  const chartData = history.map((h) => ({
    time: formatTime(h.timestamp),
    walking_speed: h.walking_speed,
    activity_level: h.activity_level,
    sitting_minutes: h.sitting_minutes,
    balance_score: h.balance_score,
    tremor_index: h.tremor_index,
    gait_rhythm: h.gait_rhythm,
    heart_rate_var: h.heart_rate_var,
  }));

  const metrics = [
    { key: 'walking_speed', label: 'Walking Speed', color: '#0ea5e9', unit: 'm/s' },
    { key: 'activity_level', label: 'Activity', color: '#8b5cf6', unit: '%' },
    { key: 'balance_score', label: 'Balance', color: '#10b981', unit: '%' },
    { key: 'tremor_index', label: 'Tremor', color: '#f59e0b', unit: '' },
    { key: 'gait_rhythm', label: 'Gait Rhythm', color: '#ec4899', unit: '%' },
    { key: 'heart_rate_var', label: 'HRV', color: '#6366f1', unit: 'ms' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => (
        <div key={m.key} className="rounded-xl border border-slate-200 bg-white p-3">
          <MetricLiveChart
            data={chartData}
            dataKey={m.key}
            label={m.label}
            color={m.color}
            baseline={baseline?.[m.key]}
            unit={m.unit}
            height={160}
          />
        </div>
      ))}
    </div>
  );
}

export function buildTrendData(history, baseline) {
  return history.map((h) => {
    const speedDrop = Math.max(0, (baseline.walking_speed - h.walking_speed) / baseline.walking_speed);
    const activityDrop = Math.max(0, (baseline.activity_level - h.activity_level) / baseline.activity_level);
    const sittingRise = Math.max(0, (h.sitting_minutes - baseline.sitting_minutes) / baseline.sitting_minutes);
    const hsi = Math.max(0, Math.min(100, Math.round(100 - speedDrop * 30 - activityDrop * 25 - sittingRise * 15)));
    let risk = 0;
    if (h.walking_speed < baseline.walking_speed * 0.85) risk += 25;
    if (h.activity_level < baseline.activity_level * 0.7) risk += 20;
    if (h.sitting_minutes > baseline.sitting_minutes * 1.3) risk += 15;
    if (h.balance_score < baseline.balance_score * 0.8) risk += 15;
    if (h.tremor_index > baseline.tremor_index * 1.5) risk += 15;
    return { time: formatTime(h.timestamp), hsi, risk: Math.min(100, risk) };
  });
}
