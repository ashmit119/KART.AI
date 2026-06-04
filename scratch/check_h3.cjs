const h3 = require('h3');
console.log('H3 Exports:', Object.keys(h3).filter(k => k.toLowerCase().includes('request')));
