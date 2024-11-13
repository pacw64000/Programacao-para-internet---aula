import express from "express";

const app = express();
app.use(express.urlencoded({ extended: true }));

const porta = 3000;
const host = "0.0.0.0";

var listaEmpresas = [];

function menuView(req, resp) {
  resp.send(`
        <html>
            <head>
                <title>Cadastro de Empresas</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            </head>
            <body>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#">MENU</a>
                        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                            <div class="navbar-nav">
                                <a class="nav-link active" aria-current="page" href="/cadastrarEmpresa">Cadastrar Empresa</a>
                            </div>
                        </div>
                    </div>
                </nav>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        </html>
        `);
}

function cadastroEmpresaView(req, resp, erro = "") {
  resp.send(`
            <html>
                <head>
                    <title>Cadastro de Empresa</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                </head>
                <body>
                    <div class="container text-center">
                        <h1 class="mb-5">Cadastro da Empresa</h1>
                        ${erro ? `<div class="alert alert-danger">${erro}</div>` : ""}
                        <form method="POST" action="/cadastrarEmpresa" class="border p-3 row g-3" novalidate>
                            <div class="col-md-4">
                                <label for="cnpj" class="form-label">CNPJ</label>
                                <input type="text" class="form-control" id="cnpj" name="cnpj" required>
                            </div>
                            <div class="col-md-4">
                                <label for="razaoSocial" class="form-label">Razão Social</label>
                                <input type="text" class="form-control" id="razaoSocial" name="razaoSocial" placeholder="Ex: Moraes & irmãos Ltda" required>
                            </div>
                            <div class="col-md-4">
                                <label for="nomeFantasia" class="form-label">Nome Fantasia</label>
                                <input type="text" class="form-control" id="nomeFantasia" name="nomeFantasia" placeholder="Ex: Loja do 1,99" required>
                            </div>
                            <div class="col-md-6">
                                <label for="endereco" class="form-label">Endereço</label>
                                <input type="text" class="form-control" id="endereco" name="endereco" required>
                            </div>
                            <div class="col-md-3">
                                <label for="cidade" class="form-label">Cidade</label>
                                <input type="text" class="form-control" id="cidade" name="cidade" required>
                            </div>
                            <div class="col-md-3">
                                <label for="uf" class="form-label">UF</label>
                                <select class="form-select" id="uf" name="uf" required>
                                    <option selected value="">Escolha...</option>
                                    <option value="SP">São Paulo</option>
                                    <option value="RJ">Rio de Janeiro</option>
                                    <option value="MG">Minas Gerais</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label for="cep" class="form-label">CEP</label>
                                <input type="text" class="form-control" id="cep" name="cep" required>
                            </div>
                            <div class="col-md-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" name="email" required>
                            </div>
                            <div class="col-md-3">
                                <label for="telefone" class="form-label">Telefone</label>
                                <input type="text" class="form-control" id="telefone" name="telefone" required>
                            </div>
                            <div class="col-12">
                                <button class="btn btn-primary" type="submit">Cadastrar</button>
                            </div>
                        </form>
                    </div>
                </body>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
            </html>
    `);
}

function validarDadosEmpresa(dados) { //Validaçao feita pelo chatGPT
  const { cnpj, razaoSocial, nomeFantasia, endereco, cidade, uf, cep, email, telefone } = dados;

  if (!cnpj || !cnpj.match(/^\d{14}$/)) return "CNPJ inválido. Deve conter 14 dígitos numéricos.";
  if (!razaoSocial || razaoSocial.length < 3) return "Razão Social inválida. Deve ter pelo menos 3 caracteres.";
  if (!nomeFantasia || nomeFantasia.length < 3) return "Nome Fantasia inválido. Deve ter pelo menos 3 caracteres.";
  if (!endereco) return "Endereço é obrigatório.";
  if (!cidade) return "Cidade é obrigatória.";
  if (!uf || uf.length !== 2) return "UF inválido.";
  if (!cep || !cep.match(/^\d{8}$/)) return "CEP inválido. Deve conter 8 dígitos numéricos.";
  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Email inválido.";
  if (!telefone || !telefone.match(/^\d+$/)) return "Telefone inválido. Deve conter apenas dígitos.";

  return null;
}

function cadastrarEmpresa(req, resp) {
  const erro = validarDadosEmpresa(req.body);
  if (erro) {
    return cadastroEmpresaView(req, resp, erro);
  }

  const { cnpj, razaoSocial, nomeFantasia, endereco, cidade, uf, cep, email, telefone } = req.body;
  const empresa = { cnpj, razaoSocial, nomeFantasia, endereco, cidade, uf, cep, email, telefone };
  listaEmpresas.push(empresa);

  resp.write(`
        <html>
            <head>
                <title>Lista de Empresas</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                <meta charset="utf-8">
            </head>
            <body>
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>CNPJ</th>
                        <th>Razão Social</th>
                        <th>Nome Fantasia</th>
                        <th>Endereço</th>
                        <th>Cidade</th>
                        <th>UF</th>
                        <th>CEP</th>
                        <th>Email</th>
                        <th>Telefone</th>
                    </tr>
                </thead>
                <tbody>`);
  listaEmpresas.forEach((empresa) => {
    resp.write(`
                    <tr>
                        <td>${empresa.cnpj}</td>
                        <td>${empresa.razaoSocial}</td>
                        <td>${empresa.nomeFantasia}</td>
                        <td>${empresa.endereco}</td>
                        <td>${empresa.cidade}</td>
                        <td>${empresa.uf}</td>
                        <td>${empresa.cep}</td>
                        <td>${empresa.email}</td>
                        <td>${empresa.telefone}</td>
                    </tr>`);
  });

  resp.write(`</tbody>
            </table>
            <a class="btn btn-primary" href="/cadastrarEmpresa">Continuar Cadastrando</a>
            <a class="btn btn-secondary" href="/">Voltar para o Menu</a>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        </html>
            `);

  resp.end();
}

app.get("/", menuView);
app.get("/cadastrarEmpresa", (req, resp) => cadastroEmpresaView(req, resp));
app.post("/cadastrarEmpresa", cadastrarEmpresa);

app.listen(porta, host, () => {
  console.log(`Servidor iniciado e em execução no endereço http://${host}:${porta}`);
});
