const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
function now(){ return Date.now(); }
router.get('/balance/:userId', (req,res)=>{
  const wallet = db.prepare(`SELECT * FROM wallets WHERE user_id=? AND type='player'`).get(req.params.userId);
  if (!wallet) return res.status(404).json({ error:'wallet not found'});
  return res.json({ balance: wallet.balance });
});
router.post('/deposit', (req,res)=>{
  const { userId, amount } = req.body;
  const wallet = db.prepare(`SELECT * FROM wallets WHERE user_id=? AND type='player'`).get(userId);
  if (!wallet || amount <= 0) return res.status(400).json({ error:'invalid' });
  db.prepare(`UPDATE wallets SET balance=balance+? WHERE id=?`).run(amount, wallet.id);
  return res.json({ ok:true });
});
router.post('/withdraw', (req,res)=>{
  const { userId, amount } = req.body;
  const wallet = db.prepare(`SELECT * FROM wallets WHERE user_id=? AND type='player'`).get(userId);
  if (!wallet || wallet.balance < amount) return res.status(400).json({ error:'invalid/insufficient' });
  db.prepare(`UPDATE wallets SET balance=balance-? WHERE id=?`).run(amount, wallet.id);
  return res.json({ ok:true });
});
module.exports = router;
