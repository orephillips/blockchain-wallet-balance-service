const fs = require('fs');
const crypto = require('crypto');

function generateApiKey() {
  return crypto.randomBytes(20).toString('hex');
}

const apiKeys = [];
for (let i = 0; i < 10000; i++) {
  apiKeys.push(generateApiKey());
}

fs.writeFileSync('api-keys.json', JSON.stringify(apiKeys, null, 2));

console.log('Generated 10,000 API keys and saved to api-keys.json');
