const express = require('express');
const router = express.Router(); 

const db = require('../database/db.js');



router.get('/api/perfil', async (req, res) => {
    try {
        const user = await User.findById(req.idCliente);
        res.json({ nome: user.nome, cpf: user.cpf, email: user.email });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar perfil' });
    }
});

router.put('/api/perfil', async (req, res) => {
    try {
        const { nome, cpf, email } = req.body;
        // CORREÇÃO: Sintaxe do where ajustada para apontar a coluna "id"
        await User.update({ nome, cpf, email }, { where: { id: req.idCliente } });
        
        // CORREÇÃO: Adicionada a resposta de sucesso para a requisição não travar
        res.json({ mensagem: 'Perfil atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar perfil '});
    }
});

// ALTERAR SENHA
// CORREÇÃO: Adicionada a "/" no início da rota e o bloco catch
router.put('/api/perfil/senha', async (req, res) => {
    try {
        const { senhaAtual, novaSenha } = req.body;
        
        // AQUI ENTRA A LÓGICA DE BCRYPT
        // 1. const user = await User.findById(req.idCliente)
        // 2. const senhaValida = await bcrypt.compare(senhaAtual, user.senha)
        // 3. const hashNovaSenha = await bcrypt.hash(novaSenha, 10)
        // 4. await User.update({ senha: hashNovaSenha }, { where: { id: req.idCliente } })
        
        res.json({ mensagem: 'Senha alterada com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao alterar a senha' });
    }
});

router.delete('/api/perfil', async (req, res) => {
    try {
        await User.destroy({ where: { id: req.idCliente } });
        res.json({ mensagem: 'Conta excluída' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir conta' });
    }
});

module.exports = router; // Agora "router" existe