import { useEffect, useState } from 'react';
import { useCountUp } from '../hooks/useCountUp';
import { SkeletonRow } from '../components/Skeleton';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatPKR(amount) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
}

function WalletDashboard({ showToast }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [cardClass, setCardClass] = useState('');

  const animatedBalance = useCountUp(wallet?.balance || 0);

  async function fetchWallet(showLoader = false) {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const response = await fetch(`${API}/api/wallet`);
      const data = await response.json();
      setWallet(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchWallet(true);
  }, []);

  async function handleDeposit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/api/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(depositAmount) })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      setCardClass('credit');
      showToast('Deposit successful');
      await fetchWallet();
      setDepositAmount('');
      setTimeout(() => setCardClass(''), 600);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleWithdraw(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/api/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(withdrawAmount) })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      setCardClass('debit');
      showToast('Withdrawal successful');
      await fetchWallet();
      setWithdrawAmount('');
      setTimeout(() => setCardClass(''), 600);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Wallet Dashboard</h1>

      {loading ? (
        <SkeletonRow />
      ) : (
        <div className={'balance-card ' + cardClass} style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h2>{formatPKR(animatedBalance)}</h2>
          <p>{wallet?.owner}</p>
        </div>
      )}

      <form onSubmit={handleDeposit} style={{ marginBottom: '1rem' }}>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Deposit amount"
        />
        <button type="submit">Deposit</button>
      </form>

      <form onSubmit={handleWithdraw}>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Withdraw amount"
        />
        <button type="submit">Withdraw</button>
      </form>
    </div>
  );
}

export default WalletDashboard;
