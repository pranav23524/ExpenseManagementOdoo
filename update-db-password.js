const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 MongoDB Password Update Tool');
console.log('================================');
console.log('Please enter your MongoDB Atlas password:');

rl.question('Password: ', (password) => {
  if (!password) {
    console.log('❌ No password provided. Exiting...');
    rl.close();
    return;
  }

  try {
    // Read the current config file
    const configPath = 'server/config/env.ts';
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Replace the placeholder with the actual password
    const updatedContent = configContent.replace(
      'YOUR_ACTUAL_PASSWORD_HERE',
      password
    );
    
    // Write the updated content back
    fs.writeFileSync(configPath, updatedContent);
    
    console.log('✅ Password updated successfully!');
    console.log('📝 You can now run: npm run seed');
    
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
  }
  
  rl.close();
});
