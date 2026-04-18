# MASTER SPEC — FintechFlow
## Full-Stack Quiz | React + Node/Express

> Keep it simple. No clever abstractions. Code a student would actually write.
> No UI libraries. No database. In-memory only.

---

## 1. Folder Structure

```
fintechflow/
├── backend/
│   ├── index.js
│   ├── data.js
│   ├── routes/
│   │   ├── wallet.js
│   │   └── loans.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── WalletDashboard.jsx
│   │   │   ├── TransactionHistory.jsx
│   │   │   ├── LoanApplication.jsx
│   │   │   ├── LoanStatus.jsx
│   │   │   └── EMICalculator.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Skeleton.jsx
│   │   ├── hooks/
│   │   │   └── useCountUp.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

---

## 2. Backend — Shared Data (data.js)

```js
const wallet = { balance: 50000, currency: 'PKR', owner: 'Demo User' };
const transactions = [];
const loans = [];
let txId = 1;
let loanId = 1;

module.exports = { wallet, transactions, loans, getTxId: () => txId++, getLoanId: () => loanId++ };
```

---

## 3. Backend — index.js

```js
const express = require('express');
const cors = require('cors');
const walletRoutes = require('./routes/wallet');
const loanRoutes = require('./routes/loans');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', walletRoutes);
app.use('/api', loanRoutes);

app.listen(process.env.PORT || 5000, () => console.log('Server running'));
```

---

## 4. Backend — All 8 Endpoints

### routes/wallet.js

```js
const router = require('express').Router();
const { wallet, transactions, getTxId } = require('../data');

router.get('/wallet', (req, res) => {
  res.json(wallet);
});

router.post('/wallet/deposit', (req, res) => {
  const { amount } = req.body;
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  wallet.balance += amount;
  transactions.unshift({
    id: getTxId(), type: 'credit', amount,
    timestamp: new Date().toISOString(),
    description: `Deposit of PKR ${amount}`
  });
  res.json({ message: 'Deposit successful', wallet });
});

router.post('/wallet/withdraw', (req, res) => {
  const { amount } = req.body;
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  if (wallet.balance - amount < 0) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  wallet.balance -= amount;
  transactions.unshift({
    id: getTxId(), type: 'debit', amount,
    timestamp: new Date().toISOString(),
    description: `Withdrawal of PKR ${amount}`
  });
  res.json({ message: 'Withdrawal successful', wallet });
});

router.get('/transactions', (req, res) => {
  const { type } = req.query;
  const result = type ? transactions.filter(t => t.type === type) : transactions;
  res.json(result);
});

module.exports = router;
```

### routes/loans.js

```js
const router = require('express').Router();
const { loans, getLoanId } = require('../data');

router.post('/loans/apply', (req, res) => {
  const { applicant, amount, purpose, tenure } = req.body;
  if (!applicant || !amount || !purpose || !tenure) {
    return res.status(400).json({ error: 'All fields required: applicant, amount, purpose, tenure' });
  }
  if (amount < 5000 || amount > 5000000) {
    return res.status(400).json({ error: 'Amount must be between PKR 5,000 and 5,000,000' });
  }
  if (tenure < 3 || tenure > 60) {
    return res.status(400).json({ error: 'Tenure must be between 3 and 60 months' });
  }
  const loan = { id: getLoanId(), applicant, amount, purpose, tenure, status: 'pending' };
  loans.push(loan);
  res.status(201).json(loan);
});

router.get('/loans', (req, res) => {
  res.json(loans);
});

router.patch('/loans/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
  }
  const loan = loans.find(l => l.id === parseInt(req.params.id));
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  loan.status = status;
  res.json(loan);
});

router.get('/emi-calculator', (req, res) => {
  const P = parseFloat(req.query.principal);
  const r = parseFloat(req.query.annualRate) / 100 / 12;
  const n = parseInt(req.query.months);
  if (!P || !r || !n) {
    return res.status(400).json({ error: 'principal, annualRate, and months are required' });
  }
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  res.json({
    emi: parseFloat(emi.toFixed(2)),
    totalPayable: parseFloat((emi * n).toFixed(2)),
    totalInterest: parseFloat((emi * n - P).toFixed(2))
  });
});

module.exports = router;
```

---

## 5. Frontend — API URL

Just a const at the top of each page file that fetches:
```js
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```
No separate file. Just paste it where needed.

---

## 6. formatPKR

Put this at the top of any file that displays money, or in a shared `utils.js`:
```js
export function formatPKR(amount) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
}
```

---

## 7. useCountUp hook (required by quiz spec)

```js
// src/hooks/useCountUp.js
import { useState, useEffect } from 'react';

export function useCountUp(target) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let current = 0;
    const step = target / 50;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(current));
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return val;
}
```

---

## 8. Toast — simple local state in App.jsx

No context, no provider. Just state in App passed as a prop:

```jsx
// In App.jsx
const [toast, setToast] = useState(null);

function showToast(message, type = 'success') {
  setToast({ message, type });
  setTimeout(() => setToast(null), 4000);
}

// At bottom of App return:
{toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
```

Pass `showToast` as a prop to pages that need it.

---

## 9. Dark Mode — simple, in App.jsx

```jsx
const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

useEffect(() => {
  document.body.className = dark ? 'dark' : '';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}, [dark]);
```

CSS:
```css
body { background: #f9fafb; color: #111827; transition: background 0.3s, color 0.3s; }
body.dark { background: #0f172a; color: #f1f5f9; }
```

---

## 10. Skeleton

```jsx
// src/components/Skeleton.jsx
export function SkeletonRow() {
  return <div className="skeleton-row" />;
}
```

```css
.skeleton-row {
  height: 50px; border-radius: 6px; margin-bottom: 8px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200%;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
```

---

## 11. Pages

### WalletDashboard (/wallet)
- useState for wallet, loading
- useEffect fetches GET /api/wallet on mount
- Balance shown with `useCountUp(wallet?.balance || 0)`
- `.balance-card` changes class to `credit` or `debit` based on last action. Add `pulse` class briefly after success, remove after 600ms.
- Two simple forms, each with one number input. On submit: POST to endpoint, on success call showToast + refetch. On error: showToast with error message.
- Show `<SkeletonRow />` while loading

### TransactionHistory (/transactions)
- useState for transactions, loading, searchTerm, typeFilter
- Fetch on mount. When typeFilter changes, refetch with `?type=credit` etc.
- Filter client-side by searchTerm on already-fetched data
- Summary bar: `useMemo` computing total credits, total debits, net
- Each card gets `style={{ animationDelay: index * 100 + 'ms' }}` and a `slide-in` CSS class
- Show 5 `<SkeletonRow />` while loading

### LoanApplication (/loans/apply)
- step state (1, 2, 3), formData state, errors state
- Step 1: Name, CNIC (regex `/^\d{5}-\d{7}-\d{1}$/`), Contact
- Step 2: Amount (5000–5000000), Purpose (select: Business/Education/Medical/Personal), Tenure (3–60)
- Step 3: Read-only review of everything
- Progress bar: `<div className="progress-fill" style={{ width: step/3*100 + '%' }} />`
- Validate before Next, show inline errors below fields
- On submit: POST /api/loans/apply. On 201: show success screen with loan ID.

### LoanStatus (/loans)
- useState for loans, sortBy
- Fetch on mount
- Sort loans array before rendering based on sortBy
- Summary bar: useCountUp for pending/approved/rejected counts
- Card flip on hover — CSS only. Front: loan info. Back: Approve/Reject buttons.
- On Approve/Reject: PATCH /api/loans/:id/status → `setLoans(prev => prev.map(l => l.id === id ? {...l, status} : l))`
- Pending badge: pulsing glow animation
- Grid: 3 cols desktop / 2 tablet / 1 mobile via CSS grid

### EMICalculator (/emi)
- useState for principal, annualRate, months inputs + result
- On Calculate: fetch GET /api/emi-calculator — server computes, DO NOT compute EMI in frontend
- Three stat cards with useCountUp on emi, totalPayable, totalInterest
- Amortization table built on frontend using server-returned emi value:
```js
const rows = [];
let remaining = Number(principal);
const monthlyRate = Number(annualRate) / 100 / 12;
for (let m = 1; m <= Number(months); m++) {
  const interest = remaining * monthlyRate;
  const princ = result.emi - interest;
  remaining = Math.max(0, remaining - princ);
  rows.push({ month: m, interest, princ, remaining });
}
```
- Table: zebra stripe with `tr:nth-child(even)`, formatPKR on all values
- Principal vs interest bar: two side-by-side divs with % widths

---

## 12. App.jsx routing

```jsx
<Routes>
  <Route path="/" element={<Navigate to="/wallet" />} />
  <Route path="/wallet" element={<WalletDashboard showToast={showToast} />} />
  <Route path="/transactions" element={<TransactionHistory />} />
  <Route path="/loans/apply" element={<LoanApplication showToast={showToast} />} />
  <Route path="/loans" element={<LoanStatus showToast={showToast} />} />
  <Route path="/emi" element={<EMICalculator />} />
  <Route path="*" element={<div style={{padding:'2rem'}}>404 — Page not found</div>} />
</Routes>
```

---

## 13. Navbar

Functional component. `useLocation()` to highlight active link. Dark/light toggle button calls `setDark`. Links to all 5 pages. Hamburger state for mobile.

---

## 14. CSS Animations (all in index.css)

```css
@keyframes pulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
@keyframes shake    { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
@keyframes slideIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes glowPulse{ 0%,100%{box-shadow:0 0 4px #f59e0b} 50%{box-shadow:0 0 14px #f59e0b} }

/* card flip */
.card-wrapper { perspective: 1000px; height: 200px; position: relative; }
.card-inner   { width:100%; height:100%; transform-style:preserve-3d; transition:transform 0.5s; }
.card-wrapper:hover .card-inner { transform: rotateY(180deg); }
.card-front, .card-back { position:absolute; width:100%; height:100%; backface-visibility:hidden; border-radius:8px; padding:1rem; }
.card-back { transform: rotateY(180deg); background: #1e293b; color: white; }

/* toast */
.toast { position:fixed; top:1rem; right:1rem; padding:0.75rem 1.25rem; border-radius:6px; color:white; animation:slideIn 0.3s ease; z-index:9999; }
.toast-success { background:#16a34a; }
.toast-error   { background:#dc2626; }

/* balance card states */
.balance-card { transition: background 0.4s; }
.balance-card.credit { background: #dcfce7; }
.balance-card.debit  { background: #fee2e2; }
.balance-card.pulse  { animation: pulse 0.5s ease; }

/* badge */
.badge-pending { animation: glowPulse 1.5s infinite; }
```

---

## 15. Deployment

**Backend → Render:**
- Root dir: `backend`, Start: `node index.js`
- Render sets PORT automatically

**Frontend → Vercel:**
- Root dir: `frontend`, Framework: Vite
- Add env var: `VITE_API_URL` = your Render backend URL

**frontend/.env:**
```
VITE_API_URL=http://localhost:5000
```

---

## 16. README

```md
# FintechFlow — Personal Finance & Loan Manager

React frontend + Node/Express backend. In-memory data storage.

## Run Locally

**Backend:** cd backend && npm install && node index.js
**Frontend:** cd frontend && npm install && npm run dev

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/wallet | Get wallet |
| POST   | /api/wallet/deposit | Deposit funds |
| POST   | /api/wallet/withdraw | Withdraw funds |
| GET    | /api/transactions | Get transactions |
| POST   | /api/loans/apply | Apply for loan |
| GET    | /api/loans | Get all loans |
| PATCH  | /api/loans/:id/status | Update loan status |
| GET    | /api/emi-calculator | Compute EMI |

**Name:** Faiq
**Roll No:** [your roll number]
**Frontend:** [Vercel URL]
**Backend:** [Render URL]
```
