'use client';
import { useState, useEffect, useCallback } from 'react';
import adminApi from '@/lib/api';

interface FraudEntry {
  id: string;
  userId: string;
  score: number;
  reasonFlags: string[];
  status: 'SUSPICIOUS' | 'BLOCKED';
  createdAt: string;
  user: { id: string; username: string | null; walletAddress: string };
}

const STATUS_STYLE: Record<string, string> = {
  SUSPICIOUS: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  BLOCKED: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export default function FraudPage() {
  const [entries, setEntries] = useState<FraudEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchFraud = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getFraud(page);
      setEntries(Array.isArray(data) ? data : data?.items || data || []);
    } catch { /* backend not running */ }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchFraud(); }, [fetchFraud]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Fraud Review</h1>
        <p className="text-muted mt-1">Flagged accounts requiring review</p>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-yellow-400 font-bold text-2xl">
            {entries.filter(e => e.status === 'SUSPICIOUS').length}
          </p>
          <p className="text-muted text-sm mt-1">⚠️ Suspicious</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-bold text-2xl">
            {entries.filter(e => e.status === 'BLOCKED').length}
          </p>
          <p className="text-muted text-sm mt-1">🚫 Blocked</p>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-variant">
                <th className="text-left px-4 py-3 text-muted font-medium">User</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Status</th>
                <th className="text-right px-4 py-3 text-muted font-medium">Score</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Flags</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Detected</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted">Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <p className="text-secondary text-2xl mb-2">✅</p>
                    <p className="text-muted">No fraud flags. Platform looks clean!</p>
                  </td>
                </tr>
              ) : entries.map((e) => (
                <tr key={e.id} className="border-b border-outline-variant/50 hover:bg-surface-variant/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{e.user.username || <span className="text-muted italic">no username</span>}</p>
                    <p className="text-muted text-xs font-mono">
                      {e.user.walletAddress.slice(0, 8)}...{e.user.walletAddress.slice(-4)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[e.status]}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${e.score >= 50 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {e.score}
                    </span>
                    <span className="text-muted">/100</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(e.reasonFlags) ? e.reasonFlags : []).map((flag, i) => (
                        <span key={i} className="text-xs bg-surface-variant px-1.5 py-0.5 rounded text-muted border border-outline-variant">
                          {flag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-4">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
          className="px-3 py-1.5 rounded border border-outline-variant text-sm text-white disabled:opacity-40 hover:border-primary/40 transition-colors">
          ← Prev
        </button>
        <button onClick={() => setPage(p => p + 1)}
          className="px-3 py-1.5 rounded border border-outline-variant text-sm text-white disabled:opacity-40 hover:border-primary/40 transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}
