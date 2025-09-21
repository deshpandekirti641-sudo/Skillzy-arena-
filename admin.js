const express = require('express');
const router = express.Router();
const db = require('../db');
function requireAdmin(req,res,next){
  const key = req.headers['x-admin-key'] || req.query.admin_key;
  if (key !== process.env.ADMIN_KEY) return res.status(403).json({ error:'admin required' });
  next();
}
router.post('/autopilot', requireAdmin, (req,res)=>{
  process.env.AUTOPILOT_ENABLED = req.body.enabled ? 'true' : 'false';
  return res.json({ ok:true, autopilot: process.env.AUTOPILOT_ENABLED });
});
router.post('/dev-withdraw', requireAdmin, (req,res)=>{
  const { amount } = req.body;
  const devWallet = db.prepare(`SELECT * FROM wallets WHERE type='developer'`).get();
  if (devWallet.balance < amount) return res.status(400).json({ error:'insufficient dev balance' });
  db.prepare(`UPDATE wallets SET balance=balance-? WHERE id=?`).run(amount, devWallet.id);
  return res.json({ ok:true });
});
module.exports = router;
