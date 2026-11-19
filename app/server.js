
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 80;
const PASTA = __dirname;

const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8"
};

const server = http.createServer((req, res) => {
  let arquivo = req.url.split("?")[0];

  if (arquivo === "/") {
    arquivo = "/index.html";
  }

  const caminho = path.join(PASTA, path.basename(arquivo));

  fs.readFile(caminho, (erro, conteudo) => {
    if (erro) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Arquivo não encontrado.");
    }

    const tipo = tipos[path.extname(caminho)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": tipo });
    res.end(conteudo);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Aplicação Web rodando na porta ${PORT}`);
});
