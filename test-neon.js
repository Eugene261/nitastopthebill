const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const net = require('net');
if (net.setDefaultAutoSelectFamilyAttemptTimeout) {
  net.setDefaultAutoSelectFamilyAttemptTimeout(2000);
}

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure WebSocket for Node.js
neonConfig.webSocketConstructor = ws;

// Use the pooler URL
const connectionString = 'postgresql://neondb_owner:npg_ab0sJqLH3oVu@ep-plain-boat-akrbvh6p-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require';

console.log('Testing connection to pooler URL using @neondatabase/serverless WebSocket...');
const pool = new Pool({ connectionString });

pool.query('SELECT NOW()')
  .then(res => {
    console.log('Success! Database time:', res.rows[0].now);
    pool.end();
  })
  .catch(err => {
    console.error('Error connecting to pooler URL:', err);
    pool.end();
  });
