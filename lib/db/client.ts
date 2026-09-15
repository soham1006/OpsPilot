import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const databasePath = path.resolve(
  process.cwd(),
  process.env.DATABASE_URL ?? "./data/opspilot.db"
);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

export default db;