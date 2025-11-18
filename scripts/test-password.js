/**
 * Test Password Hash
 * 
 * Run with: node scripts/test-password.js your-password-here
 * 
 * This will test if a password matches a hash from your .env.local
 */

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');

const password = process.argv[2];
const hash = process.env.ADMIN_PASSWORD_HASH;

if (!password) {
  console.error('❌ Error: Please provide a password as an argument');
  console.log('\nUsage: node scripts/test-password.js your-password-here\n');
  process.exit(1);
}

if (!hash) {
  console.error('❌ Error: ADMIN_PASSWORD_HASH not found in .env.local');
  console.log('\nMake sure you have ADMIN_PASSWORD_HASH set in your .env.local file\n');
  process.exit(1);
}

console.log('\n🔍 Testing password verification...\n');
console.log('Password provided:', password);
console.log('Hash from .env.local:', hash.substring(0, 20) + '...');
console.log('Hash length:', hash.length);
console.log('');

bcrypt.compare(password, hash)
  .then(isValid => {
    if (isValid) {
      console.log('✅ Password matches! The hash is correct.');
      console.log('\nIf login still fails, check:');
      console.log('  1. Server was restarted after adding hash to .env.local');
      console.log('  2. NODE_ENV is set correctly');
      console.log('  3. No typos in the hash in .env.local\n');
    } else {
      console.log('❌ Password does NOT match the hash.');
      console.log('\nPossible issues:');
      console.log('  1. Wrong password entered');
      console.log('  2. Hash was generated with a different password');
      console.log('  3. Hash in .env.local is incorrect\n');
      console.log('To generate a new hash, run:');
      console.log(`  node scripts/generate-password-hash.js ${password}\n`);
    }
  })
  .catch(error => {
    console.error('❌ Error comparing password:', error.message);
    console.log('\nThe hash format might be invalid.\n');
  });

