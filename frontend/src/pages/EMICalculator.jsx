import { useState } from 'react';
import { useCountUp } from '../hooks/useCountUp';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatPKR(amount) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
}

function EMICalculator() {
  const [principal, setPrincipal] = useState('');
  const [annualRate, setAnnualRate] = useState('');
  const [months, setMonths] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const animatedEmi = useCountUp(result ? Math.round(result.emi) : 0);
  const animatedTotalPayable = useCountUp(result ? Math.round(result.totalPayable) : 0);
  const animatedTotalInterest = useCountUp(result ? Math.round(result.totalInterest) : 0);

  async function handleCalculate() {
    try {
      setLoading(true);
      const response = await fetch(`${API}/api/emi-calculator?principal=${principal}&annualRate=${annualRate}&months=${months}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate EMI');
      }

      setResult(data);

      const nextRows = [];
      let remaining = Number(principal);
      const monthlyRate = Number(annualRate) / 100 / 12;
      for (let m = 1; m <= Number(months); m++) {
        const interest = remaining * monthlyRate;
        const princ = data.emi - interest;
        remaining = Math.max(0, remaining - princ);
        nextRows.push({ month: m, interest, princ, remaining });
      }
      setRows(nextRows);
    } catch {
      setResult(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const principalShare = result ? (Number(principal) / result.totalPayable) * 100 : 0;
  const interestShare = result ? 100 - principalShare : 0;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>EMI Calculator</h1>

      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '420px', marginBottom: '1rem' }}>
        <input
          type="number"
          placeholder="Principal"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
        />
        <input
          type="number"
          placeholder="Annual Rate (%)"
          value={annualRate}
          onChange={(e) => setAnnualRate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Months"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
        />
        <button type="button" onClick={handleCalculate}>Calculate</button>
      </div>

      {loading && <p>Loading...</p>}

      {result && !loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div key={result.emi} style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.75rem' }}>
              <p>Monthly EMI</p>
              <h3>{formatPKR(animatedEmi)}</h3>
            </div>
            <div key={result.totalPayable} style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.75rem' }}>
              <p>Total Payable</p>
              <h3>{formatPKR(animatedTotalPayable)}</h3>
            </div>
            <div key={result.totalInterest} style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.75rem' }}>
              <p>Total Interest</p>
              <h3>{formatPKR(animatedTotalInterest)}</h3>
            </div>
          </div>

          <div style={{ display: 'flex', width: '100%', height: '28px', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ width: principalShare + '%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              Principal
            </div>
            <div style={{ width: interestShare + '%', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              Interest
            </div>
          </div>

          <table className="emi-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Month</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Principal</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Interest</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month}>
                  <td style={{ padding: '0.5rem' }}>{row.month}</td>
                  <td style={{ padding: '0.5rem' }}>{formatPKR(row.princ)}</td>
                  <td style={{ padding: '0.5rem' }}>{formatPKR(row.interest)}</td>
                  <td style={{ padding: '0.5rem' }}>{formatPKR(row.remaining)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default EMICalculator;
