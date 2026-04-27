import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

export default function BudgetManager() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ limit: '', categoryId: '', period: 'MONTHLY' });
  const [insights, setInsights] = useState(null);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchInsights = async () => {
    try {
      const res = await api.get('/insights/dashboard');
      setInsights(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    Promise.all([fetchBudgets(), fetchCategories(), fetchInsights()]).then(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets', formData);
      setShowModal(false);
      setFormData({ limit: '', categoryId: categories[0]?.id || '', period: 'MONTHLY' });
      fetchBudgets();
    } catch (err) { alert('Failed to set budget'); }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this budget limit?')) {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0, fontSize: '2rem' }}>Budget Manager</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Set Budget
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {budgets.map(budget => {
          const spent = insights?.categoryBreakdown?.[budget.categoryName] || 0;
          const limit = parseFloat(budget.limit);
          const percentage = Math.min((spent / limit) * 100, 100).toFixed(1);
          const isWarning = percentage > 80;
          return (
          <div key={budget.id} className="glass-card" style={{ position: 'relative' }}>
            <button onClick={() => handleDelete(budget.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}><Trash2 size={18} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>{budget.categoryName}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{budget.period}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              ${limit.toFixed(2)}
              <span style={{ fontSize: '1rem', color: isWarning ? '#ef4444' : 'var(--text-muted)' }}>
                (Spent: ${spent.toFixed(2)})
              </span>
            </div>
            <div style={{ marginTop: '1rem', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${percentage}%`, height: '100%', background: isWarning ? 'linear-gradient(to right, #f59e0b, #ef4444)' : 'linear-gradient(to right, var(--primary-color), var(--accent-color))' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: isWarning ? '#ef4444' : 'var(--text-muted)' }}>{percentage}% used</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Remaining: ${(limit - spent).toFixed(2)}</p>
            </div>
          </div>
        )})}
        {budgets.length === 0 && (
          <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>No budgets set. Create your first budget limit!</div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>Set Budget Limit</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Category</label>
                <select className="input-field" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                  <option value="">Select a category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Limit Amount ($)</label>
                <input type="number" step="0.01" className="input-field" value={formData.limit} onChange={e => setFormData({...formData, limit: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Period</label>
                <select className="input-field" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} required>
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" style={{ background: 'transparent', color: 'white' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
