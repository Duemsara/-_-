const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

const server = http.createServer((req, res) => {
  // Decode URL and normalize path
  let safeUrl = decodeURI(req.url.split('?')[0]);
  if (safeUrl === '/') safeUrl = '/index.html';

  let filePath = path.join(ROOT, safeUrl);

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h2>404 មិនមានទំព័រនេះទេ (Not Found)</h2><p><a href="/">ត្រឡប់ទៅកាន់ទំព័រដើម</a></p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIPs = getLocalIPs();
  console.log(`====================================================`);
  console.log(`🎮 Server ល្បែងសិក្សា កំពុងដំណើរការដោយជោគជ័យ!`);
  console.log(`----------------------------------------------------`);
  console.log(`💻 លើម៉ាស៊ីនផ្ទាល់ (Local):`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}`);
  if (localIPs.length > 0) {
    console.log(`\n📱 សម្រាប់ទូរសព្ទ/កុំព្យូទ័រផ្សេងក្នុង Wi-Fi ជាមួយគ្នា (LAN):`);
    localIPs.forEach(ip => {
      console.log(`   http://${ip}:${PORT}`);
    });
  }
  console.log(`====================================================`);
});
