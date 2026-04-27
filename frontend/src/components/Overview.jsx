import { useState, useEffect } from 'react';
import api from '../services/api';
import { Doughnut, Line } from 'react-chartjs-2';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/insights/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch insights', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <div>Loading insights...</div>;
  if (!data) return <div>No data available</div>;

  const categoryLabels = Object.keys(data.categoryBreakdown || {});
  const categoryValues = Object.values(data.categoryBreakdown || {});

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
        ],
        borderWidth: 0,
      },
    ],
  };

  const trendLabels = Object.keys(data.monthlyTrends || {}).sort();
  const trendValues = trendLabels.map(label => data.monthlyTrends[label]);

  if (data.predictedNextMonth > 0) {
    trendLabels.push('Next Month (Pred)');
    trendValues.push(data.predictedNextMonth);
  }


  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Monthly Expenses',
        data: trendValues,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: { color: '#f8fafc' }
      }
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };
  
  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#f8fafc' }
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="page-title" style={{ fontSize: '2rem' }}>Dashboard Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>Total Expenses</h3>
          <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-main)' }}>
            ${parseFloat(data.totalExpenses || 0).toFixed(2)}
          </p>
        </div>
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>Predicted Next Month</h3>
          <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-main)' }}>
            ${parseFloat(data.predictedNextMonth || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {data.alerts && data.alerts.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Smart Alerts
          </h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {data.alerts.map((alert, idx) => (
              <li key={idx} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}


      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Category Breakdown</h3>
          {categoryLabels.length > 0 ? (
             <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
               <Doughnut data={doughnutData} options={doughnutOptions} />
             </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>No expenses yet</p>
          )}
        </div>
        
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Monthly Trends</h3>
          {trendLabels.length > 0 ? (
            <div style={{ height: '300px', width: '100%' }}>
              <Line data={lineData} options={chartOptions} />
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>No expenses yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
