'use client';
import { useState, useEffect, useCallback } from 'react';
import adminApi from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description: string;
  taskType: string;
  xpReward: number;
  difficulty: string;
  frequency: string;
  validationType: string;
  isActive: boolean;
  premiumOnly: boolean;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  EASY: 'text-secondary',
  MEDIUM: 'text-accent',
  HARD: 'text-orange-400',
  EXPERT: 'text-red-400',
};

const BLANK_TASK = {
  title: '', description: '', taskType: 'DAILY_CHECKIN', xpReward: 10,
  difficulty: 'EASY', frequency: 'DAILY', validationType: 'AUTOMATIC',
  isActive: true, premiumOnly: false, iconName: 'stars',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(BLANK_TASK);
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getTasks();
      setTasks(Array.isArray(data) ? data : data?.items || []);
    } catch { /* backend not running */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openCreate = () => { setForm(BLANK_TASK); setEditTask(null); setShowForm(true); };
  const openEdit = (t: Task) => { setForm({ ...t }); setEditTask(t); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTask) {
        await adminApi.updateTask(editTask.id, form);
      } else {
        await adminApi.createTask(form);
      }
      setShowForm(false);
      fetchTasks();
    } catch { alert('Failed to save task'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Disable this task?')) return;
    try {
      await adminApi.deleteTask(id);
      fetchTasks();
    } catch { alert('Failed to delete task'); }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-muted mt-1">{tasks.length} tasks configured</p>
        </div>
        <button onClick={openCreate}
          className="bg-primary text-[#1A0042] font-bold px-4 py-2.5 rounded-lg text-sm hover:bg-primary-dim transition-colors">
          + New Task
        </button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-variant">
                <th className="text-left px-4 py-3 text-muted font-medium">Task</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Type</th>
                <th className="text-right px-4 py-3 text-muted font-medium">XP</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Difficulty</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Frequency</th>
                <th className="text-left px-4 py-3 text-muted font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted">Loading tasks...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted">No tasks yet</td></tr>
              ) : tasks.map((t) => (
                <tr key={t.id} className="border-b border-outline-variant/50 hover:bg-surface-variant/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{t.title}</p>
                    <p className="text-muted text-xs mt-0.5 line-clamp-1">{t.description}</p>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs font-mono">{t.taskType}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-primary font-bold">+{t.xpReward}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${DIFFICULTY_COLOR[t.difficulty]}`}>{t.difficulty}</span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{t.frequency}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.isActive ? 'bg-secondary/10 text-secondary' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {t.premiumOnly && (
                      <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Premium</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(t)}
                        className="text-xs text-muted hover:text-white transition-colors px-2 py-1 rounded border border-outline-variant hover:border-primary/40">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded border border-red-500/20 hover:border-red-500/40">
                        Disable
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-surface border border-outline-variant rounded-2xl p-6 w-full max-w-lg my-4">
            <h3 className="text-lg font-bold text-white mb-4">
              {editTask ? 'Edit Task' : 'Create Task'}
            </h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {([
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'description', label: 'Description', type: 'text' },
                { key: 'xpReward', label: 'XP Reward', type: 'number' },
              ] as { key: string; label: string; type: string }[]).map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-sm text-muted mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={String(form[key] ?? '')}
                    onChange={(e) => setForm(f => ({ ...f, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
                    className="w-full bg-surface-variant border border-outline-variant rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>
              ))}

              {([
                { key: 'taskType', label: 'Task Type', opts: ['DAILY_CHECKIN','QUIZ','SOCIAL_FOLLOW','SOCIAL_JOIN','REFERRAL','WALLET_CONNECT','SOLANA_TRANSACTION','NFT_HOLD','TOKEN_HOLD','DAPP_USE','INVITE','LEARNING_MODULE'] },
                { key: 'difficulty', label: 'Difficulty', opts: ['EASY','MEDIUM','HARD','EXPERT'] },
                { key: 'frequency', label: 'Frequency', opts: ['DAILY','WEEKLY','ONCE','CAMPAIGN'] },
                { key: 'validationType', label: 'Validation', opts: ['MANUAL','AUTOMATIC','BLOCKCHAIN','SOCIAL','QUIZ'] },
              ] as { key: string; label: string; opts: string[] }[]).map(({ key, label, opts }) => (
                <div key={key}>
                  <label className="text-sm text-muted mb-1 block">{label}</label>
                  <select
                    value={String(form[key] ?? '')}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-surface-variant border border-outline-variant rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/60"
                  >
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" checked={Boolean(form.isActive)}
                    onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="rounded" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="checkbox" checked={Boolean(form.premiumOnly)}
                    onChange={(e) => setForm(f => ({ ...f, premiumOnly: e.target.checked }))}
                    className="rounded" />
                  Premium Only
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg border border-outline-variant text-sm text-white hover:bg-surface-variant transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-primary text-[#1A0042] font-bold text-sm disabled:opacity-50 hover:bg-primary-dim transition-colors">
                {saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
