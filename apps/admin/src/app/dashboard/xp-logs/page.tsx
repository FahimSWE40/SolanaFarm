'use client';
import { useState, useEffect, useCallback } from 'react';
import adminApi from '@/lib/api';

interface XPLog {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  source: string;
  multiplier: number;
  createdAt: string;
  user?: { username: string | null };
  task?: { title: string } | null;
}

const SOURCE_COLOR: Record<string, string> = {
  TASK: 'text-secondary',
  STREAK_BONUS: 'text-orange-400',
  REFERRAL: 'text-tertiary',
  ADMIN_ADJUSTMENT: 'text-yellow-400',
  WELCOME_BONUS: 'text-primary',
  CAMPAIGN_BONUS: 'text-pink-400',
  PREMIUM_BONUS: 'text-primary-dim',
};

export default function XPLogsPage() {
  const [logs, setLogs] = useState<XPLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getXPLogs(userId || undefined, page);
      setLogs(Array.isArray(data) ? data : data?.items || data || []);
    } catch { /* backend not running */ }
    finally { setLoading(false); }
  }, [userId, page]);

  useEffect(() => {
    const t = setTimeout(fetchLogs, 300);
    return () => clearTimeout(t);
  }, [fetchLogs]);

  const totalXP = logs.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">XP Logs</h1>
        <p className="text-muted mt-1">Full audit trail of all XP events</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={userId}
          onChange={(e) => { setUserId(e.target.value); setPage(1); }}
          placeholder="Filter by user ID..."
          className="w-full max-w-xs bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-white placeholder-muted focus:outline-none focus:border-primary/60 text-sm"
        />
        <div className="bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-muted flex items-center gap-2">
          <span className="text-primary font-bold">{logs.length > 0 ? `+${totalXP.toLocaleString()} XP` : '—'}</span>
          <span>this page</span>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-variant">
                <th className="text-left px-4 py-3 text-muted font-medium">User</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Reason</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Source</th>
                <th className="text-right px-4 py-3 text-muted font-medium">Amount</th>
                <th className="text-right px-4 py-3 text-muted font-medium">Multiplier</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted">No XP logs found</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="border-b border-outline-variant/50 hover:bg-surface-variant/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-white">{log.user?.username || log.userId.slice(0, 8) + '...'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-muted text-xs line-clamp-1">{log.reason}</p>
                    {log.task && <p className="text-xs text-primary mt-0.5">📋 {log.task.title}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${SOURCE_COLOR[log.source] || 'text-muted'}`}>
                      {log.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${log.amount > 0 ? 'text-secondary' : 'text-red-400'}`}>
                      {log.amount > 0 ? '+' : ''}{log.amount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {log.multiplier > 1 ? <span className="text-accent">{log.multiplier}x</span> : '1x'}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-muted text-sm">Page {page}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded border border-outline-variant text-sm text-white disabled:opacity-40 hover:border-primary/40 transition-colors">
            ← Prev
          </button>
          <button disabled={logs.length < 50} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded border border-outline-variant text-sm text-white disabled:opacity-40 hover:border-primary/40 transition-colors">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
