const { randomInt } = require('crypto');
const fs = require('fs');
const http = require('http');
const httpProxy = require('http-proxy');

// Proxy nesnesi oluştur
const proxy = httpProxy.createProxyServer({});

// Proxy ayarları
let proxyConfig = {};
let serverConfig = {};

// Sunucu oluştur
const server = http.createServer((req, res) => {
    console.log(req.url)
    // /reload isteği
    if (req.url === '/zfc' && req.method === 'GET') {
        // Yeniden yükleme isteği alındığında proxy ayarlarını yeniden yükle
        reloadProxyConfig();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Proxy configuration reloaded successfully.');
    } else {
        // Diğer istekler için proxy işlemini gerçekleştir
        handleProxyRequest(req, res);
    }
});

// Proxy ayarlarını yükle
function loadServerConfig() {
    try {
        serverConfig = JSON.parse(fs.readFileSync(__dirname + '/../configs/default.json', 'utf8'));
        console.log('Proxy configuration loaded successfully.');
    } catch (err) {
        console.error('Error loading proxy configuration:', err);
    }
}

// Hedef sunucu ayarlarını yükle
function loadTargetServers() {
    try {
        const targetServers = JSON.parse(fs.readFileSync(__dirname + '/../configs/servers.json', 'utf8'));
        for (const hostname in targetServers) {
            proxyConfig[hostname] = targetServers[hostname];
        }
        console.log('Target servers configuration loaded successfully.');
    } catch (err) {
        console.error('Error loading target servers configuration:', err);
    }
}

// Proxy ayarlarını yeniden yükle
function reloadProxyConfig() {
    loadServerConfig();
    loadTargetServers();
}

// Proxy işlemini gerçekleştir
async function handleProxyRequest(req, res) {
    const hostname = req.headers.host.split(':')[0]; // Gelen isteğin hostname'ini al
    const target = proxyConfig[hostname]; // Hostname'e göre hedef sunucuyu seç

    const defaultTarget = serverConfig.defaultServer.host;

    console.log("deftar", defaultTarget)
    if (target) {
        proxy.web(req, res, { target });
    } else {
        if (defaultTarget) {
            proxy.web(req, res, { target: defaultTarget });
        }
        else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found.');
        }
    }
}

// Hata yönetimi
proxy.on('error', (err, req, res) => {
    console.error('Proxy Error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Something went wrong.');
});

reloadProxyConfig();
// Sunucuyu dinle
server.listen(serverConfig.port, () => {
    console.log(`Server running on port ${serverConfig.port}`);
    // İlk başta proxy ve hedef sunucu ayarlarını yükle
});