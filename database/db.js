const sqlite3 = require('sqlite3').verbose();

// A função verbose serve para gerar logs mais detalhados no terminal caso aconteça algum erro 

const path = require('path');

const dbPath = path.join(__dirname, 'banco.db');
const conexao = new sqlite3.Database(dbPath);

// O comando serialize serve para que todas as operações do banco sejam executadas uma após a outra, de forma sequencial

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
            idCliente INTEGER PRIMARY KEY, -- Sem AUTOINCREMENT aqui pois ela recebe o ID do login
            nome TEXT NOT NULL,
            cpf TEXT,
            dataNascimento TEXT,
            telefone TEXT,
            email TEXT,
            cep TEXT,
            endereco TEXT,
            cadastro_completo INTEGER DEFAULT 1
        )
    `);

    // 3. Tabela de Técnicos (Corrigido: trocado a vírgula por parênteses)
    conexao.run(`
        CREATE TABLE IF NOT EXISTS tecnicos (
            idTecnico INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            cpf INTEGER,
            dataNascimento TEXT,
            telefone TEXT,
            cep TEXT,
            etnia TEXT,
            admissao DATE,
            demissao DATE,
            cargo TEXT,
            salario FLOAT
        )
    `);

    // 4. Tabela de Chamados/Serviços (Corrigido: adicionado CREATE TABLE e as vírgulas que faltavam)
    conexao.run(`
        CREATE TABLE IF NOT EXISTS os (
            idChamado INTEGER PRIMARY KEY AUTOINCREMENT,
            identificacao TEXT,
            abertura TEXT,
            hora TEXT,
            descricao TEXT,
            equipamento TEXT,
            marca TEXT,
            perifericos TEXT,
            diagnostico TEXT,
            servicoExe TEXT,
            pecas_mate TEXT,
            valorfinal FLOAT,
            processo TEXT,
            validacao TEXT,
            idCliente INTEGER,
            idTecnico INTEGER
        )
    `);
});


module.exports = conexao;