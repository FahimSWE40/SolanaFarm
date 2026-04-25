'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import adminApi from '@/lib/api';

const nav = [
  { href: '/dashboard',           label: 'Dashboard',   icon: '📊' },
  { href: '/dashboard/users',     label: 'Users',       icon: '👥' },
  { href: '/dashboard/tasks',     label: 'Tasks',       icon: '⚡' },
  { href: '/dashboard/xp-logs',   label: 'XP Logs',     icon: '📈' },
  { href: '/dashboard/fraud',     label: 'Fraud',       icon: '🛡️' },
  { href: '/dashboard/analytics', label: 'Analytics',   icon: '📉' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    adminApi.clearToken();
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  return (
    <aside className="w-60 min-h-screen bg-surface border-r border-outline-variant flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="font-bold text-white text-sm tracking-wider">SOLANA SEEKER</p>
            <p className="text-muted text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-gray-400 hover:bg-surface-variant hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-outline-variant">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
