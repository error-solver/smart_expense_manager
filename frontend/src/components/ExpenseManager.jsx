import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ amount: '', categoryId: '', description: '', date: new Date().toISOString().split('T')[0] });

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    Promise.all([fetchExpenses(), fetchCategories()]).then(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/expenses/${formData.id}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      setShowModal(false);
      setFormData({ amount: '', categoryId: categories[0]?.id || '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (err) { alert('Failed to save expense'); }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      id: expense.id,
      amount: expense.amount,
      categoryId: expense.categoryId,
      description: expense.description || '',
      date: expense.date
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    setFormData({ amount: '', currency: 'USD', categoryId: '', description: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await api.post('/expenses/upload-receipt');
      // Autofill form
      setFormData({
        ...formData,
        amount: res.data.amount,
        description: res.data.description,
        date: res.data.date
      });
      alert('Mock Receipt Scanned! Form autofilled.');
    } catch (err) {
      alert('Failed to process receipt');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0, fontSize: '2rem' }}>Expense Manager</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={openNewModal}>
            <Plus size={20} /> Add Expense
          </button>
        </div>
      </div>

      <div className="glass-card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Description</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{expense.date}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem' }}>
                    {expense.categoryName}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{expense.description}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>${parseFloat(expense.amount).toFixed(2)}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(expense)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '1rem' }}><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(expense.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses found. Add one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>{formData.id ? 'Edit Expense' : 'Add New Expense'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label">Amount</label>
                  <input type="number" step="0.01" className="input-field" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select className="input-field" value={formData.currency || 'USD'} onChange={e => setFormData({...formData, currency: e.target.value})}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                <label className="label">Date</label>
                <input type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Category</label>
                <select className="input-field" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                  <option value="">Auto-Detect via AI...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <small style={{ color: 'var(--text-muted)' }}>Leave blank to let AI predict based on description</small>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Description</label>
                <input type="text" className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <label className="label">Smart Receipt Scanner (Mock)</label>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" style={{ background: 'transparent', color: 'white' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
