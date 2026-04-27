import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, PiggyBank, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'expenses', label: 'Expenses', icon: <Receipt size={20} /> },
    { id: 'budgets', label: 'Budgets', icon: <PiggyBank size={20} /> },
  ];

  return (
    <div className="glass-card" style={{ height: 'calc(100vh - 4rem)', position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>Expense<span style={{ color: 'var(--text-main)'}}>Sync</span></h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Welcome, {user?.name}</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: activeTab === item.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: activeTab === item.id ? 'var(--primary-color)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              fontWeight: activeTab === item.id ? 600 : 400
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <button onClick={handleLogout} className="btn btn-danger" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
}
