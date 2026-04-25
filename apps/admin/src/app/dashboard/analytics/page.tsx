'use client';
import { useEffect, useState } from 'react';
import adminApi from '@/lib/api';

interface Analytics {
  totalUsers: number;
  activeToday: number;
  totalXPAwarded: number;
  premiumUsers: number;
  tasksCompletedToday: number;
}

function MetricRow({ label, value, sub, color = 'text-white' }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-outline-variant/50 last:border-0">
      <span className="text-muted text-sm">{label}</span>
      <div className="text-right">
        <span className={`font-bold ${color}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {sub && <span className="text-muted text-xs ml-2">{sub}</span>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-muted">Loading analytics...</div>;
  if (!analytics) return <div className="p-8 text-muted">Failed to load. Is the backend running?</div>;

  const premiumRate = analytics.totalUsers > 0
    ? ((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1)
    : '0';

  const avgXP = analytics.totalUsers > 0
    ? Math.round(analytics.totalXPAwarded / analytics.totalUsers)
    : 0;

  const dailyActiveRate = analytics.totalUsers > 0
    ? ((analytics.activeToday / analytics.totalUsers) * 100).toFixed(1)
    : '0';

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-muted mt-1">Platform health metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: analytics.totalUsers, icon: '👥', color: 'text-white' },
          { label: 'Active Today', value: analytics.activeToday, icon: '🔥', color: 'text-secondary' },
          { label: 'Total XP Awarded', value: analytics.totalXPAwarded.toLocaleString(), icon: '⭐', color: 'text-accent' },
          { label: 'Premium Users', value: analytics.premiumUsers, icon: '💎', color: 'text-tertiary' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-outline-variant rounded-xl p-5">
            <span className="text-2xl">{kpi.icon}</span>
            <p className={`text-3xl font-bold mt-2 ${kpi.color}`}>{kpi.value}</p>
            <p className="text-muted text-xs mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Derived Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-outline-variant rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Engagement Metrics</h3>
          <MetricRow label="Daily Active Rate" value={`${dailyActiveRate}%`} color="text-secondary" />
          <MetricRow label="Premium Conversion Rate" value={`${premiumRate}%`} color="text-tertiary" />
          <MetricRow label="Tasks Completed Today" value={analytics.tasksCompletedToday} color="text-accent" />
          <MetricRow label="Avg Tasks / Active User" value={
            analytics.activeToday > 0
              ? (analytics.tasksCompletedToday / analytics.activeToday).toFixed(1)
              : '0'
          } />
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">XP Metrics</h3>
          <MetricRow label="Total XP Distributed" value={analytics.totalXPAwarded.toLocaleString()} color="text-accent" />
          <MetricRow label="Avg XP Per User" value={avgXP.toLocaleString()} />
          <MetricRow
            label="Avg XP Per Active User (today)"
            value={analytics.activeToday > 0 ? Math.round(analytics.totalXPAwarded / analytics.activeToday).toLocaleString() : '—'}
          />
          <MetricRow label="Total Users" value={analytics.totalUsers.toLocaleString()} />
        </div>
      </div>

      {/* Tier Distribution (estimated) */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">Estimated Reward Tier Distribution</h3>
        <div className="space-y-3">
          {[
            { tier: '💎 Diamond', pct: 1,  color: 'bg-[#B9F2FF]' },
            { tier: '🏆 Platinum', pct: 4,  color: 'bg-gray-300' },
            { tier: '🥇 Gold', pct: 5,  color: 'bg-yellow-400' },
            { tier: '🥈 Silver', pct: 15, color: 'bg-gray-400' },
            { tier: '🥉 Bronze', pct: 75, color: 'bg-amber-600' },
          ].map((row) => (
            <div key={row.tier} className="flex items-center gap-3">
              <span className="text-sm w-28 text-muted">{row.tier}</span>
              <div className="flex-1 bg-surface-variant rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%`, minWidth: '4px' }} />
              </div>
              <span className="text-xs text-muted w-12 text-right">{row.pct}%</span>
            </div>
          ))}
        </div>
        <p className="text-muted text-xs mt-4">* Tier distribution is estimated based on typical engagement patterns.</p>
      </div>
    </div>
  );
}
