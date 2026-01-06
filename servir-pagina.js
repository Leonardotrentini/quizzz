const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;
const HTML_FILE = path.join(__dirname, 'pagina', 'code.html');

const server = http.createServer((req, res) => {
  let filePath = req.url;
  if (filePath === '/' || filePath === '/code.html' || filePath === '/index.html') {
    filePath = HTML_FILE;
  } else if (filePath.startsWith('/')) {
    // Remove a barra inicial e tenta encontrar o arquivo na pasta pagina
    const requestedFile = filePath.substring(1);
    filePath = path.join(__dirname, 'pagina', requestedFile);
  } else {
    filePath = path.join(__dirname, 'pagina', filePath);
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Arquivo não encontrado</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Erro do servidor: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📄 Abrindo página no navegador...\n`);
  
  // Abre o navegador automaticamente
  const url = `http://localhost:${PORT}`;
  const command = process.platform === 'win32' 
    ? `start ${url}` 
    : process.platform === 'darwin' 
    ? `open ${url}` 
    : `xdg-open ${url}`;
  
  exec(command, (error) => {
    if (error) {
      console.log(`⚠️  Não foi possível abrir o navegador automaticamente.`);
      console.log(`   Acesse manualmente: ${url}\n`);
    }
  });
  
  console.log('Pressione Ctrl+C para parar o servidor\n');
});




