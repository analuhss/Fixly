-- database: :memory:
-- 1. Tabela de Login
CREATE TABLE IF NOT EXISTS login (
    idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo TEXT DEFAULT 'cliente'
);

-- 2. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    idCliente INTEGER PRIMARY KEY, -- Sem AUTOINCREMENT aqui pois ela recebe o ID do login
    nome TEXT NOT NULL,
    cpf TEXT,
    dataNascimento TEXT,
    telefone TEXT,
    email TEXT,
    cep TEXT,
    endereco TEXT,
    foto TEXT,
    cadastro_completo INTEGER DEFAULT 1
);

-- 3. Tabela de Técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
    idTecnico INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    cpf TEXT, -- Alterado de INTEGER para TEXT para manter zeros à esquerda e pontuação
    dataNascimento TEXT,
    telefone TEXT,
    cep TEXT,
    etnia TEXT,
    admissao DATE,
    demissao DATE,
    cargo TEXT,
    salario FLOAT
);

-- 4. Tabela de Chamados/Serviços
CREATE TABLE IF NOT EXISTS os (
    idChamado INTEGER PRIMARY KEY AUTOINCREMENT,
    identificacao TEXT,
    abertura TEXT,
    data_abertura TEXT DEFAULT (date('now', 'localtime')),
    modelo TEXT,
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
    idTecnico INTEGER,
    status TEXT
);