const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Cria ou abre o arquivo do banco de dados dentro da pasta database
const dbPath = path.join(__dirname, 'banco.db');

const conexao = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Conectado com sucesso ao banco de dados SQLite!');
    }
});

// CRIA A TABELA AUTOMATICAMENTE COM OS CAMPOS OBRIGATÓRIOS E ADICIONAIS
conexao.serialize(() => {
    conexao.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            tipo TEXT DEFAULT 'cliente',
            nome TEXT,
            data_nascimento TEXT,
            cadastro_completo INTEGER DEFAULT 0
        )
    `, (err) => {
        if (err) {
            console.error('Erro ao criar tabela de usuários:', err.message);
        } else {
            console.log('Tabela "usuarios" com campos de perfil atualizada/verificada com sucesso!');
        }
    });
});

// Exporta a conexão para o server.js usar
module.exports = conexao;
