import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

const DB_PATH =
  process.env.DATABASE_PATH ??
  path.join(process.cwd(), "data", "expense_tracker.db");

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

declare global {
  var sqlite: Database.Database | undefined;
  var dbInitialized: boolean | undefined;
  var dbSeeded: boolean | undefined;
}

const db: Database.Database = (() => {
  if (process.env.NODE_ENV === "production") {
    return new Database(DB_PATH);
  } else {
    global.sqlite ??= new Database(DB_PATH);
    return global.sqlite;
  }
})();

const initializeDatabase = () => {
  global.dbInitialized = true;

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('employee', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('travel', 'meals', 'office_supplies', 'software', 'training', 'marketing', 'other')),
      description TEXT NOT NULL,
      date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      receipt_url TEXT,
      approved_by INTEGER,
      approved_at DATETIME,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (approved_by) REFERENCES users (id)
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses (user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses (status);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
  `);
};

const seedDatabase = () => {
  global.dbSeeded = true;

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };

  if (userCount.count === 0) {
    try {
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      db.prepare(
        `INSERT INTO users (name, email, password, role)
         VALUES (?, ?, ?, ?)`
      ).run("Admin User", "admin@example.com", hashedPassword, "admin");

      const empPassword = bcrypt.hashSync("employee123", 10);
      db.prepare(
        `INSERT INTO users (name, email, password, role)
         VALUES (?, ?, ?, ?)`
      ).run("John Doe", "john@example.com", empPassword, "employee");

      console.log("Default users created");
    } catch (error: unknown) {
      console.error(
        "Error creating default users:",
        error instanceof Error ? error.message : String(error)
      );
    }
  }
};

if (!global.dbInitialized) {
  initializeDatabase();
}

if (!global.dbSeeded) {
  seedDatabase();
}

export default db;
