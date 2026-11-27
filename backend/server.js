
//=======================================
//   Server.js - BACK-END COMPLETO
//=======================================

const path = require('path');            // -->  ajuda a montar caminhos de pastas

// Importar o dotenv LOGO NO INÍCIO para garantir que o processo leia as variáveis de ambiente antes de tudo
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');      // --> biblioteca para criar o servidor

const fs = require('fs');

const {
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
} = require('../database/db');

const { popularContasPadrao } = require('../database/seed');

const cors = require('cors');

const session = require('express-session');            // --> importa as variáveis

const PORT = process.env.PORT || 3000;   // --> Essa linha define a porta em que o servidor será executado, 
// se não estiver definido, o programaa utilizará 3000

const app = express();                   // --> cria o servidor 

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true })); // Faz o servidor entender JSON - Middleware 
// (Função que participa do processamento de requisições antes que elas 
// cheguem à rota responsàvel por responder)

app.use(express.static(path.resolve(__dirname, '..', 'frontend'))); // --> Servir os dados para do frontend

app.use('/files', express.static(path.join(__dirname, '../../files'))); // Rastrear dados de imagem e svg

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

// =====================================
//      CADASTRO DE NOVOS USUÁRIOS
// =====================================
app.post('/api/usuarios', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Cadastra o novo usuário no banco e recupera o ID gerado
        const resultadoCadastro = await cadastrarUsuario(email, senha);
        const novoIdUsuario = resultadoCadastro.id;

        req.session.usuario = {
            id: novoIdUsuario,
            email: email,
            tipo: 'cliente'
        };

        req.session.save((err) => {
            if (err) {
                console.error('Erro ao salvar sessão:', err);
                return res.status(500).json({ mensagem: 'Erro ao iniciar sessão após o cadastro.' });
            }

            return res.status(201).json({
                mensagem: 'Usuário cadastrado com sucesso!',
                id: novoIdUsuario
            });
        });
    } catch (erro) {
        console.error('Erro interno no SQLite:', erro.message);
        return res.status(500).json({ mensagem: 'Erro interno no servidor ao cadastrar usuário.' });
    }
});

// =====================================
//         FINALIZAR CADASTRO 
// =====================================

app.put('/api/usuarios/finalizar-cadastro', async (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    try {
        const idCliente = req.session.usuario.id;
        await finalizarCadastroUsuario(idCliente, req.body);

        return res.json({ mensagem: 'Cadastro finalizado com sucesso!' });
    } catch (erro) {
        console.error('Erro fatal ao inserir na tabela usuarios:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao salvar informações no banco de dados.' });
    }
});

// =====================================
//               LOGIN
// =====================================

app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuarioDoBanco = await buscarLoginPorEmail(email);

        if (!usuarioDoBanco || usuarioDoBanco.senha !== senha) {
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

            return res.json({
                mensagem: 'Login realizado com sucesso!',
                tipo: usuarioDoBanco.tipo || 'cliente'
            });
        });
    } catch (erro) {
        console.error('Erro no login:', erro.message);
        return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
});

// ===================================
//      CADASTRO DE OS - CLIENTE
// ===================================

app.post('/api/ordens', async (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        const { equipamento, marca, perifericos, descricao } = req.body;
        const idCliente = req.session.usuario.id;

        const dataAtual = new Date();
        const abertura = dataAtual.toLocaleDateString('pt-BR');
        const hora = dataAtual.toLocaleTimeString('pt-BR');

        const resultado = await criarOrdemServico({
            abertura,
            hora,
            equipamento,
            marca,
            perifericos,
            descricao,
            idCliente
        });

        return res.status(201).json({
            message: 'Ordem de serviço aberta com sucesso!',
            idChamado: resultado.id
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao abrir chamado no banco de dados.' });
    }
});

// ============================================
//     BUSCAR OS DADOS DO USUÁRIO LOGADO
// ============================================

app.get('/api/perfil', async (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado. Faça login novamente.' });
    }

    const usuarioSessao = req.session.usuario;
    const emailLogado = usuarioSessao.email;
    const tipoLogado = (usuarioSessao.tipo || '').toLowerCase();

    try {
        if (tipoLogado === 'profissional') {
            const tecnico = await buscarPerfilProfissional(emailLogado);

            if (!tecnico) {
                return res.json({
                    nome: emailLogado.split('@')[0],
                    email: emailLogado,
                    tipo: 'profissional'
                });
            }

            return res.json(tecnico);
        }

        // Se for CLIENTE ou ADM
        const idCliente = usuarioSessao.idCliente || usuarioSessao.id;
        const usuario = await buscarPerfilUsuario(idCliente);

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Perfil não encontrado.' });
        }

        return res.json(usuario);
    } catch (erro) {
        console.error('Erro ao buscar perfil:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao carregar perfil.' });
    }
});

// =============================
//         ALTERAR SENHA
// =============================

app.put('/api/perfil/senha', async (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const idCliente = req.session.usuario.idCliente || req.session.usuario.id;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ mensagem: 'Preencha a senha atual e a nova senha.' });
    }

    try {
        // Busca a senha atual salva no banco
        const row = await buscarSenhaPorId(idCliente);

        if (!row) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        // Verifica se a senha atual confere (suporta hash bcrypt ou texto simples)
        const usaBcrypt = row.senha.startsWith('$2b$') || row.senha.startsWith('$2a$');
        let senhaValida = false;

        if (usaBcrypt) {
            const bcrypt = require('bcrypt');
            senhaValida = await bcrypt.compare(senhaAtual, row.senha);
        } else {
            senhaValida = (senhaAtual === row.senha);
        }

        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'A senha atual está incorreta.' });
        }

        // Criptografa a nova senha se a conta já usa bcrypt, senão salva direto
        let senhaParaSalvar = novaSenha;
        if (usaBcrypt) {
            try {
                const bcrypt = require('bcrypt');
                senhaParaSalvar = await bcrypt.hash(novaSenha, 10);
            } catch (e) {
                // Segue sem bcrypt caso não esteja instalado
            }
        }

        await atualizarSenha(idCliente, senhaParaSalvar);
        return res.json({ mensagem: 'Senha alterada com sucesso!' });
    } catch (erro) {
        console.error('Erro ao alterar senha:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao atualizar a senha.' });
    }
});

// ============================
//    REMOVER FOTO DE PERFIL
// ============================
app.delete('/api/perfil/foto', async (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }

    try {
        const idCliente = req.session.usuario.idCliente || req.session.usuario.id;
        await removerFotoPerfil(idCliente);

        return res.json({ mensagem: 'Foto removida com sucesso!' });
    } catch (err) {
        console.error('Erro ao remover foto:', err.message);
        return res.status(500).json({ mensagem: 'Erro ao remover a foto de perfil.' });
    }
});

// =========================
//      ADM CADASTRAR
// =========================
app.post('/api/usuarios/admin', async (req, res) => {
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

    // 1. Cria o login
    let idGerado;
    try {
        const resultadoLogin = await criarLoginPorTipo(email, senha, tipo);
        idGerado = resultadoLogin.id;
    } catch (erroLogin) {
        console.error('Erro ao inserir na tabela login:', erroLogin.message);

        if (erroLogin.message.includes('UNIQUE')) {
            return res.status(400).json({ mensagem: 'Este e-mail já está cadastrado no sistema.' });
        }

        return res.status(500).json({ mensagem: 'Erro ao criar login no banco de dados.' });
    }

    // 2A. Se for PROFISSIONAL, grava apenas na tabela "tecnicos"
    if (tipo === 'profissional') {
        try {
            const cargo = especialidades ? `${funcao} (${especialidades})` : funcao;
            const admissao = new Date().toISOString().split('T')[0];

            const resultadoTecnico = await cadastrarTecnico({
                nome,
                cpf,
                nascimento,
                telefone,
                email,
                cep,
                admissao,
                cargo
            });

            return res.status(201).json({
                mensagem: 'Profissional cadastrado com sucesso!',
                idLogin: idGerado,
                idTecnico: resultadoTecnico.id
            });
        } catch (erroTecnico) {
            console.error('Erro ao inserir na tabela tecnicos:', erroTecnico.message);
            return res.status(500).json({ mensagem: 'Login criado, mas houve erro ao salvar dados do técnico.' });
        }
    }

    // 2B. Se for CLIENTE ou ADM, grava apenas na tabela "usuarios"
    try {
        await cadastrarDadosUsuario({
            idCliente: idGerado,
            nome,
            cpf,
            nascimento,
            telefone,
            email,
            cep,
            endereco
        });

        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            idCliente: idGerado
        });
    } catch (erroUsuario) {
        console.error('Erro ao inserir na tabela usuarios:', erroUsuario.message);
        return res.status(500).json({ mensagem: 'Login criado, mas houve erro ao salvar dados do usuário.' });
    }
});

// ==================================
//    BUSCAR ORDENS DO PROFISSIONAL 
// ==================================

app.get('/api/ordens/profissional', async (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const emailLogado = (req.session.usuario.email || '').trim().toLowerCase();
    const idLoginLogado = req.session.usuario.idCliente || req.session.usuario.id;

    try {
        const listaTecnicos = await listarTecnicos();
        const tecnico = (listaTecnicos || []).find(
            (t) =>
                (t.email && t.email.trim().toLowerCase() === emailLogado) ||
                Number(t.idTecnico) === Number(idLoginLogado)
        );

        const idTecnico = tecnico ? Number(tecnico.idTecnico) : -1;
        const nomeTecnico = tecnico ? (tecnico.nome || '').trim().toLowerCase() : '';

        const todasOrdens = await listarOrdensComCliente();

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
    } catch (erro) {
        console.error('Erro ao buscar ordens do profissional:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao carregar ordens: ' + erro.message });
    }
});

// ===========================
//   PROFISSIONAL ATRIBUIR-SE
// ===========================

app.put('/api/ordens/:id/assumir', async (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const idOrdem = req.params.id;
    const emailProfissional = (req.session.usuario.email || '').trim().toLowerCase();
    const idLoginLogado = req.session.usuario.idCliente || req.session.usuario.id;

    try {
        const listaTecnicos = await listarTecnicos();
        const tecnico = (listaTecnicos || []).find(
            (t) =>
                (t.email && t.email.trim().toLowerCase() === emailProfissional) ||
                Number(t.idTecnico) === Number(idLoginLogado)
        );

        if (!tecnico) {
            return res.status(404).json({ mensagem: 'Perfil técnico não encontrado no banco.' });
        }

        const resultado = await assumirOrdemServico(idOrdem, tecnico);

        if (resultado.changes === 0) {
            return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
        }

        return res.json({ mensagem: 'Ordem assumida com sucesso!' });
    } catch (erro) {
        console.error('Erro ao assumir ordem:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao atualizar a ordem no banco.' });
    }
});

// ==================
//    FINALIZAR OS
// ==================
app.put('/api/ordens/:id/status', async (req, res) => {
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

    try {
        const resultado = await atualizarStatusOrdem(idOrdem, novoStatus, mapaProcesso[novoStatus]);

        if (resultado.changes === 0) {
            return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
        }

        return res.json({ mensagem: 'Status atualizado com sucesso!' });
    } catch (erro) {
        console.error('Erro ao atualizar status da OS:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao atualizar status no banco.' });
    }
});

// =============================
//      MOSTRAR USUÁRIOS
// =============================

app.get('/api/usuarios/admin', async (req, res) => {
    try {
        const usuarios = await listarTodosUsuariosAdmin();
        return res.json(usuarios);
    } catch (erro) {
        console.error('Erro ao buscar usuários e profissionais:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao buscar usuários no banco.' });
    }
});

// =================================================================
//   SALVAR DIAGNÓSTICO, VALORES E ENVIAR PARA VALIDAÇÃO DO CLIENTE
// =================================================================

app.put('/api/ordens/:id/tecnico-detalhes', async (req, res) => {
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

    try {
        const resultado = await salvarDetalhesTecnicosOrdem(idOrdem, {
            diagnostico,
            servico_executado,
            data_finalizacao,
            maoObraNum,
            materialNum,
            processo,
            valorTotal,
            enviar_validacao
        });

        if (resultado.changes === 0) {
            return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
        }

        console.log(`[OS# ${idOrdem}] Dados técnicos salvos com sucesso! Total: R$ ${valorTotal.toFixed(2)}`);
        return res.json({
            mensagem: enviar_validacao
                ? 'Dados salvos e enviados para validação do cliente!'
                : 'Dados técnicos salvos com sucesso!'
        });
    } catch (erro) {
        console.error('Erro ao salvar dados técnicos da OS:', erro.message);
        return res.status(500).json({ mensagem: 'Erro SQL: ' + erro.message });
    }
});

// =========================================================
// RESPOSTA DO CLIENTE À VALIDAÇÃO DO ORÇAMENTO / SERVIÇO
// =========================================================

app.put('/api/ordens/:id/validacao-cliente', async (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const idOrdem = req.params.id;
    const decisao = (req.body.decisao || '').toLowerCase().trim(); // 'aprovado' ou 'recusado'

    if (!['aprovado', 'recusado'].includes(decisao)) {
        return res.status(400).json({ mensagem: 'Decisão inválida.' });
    }

    const novoStatus = decisao === 'aprovado' ? 'andamento' : 'cancelada';
    const novoProcesso = decisao === 'aprovado'
        ? 'Aprovado pelo cliente - Em andamento'
        : 'Recusado pelo cliente';

    try {
        const resultado = await registrarValidacaoClienteOrdem(idOrdem, {
            decisao,
            novoStatus,
            novoProcesso
        });

        if (resultado.changes === 0) {
            return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
        }

        return res.json({
            mensagem: decisao === 'aprovado'
                ? 'Orçamento aprovado! O técnico foi liberado para executar o serviço.'
                : 'Orçamento recusado e ordem encerrada.'
        });
    } catch (erro) {
        console.error('Erro na validação do cliente:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao registrar validação.' });
    }
});

// =========================================================
// LISTAR APENAS AS ORDENS DE SERVIÇO DO CLIENTE LOGADO
// =========================================================
app.get('/api/ordens/cliente', async (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente.' });
    }

    const usuario = req.session.usuario;
    const idCliente = usuario.idCliente || usuario.id || null;
    const email = (usuario.email || '').trim().toLowerCase();
    const nome = (usuario.nome || '').trim().toLowerCase();

    try {
        const ordens = await listarOrdensDoCliente({ idCliente, email, nome });
        return res.json(ordens);
    } catch (erro) {
        console.error('Erro ao buscar ordens do cliente:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao carregar suas ordens de serviço.' });
    }
});

// ==================
//     DASHBOARD
// ==================
app.get('/api/ordens/admin', async (req, res) => {
    try {
        const ordens = await listarOrdensAdmin();
        return res.json(ordens);
    } catch (erro) {
        console.error('Erro no banco de dados (Admin):', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao buscar ordens no banco.' });
    }
});

//=============================================
//    ADM ADICIONAR TÉCNICOS PARA AS ORDENS
//=============================================

// 1. Lista os técnicos cadastrados para preencher o <select> do modal
app.get('/api/tecnicos', async (req, res) => {
    try {
        const linhas = await listarTecnicosAtivos();
        console.log(`[GET /api/tecnicos] Técnicos encontrados: ${linhas.length}`);
        return res.json(linhas);
    } catch (erro) {
        console.error('Erro ao buscar técnicos:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao carregar lista de técnicos.' });
    }
});

// 2. Atribui o técnico à OS e coloca em andamento
app.put('/api/ordens/:id/atribuir', async (req, res) => {
    const { id } = req.params;
    const { idTecnico } = req.body;

    if (!idTecnico) {
        return res.status(400).json({ mensagem: 'Selecione um técnico válido.' });
    }

    try {
        const resultado = await atribuirTecnicoOrdem(id, idTecnico);

        if (resultado.changes === 0) {
            return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
        }

        return res.json({ mensagem: 'Técnico atribuído e ordem colocada em andamento!' });
    } catch (erro) {
        console.error('Erro ao atribuir técnico à OS:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao salvar atribuição no banco de dados.' });
    }
});

// =====================================
//               LOGOUT
// =====================================
app.all('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao encerrar sessão:', err);
            return res.status(500).json({ mensagem: 'Erro ao sair da conta.' });
        }

        res.clearCookie('connect.sid');
        return res.json({ mensagem: 'Logout realizado com sucesso!' });
    });
});

//=====================================
//    MANTER EMAIL DA SESSÃO ATIVO
//=====================================

// 2. ATUALIZAR DADOS E FOTO DE PERFIL
app.put('/api/perfil', async (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ mensagem: 'Não autorizado.' });
    }

    const idCliente = req.session.usuario.idCliente || req.session.usuario.id;
    const { nome, cpf, email, foto } = req.body;

    try {
        await atualizarPerfilUsuario(idCliente, { nome, cpf, email, foto });

        // Mantém o e-mail atualizado na sessão ativa
        req.session.usuario.email = email;

        return res.json({ mensagem: 'Perfil atualizado com sucesso!' });
    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ mensagem: 'Este e-mail já está em uso por outra conta.' });
        }
        console.error('Erro ao atualizar perfil:', erro.message);
        return res.status(500).json({ mensagem: 'Erro ao atualizar perfil.' });
    }
});

// ========================================
//             INICIALIZAÇÃO
// ========================================

async function iniciarSistema() {
    try {
        await inicializarBanco();
        await executarMigracoes();
        await sincronizarAdministrador(process.env.emailAdm, process.env.senhaAdm);
        await popularContasPadrao();

        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (erro) {
        console.error('Erro na inicialização do sistema:', erro.message);
        process.exit(1);
    }
}

iniciarSistema();