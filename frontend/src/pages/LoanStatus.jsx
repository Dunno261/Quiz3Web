import { useEffect, useMemo, useState } from 'react';
import { useCountUp } from '../hooks/useCountUp';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatPKR(amount) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
}

function LoanStatus({ showToast }) {
  const [loans, setLoans] = useState([]);
  const [sortBy, setSortBy] = useState('amount-high');

  useEffect(() => {
    async function fetchLoans() {
      try {
        const response = await fetch(`${API}/api/loans`);
        const data = await response.json();
        setLoans(data);
      } catch (err) {
        showToast(err.message || 'Failed to fetch loans', 'error');
      }
    }

    fetchLoans();
  }, [showToast]);

  const sortedLoans = useMemo(() => {
    const clone = [...loans];

    if (sortBy === 'amount-high') {
      clone.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-low') {
      clone.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === 'status') {
      clone.sort((a, b) => a.status.localeCompare(b.status));
    }

    return clone;
  }, [loans, sortBy]);

  const pendingCount = useCountUp(loans.filter((l) => l.status === 'pending').length);
  const approvedCount = useCountUp(loans.filter((l) => l.status === 'approved').length);
  const rejectedCount = useCountUp(loans.filter((l) => l.status === 'rejected').length);

  async function updateStatus(id, status) {
    try {
      const response = await fetch(`${API}/api/loans/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      showToast('Status updated');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Loan Status</h1>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div>Pending: {pendingCount}</div>
        <div>Approved: {approvedCount}</div>
        <div>Rejected: {rejectedCount}</div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="amount-high">Amount: High to Low</option>
          <option value="amount-low">Amount: Low to High</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div className="loan-grid">
        {sortedLoans.map((loan) => (
          <div key={loan.id} className="card-wrapper">
            <div className="card-inner">
              <div className="card-front" style={{ border: '1px solid #d1d5db', background: '#ffffff' }}>
                <h3>{loan.applicant}</h3>
                <p>{formatPKR(loan.amount)}</p>
                <p>{loan.purpose}</p>
                <p>{loan.tenure} months</p>
                <span className={loan.status === 'pending' ? 'badge-pending' : ''}>
                  {loan.status}
                </span>
              </div>
              <div className="card-back">
                <button onClick={() => updateStatus(loan.id, 'approved')}>Approve</button>
                <button onClick={() => updateStatus(loan.id, 'rejected')}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoanStatus;
