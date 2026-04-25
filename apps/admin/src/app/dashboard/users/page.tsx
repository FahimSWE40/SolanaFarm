'use client';
import { useState, useEffect, useCallback } from 'react';
import adminApi from '@/lib/api';

interface User {
  id: string;
  walletAddress: string;
  username: string | null;
  xpTotal: number;
  level: number;
  rank: number | null;
  premiumStatus: string;
  streakCount: number;
  createdAt: string;
}

const PREMIUM_COLOR: Record<string, string> = {
  FREE: 'text-muted',
  PREMIUM: 'text-tertiary',
  PREMIUM_PRO: 'text-primary',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // XP Adjust modal
  const [adjustUser, setAdjustUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(search || undefined, page);
      setUsers(data.items);
      setTotal(data.total);
    } catch {
      // backend not running — show empty state
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleAdjustXP = async () => {
    if (!adjustUser || !adjustAmount || !adjustReason) return;
    setAdjusting(true);
    try {
      await adminApi.adjustXP(adjustUser.id, parseInt(adjustAmount), adjustReason);
      setAdjustUser(null);
      setAdjustAmount('');
      setAdjustReason('');
      fetchUsers();
    } catch (e) {
      alert('Failed to adjust XP');
    } finally {
      setAdjusting(false);
    }
  };

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-muted mt-1">{total.toLocaleString()} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by username or wallet address..."
          className="w-full max-w-md bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-white placeholder-muted focus:outline-none focus:border-primary/60 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-variant">
                <th className="text-left px-4 py-3 text-muted font-medium">User</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Wallet</th>
                <th className="text-right px-4 py-3 text-muted font-medium">XP</th>
                <th className="text-right px-4 py-3 text-muted font-medium">Level</th>
                <th className="text-right px-4 py-3 text-muted font-medium">Rank</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Status</th>
                <th className="text-right px-4 py-3 text-muted font-medium">Streak</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-outline-variant/50 hover:bg-surface-variant/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {(u.username || u.walletAddress)[0].toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{u.username || <span className="text-muted italic">no username</span>}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">
                    {u.walletAddress.slice(0, 6)}...{u.walletAddress.slice(-4)}
                  </td>
                  <td className="px-4 py-3 text-right text-white font-semibold">{u.xpTotal.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-accent">{u.level}</td>
                  <td className="px-4 py-3 text-right text-muted">#{u.rank || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${PREMIUM_COLOR[u.premiumStatus]}`}>
                      {u.premiumStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-orange-400">🔥 {u.streakCount}</td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setAdjustUser(u)}
                      className="text-xs text-primary hover:text-primary-dim transition-colors px-2 py-1 rounded border border-primary/20 hover:border-primary/40"
                    >
                      +/− XP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-muted text-sm">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded border border-outline-variant text-sm text-white disabled:opacity-40 hover:border-primary/40 transition-colors">
              ← Prev
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded border border-outline-variant text-sm text-white disabled:opacity-40 hover:border-primary/40 transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* XP Adjust Modal */}
      {adjustUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-outline-variant rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-1">Adjust XP</h3>
            <p className="text-muted text-sm mb-4">{adjustUser.username || adjustUser.walletAddress.slice(0, 10) + '...'}</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted mb-1 block">Amount (use negative to deduct)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 100 or -50"
                  className="w-full bg-surface-variant border border-outline-variant rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/60 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-muted mb-1 block">Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Admin adjustment reason..."
                  className="w-full bg-surface-variant border border-outline-variant rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/60 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setAdjustUser(null)}
                className="flex-1 py-2.5 rounded-lg border border-outline-variant text-sm text-white hover:bg-surface-variant transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAdjustXP}
                disabled={adjusting || !adjustAmount || !adjustReason}
                className="flex-1 py-2.5 rounded-lg bg-primary text-[#1A0042] font-bold text-sm disabled:opacity-50 hover:bg-primary-dim transition-colors"
              >
                {adjusting ? 'Adjusting...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
