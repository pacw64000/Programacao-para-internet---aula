import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();

// Configuring session management
app.use(session({
    secret: 'M1nh4Chav3S3cr3t4',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // set to true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 30 // 30 minutes
    }
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./pages/public'));

const porta = 3000;
const host = '0.0.0.0';

// Data storage for students and products
let listaAlunos = [];
let listaProdutos = [];

// Login page
function loginView(req, resp) {
    resp.send(`
        <html>
            <head>
                <title>Login</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container text-center">
                    <h1 class="mb-5">Login</h1>
                    <form method="POST" action="/login" class="border p-3">
                        <div class="mb-3">
                            <label for="username" class="form-label">Usuario</label>
                            <input  class="form-control" id="username" name="username" required>
                        </div>
                        <div class="mb-3">
                            <label for="senha" class="form-label">Senha</label>
                            <input type="password" class="form-control" id="senha" name="senha" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                </div>
            </body>
        </html>
    `);
}

// Authenticate user login
function login(req, resp) {
    const { username, senha } = req.body;
    if (username === "admin" && senha === "123") { // Sample credentials
        req.session.loggedIn = true;
        req.session.user = username;
        req.session.dataHoraUltimoLogin = new Date().toLocaleString();
        resp.redirect('/menu');
    } else {
        resp.send('Credenciais inválidas!');
        resp.redirect('/login');
    }
}

// Logout user
function logout(req, resp) {
    req.session.destroy((err) => {
        if (err) {
            return resp.send('Erro ao sair.');
        }
        resp.clearCookie('connect.sid');
        resp.redirect('/login');
    });
}

// Ensure the user is logged in before proceeding
function checkAuth(req, resp, next) {
    if (!req.session.loggedIn) {
        return resp.redirect('/login');
    }
    next();
}

// Menu page (accessible after login)
function menuView(req, resp) {
    const dataHoraUltimoLogin = req.session.dataHoraUltimoLogin || '';
    resp.send(`
        <html>
            <head>
                <title>Menu</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#">MENU</a>
                        <div class="navbar-nav">
                            <a class="nav-link" href="/cadastrarAluno">Cadastrar Aluno</a>
                            <a class="nav-link" href="/cadastrarProduto">Cadastrar Produto</a>
                            <a class="nav-link" href="/alunos">Ver Alunos</a>
                            <a class="nav-link" href="/produtos">Ver Produtos</a>
                            <a class="nav-link" href="/logout">Sair</a>
                            <a class="nav-link disabled">Último acesso: ${dataHoraUltimoLogin}</a>
                        </div>
                    </div>
                </nav>
            </body>
        </html>
    `);
}

// Registration form for students
function cadastroAlunoView(req, resp) {
    resp.send(`
        <html>
            <head>
                <title>Cadastro de Alunos</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container text-center">
                    <h1 class="mb-5">Cadastro de Alunos</h1>
                    <form method="POST" action="/cadastrarAluno" class="border p-3 row g-3" novalidate>
                        <div class="col-md-4">
                            <label for="nome" class="form-label">Nome</label>
                            <input type="text" class="form-control" id="nome" name="nome" placeholder="Digite seu nome" required>
                        </div>
                        <div class="col-md-4">
                            <label for="sobrenome" class="form-label">Sobrenome</label>
                            <input type="text" class="form-control" id="sobrenome" name="sobrenome" required>
                        </div>
                        <div class="col-md-4">
                            <label for="email" class="form-label">Email</label>
                            <div class="input-group has-validation">
                                <span class="input-group-text" id="inputGroupPrepend">@</span>
                                <input type="email" class="form-control" id="email" name="email" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label for="cidade" class="form-label">Cidade</label>
                            <input type="text" class="form-control" id="cidade" name="cidade" required>
                        </div>
                        <div class="col-md-3">
                            <label for="estado" class="form-label">UF</label>
                            <select class="form-select" id="estado" name="estado" required>
                                <option selected value="SP">São Paulo</option>
                                <option value="AC">Acre</option>
                                <option value="AL">Alagoas</option>
                                <option value="AM">Amazonas</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="cep" class="form-label">CEP</label>
                            <input type="text" class="form-control" id="cep" name="cep" required>
                        </div>
                        <div class="col-12">
                            <button class="btn btn-primary" type="submit">Cadastrar</button>
                        </div>
                    </form>
                </div>
            </body>
        </html>
    `);
}

// Register student
function cadastrarAluno(req, resp) {
    const { nome, sobrenome, email, cidade, estado, cep } = req.body;
    if (nome && sobrenome && email && cidade && estado && cep) {
        listaAlunos.push({ nome, sobrenome, email, cidade, estado, cep });
        resp.redirect('/alunos');
    } else {
        resp.send('Dados inválidos!');
    }
}

// List students
function listarAlunos(req, resp) {
    resp.send(`
        <html>
            <head>
                <title>Lista de Alunos</title>
            </head>
            <body>
                <table border="1">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Sobrenome</th>
                            <th>Email</th>
                            <th>Cidade</th>
                            <th>Estado</th>
                            <th>CEP</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${listaAlunos.map(aluno => `
                            <tr>
                                <td>${aluno.nome}</td>
                                <td>${aluno.sobrenome}</td>
                                <td>${aluno.email}</td>
                                <td>${aluno.cidade}</td>
                                <td>${aluno.estado}</td>
                                <td>${aluno.cep}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button><a href="/menu">Voltar ao Menu</a></button>
            </body>
        </html>
    `);
}

// Product registration form
function cadastroProdutoView(req, resp) {
    resp.send(`
        <html>
            <head>
                <title>Cadastro de Produtos</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container text-center">
                    <h1 class="mb-5">Cadastro de Produtos</h1>
                    <form method="POST" action="/cadastrarProduto" class="border p-3 row g-3" novalidate>
                        <div class="col-md-4">
                            <label for="codigo" class="form-label">Código do Produto</label>
                            <input type="text" class="form-control" id="codigo" name="codigo" placeholder="Código" required>
                        </div>
                        <div class="col-md-4">
                            <label for="descricao" class="form-label">Descrição</label>
                            <input type="text" class="form-control" id="descricao" name="descricao" placeholder="Descrição" required>
                        </div>
                        <div class="col-md-4">
                            <label for="preco" class="form-label">Preço</label>
                            <input type="number" class="form-control" id="preco" name="preco" required>
                        </div>
                        <div class="col-md-4">
                            <label for="quantidade" class="form-label">Quantidade</label>
                            <input type="number" class="form-control" id="quantidade" name="quantidade" required>
                        </div>
                        <div class="col-md-4">
                            <label for="fornecedor" class="form-label">Fornecedor</label>
                            <input type="text" class="form-control" id="fornecedor" name="fornecedor" required>
                        </div>
                        <div class="col-md-4">
                            <label for="validade" class="form-label">Data de Validade</label>
                            <input type="date" class="form-control" id="validade" name="validade" required>
                        </div>
                        <div class="col-12">
                            <button class="btn btn-primary" type="submit">Cadastrar Produto</button>
                        </div>
                    </form>
                </div>
            </body>
        </html>
    `);
}

// Register product
function cadastrarProduto(req, resp) {
    const { codigo, descricao, preco, quantidade, fornecedor, validade } = req.body;
    if (codigo && descricao && preco && quantidade && fornecedor && validade) {
        listaProdutos.push({ codigo, descricao, preco, quantidade, fornecedor, validade });
        resp.redirect('/produtos');
    } else {
        resp.send('Dados inválidos!');
    }
}

// List products
function listarProdutos(req, resp) {
    resp.send(`
        <html>
            <head>
                <title>Lista de Produtos</title>
            </head>
            <body>
                <table border="1">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descrição</th>
                            <th>Preço</th>
                            <th>Quantidade</th>
                            <th>Fornecedor</th>
                            <th>Data de Validade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${listaProdutos.map(produto => `
                            <tr>
                                <td>${produto.codigo}</td>
                                <td>${produto.descricao}</td>
                                <td>${produto.preco}</td>
                                <td>${produto.quantidade}</td>
                                <td>${produto.fornecedor}</td>
                                <td>${produto.validade}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button><a href="/menu">Voltar ao Menu</a></button>
            </body>
        </html>
    `);
}

// Routing
app.get('/', (req,resp)=>{
    resp.redirect('/login');});
app.get('/login', loginView);
app.post('/login', login);
app.get('/logout', logout);
app.get('/menu', checkAuth, menuView);

// Routes for students
app.get('/cadastrarAluno', checkAuth, cadastroAlunoView);
app.post('/cadastrarAluno', checkAuth, cadastrarAluno);
app.get('/alunos', checkAuth, listarAlunos);

// Routes for products
app.get('/cadastrarProduto', checkAuth, cadastroProdutoView);
app.post('/cadastrarProduto', checkAuth, cadastrarProduto);
app.get('/produtos', checkAuth, listarProdutos);

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
