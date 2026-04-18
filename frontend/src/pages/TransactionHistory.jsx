import { useEffect, useMemo, useState } from 'react';
import { SkeletonRow } from '../components/Skeleton';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatPKR(amount) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
}

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const query = typeFilter === 'all' ? '' : `?type=${typeFilter}`;
        const response = await fetch(`${API}/api/transactions${query}`);
        const data = await response.json();
        setTransactions(data);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [typeFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [transactions, searchTerm]);

  const summary = useMemo(() => {
    const totalCredits = filteredTransactions
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebits = filteredTransactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalCredits,
      totalDebits,
      netBalance: totalCredits - totalDebits
    };
  }, [filteredTransactions]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Transaction History</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>Credits: {formatPKR(summary.totalCredits)}</div>
        <div>Debits: {formatPKR(summary.totalDebits)}</div>
        <div>Net: {formatPKR(summary.netBalance)}</div>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by description"
        style={{ marginBottom: '1rem' }}
      />

      <div style={{ marginBottom: '1rem' }}>
        <button type="button" onClick={() => setTypeFilter('all')}>All</button>
        <button type="button" onClick={() => setTypeFilter('credit')}>Credits</button>
        <button type="button" onClick={() => setTypeFilter('debit')}>Debits</button>
      </div>

      {loading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : (
        filteredTransactions.map((tx, index) => (
          <div
            key={tx.id}
            className="slide-in"
            style={{ animationDelay: index * 100 + 'ms', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span style={{ color: tx.type === 'credit' ? 'green' : 'red' }}>
                {tx.type === 'credit' ? '↑' : '↓'} {formatPKR(tx.amount)}
              </span>
              <span>{new Date(tx.timestamp).toLocaleString()}</span>
            </div>
            <p>{tx.description}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default TransactionHistory;
