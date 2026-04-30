const http = require('http');

async function testChat() {
  const data = JSON.stringify({ message: 'Hello' });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', (error) => reject(error));
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Testing chat endpoint...');
  try {
    const res = await testChat();
    console.log('Status:', res.status);
    console.log('Body:', res.body);
  } catch (e) {
    console.error('Test failed:', e.message);
  }
}

run();
