const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use(limiter);

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const matchRoutes = require('./routes/match');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);
app.use('/match', matchRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=> console.log(`Skillzy backend running on port ${PORT}`));
