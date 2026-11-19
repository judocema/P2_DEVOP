
const API_URL = "http://192.168.122.228:3000";

const form = document.getElementById("formProduto");
const mensagem = document.getElementById("mensagem");
const listaProdutos = document.getElementById("listaProdutos");

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const produto = {
        nome: document.getElementById("nome").value.trim(),
        categoria: document.getElementById("categoria").value.trim(),
        preco: Number(document.getElementById("preco").value),
        quantidade: Number(document.getElementById("quantidade").value)
    };

    try {
        const resposta = await fetch(`${API_URL}/produto`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(produto)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Erro ao cadastrar produto.");
        }

        mostrarMensagem(resultado.mensagem, "sucesso");
        form.reset();
        listarProdutos();

    } catch (erro) {
        mostrarMensagem(
            `Não foi possível cadastrar: ${erro.message}`,
            "erro"
        );
    }
});

async function listarProdutos() {
    listaProdutos.innerHTML = `
        <tr><td colspan="5">Carregando produtos...</td></tr>
    `;

    try {
        const resposta = await fetch(`${API_URL}/produtos`);

        if (!resposta.ok) {
            throw new Error("Erro ao consultar a API.");
        }

        const produtos = await resposta.json();

        listaProdutos.innerHTML = "";

        if (produtos.length === 0) {
            listaProdutos.innerHTML = `
                <tr><td colspan="5">Nenhum produto cadastrado.</td></tr>
            `;
            return;
        }

        produtos.forEach(produto => {
            const linha = document.createElement("tr");

            const valores = [
                produto.id,
                produto.nome,
                produto.categoria,
                Number(produto.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                }),
                produto.quantidade
            ];

            valores.forEach(valor => {
                const celula = document.createElement("td");
                celula.textContent = valor;
                linha.appendChild(celula);
            });

            listaProdutos.appendChild(linha);
        });

    } catch (erro) {
        listaProdutos.innerHTML = `
            <tr><td colspan="5">Erro ao listar: ${erro.message}</td></tr>
        `;
    }
}

document.getElementById("btnListar")
    .addEventListener("click", listarProdutos);
