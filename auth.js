const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
function now(){ return Date.now(); }
const otpStore = {};
router.post('/request-otp', (req,res)=>{
  const { mobile, email } = req.body;
  if (!mobile && !email) return res.status(400).json({ error:'mobile or email required' });
  const otp = Math.floor(100000 + Math.random()*900000).toString();
  const key = mobile || email;
  otpStore[key] = { otp, createdAt: now(), attempts:0 };
  console.log(`OTP for ${key}: ${otp}`);
  return res.json({ ok:true, otp });
});
router.post('/verify-otp', (req,res)=>{
  const { mobile, email, otp } = req.body;
  const key = mobile || email;
  if (!key || !otp) return res.status(400).json({ error:'invalid' });
  const entry = otpStore[key];
  if (!entry || entry.otp !== otp) return res.status(400).json({ error:'invalid otp' });
  let user = db.prepare(`SELECT * FROM users WHERE mobile=? OR email=?`).get(mobile||'', email||'');
  let userId;
  if (user) {
    userId = user.id;
    db.prepare(`UPDATE users SET verified=1 WHERE id=?`).run(userId);
  } else {
    userId = uuidv4();
    db.prepare(`INSERT INTO users (id,mobile,email,verified,created_at) VALUES (?,?,?,?,?)`)
      .run(userId, mobile||'', email||'', 1, now());
    const walletId = uuidv4();
    db.prepare(`INSERT INTO wallets (id,user_id,balance,type,created_at) VALUES (?,?,?,?,?)`)
      .run(walletId, userId, 0, 'player', now());
  }
  delete otpStore[key];
  return res.json({ ok:true, userId });
});
module.exports = router;
