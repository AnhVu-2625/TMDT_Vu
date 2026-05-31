/**
 * Script tạo bcrypt hash để dùng trong seed.sql
 * Chạy: node scripts/gen-hash.js
 */
const bcrypt = require('bcryptjs');

async function generateHashes() {
  const accounts = [
    { role: 'ADMIN',  password: 'Admin@123' },
    { role: 'USER',   password: 'User@123' },
    { role: 'SELLER', password: 'Seller@123' },
  ];

  console.log('Generating bcrypt hashes (salt=10)...\n');

  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.password, 10);
    console.log(`${acc.role} (${acc.password}):`);
    console.log(`  Hash: ${hash}`);
    console.log();
  }
}

generateHashes();
