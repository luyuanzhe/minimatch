const fs = require('fs');
console.log(require('./src/index.js').minimatch('foobar', '!(foo)bar'));
