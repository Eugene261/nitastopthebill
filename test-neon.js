/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");

const { setDefaultAutoSelectFamily } = require("node:net");
const { Pool } = require("pg");

setDefaultAutoSelectFamily(false);

const connectionString = process.env.DATABASE_URL?.replace(
  "sslmode=require",
  "sslmode=verify-full",
);

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

console.log("Testing connection with standard pg on direct URL...");
const pool = new Pool({ connectionString });

pool
  .query("SELECT NOW()")
  .then((res) => {
    console.log("Success! Database time:", res.rows[0].now);
    pool.end();
  })
  .catch((err) => {
    console.error("Error connecting to direct URL:", err);
    pool.end();
  });
