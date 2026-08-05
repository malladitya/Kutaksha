export const DEFAULT_BASELINE = {
  walking_speed: 1.2,
  activity_level: 82,
  sitting_minutes: 48,
  balance_score: 78,
  tremor_index: 12,
  gait_rhythm: 85,
  heart_rate_var: 45,
};

export function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeMetrics(input, fallback = DEFAULT_BASELINE) {
  if (!input || typeof input !== 'object') return { ...fallback };
  return {
    walking_speed: asNumber(input.walking_speed ?? input.walkingSpeed, fallback.walking_speed),
    activity_level: asNumber(input.activity_level ?? input.activity ?? input.activityLevel, fallback.activity_level),
    sitting_minutes: asNumber(input.sitting_minutes ?? input.sitting ?? input.sittingTime, fallback.sitting_minutes),
    balance_score: asNumber(input.balance_score ?? input.balanceScore, fallback.balance_score),
    tremor_index: asNumber(input.tremor_index ?? input.tremorIndex, fallback.tremor_index),
    gait_rhythm: asNumber(input.gait_rhythm ?? input.gaitRhythm, fallback.gait_rhythm),
    heart_rate_var: asNumber(input.heart_rate_var ?? input.heartRateVar, fallback.heart_rate_var),
  };
}

export function hsiFromCurrent(current, base) {
  const speedDrop = Math.max(0, (base.walking_speed - current.walking_speed) / base.walking_speed);
  const activityDrop = Math.max(0, (base.activity_level - current.activity_level) / base.activity_level);
  const sittingRise = Math.max(0, (current.sitting_minutes - base.sitting_minutes) / base.sitting_minutes);
  const balanceDrop = Math.max(0, (base.balance_score - current.balance_score) / base.balance_score);
  const tremorRise = Math.max(0, (current.tremor_index - base.tremor_index) / Math.max(base.tremor_index, 1));
  const score = 100 - speedDrop * 30 - activityDrop * 25 - sittingRise * 15 - balanceDrop * 15 - tremorRise * 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function riskFromCurrent(current, base) {
  let risk = 0;
  if (current.walking_speed < base.walking_speed * 0.85) risk += 25;
  if (current.activity_level < base.activity_level * 0.7) risk += 20;
  if (current.sitting_minutes > base.sitting_minutes * 1.3) risk += 15;
  if (current.walking_speed < base.walking_speed * 0.75) risk += 10;
  if (current.balance_score < base.balance_score * 0.8) risk += 15;
  if (current.tremor_index > base.tremor_index * 1.5) risk += 15;
  return Math.min(100, risk);
}

export function metricChange(current, base) {
  if (base === 0) return 0;
  return Math.round(((current - base) / base) * 100);
}

export function deviationPercent(current, base) {
  if (base === 0) return 0;
  return Math.abs((current - base) / base) * 100;
}

export function checkDeviations(current, base, threshold = 20) {
  const alerts = [];
  const metrics = [
    { key: 'walking_speed', label: 'Walking Speed', unit: 'm/s', lowerIsBad: true },
    { key: 'activity_level', label: 'Activity Level', unit: '%', lowerIsBad: true },
    { key: 'sitting_minutes', label: 'Sitting Duration', unit: 'min', lowerIsBad: false },
    { key: 'balance_score', label: 'Balance Score', unit: '%', lowerIsBad: true },
    { key: 'tremor_index', label: 'Tremor Index', unit: '', lowerIsBad: false },
    { key: 'gait_rhythm', label: 'Gait Rhythm', unit: '%', lowerIsBad: true },
    { key: 'heart_rate_var', label: 'Heart Rate Variability', unit: 'ms', lowerIsBad: true },
  ];

  for (const m of metrics) {
    const curr = current[m.key];
    const bl = base[m.key];
    const dev = deviationPercent(curr, bl);
    if (dev >= threshold) {
      const direction = curr > bl ? 'above' : 'below';
      const severity = dev >= 40 ? 'critical' : dev >= 30 ? 'warning' : 'caution';
      alerts.push({
        metric: m.key,
        label: m.label,
        current: curr,
        baseline: bl,
        deviation: Math.round(dev),
        direction,
        severity,
        unit: m.unit,
        message: `${m.label} is ${Math.round(dev)}% ${direction} baseline (${curr}${m.unit ? ' ' + m.unit : ''} vs ${bl}${m.unit ? ' ' + m.unit : ''})`,
      });
    }
  }
  return alerts;
}

export function riskLabel(score) {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function trendLabel(change, reverse = false) {
  const good = reverse ? change > 0 : change < 0;
  return good ? 'text-emerald-600' : 'text-rose-600';
}

export const METRIC_LABELS = {
  walking_speed: { label: 'Walking Speed', unit: 'm/s', decimals: 2 },
  activity_level: { label: 'Activity Level', unit: '%', decimals: 0 },
  sitting_minutes: { label: 'Sitting Duration', unit: 'min', decimals: 0 },
  balance_score: { label: 'Balance Score', unit: '%', decimals: 0 },
  tremor_index: { label: 'Tremor Index', unit: '', decimals: 1 },
  gait_rhythm: { label: 'Gait Rhythm', unit: '%', decimals: 0 },
  heart_rate_var: { label: 'Heart Rate Variability', unit: 'ms', decimals: 0 },
};
