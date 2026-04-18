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
