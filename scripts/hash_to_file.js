const bcrypt = require('bcryptjs');
const fs = require('fs');
const hash = bcrypt.hashSync('password123', 10);
fs.writeFileSync('hash.txt', hash);
console.log('Hash written to hash.txt');
