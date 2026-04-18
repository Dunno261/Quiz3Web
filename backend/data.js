const wallet = { balance: 50000, currency: 'PKR', owner: 'Demo User' };
const transactions = [];
const loans = [];
let txId = 1;
let loanId = 1;

module.exports = { wallet, transactions, loans, getTxId: () => txId++, getLoanId: () => loanId++ };
