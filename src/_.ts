import http, { IncomingMessage, ServerResponse } from "http";
import https from "http";
import httpProxy from "http-proxy";
import fs from "fs";

var tropsyConfig: {
  port: number;
} = {
  port: 3000,
};

var serversConfig: {
  host: string;
  target: string;
}[] = [];

const loadTropsyConfigs = async () => {
  // Yapılacak
  // ./../configs/config.json dosyasını okuyarak targetServer değişkenini güncelle
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + "/../configs/tropsy.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading config file:", err);
        reject(err);
        return;
      }
      const config = JSON.parse(data);
      tropsyConfig = config as any;
      console.log("Tropsy's config loaded:", tropsyConfig);
      resolve(true);
    });
  });
};

const loadServersConfigs = async () => {
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
    fs.readFile(__dirname + "/../configs/servers.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading servers config file:", err);
        reject(err);
        return;
      }
      const config = JSON.parse(data);
      serversConfig = config as any;
      console.log("Servers config loaded:", serversConfig);
      resolve(true);
    });
  });
};

const proxy = httpProxy.createProxyServer({});

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    // Gelen isteği hedef sunucuya yönlendir

    let host = req.headers.host?.split(":")[0];

    // find base domain in host but it should be a subdomain
    let baseDomain = host?.split(".").slice(1).join(".");

    console.log("Host:", host);

    // find config for base domain
    let serverConfig = serversConfig.find((config) => config.host == host);

    if (!serverConfig) {
      console.error("Server config not found for host:", host);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server config not found for host.");
      return;
    }

    proxy.web(req, res, { target: serverConfig.target }, (err: Error) => {
      console.error("Proxy error:", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Proxying error occurred.");
    });
  }
);

async function Main() {
  await loadTropsyConfigs();
  await loadServersConfigs();
  server.listen(tropsyConfig.port, () => {
    console.log(
      `Reverse proxy server listening at http://localhost:${tropsyConfig.port}`
    );
  });
}

Main();
