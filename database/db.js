const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs'); // <-- 1. Importa o módulo para ler arquivos

const dbPath = path.join(__dirname, 'banco.db');
const conexao = new sqlite3.Database(dbPath);

// 2. Define o caminho e lê o CONTEÚDO de dentro do db.sql
const caminhoSql = path.join(__dirname, 'db.sql');
const schema = fs.readFileSync(caminhoSql, 'utf8');

// 3. Executa o código SQL lido
conexao.exec(schema, (erro) => {
    if (erro) {
        console.error('Erro ao inicializar o banco de dados:', erro.message);
    } else {
        console.log('Banco de dados criado com sucesso :) ');
    }
});

module.exports = conexao;