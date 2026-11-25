
//=======================================
//   Server.js - BACK-END COMPLETO
//=======================================



const path = require('path');            // -->  ajuda a montar caminhos de pastas

// Importar o dotenv LOGO NO INÍCIO para garantir que o processo leia as variáveis de ambiente antes de tudo
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');      // --> biblioteca para criar o servidor

const fs = require('fs');

const db = require('../database/db.js');

const cors = require('cors');

const session = require('express-session');            // --> importa as variáveis

const PORT = process.env.PORT || 3000;   // --> Essa linha define a porta em que o servidor será executado, 
                                         // se não estiver definido, o programaa utilizará 3000

const app = express();                   // --> cria o servidor 

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.use(express.static(path.resolve(__dirname, '..', 'frontend'))); // --> Servir os dados para do frontend

app.use('/files', express.static(path.join(__dirname, '../../files'))); // Rastrear dados de imagem e svg

app.use(express.json());  // Faz o servidor entender JSON - Middleware 
                          // (Função que participa do processamento de requisições antes que elas 
                          // cheguem à rota responsàvel por responder)

//Essa parte do nosso código permite que o frontend como live-server
//envie cookies de autenticação
app.use(cors({
    origin: true, 
    credentials: true
}));

//Cria e gerencia a sessão (memória de login) do usuário no servidor
app.use(session({
    secret: 'sua_chave_secreta', // --> Chave para criptografar e proteger
    resave: false,               // --> Ecita salvar sessões sem alterações
    saveUninitialized: false,    // --> Não salva visitantes que ainda nao fizeram login
    cookie: { 
        secure: false,           // --> 'false' porque estamos usando localhost
        httpOnly: true           // --> Medida de segurança cotra roubo de sessão via JS
    }
}));


db.run("ALTER TABLE os ADD COLUMN data_abertura TEXT", () => {
    db.run("UPDATE os SET data_abertura = date('now', 'localtime') WHERE data_abertura IS NULL OR data_abertura = ''");
});

// ==================================
//       ROTAS DE PÁGINAS (GET)
// ==================================

// ================= PÁGINAS INICIAIS

    // ROTA PARA CONFIGURAR A TELA PRINCIPAL DO INDEX
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'pag-ini', 'index.html'));
});

    // ROTA PARA A PÁGINA DE CRIAR CONTA
    app.get('/criar-conta', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/pag-ini/criarConta.html'));
    });
    
    // ROTA PARA API - TELA DE FINALIZAÇÃO DE CADASTRO
    app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-cliente/cadastro-c.html'));
    });
    
// ======================= PÁGINAS CLIENTES

    // ROTA PARA HOME - CLIENTE
app.get('/home-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-cliente/home-c.html'));
});

// ROTA PARA PÁGINA DE PERFIL - CLIENTE 
app.get('/perfil-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-cliente/perfil-c.html'));
});

// ROTA PRA CONVERSA - CLIENTE
app.get('/conversa-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-cliente/conversa-c.html'));
});

// ROTA PARA CADASTRO DE OS - CLIENTE
app.get('/os-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-cliente/os-c.html'));
});

// ROTA PARA ORDENS - CLIENTE
app.get('/ordens-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-cliente/ordens-c.html'));

});

// ========================= PÁGINAS PROFISSIONAIS

    // ROTA PARA HOME - PROFISSIONAIS
app.get('/home-p', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-profissionais/home-p.html'));
});

// ROTA PARA ORDENS - PROFISSIONAIS
app.get('/ordens-p', (req, res) => {
res.sendFile(path.join(__dirname, '../frontend/pag-profissionais/ordens-p.html'));
});

// ROTA PARA CONVERSAS - PROFISSIONAIS
app.get('/conversas-p', (req, res) => {
res.sendFile(path.join(__dirname, '../frontend/pag-profissionais/conversa-p.html'));
});

// ROTA PARA CONVERSAS - PROFISSIONAIS
app.get('/perfil-p', (req, res) => {
res.sendFile(path.join(__dirname, '../frontend/pag-profissionais/perfil-p.html'));
});

// ROTA PARA USUARIOS - PROFISSIONAIS
app.get('/usuarios-p', (req, res) => {
res.sendFile(path.join(__dirname, '../frontend/pag-profissionais/usuarios-p.html'));
});

// ROTA PARA CADASTRO DE USUARIOS - PROFISSIONAIS
app.get('/cad-p', (req, res) => {
res.sendFile(path.join(__dirname, '../frontend/pag-profissionais/cad-p.html'));
});

// ============================== PÁGINAS ADM

// ROTA PARA HOME - ADM (DASHBOARD)
app.get('/home-adm', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-adm/home-adm.html'));
});

// ROTA PARA ORDENS - ADM
app.get('/ordens-adm', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-adm/ordens-adm.html'));
});

// ROTA PARA CONVERSAS - ADM
app.get('/conversas-adm', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-adm/conversas-adm.html'));
});

// ROTA PARA PERFIL - ADM
app.get('/perfil-adm', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-adm/perfil-adm.html'));
});

// ROTA PARA CADASTROS DE USUÁRIOS - ADM
app.get('/cad-adm', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-adm/cad-adm.html'));
});

// ROTA PARA PÁGINA DE USUÁRIOS - ADM
app.get('/usuarios-adm', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-adm/usuarios-adm.html'));
});

// ROTA PARA PÁGINA DE SOLICITAR OS - ADM
app.get('/os-adm', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-adm/os-adm.html'));
});


// =====================================
//           Cadastro (POST)
// =====================================

// Aqui ós usamos ele para que esas informações sejam colocadas no nosso banco de dados
app.post('/api/usuarios', (req, res) => {
    const { email, senha } = req.body; 
    
    // Inserção na tabela de logins
    const sql = "INSERT INTO login (email, senha, tipo) VALUES (?, ?, 'cliente')";
    
    db.run(sql, [email, senha], function(erro) {
        if (erro) {
            console.error('Erro interno no SQLite:', erro.message);
            return res.status(500).json({ mensagem: 'Erro interno no servidor ao salvar login' });
        }
        
        // 1. Pega o ID gerado automaticamente
        const novoIdCliente = this.lastID;

        req.session.usuario = {
            id: novoIdCliente,
            email: email,
            tipo: 'cliente'
        };

        // 3. Forçamos a gravação explícita da sessão antes de responder
        req.session.save((err) => {
            if (err) {
                console.error('Erro ao salvar sessão:', err);
                return res.status(500).json({ mensagem: 'Erro ao criar sessão após cadastro.' });
            }

            // 4. Retorna a resposta de sucesso com a sessão criada
            return res.status(201).json({ 
                mensagem: 'Login criado com sucesso!', 
                id: novoIdCliente 
            });
        });
    });
});

// =====================================
//         FINALIZAR CADASTRO 
// =====================================

app.put('/api/usuarios/finalizar-cadastro', (req, res) => {
    // 1. Verifica sessão
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    // Pega o ID que está salvo na sessão (veja como ele foi salvo no /api/login)
    const idCliente = req.session.usuario.id; 
    const { nome, dataNascimento, cpf, cep, endereco, telefone } = req.body;

    // 2. Insere na tabela 'usuarios' vinculando com o idCliente da tabela 'login'
    const sql = `
        INSERT OR REPLACE INTO usuarios 
        (idCliente, nome, dataNascimento, cpf, cep, endereco, telefone, cadastro_completo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.run(sql, [idCliente, nome, dataNascimento, cpf, cep, endereco, telefone], function(erro) {
        if (erro) {
            console.error('Erro fatal ao inserir na tabela usuarios:', erro.message);
            return res.status(500).json({ mensagem: 'Erro ao salvar informações no banco de dados.' });
        }

        return res.json({ mensagem: 'Cadastro finalizado com sucesso!' });
    });
});

// =====================================
//               LOGIN
// =====================================

app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    const sql = `SELECT * FROM login WHERE email = ?`;
    
    db.get(sql, [email], (err, usuarioDoBanco) => {
        if (err || !usuarioDoBanco) {
            return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
        }

        if (usuarioDoBanco.senha !== senha) {
            return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
        }

        // Salva a sessão com o tipo do usuário
        req.session.usuario = {
            id: usuarioDoBanco.idCliente || usuarioDoBanco.id,
            email: usuarioDoBanco.email,
            tipo: usuarioDoBanco.tipo || 'cliente'
        };

        req.session.save((err) => {
            if (err) {
                return res.status(500).json({ mensagem: 'Erro ao salvar sessão.' });
            }

            // IMPORTANTE: Devolva a propriedade 'tipo' no JSON!
            return res.json({ 
                mensagem: 'Login realizado com sucesso!',
                tipo: usuarioDoBanco.tipo || 'cliente'
            });
        });
    });
});
// ===================================
//      CADASTRO DE OS - CLIENTE
// ===================================

app.post('/api/ordens', (req, res) => {

    // 1. Recebe os dados do formulário do frontend
    const { equipamento, marca, perifericos, descricao } = req.body;

    // 2. Pega o ID do cliente que está logado na sessão atual
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    const idCliente = req.session.usuario.id;

    // 3. Pega a data e hora do momento da criação
    const dataAtual = new Date();
    const abertura = dataAtual.toLocaleDateString('pt-BR');
    const hora = dataAtual.toLocaleTimeString('pt-BR');

    // 4. Insere na sua tabela 'os'
    // O 'processo' inicia como 'Pendente' e o 'idTecnico' fica vazio (NULL)
    const sql = `
        INSERT INTO os (
            abertura, hora, equipamento, marca, perifericos, descricao, processo, idCliente
        ) VALUES (?, ?, ?, ?, ?, ?, 'Pendente', ?)
    `;
    
    db.run(sql, [abertura, hora, equipamento, marca, perifericos, descricao, idCliente], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao abrir chamado no banco de dados.' });
        }
        
        return res.status(201).json({ 
            message: 'Ordem de serviço aberta com sucesso!',
            idChamado: this.lastID // Retorna o idChamado gerado[cite: 13]
        });
    });
});

// ============================================
//     BUSCAR OS DADOS DO CLIENTE LOGADO
// ============================================

app.get('/api/perfil', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado. Faça login novamente.' });
    }

    const usuarioSessao = req.session.usuario;
    const emailLogado = usuarioSessao.email;
    const tipoLogado = (usuarioSessao.tipo || '').toLowerCase();

    // 1. Se for PROFISSIONAL, busca os dados na tabela "tecnicos" pelo e-mail
    if (tipoLogado === 'profissional') {
        const sqlTecnico = `
            SELECT 
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
            LIMIT 1
        `;

        return db.get(sqlTecnico, [emailLogado], (erro, tecnico) => {
            if (erro) {
                console.error('Erro ao buscar perfil do profissional:', erro.message);
                return res.status(500).json({ mensagem: 'Erro ao carregar perfil do profissional.' });
            }

            if (!tecnico) {
                return res.json({
                    nome: emailLogado.split('@')[0],
                    email: emailLogado,
                    tipo: 'profissional'
                });
            }

            return res.json(tecnico);
        });
    }

    // 2. Se for CLIENTE ou ADM, busca na tabela "usuarios"
    const idCliente = usuarioSessao.idCliente || usuarioSessao.id;
    const sqlUsuario = `
        SELECT 
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
        WHERE l.idCliente = ?
    `;

    db.get(sqlUsuario, [idCliente], (erro, usuario) => {
        if (erro) {
            console.error('Erro ao buscar perfil do usuário:', erro.message);
            return res.status(500).json({ mensagem: 'Erro ao carregar perfil.' });
        }

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Perfil não encontrado.' });
        }

        return res.json(usuario);
    });
});

// =============================
//         ALTERAR SENHA
// =============================

// 4. ALTERAR SENHA
app.put('/api/perfil/senha', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const idCliente = req.session.usuario.idCliente || req.session.usuario.id;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ mensagem: 'Preencha a senha atual e a nova senha.' });
    }

    // Busca a senha atual salva no banco
    db.get('SELECT senha FROM login WHERE idCliente = ?', [idCliente], async (err, row) => {
        if (err || !row) {
            return res.status(500).json({ mensagem: 'Erro ao verificar usuário.' });
        }

        // Verifica se a senha atual confere (suporta hash bcrypt ou texto simples)
        let senhaValida = false;
        if (row.senha.startsWith('$2b$') || row.senha.startsWith('$2a$')) {
            const bcrypt = require('bcrypt');
            senhaValida = await bcrypt.compare(senhaAtual, row.senha);
        } else {
            senhaValida = (senhaAtual === row.senha);
        }

        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'A senha atual está incorreta.' });
        }

        // Criptografa a nova senha se o projeto usa bcrypt, senão salva direto
        let senhaParaSalvar = novaSenha;
        try {
            const bcrypt = require('bcrypt');
            if (row.senha.startsWith('$2b$') || row.senha.startsWith('$2a$')) {
                senhaParaSalvar = await bcrypt.hash(novaSenha, 10);
            }
        } catch (e) {
            // Segue sem bcrypt caso não esteja instalado
        }

        db.run('UPDATE login SET senha = ? WHERE idCliente = ?', [senhaParaSalvar, idCliente], (errUpdate) => {
            if (errUpdate) {
                return res.status(500).json({ mensagem: 'Erro ao atualizar a senha.' });
            }
            res.json({ mensagem: 'Senha alterada com sucesso!' });
        });
    });
});

// ============================
//    REMOVER FOTO DE PERIL
// ============================

app.delete('/api/perfil/foto', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }

    const idCliente = req.session.usuario.idCliente || req.session.usuario.id;

    db.run('UPDATE usuarios SET foto = NULL WHERE idCliente = ?', [idCliente], (err) => {
        if (err) {
            console.error('Erro ao remover foto:', err.message);
            return res.status(500).json({ mensagem: 'Erro ao remover a foto de perfil.' });
        }
        res.json({ mensagem: 'Foto removida com sucesso!' });
    });
});

// =========================
//      ADM CADASTRAR
// =========================

app.post('/api/usuarios/admin', (req, res) => {
    const {
        tipo,
        nome,
        cpf,
        nascimento,
        telefone,
        email,
        senha,
        cep,
        endereco,
        funcao,
        especialidades
    } = req.body;

    if (!tipo || !nome || !cpf || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' });
    }

    if (tipo === 'profissional' && !funcao) {
        return res.status(400).json({ mensagem: 'Selecione a função do profissional.' });
    }

    const sqlLogin = 'INSERT INTO login (email, senha, tipo) VALUES (?, ?, ?)';

    db.run(sqlLogin, [email, senha, tipo], function (erroLogin) {
        if (erroLogin) {
            console.error('Erro ao inserir na tabela login:', erroLogin.message);

            if (erroLogin.message.includes('UNIQUE')) {
                return res.status(400).json({ mensagem: 'Este e-mail já está cadastrado no sistema.' });
            }

            return res.status(500).json({ mensagem: 'Erro ao criar login no banco de dados.' });
        }

        const idGerado = this.lastID;

        // 2A. Se for PROFISSIONAL, grava apenas na tabela "tecnicos"
        if (tipo === 'profissional') {
            const cargoCompleto = especialidades ? `${funcao} (${especialidades})` : funcao;
            const dataHoje = new Date().toISOString().split('T')[0];

            const sqlTecnico = `
                INSERT INTO tecnicos (nome, cpf, dataNascimento, telefone, email, cep, admissao, cargo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            return db.run(
                sqlTecnico,
                [nome, cpf, nascimento, telefone, email, cep, dataHoje, cargoCompleto],
                function (erroTecnico) {
                    if (erroTecnico) {
                        console.error('Erro ao inserir na tabela tecnicos:', erroTecnico.message);
                        return res.status(500).json({ mensagem: 'Login criado, mas houve erro ao salvar dados do técnico.' });
                    }

                    return res.status(201).json({
                        mensagem: 'Profissional cadastrado com sucesso!',
                        idLogin: idGerado,
                        idTecnico: this.lastID
                    });
                }
            );
        }

        // 2B. Se for CLIENTE ou ADM, grava apenas na tabela "usuarios"
        const sqlUsuario = `
            INSERT INTO usuarios (idCliente, nome, cpf, dataNascimento, telefone, email, cep, endereco, cadastro_completo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `;

        return db.run(
            sqlUsuario,
            [idGerado, nome, cpf, nascimento, telefone, email, cep, endereco],
            function (erroUsuario) {
                if (erroUsuario) {
                    console.error('Erro ao inserir na tabela usuarios:', erroUsuario.message);
                    return res.status(500).json({ mensagem: 'Login criado, mas houve erro ao salvar dados do usuário.' });
                }

                return res.status(201).json({
                    mensagem: 'Usuário cadastrado com sucesso!',
                    idCliente: idGerado
                });
            }
        );
    });
});

// ==================================
//    BUSCAR ORDENS DO PROFISSIONAL 
// ==================================
app.get('/api/ordens/profissional', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const emailLogado = (req.session.usuario.email || '').trim().toLowerCase();
    const idLoginLogado = req.session.usuario.idCliente || req.session.usuario.id;

    db.all('SELECT * FROM tecnicos', [], (errTec, listaTecnicos) => {
        if (errTec) {
            console.error('Erro SQL ao ler tecnicos:', errTec.message);
            return res.status(500).json({ mensagem: 'Erro ao identificar profissional no banco.' });
        }

        const tecnico = (listaTecnicos || []).find(
            (t) =>
                (t.email && t.email.trim().toLowerCase() === emailLogado) ||
                Number(t.idTecnico) === Number(idLoginLogado)
        );

        const idTecnico = tecnico ? Number(tecnico.idTecnico) : -1;
        const nomeTecnico = tecnico ? (tecnico.nome || '').trim().toLowerCase() : '';

        const sqlOrdens = `
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
        `;

        db.all(sqlOrdens, [], (errOs, todasOrdens) => {
            if (errOs) {
                console.error('Erro SQL ao buscar ordens:', errOs.message);
                return res.status(500).json({ mensagem: 'Erro ao carregar ordens: ' + errOs.message });
            }

            const normalizadas = (todasOrdens || []).map((os) => {
                const rawStatus = (os.status || os.processo || '').toLowerCase().trim();
                let statusFinal = 'aberta';
                if (rawStatus.includes('andamento')) statusFinal = 'andamento';
                else if (rawStatus.includes('fechada') || rawStatus.includes('conclu')) statusFinal = 'fechada';
                else if (rawStatus.includes('congelada') || rawStatus.includes('pausada')) statusFinal = 'congelada';
                else if (rawStatus.includes('analise') || rawStatus.includes('análise')) statusFinal = 'analise';
                else if (rawStatus) statusFinal = rawStatus;

                return {
                    ...os,
                    id: os.idChamado || os.idOrdem || os.id || os.rowid_os,
                    status: statusFinal
                };
            });

            const atribuidas = normalizadas.filter((os) => {
                const osIdTec = Number(os.idTecnico || 0);
                const osNomeTec = (os.tecnico || '').trim().toLowerCase();
                return (idTecnico > 0 && osIdTec === idTecnico) ||
                       (nomeTecnico && osNomeTec === nomeTecnico);
            });

            const disponiveis = normalizadas.filter((os) => {
                const osIdTec = Number(os.idTecnico || 0);
                const osNomeTec = (os.tecnico || '').trim().toLowerCase();
                const semId = osIdTec === 0;
                const semNome = !osNomeTec || osNomeTec === 'aguardando técnico' || osNomeTec === 'sem técnico';
                return semId && semNome;
            });

            return res.json({ atribuidas, disponiveis });
        });
    });
});

// ===========================
//   PROFISIONAL ATRIBUIR-SE
// ===========================

app.put('/api/ordens/:id/assumir', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const idOrdem = req.params.id;
    const emailProfissional = (req.session.usuario.email || '').trim().toLowerCase();
    const idLoginLogado = req.session.usuario.idCliente || req.session.usuario.id;

    db.all('SELECT * FROM tecnicos', [], (errTec, listaTecnicos) => {
        if (errTec) {
            console.error('Erro ao buscar técnicos:', errTec.message);
            return res.status(500).json({ mensagem: 'Erro interno ao identificar profissional.' });
        }

        const tecnico = (listaTecnicos || []).find(
            (t) =>
                (t.email && t.email.trim().toLowerCase() === emailProfissional) ||
                Number(t.idTecnico) === Number(idLoginLogado)
        );

        if (!tecnico) {
            return res.status(404).json({ mensagem: 'Perfil técnico não encontrado no banco.' });
        }

        // Descobre dinamicamente as colunas da tabela "os" para evitar erro de coluna inexistente
        db.all('PRAGMA table_info(os)', [], (errCols, colunas) => {
            if (errCols) {
                return res.status(500).json({ mensagem: 'Erro ao verificar estrutura da tabela os.' });
            }

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
                return res.status(500).json({ mensagem: 'Colunas de atribuição não encontradas na tabela os.' });
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

            db.run(sql, [...params, ...paramsWhere], function (erroUpdate) {
                if (erroUpdate) {
                    console.error('Erro ao assumir ordem:', erroUpdate.message);
                    return res.status(500).json({ mensagem: 'Erro ao atualizar a ordem no banco.' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
                }

                return res.json({ mensagem: 'Ordem assumida com sucesso!' });
            });
        });
    });
});

// ==================
//    FINALZIAR OS
// ==================

app.put('/api/ordens/:id/status', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const idOrdem = req.params.id;
    const novoStatus = (req.body.status || '').toLowerCase().trim();

    const mapaProcesso = {
        aberta: 'Aberta',
        analise: 'Em análise',
        andamento: 'Em andamento',
        congelada: 'Congelada',
        fechada: 'Concluída',
        cancelada: 'Cancelada'
    };

    if (!mapaProcesso[novoStatus]) {
        return res.status(400).json({ mensagem: 'Status inválido.' });
    }

    db.all('PRAGMA table_info(os)', [], (errCols, colunas) => {
        if (errCols) {
            return res.status(500).json({ mensagem: 'Erro ao verificar estrutura da tabela os.' });
        }

        const nomesColunas = colunas.map((c) => c.name);
        const updates = [];
        const params = [];

        if (nomesColunas.includes('status')) {
            updates.push('status = ?');
            params.push(novoStatus);
        }
        if (nomesColunas.includes('processo')) {
            updates.push('processo = ?');
            params.push(mapaProcesso[novoStatus]);
        }

        if (updates.length === 0) {
            return res.status(500).json({ mensagem: 'Colunas de status não encontradas na tabela os.' });
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

        db.run(sql, [...params, ...paramsWhere], function (erroUpdate) {
            if (erroUpdate) {
                console.error('Erro ao atualizar status da OS:', erroUpdate.message);
                return res.status(500).json({ mensagem: 'Erro ao atualizar status no banco.' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
            }

            return res.json({ mensagem: 'Status atualizado com sucesso!' });
        });
    });
});

// =============================
//      MOSTRAR USUÁRIOS
// =============================

app.get('/api/usuarios/admin', (req, res) => {
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

    db.all(sqlUsuarios, [], (errUsuarios, listaUsuarios) => {
        if (errUsuarios) {
            console.error('Erro ao buscar usuários:', errUsuarios);
            return res.status(500).json({ mensagem: 'Erro ao buscar usuários no banco.' });
        }

        db.all(sqlTecnicos, [], (errTecnicos, listaTecnicos) => {
            if (errTecnicos) {
                console.error('Erro ao buscar técnicos:', errTecnicos);
                return res.status(500).json({ mensagem: 'Erro ao buscar profissionais no banco.' });
            }

            return res.json([...listaUsuarios, ...listaTecnicos]);
        });
    });
});
    

// =========================================================
// SALVAR DIAGNÓSTICO, VALORES E ENVIAR PARA VALIDAÇÃO DO CLIENTE
// =========================================================
app.put('/api/ordens/:id/tecnico-detalhes', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const idOrdem = req.params.id;
    const {
        diagnostico,
        servico_executado,
        data_finalizacao,
        preco_mao_obra,
        preco_material,
        processo,
        enviar_validacao
    } = req.body;

    const taxaAnalise = 60.00;
    const maoObraNum = parseFloat(preco_mao_obra) || 0;
    const materialNum = parseFloat(preco_material) || 0;
    const valorTotal = taxaAnalise + maoObraNum + materialNum;

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

    db.serialize(() => {
        colunasExtras.forEach((colDef) => {
            db.run(`ALTER TABLE os ADD COLUMN ${colDef}`, () => {});
        });

        db.all('PRAGMA table_info(os)', [], (errCols, colunas) => {
            if (errCols) {
                console.error('Erro PRAGMA os:', errCols.message);
                return res.status(500).json({ mensagem: 'Erro ao ler estrutura da tabela os.' });
            }

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

            db.run(sql, [...params, ...paramsWhere], function (errUp) {
                if (errUp) {
                    console.error('Erro ao salvar dados técnicos da OS:', errUp.message);
                    return res.status(500).json({ mensagem: 'Erro SQL: ' + errUp.message });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
                }
                console.log(`[OS# ${idOrdem}] Dados técnicos salvos com sucesso! Total: R$ ${valorTotal.toFixed(2)}`);
                return res.json({
                    mensagem: enviar_validacao
                        ? 'Dados salvos e enviados para validação do cliente!'
                        : 'Dados técnicos salvos com sucesso!'
                });
            });
        });
    });
});

// =========================================================
// RESPOSTA DO CLIENTE À VALIDAÇÃO DO ORÇAMENTO / SERVIÇO
// =========================================================
app.put('/api/ordens/:id/validacao-cliente', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const idOrdem = req.params.id;
    const decisao = (req.body.decisao || '').toLowerCase().trim(); // 'aprovado' ou 'recusado'

    if (!['aprovado', 'recusado'].includes(decisao)) {
        return res.status(400).json({ mensagem: 'Decisão inválida.' });
    }

    const novoStatus = decisao === 'aprovado' ? 'andamento' : 'cancelada';
    const novoProcesso = decisao === 'aprovado' ? 'Aprovado pelo cliente - Em andamento' : 'Recusado pelo cliente';

    db.all('PRAGMA table_info(os)', [], (errCols, colunas) => {
        if (errCols) return res.status(500).json({ mensagem: 'Erro ao verificar tabela os.' });

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

        db.run(sql, [decisao, novoStatus, novoProcesso, ...paramsWhere], function (errUp) {
            if (errUp) {
                console.error('Erro na validação do cliente:', errUp.message);
                return res.status(500).json({ mensagem: 'Erro ao registrar validação.' });
            }
            return res.json({
                mensagem: decisao === 'aprovado'
                    ? 'Orçamento aprovado! O técnico foi liberado para executar o serviço.'
                    : 'Orçamento recusado e ordem encerrada.'
            });
        });
    });
});

// =========================================================
// LISTAR APENAS AS ORDENS DE SERVIÇO DO CLIENTE LOGADO
// =========================================================
app.get('/api/ordens/cliente', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const usuario = req.session.usuario;
    const idClienteSessao = usuario.idCliente || usuario.id || null;
    const emailSessao = (usuario.email || '').trim().toLowerCase();
    const nomeSessao = (usuario.nome || '').trim().toLowerCase();

    db.all('PRAGMA table_info(os)', [], (errCols, colunas) => {
        if (errCols) {
            console.error('Erro ao ler estrutura da tabela os:', errCols.message);
            return res.status(500).json({ mensagem: 'Erro ao consultar estrutura de ordens.' });
        }

        const nomesColunas = colunas.map((c) => c.name);
        const condicoes = [];
        const params = [];

        // Filtra pelo ID do cliente se a coluna existir
        if (idClienteSessao !== null) {
            if (nomesColunas.includes('idCliente')) {
                condicoes.push('os.idCliente = ?');
                params.push(idClienteSessao);
            }
            if (nomesColunas.includes('cliente_id')) {
                condicoes.push('os.cliente_id = ?');
                params.push(idClienteSessao);
            }
            if (nomesColunas.includes('id_cliente')) {
                condicoes.push('os.id_cliente = ?');
                params.push(idClienteSessao);
            }
        }

        // Também verifica vínculo por e-mail ou nome do cliente caso alguma OS antiga tenha sido gravada assim
        if (emailSessao) {
            if (nomesColunas.includes('emailCliente')) {
                condicoes.push('LOWER(TRIM(os.emailCliente)) = ?');
                params.push(emailSessao);
            }
            if (nomesColunas.includes('clienteEmail')) {
                condicoes.push('LOWER(TRIM(os.clienteEmail)) = ?');
                params.push(emailSessao);
            }
            if (nomesColunas.includes('cliente')) {
                condicoes.push('LOWER(TRIM(os.cliente)) = ?');
                params.push(emailSessao);
            }
        }

        if (nomeSessao && nomesColunas.includes('clienteNome')) {
            condicoes.push('LOWER(TRIM(os.clienteNome)) = ?');
            params.push(nomeSessao);
        }

        // Se nenhuma coluna de identificação existir, não retorna ordens de terceiros
        if (condicoes.length === 0) {
            return res.json([]);
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

        db.all(sql, params, (err, linhas) => {
            if (err) {
                console.error('Erro SQL ao buscar ordens do cliente:', err.message);
                return res.status(500).json({ mensagem: 'Erro ao carregar suas ordens de serviço.' });
            }

            const resultado = (linhas || []).map((os) => ({
                ...os,
                id: os.id || os.idChamado || os.idOrdem,
                tecnico: os.tecnico || os.nomeTecnicoTabela || 'Aguardando técnico'
            }));

            return res.json(resultado);
        });
    });
});     

// ==================
//     DASHBORD
// ==================

app.get('/api/ordens/admin', (req, res) => {
    const sql = `
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
    `;

    db.all(sql, [], (erro, ordens) => {
        if (erro) {
            console.error('Erro no banco de dados (Admin):', erro);
            return res.status(500).json({ mensagem: 'Erro ao buscar ordens no banco.' });
        }
        res.json(ordens);
    });
});


// ======================================================
//      FUNÇÃO PARA CRIAR A SENHA DE ADMINISTRADOR
// ======================================================

function administrador() {
    const emailAdmin = process.env.emailAdm;
    const senhaAdmin = process.env.senhaAdm;

    if (!emailAdmin || !senhaAdmin) {
        console.log('Aviso: Variáveis emailAdm ou senhaAdm não configuradas no .env');
        return;
    }

    const buscarSql = 'SELECT * FROM login WHERE email = ?';
    
    db.get(buscarSql, [emailAdmin], (erro, usuario) => {
        if (erro) {
            console.error('Erro ao verificar admin:', erro.message);
            return;
        }

        if (!usuario) {
            // Inserção caso não exista
            const inserirSql = "INSERT INTO login (email, senha, tipo) VALUES (?, ?, 'adm')";
            db.run(inserirSql, [emailAdmin, senhaAdmin], (err) => {
                if (err) console.error('Erro ao inserir admin:', err.message);
                else console.log(`Administrador (${emailAdmin}) inserido com sucesso!`);
            });
        } else {
            // FORÇA A ATUALIZAÇÃO DA SENHA E DO TIPO 'adm' CASO JÁ EXISTA
            const atualizarSql = "UPDATE login SET senha = ?, tipo = 'adm' WHERE email = ?";
            db.run(atualizarSql, [senhaAdmin, emailAdmin], (err) => {
                if (err) console.error('Erro ao atualizar admin:', err.message);
                else console.log(`Credenciais do administrador (${emailAdmin}) sincronizadas com o .env!`);
            });
        }
    });
}

// Função para rodar o script do BDD de login
function iniBDD() {
    const scriptPath = path.resolve(__dirname, '..', 'database', 'script.sql');
    try {
        if (fs.existsSync(scriptPath)) {
            const sql = fs.readFileSync(scriptPath, 'utf8');
            db.exec(sql); 
            console.log('Banco de dados inicializado a partir do script.sql');
        }
    } catch (error) {
        console.error('ERRO ao rodar o script de inicialização do banco de dados:', error.message);
    }
}

//=============================================
//    ADM ADICIONAR TÉCNICOS PARA AS ORDENS
//=============================================

// 1. Lista os técnicos cadastrados para preencher o <select> do modal
app.get('/api/tecnicos', (req, res) => {
    const sql = `
        SELECT 
            COALESCE(idTecnico, rowid) AS idTecnico, 
            nome, 
            cargo 
        FROM tecnicos 
        WHERE demissao IS NULL OR TRIM(demissao) = '' 
        ORDER BY nome ASC
    `;

    db.all(sql, [], (erro, linhas) => {
        if (erro) {
            console.error('Erro ao buscar técnicos:', erro);
            return res.status(500).json({ mensagem: 'Erro ao carregar lista de técnicos.' });
        }

        console.log(`[GET /api/tecnicos] Técnicos encontrados: ${linhas.length}`);
        res.json(linhas);
    });
});

// 2. Atribui o técnico à OS e coloca em andamento
app.put('/api/ordens/:id/atribuir', (req, res) => {
    const { id } = req.params;
    const { idTecnico } = req.body;

    if (!idTecnico) {
        return res.status(400).json({ mensagem: 'Selecione um técnico válido.' });
    }

    const sql = `
        UPDATE os 
        SET idTecnico = ?,
            status = 'andamento',
            processo = 'Em andamento'
        WHERE idChamado = ? OR rowid = ?
    `;

    db.run(sql, [idTecnico, id, id], function (erro) {
        if (erro) {
            console.error('Erro ao atribuir técnico à OS:', erro);
            return res.status(500).json({ mensagem: 'Erro ao salvar atribuição no banco de dados.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
        }

        res.json({ mensagem: 'Técnico atribuído e ordem colocada em andamento!' });
    });
});

//=============================================
//    ADM ADICIONAR TÉCNICOS PARA AS ORDENS
//=============================================

app.put('/api/ordens/:id/atribuir', (req, res) => {
    const { id } = req.params;
    const { idTecnico } = req.body;

    if (!idTecnico) {
        return res.status(400).json({ mensagem: 'Selecione um técnico válido.' });
    }

    const sql = `
        UPDATE os 
        SET idTecnico = ?,
            status = 'andamento',
            processo = 'Em andamento'
        WHERE idChamado = ? OR rowid = ?
    `;

    db.run(sql, [idTecnico, id, id], function (erro) {
        if (erro) {
            console.error('Erro ao atribuir técnico à OS:', erro);
            return res.status(500).json({ mensagem: 'Erro ao salvar atribuição no banco de dados.' });
        }

        console.log(`[PUT /api/ordens/${id}/atribuir] Linhas alteradas: ${this.changes} | idTecnico: ${idTecnico}`);

        if (this.changes === 0) {
            return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
        }

        res.json({ mensagem: 'Técnico atribuído e ordem colocada em andamento!' });
    });
});

// Rota para o profissional ver apenas as ordens atribuídas a ele
app.get('/api/ordens/profissional', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const emailLogado = req.session.usuario.email;
    const idLoginLogado = req.session.usuario.idCliente || req.session.usuario.id;

    db.run("ALTER TABLE tecnicos ADD COLUMN email TEXT", () => {
        const sqlBuscaTecnico = `
            SELECT idTecnico FROM tecnicos 
            WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) OR idTecnico = ?
            ORDER BY CASE WHEN LOWER(TRIM(email)) = LOWER(TRIM(?)) THEN 0 ELSE 1 END
            LIMIT 1
        `;

        db.get(sqlBuscaTecnico, [emailLogado, idLoginLogado, emailLogado], (errTec, tecnico) => {
            if (errTec) {
                console.error('Erro SQL ao identificar técnico:', errTec.message);
                return res.status(500).json({ mensagem: 'Erro ao identificar profissional no banco.' });
            }

            if (!tecnico) {
                return res.json([]);
            }

            const sqlOrdens = `
                SELECT 
                    o.*,
                    COALESCE(o.idChamado, o.rowid) AS id,
                    COALESCE(u.nome, l.email, 'Cliente não identificado') AS clienteNome,
                    u.telefone AS clienteTelefone,
                    u.endereco AS clienteEndereco,
                    COALESCE(
                        NULLIF(o.status, ''),
                        CASE 
                            WHEN LOWER(o.processo) = 'em andamento' THEN 'andamento'
                            WHEN LOWER(o.processo) IN ('concluido', 'concluída', 'fechada') THEN 'fechada'
                            ELSE 'andamento'
                        END
                    ) AS status
                FROM os o
                LEFT JOIN usuarios u ON o.idCliente = u.idCliente
                LEFT JOIN login l ON o.idCliente = l.idCliente
                WHERE o.idTecnico = ?
                ORDER BY COALESCE(o.idChamado, o.rowid) DESC
            `;

            db.all(sqlOrdens, [tecnico.idTecnico], (errOs, ordens) => {
                if (errOs) {
                    console.error('Erro SQL ao buscar ordens do técnico:', errOs.message);
                    return res.status(500).json({ mensagem: 'Erro ao carregar ordens de serviço.' });
                }

                res.json(ordens || []);
            });
        });
    });
});
//=====================================
//    MANTER EMAIL DA SESSÃO ATIVO
//=====================================

// 2. ATUALIZAR DADOS E FOTO DE PERFIL
app.put('/api/perfil', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }
    
    // Tenta pegar o ID de todas as formas possíveis
    const idCliente = req.session.usuario.idCliente || req.session.usuario.id;
    const { nome, cpf, email, foto } = req.body;

    db.serialize(() => {
        // Atualiza o e-mail na tabela de login
        db.run('UPDATE login SET email = ? WHERE idCliente = ?', [email, idCliente], (err) => {
            if (err) return res.status(400).json({ mensagem: 'Este e-mail já está em uso por outra conta.' });

            // AQUI ESTÁ A VARIÁVEL sqlUser QUE FALTAVA
            const sqlUser = `
                INSERT INTO usuarios (idCliente, nome, cpf, email, foto) 
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(idCliente) DO UPDATE SET 
                    nome = excluded.nome, 
                    cpf = excluded.cpf, 
                    email = excluded.email,
                    foto = COALESCE(excluded.foto, usuarios.foto)
            `;

            // Agora o db.run já sabe o que é o sqlUser
            db.run(sqlUser, [idCliente, nome, cpf, email, foto || null], (errUser) => {
                if (errUser) return res.status(500).json({ mensagem: 'Erro ao atualizar perfil.' });
                
                // Mantém o e-mail atualizado na sessão ativa
                req.session.usuario.email = email;
                
                res.json({ mensagem: 'Perfil atualizado com sucesso!' });
            });
        });
    });
});

// ========================================
//             INICIALIZAÇÃO
// ========================================

iniBDD();

db.serialize(() => {
    db.run("ALTER TABLE tecnicos ADD COLUMN email TEXT", () => {
        // Vincula automaticamente profissionais antigos da tabela login com a tabela tecnicos
        db.all("SELECT email FROM login WHERE LOWER(tipo) = 'profissional' ORDER BY idCliente ASC", [], (errL, loginsProf) => {
            db.all("SELECT idTecnico, email FROM tecnicos ORDER BY idTecnico ASC", [], (errT, listaTec) => {
                if (!errL && !errT && loginsProf && listaTec) {
                    listaTec.forEach((tec, index) => {
                        if (!tec.email && loginsProf[index]) {
                            db.run("UPDATE tecnicos SET email = ? WHERE idTecnico = ?", [loginsProf[index].email, tec.idTecnico]);
                        }
                    });
                }
            });
        });
    });
});

administrador();

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Garante que a coluna "modelo" exista na tabela "os" sem apagar dados existentes
db.run("ALTER TABLE os ADD COLUMN modelo TEXT", (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        console.error('Erro ao criar coluna modelo na tabela os:', err.message);
    }
});

module.exports = db;
