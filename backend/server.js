
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
app.get('/home-pro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pag-profissionais/home-p.html'));
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

// 1. BUSCAR DADOS DO PERFIL LOGADO
app.get('/api/perfil', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }
    const idCliente = req.session.usuario.id;

    const sql = `
    SELECT l.email, u.nome, u.cpf 
    FROM login l 
    LEFT JOIN usuarios u ON l.idCliente = u.idCliente 
    WHERE l.idCliente = ?
`;

    db.get(sql, [idCliente], (err, row) => {
        if (err) return res.status(500).json({ mensagem: 'Erro ao buscar perfil.' });
        res.json(row || {});
    });
});

// 2. ATUALIZAR DADOS E FOTO
app.put('/api/perfil', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }
    const idCliente = req.session.usuario.id;
    const { nome, cpf, email, foto } = req.body;

    db.serialize(() => {
        // Atualiza o email na tabela login
        db.run('UPDATE login SET email = ? WHERE idCliente = ?', [email, idCliente], (err) => {
            if (err) return res.status(500).json({ mensagem: 'E-mail já está em uso ou erro no servidor.' });

            // Atualiza ou insere os dados na tabela usuarios
            const sqlUser = `
                INSERT INTO usuarios (idCliente, nome, cpf, email, foto) 
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(idCliente) DO UPDATE SET 
                nome = excluded.nome, 
                cpf = excluded.cpf, 
                email = excluded.email,
                foto = COALESCE(excluded.foto, usuarios.foto)
            `;
            db.run(sqlUser, [idCliente, nome, cpf, email, foto || null], (errUser) => {
                if (errUser) return res.status(500).json({ mensagem: 'Erro ao atualizar dados.' });
                res.json({ mensagem: 'Perfil atualizado com sucesso!' });
            });
        });
    });
});

// 3. ALTERAR SENHA
app.put('/api/perfil/senha', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }
    const idCliente = req.session.usuario.id;
    const { senhaAtual, novaSenha } = req.body;

    db.get('SELECT senha FROM login WHERE idCliente = ?', [idCliente], (err, row) => {
        if (err || !row) return res.status(500).json({ mensagem: 'Erro no servidor.' });
        if (row.senha !== senhaAtual) return res.status(400).json({ mensagem: 'Senha atual incorreta.' });

        db.run('UPDATE login SET senha = ? WHERE idCliente = ?', [novaSenha, idCliente], (errUpdate) => {
            if (errUpdate) return res.status(500).json({ mensagem: 'Erro ao atualizar senha.' });
            res.json({ mensagem: 'Senha alterada com sucesso!' });
        });
    });
});

// 4. EXCLUIR CONTA
app.delete('/api/perfil', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }
    const idCliente = req.session.usuario.id;

    db.serialize(() => {
        db.run('DELETE FROM usuarios WHERE idCliente = ?', [idCliente]);
        db.run('DELETE FROM login WHERE idCliente = ?', [idCliente], (err) => {
            if (err) return res.status(500).json({ mensagem: 'Erro ao excluir conta.' });
            req.session.destroy();
            res.json({ mensagem: 'Conta excluída permanentemente.' });
        });
    });
});

// 5. SAIR DA SESSÃO (LOGOUT)
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ mensagem: 'Erro ao sair.' });
        res.clearCookie('connect.sid');
        res.json({ mensagem: 'Sessão encerrada.' });
    });
});

// =======================
//      APAGAR CONTA
// =======================

app.delete('/api/perfil', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }
    const idCliente = req.session.usuario.id;

    db.serialize(() => {
        // 1. Apaga os chamados/ordens de serviço desse cliente
        db.run('DELETE FROM os WHERE idCliente = ?', [idCliente]);
        
        // 2. Apaga os dados pessoais na tabela usuarios
        db.run('DELETE FROM usuarios WHERE idCliente = ?', [idCliente]);
        
        // 3. Apaga as credenciais de acesso na tabela login
        db.run('DELETE FROM login WHERE idCliente = ?', [idCliente], (err) => {
            if (err) {
                console.error('Erro ao excluir conta:', err.message);
                return res.status(500).json({ mensagem: 'Erro ao excluir conta do banco de dados.' });
            }

            conta
            
            // 4. Destrói a sessão e limpa o cookie do navegador
            req.session.destroy();
            res.clearCookie('connect.sid');
            res.json({ mensagem: 'Conta e todos os dados vinculados foram excluídos permanentemente.' });
        });
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

// ========================================
//             INICIALIZAÇÃO
// ========================================

iniBDD();

administrador();

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = db;
