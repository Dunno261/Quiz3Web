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
