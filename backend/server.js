
//=======================================
//   Server.js - BACK-END COMPLETO
//=======================================

// PARTE 1: Importar as ferramentas
const express = require('express');             //biblioteca para criar o servidor
const path = require('path');                   //ajuda a montar caminhos de pastas
const { DatabaseSync } = require('node:sqlite') //banco SQLite (já vem dentro do node!)

// Abreviação de readFiles
const fs = require('fs');
const db = require('../database/db.js');

//PARTE 2: Criar o Servidor e abrir o banco
const PORT = 3000;
const app = express(); //cria o servidor

//Servir os dados para do frontend
app.use(express.static(path.resolve(__dirname, '..', 'frontend')));
// dados de imagem e svg
app.use('/files', express.static(path.join(__dirname, '../../files')));


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


// ROTA PARA CONFIGURAR A TELA PRINCIPAL DO INDEX

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'pag-ini', 'index.html'));
});

// ROTA PARA A PÁGINA DE CRIAR CONTA
app.get('/criar-conta', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-ini/criarConta.html'));
});

// ROTA PARA HOME - CLIENTE
app.get('/home-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cliente/homeC.html'));
});


// Fução para rodar o script do BDD de login
function iniBDD() {
    try {
        // verifica se o arquivo script.sql realmente existe na pasta

        if (fs.existsSync(scriptPath)) {
            const sql = fs.readFileSync(scriptPath, 'utf8');

            deb.exec(sql)

            console.log('Banco de dados inicializado e tabela LOG-IN criado')
        } else {
            conosle.log('Arquivo script.sql não foi encontrado')
        }
    } catch (error) {
        console.error('ERRO ao rodar o script de inicialização do banco de dados', error.message)
    }
}

// Inicializar o BDD (LOG-IN)
iniBDD();

module.exports = db;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// =====================================
//              Cadastro
// =====================================

app.post('/api/usuarios', (req, res) => {
    const { email, senha } = req.body; 

    const sql = 'INSERT INTO usuarios (email, senha) VALUES (?, ?)';

    db.run(sql, [email, senha], function(erro) {
        if (erro) {
            console.error('Erro ao salvar no banco:', erro.message);
            return res.status(500).json({ mensagem: 'Erro interno no servidor' });
        }
        
        return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id: this.lastID });
    });
});


