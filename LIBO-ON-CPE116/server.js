// Simple static file server using Node.js built-in modules
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8000;

// minimal mime dictionary for our files
const mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') {
        urlPath = '/index.html';
    }

    const filePath = path.join(__dirname, urlPath);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - Not Found');
            return;
        }

        const ext = path.extname(filePath);
        const type = mime[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(content);
    });
});

server.listen(port, () => {
    console.log(`Static server running at http://localhost:${port}`);
});