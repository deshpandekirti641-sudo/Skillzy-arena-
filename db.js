const Database = require('better-sqlite3');
const env = require('dotenv').config();
const DB_FILE = process.env.DB_FILE || './skillzy.db';
const db = new Database(DB_FILE);

function init() {
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    mobile TEXT,
    email TEXT,
    verified INTEGER DEFAULT 0,
    created_at INTEGER
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    balance INTEGER DEFAULT 0,
    type TEXT DEFAULT 'player',
    created_at INTEGER
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    wallet_id TEXT,
    amount INTEGER,
    type TEXT,
    note TEXT,
    created_at INTEGER
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    game TEXT,
    entry_fee INTEGER,
    player1 TEXT,
    player2 TEXT,
    status TEXT,
    winner TEXT,
    expires_at INTEGER,
    created_at INTEGER
  )`).run();

  const devName = process.env.DEVELOPER_NAME || 'Kirti';
  const devWallet = db.prepare(`SELECT * FROM wallets WHERE type='developer'`).get();
  if (!devWallet) {
    const id = require('uuid').v4();
    db.prepare(`INSERT INTO wallets (id, user_id, balance, type, created_at) VALUES (?,?,?,?,?)`)
      .run(id, devName, 0, 'developer', Date.now());
  }
}
init();
module.exports = db;
