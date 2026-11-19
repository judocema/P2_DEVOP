# Avaliação A — Cadastro de Produtos

## Integrantes

- Julia Docema
- Julia Fernandes

## Descrição do projeto

Este projeto consiste em uma aplicação web para cadastro e consulta de produtos, desenvolvida com uma arquitetura distribuída em duas máquinas virtuais.

A infraestrutura é provisionada com OpenTofu, enquanto a configuração e a implantação dos serviços são automatizadas com Ansible e Docker.

## Arquitetura

A solução utiliza duas máquinas virtuais Ubuntu:

### VM1 — Aplicação Web

- IP: `192.168.122.141`
- Executa a interface Web em um container Docker.
- Disponibiliza a aplicação pela porta 80.
- Permite cadastrar e listar produtos.

### VM2 — API e Banco de Dados

- IP: `192.168.122.228`
- Executa uma API REST desenvolvida em Node.js.
- Executa o banco de dados MySQL em container Docker.
- API disponibilizada pela porta 3000.

A aplicação Web da VM1 realiza requisições HTTP para a API da VM2.

## Tecnologias utilizadas

- Ubuntu Server 24.04
- OpenTofu
- Libvirt/KVM
- Cloud-init
- Ansible
- Docker
- Docker Compose
- Node.js
- MySQL 8.4
- HTML, CSS e JavaScript
- Git e GitHub

## Funcionalidades

- Cadastro de produtos.
- Consulta e listagem dos produtos cadastrados.
- Armazenamento dos dados no MySQL.
- Comunicação entre a aplicação Web e a API REST.
- Validação dos dados enviados.
- Configuração de CORS para permitir as requisições da aplicação Web.

### Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/produto` | Cadastra um produto |
| GET | `/produtos` | Lista os produtos cadastrados |

Os produtos possuem os seguintes campos:

- Nome
- Categoria
- Preço decimal
- Quantidade em números inteiros

## Estrutura do projeto

```text
avaliacao-devops-produtos/
├── ansible/
│   ├── inventory.ini
│   └── playbook.yml
├── api/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── server.js
├── app/
│   ├── Dockerfile
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── server.js
├── iac/
│   ├── cloud_init.cfg
│   └── main.tf
├── .gitignore
└── README.md
```

## Implantação da infraestrutura

Com OpenTofu instalado e o ambiente Libvirt/KVM configurado:

```bash
tofu -chdir=iac init
```

Validar a configuração:

```bash
tofu -chdir=iac validate
```

Provisionar as máquinas virtuais:

```bash
tofu -chdir=iac apply
```

O projeto provisiona duas máquinas virtuais independentes.

## Configuração e implantação com Ansible

Após as máquinas estarem disponíveis e acessíveis por SSH, executar:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

O playbook automatiza a instalação e inicialização do Docker, a cópia dos arquivos e a implantação dos containers da aplicação Web, API e banco de dados.

**Observação sobre as imagens Docker:** a imagem `api-api:latest` precisa estar disponível na VM2 e também na VM1 antes da implantação Web. Neste ambiente, ela foi construída na VM2 e transferida para a VM1 pela rede interna. O Docker Compose está configurado para utilizar as imagens existentes, sem reconstrução durante a execução do playbook.

## Acessar a aplicação

Após a implantação, acessar pelo navegador:

**Aplicação Web:**

http://192.168.122.141

**API:**

http://192.168.122.228:3000/produtos

## Banco de dados

O MySQL utiliza um volume Docker persistente para armazenar os produtos cadastrados, preservando os dados mesmo quando os containers são reiniciados.

## Repositório

Projeto desenvolvido para a Avaliação A — Cadastro de Produtos, com infraestrutura como código e automação de implantação.
