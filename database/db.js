const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs'); // <-- 1. Importa o módulo para ler arquivos

const dbPath = path.join(__dirname, 'banco.db');
const conexao = new sqlite3.Database(dbPath);
const db = conexao; // Garante que "db" exista e aponte para a mesma conexão

// 2. Define o caminho e lê o CONTEÚDO de dentro do db.sql
const caminhoSql = path.join(__dirname, 'db.sql');
const schema = fs.readFileSync(caminhoSql, 'utf8');

const scriptPath = path.resolve(__dirname, 'script.sql');

// 3. Executa o código SQL lido
conexao.exec(schema, (erro) => {
    if (erro) {
        console.error('Erro ao inicializar o banco de dados:', erro.message);
    } else {
        console.log('Banco de dados criado com sucesso :) ');
    }
});

const exec = (sql) =>
    new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

const run = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

const get = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

const all = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

// =============================
//     CADASTRO DE USUÁRIOS
// =============================

const cadastrarUsuario = (email, senha) =>
    run("INSERT INTO login (email, senha, tipo) VALUES (?, ?, 'cliente')", [email, senha]);

// =================================
//    FINALIZAR CADASTRO (USUÁRIO)
// =================================

const finalizarCadastroUsuario = (idCliente, { nome, dataNascimento, cpf, cep, endereco, telefone }) =>
    run(
        `INSERT OR REPLACE INTO usuarios 
        (idCliente, nome, dataNascimento, cpf, cep, endereco, telefone, cadastro_completo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [idCliente, nome, dataNascimento, cpf, cep, endereco, telefone]
    );

// ==========
//   LOGIN
// ==========

const buscarLoginPorEmail = (email) =>
    get('SELECT * FROM login WHERE email = ?', [email]);

// ==========================
//   CRIAR ORDEM DE SERVIÇO
// ==========================

const criarOrdemServico = ({ abertura, hora, equipamento, marca, perifericos, descricao, idCliente }) =>
    run(
        `INSERT INTO os (
            abertura, hora, equipamento, marca, perifericos, descricao, processo, idCliente
        ) VALUES (?, ?, ?, ?, ?, ?, 'Pendente', ?)`,
        [abertura, hora, equipamento, marca, perifericos, descricao, idCliente]
    );

// =================================
//   BUSCAR PERFIL PROFISSIONAL
// =================================

const buscarPerfilProfissional = (email) =>
    get(
        `SELECT 
            t.idTecnico AS id,
            t.nome,
            t.cpf,
            t.dataNascimento,
            t.telefone,
            COALESCE(NULLIF(TRIM(t.email), ''), l.email) AS email,
            t.cep,
            t.cargo,
            t.admissao,
            l.tipo,
            u.foto
        FROM tecnicos t
        LEFT JOIN login l ON LOWER(TRIM(t.email)) = LOWER(TRIM(l.email))
        LEFT JOIN usuarios u ON l.idCliente = u.idCliente
        WHERE LOWER(TRIM(t.email)) = LOWER(TRIM(?))
        LIMIT 1`,
        [email]
    );

// ==========================
//   BUSCAR PERFIL USUÁRIO
// ==========================

const buscarPerfilUsuario = (idCliente) =>
    get(
        `SELECT 
            l.idCliente AS id,
            COALESCE(u.nome, l.email) AS nome,
            u.cpf,
            u.dataNascimento,
            u.telefone,
            l.email,
            u.cep,
            u.endereco,
            u.foto,
            l.tipo
        FROM login l
        LEFT JOIN usuarios u ON l.idCliente = u.idCliente
        WHERE l.idCliente = ?`,
        [idCliente]
    );

// ==============================
//     REMOVER FOTO DE PERFIL
// ==============================

const removerFotoPerfil = (idCliente) =>
    run('UPDATE usuarios SET foto = NULL WHERE idCliente = ?', [idCliente]);

// ==================
//   LOGIN POR TIPO
// ==================

const criarLoginPorTipo = (email, senha, tipo) =>
    run('INSERT INTO login (email, senha, tipo) VALUES (?, ?, ?)', [email, senha, tipo]);

// ===================
//  CADASTRAR TÉCNICO
// ===================

const cadastrarTecnico = ({ nome, cpf, nascimento, telefone, email, cep, admissao, cargo }) =>
    run(
        `INSERT INTO tecnicos (nome, cpf, dataNascimento, telefone, email, cep, admissao, cargo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, cpf, nascimento, telefone, email, cep, admissao, cargo]
    );

// =====================
//   CADASTRAR USUÁRIO
// =====================

const cadastrarDadosUsuario = ({ idCliente, nome, cpf, nascimento, telefone, email, cep, endereco }) =>
    run(
        `INSERT INTO usuarios (idCliente, nome, cpf, dataNascimento, telefone, email, cep, endereco, cadastro_completo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [idCliente, nome, cpf, nascimento, telefone, email, cep, endereco]
    );

// ==================
//  LISTAR TÉCNICOS
// ==================

const listarTecnicos = () =>
    all('SELECT * FROM tecnicos');

// ========================
// LISTAR ORDENS CLIENTE
// ========================

const listarOrdensComCliente = () =>
    all(`
        SELECT 
            o.*,
            o.rowid AS rowid_os,
            COALESCE(u.nome, l.email, 'Cliente não identificado') AS clienteNome,
            u.telefone AS clienteTelefone,
            u.endereco AS clienteEndereco
        FROM os o
        LEFT JOIN usuarios u ON o.idCliente = u.idCliente
        LEFT JOIN login l ON o.idCliente = l.idCliente
        ORDER BY o.rowid DESC
    `);

// ==================================================
//     ASSUMIR ORDENS DE SERVIÇO (PROFISSIONAIS)
// ==================================================

const assumirOrdemServico = async (idOrdem, tecnico) => {
    const colunas = await all('PRAGMA table_info(os)');
    const nomesColunas = colunas.map((c) => c.name);

    const updates = [];
    const params = [];

    if (nomesColunas.includes('idTecnico')) {
        updates.push('idTecnico = ?');
        params.push(tecnico.idTecnico);
    }
    if (nomesColunas.includes('tecnico')) {
        updates.push('tecnico = ?');
        params.push(tecnico.nome);
    }
    if (nomesColunas.includes('status')) {
        updates.push("status = 'andamento'");
    }
    if (nomesColunas.includes('processo')) {
        updates.push("processo = 'Em andamento'");
    }

    if (updates.length === 0) {
        throw new Error('Colunas de atribuição não encontradas na tabela os.');
    }

    const condicoesId = ['rowid = ?'];
    const paramsWhere = [idOrdem];

    if (nomesColunas.includes('idChamado')) {
        condicoesId.push('idChamado = ?');
        paramsWhere.push(idOrdem);
    }
    if (nomesColunas.includes('idOrdem')) {
        condicoesId.push('idOrdem = ?');
        paramsWhere.push(idOrdem);
    }
    if (nomesColunas.includes('id')) {
        condicoesId.push('id = ?');
        paramsWhere.push(idOrdem);
    }

    const sql = `UPDATE os SET ${updates.join(', ')} WHERE (${condicoesId.join(' OR ')})`;
    return run(sql, [...params, ...paramsWhere]);
};

// ============================
// ATUALIZAR STATUS DA ORDEM
// ============================

const atualizarStatusOrdem = async (idOrdem, novoStatus, novoProcesso) => {
    const colunas = await all('PRAGMA table_info(os)');
    const nomesColunas = colunas.map((c) => c.name);

    const updates = [];
    const params = [];

    if (nomesColunas.includes('status')) {
        updates.push('status = ?');
        params.push(novoStatus);
    }
    if (nomesColunas.includes('processo')) {
        updates.push('processo = ?');
        params.push(novoProcesso);
    }

    if (updates.length === 0) {
        throw new Error('Colunas de status não encontradas na tabela os.');
    }

    const condicoesId = ['rowid = ?'];
    const paramsWhere = [idOrdem];

    if (nomesColunas.includes('idChamado')) {
        condicoesId.push('idChamado = ?');
        paramsWhere.push(idOrdem);
    }
    if (nomesColunas.includes('idOrdem')) {
        condicoesId.push('idOrdem = ?');
        paramsWhere.push(idOrdem);
    }
    if (nomesColunas.includes('id')) {
        condicoesId.push('id = ?');
        paramsWhere.push(idOrdem);
    }

    const sql = `UPDATE os SET ${updates.join(', ')} WHERE (${condicoesId.join(' OR ')})`;
    return run(sql, [...params, ...paramsWhere]);
};

// =================
//  LISTAR USUÁRIOS
// =================

const listarTodosUsuariosAdmin = async () => {
    const sqlUsuarios = `
        SELECT 
            l.idCliente AS id,
            COALESCE(u.nome, l.email) AS nome,
            u.cpf,
            u.dataNascimento,
            u.telefone,
            l.email AS email,
            u.cep,
            u.endereco,
            COALESCE(l.tipo, 'cliente') AS tipo,
            NULL AS cargo,
            NULL AS admissao
        FROM login l
        LEFT JOIN usuarios u ON l.idCliente = u.idCliente
        WHERE LOWER(COALESCE(l.tipo, 'cliente')) != 'profissional'
    `;

    const sqlTecnicos = `
        SELECT 
            idTecnico AS id,
            nome,
            cpf,
            dataNascimento,
            telefone,
            email,
            cep,
            NULL AS endereco,
            'profissional' AS tipo,
            cargo,
            admissao
        FROM tecnicos
    `;

    const [listaUsuarios, listaTecnicos] = await Promise.all([
        all(sqlUsuarios),
        all(sqlTecnicos)
    ]);

    return [...listaUsuarios, ...listaTecnicos];
};

// ==================
//   DETALHES DA OS
// ==================

const salvarDetalhesTecnicosOrdem = async (idOrdem, dados) => {
    const {
        diagnostico,
        servico_executado,
        data_finalizacao,
        maoObraNum,
        materialNum,
        processo,
        valorTotal,
        enviar_validacao
    } = dados;

    const colunasExtras = [
        'diagnostico TEXT',
        'servico_executado TEXT',
        'data_finalizacao TEXT',
        'data_abertura TEXT',
        'preco_mao_obra REAL',
        'preco_material REAL',
        'processo TEXT',
        'validacao_cliente TEXT',
        'valor REAL',
        'valorfinal REAL',
        'status TEXT'
    ];

    // Garante que as colunas existam (ignora erro caso a coluna já tenha sido criada)
    for (const colDef of colunasExtras) {
        try {
            await run(`ALTER TABLE os ADD COLUMN ${colDef}`);
        } catch (_) {
            // Coluna já existe
        }
    }

    const colunas = await all('PRAGMA table_info(os)');
    const nomes = colunas.map((c) => c.name);

    const condicoesId = ['rowid = ?'];
    const paramsWhere = [idOrdem];

    if (nomes.includes('idChamado')) { condicoesId.push('idChamado = ?'); paramsWhere.push(idOrdem); }
    if (nomes.includes('idOrdem')) { condicoesId.push('idOrdem = ?'); paramsWhere.push(idOrdem); }
    if (nomes.includes('id')) { condicoesId.push('id = ?'); paramsWhere.push(idOrdem); }

    const sets = [
        'diagnostico = ?',
        'servico_executado = ?',
        'data_finalizacao = ?',
        'preco_mao_obra = ?',
        'preco_material = ?',
        'processo = ?',
        'valor = ?',
        'valorfinal = ?'
    ];
    const params = [
        diagnostico || '',
        servico_executado || '',
        data_finalizacao || '',
        maoObraNum,
        materialNum,
        processo || 'Em análise',
        valorTotal,
        valorTotal
    ];

    if (enviar_validacao) {
        sets.push("validacao_cliente = 'pendente'");
        sets.push("status = 'analise'");
    }

    const sql = `UPDATE os SET ${sets.join(', ')} WHERE (${condicoesId.join(' OR ')})`;
    return run(sql, [...params, ...paramsWhere]);
};

// =========================
//   VALIDAÇÃO DO CLIENTE
// =========================

const registrarValidacaoClienteOrdem = async (idOrdem, { decisao, novoStatus, novoProcesso }) => {
    const colunas = await all('PRAGMA table_info(os)');
    const nomes = colunas.map((c) => c.name);

    const condicoesId = ['rowid = ?'];
    const paramsWhere = [idOrdem];

    if (nomes.includes('idChamado')) { condicoesId.push('idChamado = ?'); paramsWhere.push(idOrdem); }
    if (nomes.includes('idOrdem')) { condicoesId.push('idOrdem = ?'); paramsWhere.push(idOrdem); }
    if (nomes.includes('id')) { condicoesId.push('id = ?'); paramsWhere.push(idOrdem); }

    const sql = `
        UPDATE os 
        SET validacao_cliente = ?, status = ?, processo = ?
        WHERE (${condicoesId.join(' OR ')})
    `;

    return run(sql, [decisao, novoStatus, novoProcesso, ...paramsWhere]);
};

// ==========================
//  LISTAR ORDENS DO CLIENTE
// ==========================

const listarOrdensDoCliente = async ({ idCliente, email, nome }) => {
    const colunas = await all('PRAGMA table_info(os)');
    const nomesColunas = colunas.map((c) => c.name);

    const condicoes = [];
    const params = [];

    // Filtra pelo ID do cliente se a coluna existir
    if (idCliente !== null && idCliente !== undefined) {
        if (nomesColunas.includes('idCliente')) {
            condicoes.push('os.idCliente = ?');
            params.push(idCliente);
        }
        if (nomesColunas.includes('cliente_id')) {
            condicoes.push('os.cliente_id = ?');
            params.push(idCliente);
        }
        if (nomesColunas.includes('id_cliente')) {
            condicoes.push('os.id_cliente = ?');
            params.push(idCliente);
        }
    }

    // Verifica vínculo por e-mail caso alguma OS antiga tenha sido gravada assim
    if (email) {
        if (nomesColunas.includes('emailCliente')) {
            condicoes.push('LOWER(TRIM(os.emailCliente)) = ?');
            params.push(email);
        }
        if (nomesColunas.includes('clienteEmail')) {
            condicoes.push('LOWER(TRIM(os.clienteEmail)) = ?');
            params.push(email);
        }
        if (nomesColunas.includes('cliente')) {
            condicoes.push('LOWER(TRIM(os.cliente)) = ?');
            params.push(email);
        }
    }

    if (nome && nomesColunas.includes('clienteNome')) {
        condicoes.push('LOWER(TRIM(os.clienteNome)) = ?');
        params.push(nome);
    }

    // Se nenhuma coluna de identificação existir, não retorna ordens de terceiros
    if (condicoes.length === 0) {
        return [];
    }

    const colunaId = nomesColunas.includes('idChamado')
        ? 'os.idChamado'
        : (nomesColunas.includes('idOrdem') ? 'os.idOrdem' : 'os.rowid');

    const sql = `
        SELECT os.*,
                ${colunaId} AS id,
                t.nome AS nomeTecnicoTabela
        FROM os
        LEFT JOIN tecnicos t ON os.idTecnico = t.idTecnico
        WHERE (${condicoes.join(' OR ')})
        ORDER BY os.rowid DESC
    `;

    const linhas = await all(sql, params);

    return (linhas || []).map((os) => ({
        ...os,
        id: os.id || os.idChamado || os.idOrdem,
        tecnico: os.tecnico || os.nomeTecnicoTabela || 'Aguardando técnico'
    }));
};

// =================
//  ATUALIZAR SENHA
// =================

const atualizarSenha = (idCliente, novaSenha) =>
    run('UPDATE login SET senha = ? WHERE idCliente = ?', [novaSenha, idCliente]);

// =======================
//   BUSCAR SENHA POR ID
// =======================

const buscarSenhaPorId = (idCliente) =>
    get('SELECT senha FROM login WHERE idCliente = ?', [idCliente]);

// ======================
//  LISTAR ORDENS ADMIN
// ======================

const listarOrdensAdmin = () =>
    all(`
        SELECT 
            o.*,
            COALESCE(o.idChamado, o.rowid) AS id,
            t.nome AS tecnico,
            COALESCE(
                NULLIF(o.status, ''),
                CASE 
                    WHEN LOWER(o.processo) = 'em andamento' THEN 'andamento'
                    WHEN LOWER(o.processo) IN ('concluido', 'concluída', 'fechada') THEN 'fechada'
                    ELSE 'analise'
                END
            ) AS status
        FROM os o
        LEFT JOIN tecnicos t ON o.idTecnico = t.idTecnico
        ORDER BY COALESCE(o.idChamado, o.rowid) DESC
    `);

// ===============
//  INICIAR BANCO
// ===============

const inicializarBanco = async () => {
    const scriptPath = path.resolve(__dirname, '..', 'database', 'db.sql');

    if (!fs.existsSync(scriptPath)) {
        console.log('Aviso: arquivo db.sql não encontrado em:', scriptPath);
        return;
    }

    const sql = fs.readFileSync(scriptPath, 'utf8');
    await exec(sql);
    console.log('Banco de dados inicializado a partir do script.sql');
};

// ==========================
//  SINCRONIZAR ADIMISTRADOR
// ==========================

const sincronizarAdministrador = async (emailAdmin, senhaAdmin) => {
    if (!emailAdmin || !senhaAdmin) {
        console.log('Aviso: Variáveis emailAdm ou senhaAdm não configuradas no .env');
        return;
    }

    const usuario = await get('SELECT * FROM login WHERE email = ?', [emailAdmin]);

    if (!usuario) {
        await run("INSERT INTO login (email, senha, tipo) VALUES (?, ?, 'adm')", [emailAdmin, senhaAdmin]);
        console.log(`Administrador (${emailAdmin}) inserido com sucesso!`);
    } else {
        await run("UPDATE login SET senha = ?, tipo = 'adm' WHERE email = ?", [senhaAdmin, emailAdmin]);
        console.log(`Credenciais do administrador (${emailAdmin}) sincronizadas com o .env!`);
    }
};

// ==================
//  LISTAR TÉCNICOS
// ==================

const listarTecnicosAtivos = () =>
    all(`
        SELECT 
            COALESCE(idTecnico, rowid) AS idTecnico, 
            nome, 
            cargo 
        FROM tecnicos 
        WHERE demissao IS NULL OR TRIM(demissao) = '' 
        ORDER BY nome ASC
    `);

// ===============================
//    ATRIBUIR TÉCNICOS A ORDEM
// ===============================

const atribuirTecnicoOrdem = (idOrdem, idTecnico) =>
    run(
        `UPDATE os 
         SET idTecnico = ?,
             status = 'andamento',
             processo = 'Em andamento'
         WHERE idChamado = ? OR rowid = ?`,
        [idTecnico, idOrdem, idOrdem]
    );

// ==================
// ATUALIZAR PERFIL
// ==================

const atualizarPerfilUsuario = async (idCliente, { nome, cpf, email, foto }) => {
    await run('UPDATE login SET email = ? WHERE idCliente = ?', [email, idCliente]);

    const sqlUser = `
        INSERT INTO usuarios (idCliente, nome, cpf, email, foto) 
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(idCliente) DO UPDATE SET 
            nome = excluded.nome, 
            cpf = excluded.cpf, 
            email = excluded.email,
            foto = COALESCE(excluded.foto, usuarios.foto)
    `;

    await run(sqlUser, [idCliente, nome, cpf, email, foto || null]);
};

// ===========
// MIGRAÇÕES
// ===========

const executarMigracoes = async () => {
    // 1. Garante a coluna "email" na tabela "tecnicos"
    try {
        await run('ALTER TABLE tecnicos ADD COLUMN email TEXT');
    } catch (err) {
        if (!err.message.includes('duplicate column name')) {
            console.error('Erro ao criar coluna email na tabela tecnicos:', err.message);
        }
    }

    // 2. Vincula automaticamente profissionais antigos da tabela login com a tabela tecnicos
    const loginsProf = await all(
        "SELECT email FROM login WHERE LOWER(tipo) = 'profissional' ORDER BY idCliente ASC"
    );
    const listaTec = await all(
        'SELECT idTecnico, email FROM tecnicos ORDER BY idTecnico ASC'
    );

    for (let i = 0; i < listaTec.length; i++) {
        const tec = listaTec[i];
        if (!tec.email && loginsProf[i]) {
            await run('UPDATE tecnicos SET email = ? WHERE idTecnico = ?', [
                loginsProf[i].email,
                tec.idTecnico
            ]);
        }
    }

    // 3. Garante a coluna "modelo" na tabela "os"
    try {
        await run('ALTER TABLE os ADD COLUMN modelo TEXT');
    } catch (err) {
        if (!err.message.includes('duplicate column name')) {
            console.error('Erro ao criar coluna modelo na tabela os:', err.message);
        }
    }
};

module.exports = {
    db,
    // ...outras funções já exportadas
    inicializarBanco,
    executarMigracoes,
    sincronizarAdministrador
};

module.exports = {
    db,
    cadastrarUsuario,
    finalizarCadastroUsuario,
    buscarLoginPorEmail,
    criarOrdemServico,
    buscarPerfilProfissional,
    buscarPerfilUsuario,
    buscarSenhaPorId,
    atualizarSenha,
    removerFotoPerfil,
    criarLoginPorTipo,
    cadastrarTecnico,
    cadastrarDadosUsuario,
    listarTecnicos,
    listarOrdensComCliente,
    assumirOrdemServico,
    atualizarStatusOrdem,
    listarTodosUsuariosAdmin,
    salvarDetalhesTecnicosOrdem,
    registrarValidacaoClienteOrdem,
    listarOrdensDoCliente,
    listarOrdensAdmin,
    listarTecnicosAtivos,
    atribuirTecnicoOrdem,
    atualizarPerfilUsuario,
    inicializarBanco,
    executarMigracoes,
    sincronizarAdministrador
};