const bcrypt = require('bcryptjs');
const fs = require('fs');
const hash = bcrypt.hashSync('admin123', 10);
fs.writeFileSync('admin_hash.txt', hash);
