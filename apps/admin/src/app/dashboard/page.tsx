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

function StatCard({ icon, label, value, sub, color = 'text-primary' }: {
  icon: string; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium ${color}`}>{sub}</span>
      </div>
      <p className={`text-3xl font-bold text-white`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-muted text-sm mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-muted mt-1">Platform overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {loading ? (
        <div className="text-muted">Loading analytics...</div>
      ) : analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon="👥" label="Total Users" value={analytics.totalUsers} sub="All time" />
          <StatCard icon="🔥" label="Active Today" value={analytics.activeToday} sub="24h" color="text-secondary" />
          <StatCard icon="⭐" label="Total XP Awarded" value={analytics.totalXPAwarded} sub="All time" color="text-accent" />
          <StatCard icon="💎" label="Premium Users" value={analytics.premiumUsers} sub={`${analytics.totalUsers ? Math.round((analytics.premiumUsers / analytics.totalUsers) * 100) : 0}%`} color="text-tertiary" />
          <StatCard icon="✅" label="Tasks Completed Today" value={analytics.tasksCompletedToday} sub="Today" color="text-secondary" />
          <StatCard icon="📊" label="Avg XP / User" value={analytics.totalUsers ? Math.round(analytics.totalXPAwarded / analytics.totalUsers) : 0} sub="All time" />
        </div>
      ) : (
        <div className="text-muted">Failed to load analytics. Is the backend running?</div>
      )}

      {/* Quick Links */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/users', label: 'Manage Users', icon: '👥' },
            { href: '/dashboard/tasks', label: 'Manage Tasks', icon: '⚡' },
            { href: '/dashboard/fraud', label: 'Review Fraud', icon: '🛡️' },
            { href: '/dashboard/xp-logs', label: 'XP Logs', icon: '📈' },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="flex items-center gap-3 p-4 bg-surface border border-outline-variant rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <span className="text-xl">{a.icon}</span>
              <span className="text-sm text-white font-medium">{a.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
