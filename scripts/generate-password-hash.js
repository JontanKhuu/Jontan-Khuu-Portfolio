/**
 * Generate Admin Password Hash
 * 
 * Run with: node scripts/generate-password-hash.js your-password-here
 * 
 * This will generate a bcrypt hash that you can use for ADMIN_PASSWORD_HASH
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password as an argument');
  console.log('\nUsage: node scripts/generate-password-hash.js your-password-here\n');
  process.exit(1);
}

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\n✅ Password hash generated successfully!\n');
    console.log('Add this to your .env.local file:');
    console.log('─'.repeat(60));
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('─'.repeat(60));
    console.log('\n⚠️  Keep this hash secure and never commit it to git!\n');
  })
  .catch(error => {
    console.error('❌ Error generating hash:', error);
    process.exit(1);
  });

