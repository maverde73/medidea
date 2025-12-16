const bcrypt = require('bcryptjs');
const fs = require('fs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
