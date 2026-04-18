import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import WalletDashboard from './pages/WalletDashboard';
import TransactionHistory from './pages/TransactionHistory';
import LoanApplication from './pages/LoanApplication';
import LoanStatus from './pages/LoanStatus';
import EMICalculator from './pages/EMICalculator';

function App() {
  const [toast, setToast] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    document.body.className = dark ? 'dark' : '';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <BrowserRouter>
      <Navbar dark={dark} setDark={setDark} />
      <Routes>
        <Route path="/" element={<Navigate to="/wallet" />} />
        <Route path="/wallet" element={<WalletDashboard showToast={showToast} />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/loans/apply" element={<LoanApplication showToast={showToast} />} />
        <Route path="/loans" element={<LoanStatus showToast={showToast} />} />
        <Route path="/emi" element={<EMICalculator />} />
        <Route path="*" element={<div style={{ padding: '2rem' }}>404 - Page not found</div>} />
      </Routes>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </BrowserRouter>
  );
}

export default App;
