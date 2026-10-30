//=======================================
//   Server.js - BACK-END COMPLETO
//=======================================

// PARTE 1: Importar as ferramentas
// Importar o dotenv LOGO NO INÍCIO para garantir que o processo leia as variáveis de ambiente antes de tudo
const path = require('path');                   // ajuda a montar caminhos de pastas

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');             // biblioteca para criar o servidor
const fs = require('fs');                       // abreviação de readFiles e writeFiles

const db = require('../database/db.js');


// PARTE 2: Criar o Servidor e abrir o banco
const PORT = process.env.PORT || 3000;          // Correção da ordem para ler do .env corretamente
const app = express();                          // cria o servidor

// Servir os dados para do frontend
app.use(express.static(path.resolve(__dirname, '..', 'frontend')));

// dados de imagem e svg
app.use('/files', express.static(path.join(__dirname, '../../files')));

// Parte 3: Configurar o servidor (os famosos middlewares)
app.use(express.json()); // faz o servidor entender JSON

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
app.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cliente/perfil.html'));
});

// =====================================
//              Cadastro
// =====================================

app.post('/api/usuarios', (req, res) => {
    const { email, senha } = req.body; 
    
    // Inserção na tabela de logins (rosa do seu diagrama)
    const sql = "INSERT INTO login (email, senha, tipo) VALUES (?, ?, 'cliente')";
    
    db.run(sql, [email, senha], function(erro) {
        if (erro) {
            console.error('Erro interno no SQLite:', erro.message);
            return res.status(500).json({ mensagem: 'Erro interno no servidor ao salvar login' });
        }
        
        // Retorna o idCliente criado automaticamente pelo banco de dados
        return res.status(201).json({ mensagem: 'Login criado com sucesso!', id: this.lastID });
    });
});

// =====================================
//       FINALIZAR CADASTRO 
// =====================================

// Rota PUT usada para atualizar dados adicionais obrigatórios do cliente recém-criado
app.put('/api/usuarios/finalizar-cadastro', (req, res) => {
    const { idCliente, nome, dataNascimento, cpf, cep, endereco, telefone } = req.body;

    if (!idCliente || !nome || !dataNascimento || !cpf || !cep || !endereco || !telefone ) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos' });
    }

    const sql = `
        UPDATE usuarios 
        SET nome = ?, 
        dataNascimento = ?, 
        cpf = ?, 
        cep = ?, 
        endereco = ?, 
        telefone = ?, 
        cadastro_completo = 1 
        WHERE idCliente = ?
    `;

    db.run(sql, [nome, dataNascimento, idCliente], function(erro) {
        if (erro) {
            console.error('Erro ao atualizar informações cadastrais:', erro.message);
            return res.status(500).json({ mensagem: 'Erro ao salvar informações no banco de dados.' });
        }
        return res.status(200).json({ mensagem: 'Informações salvas e cadastro finalizado com sucesso!' });
    });
});


// =====================================
//               LOGIN
// =====================================

app.post('/api/login', (req, res) => { 
    const { email, senha } = req.body;
    
    // Busca o usuário pelo e-mail informado
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    
    db.get(sql, [email], (erro, usuario) => {
        if (erro) {
            console.error('Erro ao consultar o banco:', erro.message);
            return res.status(500).json({ mensagem: 'Erro interno no servidor' });
        }
        
        // Se não existir usuário 
        if (!usuario) { 
            return res.status(401).json({ mensagem: 'Usuário não encontrado' });
        }
        
        // Verifica se a senha está correta
        if (usuario.senha !== senha) {
            return res.status(401).json({ mensagem: 'Senha incorreta' });
        } 
        
        // Retorna o sucesso do Login e os metadados cruciais para o frontend decidir o redirecionamento
        return res.status(200).json({
            mensagem: 'Login autorizado!',
            id: usuario.idCliente,
            tipo: usuario.tipo,
            cadastroCompleto: usuario.cadastro_completo // Retorna 0 se for recém-criado, ou 1 se já finalizou
        });
    });
});

// ====================================
//           INSERIR CADASTROS
// ====================================

app.put('/api/usuarios/finalizar-cadastro', (req, res) => {
    const { idCliente, nome, data_nascimento, cpf, cep, endereco, telefone } = req.body;

    const sql = `
        UPDATE usuarios 
        SET nome = ?, data_nascimento = ?, cpf = ?, cep = ?, endereco = ?, telefone = ?, cadastro_completo = 1 
        WHERE idCliente = ?
    `;

    db.run(sql, [nome, data_nascimento, cpf, cep, endereco, telefone, idCliente], function(erro) {
        if (erro) return res.status(500).json({ mensagem: 'Erro ao salvar no banco' });
        return res.status(200).json({ mensagem: 'Cadastro finalizado com sucesso!' });
    });
});


// ======================================================
//      FUNÇÃO PARA CRIAR A SENHA DE ADMINISTRADOR
// ======================================================

function administrador() {
    const emailAdmin = process.env.emailAdm;
    const senhaAdmin = process.env.senhaAdm;

    if (!emailAdmin || !senhaAdmin) {
        console.log(' Aviso: Variáveis emailAdm ou senhaAdm não configuradas no arquivo .env');
        return;
    }

    const buscarSql = 'SELECT * FROM usuarios WHERE email = ?';
    
    db.get(buscarSql, [emailAdmin], (erro, usuario) => {
        if (erro) {
            console.error('Erro ao verificar administrador no banco:', erro.message);
            return;
        }

        if (!usuario) {
            // Conta de administrador padrão já nasce com cadastro_completo = 1
            const inserirSql = "INSERT INTO usuarios (email, senha, tipo, cadastro_completo) VALUES (?, ?, 'admin', 1)";
            
            db.run(inserirSql, [emailAdmin, senhaAdmin], function(err) {
                if (err) {
                    console.error('Erro ao inserir admin do .env:', err.message);
                } else {
                    console.log(` Administrador padrão (${emailAdmin}) injetado com sucesso no banco pelo servidor!`);
                }
            });
        } else {
            console.log('Administrador do .env já está cadastrado e pronto para uso.');
        }
    });
}

// Função para rodar o script do BDD de login
function iniBDD() {
    const scriptPath = path.resolve(__dirname, '..', 'database', 'script.sql');
    try {
        if (fs.existsSync(scriptPath)) {
            const sql = fs.readFileSync(scriptPath, 'utf8');
            db.exec(sql); // Correção de 'deb.exec' para 'db.exec'
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
