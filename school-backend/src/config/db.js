import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  max: 10,
  keepAlive: true
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL Connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL Error:", err);
});
