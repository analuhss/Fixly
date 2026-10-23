
//=======================================
//   Server.js - BACK-END COMPLETO
//=======================================

// PARTE 1: Importar as ferramentas
const express = require('express');             //biblioteca para criar o servidor
const path = require('path');                   //ajuda a montar caminhos de pastas
const { DatabaseSync } = require('node:sqlite') //banco SQLite (já vem dentro do node!)

//PARTE 2: Criar o Servidor e abrir o banco
const app = express(); //cria o servidor
console.log("Servidor funcionando!")

//Servir os dados para do frontend
app.use(express.static(path.join(__dirname, "../frontend")));

const banco = new DatabaseSync(path.join(__dirname, 'login.db')); 
//abre o banco(se não existir, cria o arquivo). ------> ___dirname = pasta deste arquivo

//Parte 3: Configurar o servidor (os famosos middlewares)
// app.use: "TODO pedido que chegar, passe primeiro por aqui."

app.use(express.json()); // faz o servidor entender JSON

//----------------------------------------------
// PARTE 4: ROTAS (a API)
//----------------------------------------------
// ROTA: a combinação do método + endereço
// API:  é o conjunto dessas rotas
// 
// Toda rota recebe 2 coisas (SEMPRE NA ORDEM ABAIXO):
// requisição = o PEDIDO que chegou 
// resposta   = o que vamos devolver para o front.
// 
//  Operação | Método HTTP | Endereço | Comando SQL
//  -----------------------------------------------
//  Create   | POST        | /tarefas     | INSERT
//  Read     | GET         | /tarefas     | SELECT
//  Update   | PUT         | /tarefas/:id | INSERT
//  Delete   | DELETE      | /tarefas/:id | DELETE


// ROTA PRINCIPAL PARA CONFIGURAR A TELA PRINCIPAL DO INDEX
app.get('/', (req, res) => {res.sendFile(path.join(__dirname, '../frontend/pag-ini/index.html'))});

