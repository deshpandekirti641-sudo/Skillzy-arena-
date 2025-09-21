const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
function now(){ return Date.now(); }
const ENTRY_FEE = 10;
const PRIZE_POOL = 20;
const WINNER_PERCENT = 0.8;
const DURATION_MS = 60000;
router.post('/create', (req,res)=>{
  const { game, creatorUserId } = req.body;
  const matchId = uuidv4();
  db.prepare(`INSERT INTO matches (id,game,entry_fee,player1,status,expires_at,created_at) VALUES (?,?,?,?,?,?,?)`)
    .run(matchId, game, ENTRY_FEE, creatorUserId, 'open', now()+DURATION_MS, now());
  return res.json({ ok:true, matchId });
});
router.post('/join', (req,res)=>{
  const { matchId, userId } = req.body;
  const match = db.prepare(`SELECT * FROM matches WHERE id=?`).get(matchId);
  if (!match || match.status !== 'open') return res.status(400).json({ error:'match not available' });
  db.prepare(`UPDATE matches SET player2=?, status='running' WHERE id=?`).run(userId, matchId);
  return res.json({ ok:true });
});
router.post('/end', (req,res)=>{
  const { matchId, winnerUserId } = req.body;
  const match = db.prepare(`SELECT * FROM matches WHERE id=?`).get(matchId);
  if (!match) return res.status(404).json({ error:'not found' });
  const winnerWallet = db.prepare(`SELECT * FROM wallets WHERE user_id=? AND type='player'`).get(winnerUserId);
  if (!winnerWallet) return res.status(404).json({ error:'winner wallet missing' });
  const winnerAmount = PRIZE_POOL * WINNER_PERCENT;
  const devAmount = PRIZE_POOL - winnerAmount;
  db.prepare(`UPDATE wallets SET balance=balance+? WHERE id=?`).run(winnerAmount, winnerWallet.id);
  const devWallet = db.prepare(`SELECT * FROM wallets WHERE type='developer'`).get();
  db.prepare(`UPDATE wallets SET balance=balance+? WHERE id=?`).run(devAmount, devWallet.id);
  db.prepare(`UPDATE matches SET status='finished', winner=? WHERE id=?`).run(winnerUserId, matchId);
  return res.json({ ok:true, winnerAmount, devAmount });
});
module.exports = router;
