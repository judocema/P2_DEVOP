
const http = require("http");
const mysql = require("mysql2/promise");

const PORT = 3000;

const dbConfig = {
  host: "mysql",
  user: "appuser",
  password: "Produtos@2026",
  database: "cadastro_produtos",
  waitForConnections: true,
  connectionLimit: 10
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

async function conectarBanco() {
  const conexao = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
  });

  await conexao.execute(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      categoria VARCHAR(100) NOT NULL,
      preco DECIMAL(10,2) NOT NULL,
      quantidade INT NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conexao.end();
}

async function aguardarBanco() {
  for (let tentativa = 1; tentativa <= 30; tentativa++) {
    try {
      await conectarBanco();
      console.log("MySQL conectado e tabela verificada.");
      return;
    } catch (erro) {
      console.log(`Aguardando MySQL (${tentativa}/30)...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  throw new Error("Nao foi possivel conectar ao MySQL.");
}

const server = http.createServer(async (req, res) => {
  Object.entries(corsHeaders).forEach(([chave, valor]) => {
    res.setHeader(chave, valor);
  });

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "GET" && req.url === "/produtos") {
    try {
      const conexao = await mysql.createConnection(dbConfig);
      const [produtos] = await conexao.execute(
        "SELECT * FROM produtos ORDER BY id DESC"
      );
      await conexao.end();

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(produtos));
    } catch (erro) {
      console.error(erro);
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ erro: "Erro ao listar produtos." }));
    }
  }

  if (req.method === "POST" && req.url === "/produto") {
    let corpo = "";

    req.on("data", parte => {
      corpo += parte;
    });

    req.on("end", async () => {
      try {
        const dados = JSON.parse(corpo);
        const { nome, categoria, preco, quantidade } = dados;

        if (
          typeof nome !== "string" || !nome.trim() ||
          typeof categoria !== "string" || !categoria.trim() ||
          !Number.isFinite(Number(preco)) || Number(preco) < 0 ||
          !Number.isInteger(Number(quantidade)) || Number(quantidade) < 0
        ) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ erro: "Dados invalidos." }));
        }

        const conexao = await mysql.createConnection(dbConfig);

        const [resultado] = await conexao.execute(
          "INSERT INTO produtos (nome, categoria, preco, quantidade) VALUES (?, ?, ?, ?)",
          [nome.trim(), categoria.trim(), Number(preco), Number(quantidade)]
        );

        await conexao.end();

        res.writeHead(201, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
          mensagem: "Produto cadastrado com sucesso!",
          id: resultado.insertId
        }));
      } catch (erro) {
        console.error(erro);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ erro: "Nao foi possivel cadastrar o produto." }));
      }
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ erro: "Rota nao encontrada." }));
});

aguardarBanco()
  .then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`API rodando na porta ${PORT}`);
    });
  })
  .catch(erro => {
    console.error(erro);
    process.exit(1);
  });
