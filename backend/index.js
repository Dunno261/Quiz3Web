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
