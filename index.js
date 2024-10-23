import express from "express";

const host = "0.0.0.0";
const porta = 3000;

const app = express();

function paginaInicial(requisicao, resposta) {
  resposta.send(`<h1>Ola!</h1> 
                    <br/> 
                    <h2>projeto com Node/JS para a aula de Programação para Internet</h2>
                    <h3>Página inicial</h3>
        `);
}
app.get("/", paginaInicial);

function mostrarSobre(requisicao, resposta) {
  resposta.write(`<html>`);
  resposta.write(`<head>
                        <meta charset="UTF-8">
                        <title>Sobre</title>
                    </head>
                    <body>`);
  resposta.write(`<h1>Sobre nós</h1> `);
  resposta.write(`<p>Aluno: Anderson Garrido</p>`);
  resposta.write(`</body>`);
  resposta.write(`</html>`);
  resposta.end();
}

app.get("/sobre", mostrarSobre);
function depositar(requisicao, resposta) {
  const valor = requisicao.query.valor;
  if (valor) {
    resposta.write(`<html>
                        <head>
                            <meta charset="UTF-8">
                            <title>Depósito realizado!</title>
                        </head>
                        <body>
                            <h1 style="color: black;">Depósito Feito!</h1> 
                            <h1 style="color: black;">Valor Depositado: R$ ${valor}</h1>
                        </body>
                        </html>`);
    resposta.end();
  } else {
    resposta.write(`
            <html>
            <head>
                <meta charset='UTF-8'>
            </head>
            <body>
                <h1 style='color: black;'>É necessário dizer o valor a ser depositado!</h1>
                <p style='color: black;'>Exemplo: http://localhost:3000/depositar?valor=10</p>
            </body>
            </html>`);
    resposta.end();
  }
}

app.get("/depositar", depositar);

function contar(requisicao, resposta) {
  const inicio = parseInt(requisicao.query.inicio);
  const fim = parseInt(requisicao.query.fim);

  if (inicio > 0 && fim > 0 && inicio < fim) {
    resposta.write("<p>Contando...</p>");
    resposta.write("<ul>");
    for (let i = inicio; i <= fim; i++) {
      resposta.write(`<li>${i}</li>`);
    }
    resposta.write("</ul>");
    resposta.end();
  } else {
    resposta.write("<p>Informe corretamente o inicio e o fim.</p>");
    resposta.write(
      "<p>Exemplo: http://localhost:3000/contar?inicio=1&fim=10</p>"
    );
    resposta.end();
  }
}

app.get("/contar", contar);

app.listen(porta, host, () => {
  console.log("Servidor em execução http://" + host + ":" + porta);
});
