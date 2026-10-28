const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'banco.db');
const conexao = new sqlite3.Database(dbPath);

conexao.serialize(() => {
    // 1. Tabela de Login (Gera o idCliente automaticamente)
    conexao.run(`
        CREATE TABLE IF NOT EXISTS login (
            idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            tipo TEXT DEFAULT 'cliente' -- Mantemos para diferenciar o Admin
        )
    `);

    // 2. Tabela de Usuários (Recebe o idCliente para o relacionamento)
    conexao.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            idCliente INTEGER PRIMARY KEY, -- Sem AUTOINCREMENT aqui, pois ela recebe o ID do login
            nome TEXT NOT NULL,
            cpf TEXT,
            dataNascimento TEXT,
            telefone TEXT,
            email TEXT,
            cep TEXT,
            cadastro_completo INTEGER DEFAULT 1 -- Como os dados entram aqui juntos, o cadastro já nasce completo
        )
    `);
});

module.exports = conexao;
