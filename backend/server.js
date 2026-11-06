
// ==========================================================
//                        IMPORTANTE:
// A competência de DELETE será entregue na próxima sprint
// ==========================================================

//=======================================
//   Server.js - BACK-END COMPLETO
//=======================================


const path = require('path');                   // ajuda a montar caminhos de pastas

// Importar o dotenv LOGO NO INÍCIO para garantir que o processo leia as variáveis de ambiente antes de tudo
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');             // biblioteca para criar o servidor

const fs = require('fs');

const db = require('../database/db.js');

const cors = require('cors');

const session = require('express-session');

// No topo absoluto do seu server.js
require('dotenv').config();

// PARTE 2: Criar o Servidor e abrir o banco
const PORT = process.env.PORT || 3000;          // Essa linha define a porta em que o servidor será executado, 
// se não estiver definido, o progra,a utilizará 3000

const app = express();                          // cria o servidor 

// Servir os dados para do frontend
app.use(express.static(path.resolve(__dirname, '..', 'frontend')));

// Rastrear dados de imagem e svg
app.use('/files', express.static(path.join(__dirname, '../../files')));

app.use(express.json());  // Faz o servidor entender JSON - Middleware 
// (Função que participa do processamento de requisições antes que elas 
// cheguem à rota responsàvel por responder)

app.use(cors({
    origin: true, 
    credentials: true
}));

// 2. Configuração da sessão
app.use(session({
    secret: 'sua_chave_secreta',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true
    }
}));


// ==================================
//       ROTAS DE PÁGINAS (GET)
// ==================================

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

    // ROTA PARA HOME - PROFISSIONAIS
app.get('/home-pro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/profissionais/home.html'));
});

    // ROTA PARA HOME - ADM
app.get('/home-adm', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/adm/home-adm.html'));
});

    // ROTA PARA API - TELA DE FINALIZAÇÃO DE CADASTRO
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cliente/cadastro.html'));
});

// ROTA PARA PÁGINA DE PERFIL - CLIENTE 
app.get('/perfil-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cliente/perfil.html'));
});

// ROTA PRA CONVERSA - CLIENTE
app.get('/conversa-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cliente/conversa.html'));
});

// ROTA PARA CADASTRO DE OS - CLIENTE
app.get('/os-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cliente/os-c.html'));
});

// ROTA PARA ORDENS - CLIENTE
app.get('/ordens-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cliente/ordensC.html'));

});

// ROTA PARA CLIENTE - ORDENS
app.get('/home-c', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cliente/homeC.html'));
});

// ROTA PARA HOME - ADM (DASHBOARD)
app.get('/home-adm', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/adm/home-adm.html'));
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

    // LOG PARA DIAGNÓSTICO:
    console.log('Sessão atual em finalizar-cadastro:', req.session);

    // 1. Verifica se o usuário tem sessão ativa
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const idCliente = req.session.usuario.id;
    const { nome, dataNascimento, cpf, cep, endereco, telefone } = req.body;

    // 2. Atualiza a tabela 'login' ou 'cliente' usando o idCliente da sessão
    const sql = `
        UPDATE usuarios
        SET nome = ?, dataNascimento = ?, cpf = ?, cep = ?, endereco = ?, telefone = ?
        WHERE idClient = ?
    `;

    db.run(sql, [nome, dataNascimento, cpf, cep, endereco, telefone, idCliente], function(erro) {
        if (erro) {
            console.error('Erro ao atualizar cadastro no SQLite:', erro.message);
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
