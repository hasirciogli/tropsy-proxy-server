"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const http_proxy_1 = __importDefault(require("http-proxy"));
const fs_1 = __importDefault(require("fs"));
var tropsyConfig = {
    port: 3000,
};
var serversConfig = [];
const loadTropsyConfigs = () => __awaiter(void 0, void 0, void 0, function* () {
    // Yapılacak
    // ./../configs/config.json dosyasını okuyarak targetServer değişkenini güncelle
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(__dirname + "/../configs/tropsy.json", "utf8", (err, data) => {
            if (err) {
                console.error("Error reading config file:", err);
                reject(err);
                return;
            }
            const config = JSON.parse(data);
            tropsyConfig = config;
            console.log("Tropsy's config loaded:", tropsyConfig);
            resolve(true);
        });
    });
});
const loadServersConfigs = () => __awaiter(void 0, void 0, void 0, function* () {
    // Yapılacak
    // ./../configs/config.json dosyasını okuyarak targetServer değişkenini güncelle
    //   fs.readFile(__dirname + "/../configs/servers.json", "utf8", (err, data) => {
    //     if (err) {
    //       console.error("Error reading servers config file:", err);
    //       return;
    //     }
    //     const config = JSON.parse(data);
    //     serversConfig = config as any;
    //     console.log("Servers config loaded:", serversConfig);
    //   });
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(__dirname + "/../configs/servers.json", "utf8", (err, data) => {
            if (err) {
                console.error("Error reading servers config file:", err);
                reject(err);
                return;
            }
            const config = JSON.parse(data);
            serversConfig = config;
            console.log("Servers config loaded:", serversConfig);
            resolve(true);
        });
    });
});
const proxy = http_proxy_1.default.createProxyServer({});
const server = http_1.default.createServer((req, res) => {
    // Gelen isteği hedef sunucuya yönlendir
    var _a;
    let host = (_a = req.headers.host) === null || _a === void 0 ? void 0 : _a.split(":")[0];
    // find base domain in host but it should be a subdomain
    let baseDomain = host === null || host === void 0 ? void 0 : host.split(".").slice(1).join(".");
    console.log("Host:", host);
    // find config for base domain
    let serverConfig = serversConfig.find((config) => config.host == host);
    if (!serverConfig) {
        console.error("Server config not found for host:", host);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server config not found for host.");
        return;
    }
    proxy.web(req, res, { target: serverConfig.target }, (err) => {
        console.error("Proxy error:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxying error occurred.");
    });
});
function Main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield loadTropsyConfigs();
        yield loadServersConfigs();
        server.listen(tropsyConfig.port, () => {
            console.log(`Reverse proxy server listening at http://localhost:${tropsyConfig.port}`);
        });
    });
}
Main();
