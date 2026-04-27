import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Overview from '../components/Overview';
import ExpenseManager from '../components/ExpenseManager';
import BudgetManager from '../components/BudgetManager';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem' }}>
      <div className="layout-grid">
        <div>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div style={{ paddingLeft: '1rem' }}>
          {activeTab === 'dashboard' && <Overview />}
          {activeTab === 'expenses' && <ExpenseManager />}
          {activeTab === 'budgets' && <BudgetManager />}
        </div>
      </div>
    </div>
  );
}
