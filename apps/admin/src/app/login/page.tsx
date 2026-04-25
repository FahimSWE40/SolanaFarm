'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import adminApi from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@solanaseeker.app');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await adminApi.login(email, password);
      // For MVP: store admin info and a flag in localStorage
      adminApi.setToken('admin-session');
      localStorage.setItem('adminUser', JSON.stringify(result));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">⚡</div>
          <h1 className="text-3xl font-bold text-white tracking-widest">SOLANA SEEKER</h1>
          <p className="text-muted mt-2 text-sm">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-variant border border-outline-variant rounded-lg px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary/60 transition-colors"
                placeholder="admin@solanaseeker.app"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-variant border border-outline-variant rounded-lg px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary/60 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-[#1A0042] font-bold py-3 rounded-lg hover:bg-primary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-6">
            Default: admin@solanaseeker.app / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
