
module.exports = function (db) {
    const router = express.Router();

    // Coloque aqui as configurações e rotas
    // do cadastro apresentadas acima.

    return router;
};

const db = require("../db");

const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Limita tentativas de cadastro.
const cadastroLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false
});

// CADASTRO
router.post("/cadastro", cadastroLimiter, async (req, res, next) => {
    try {
        const { nome, email, senha, tipo } = req.body;

        if (
            typeof nome !== "string" ||
            typeof email !== "string" ||
            typeof senha !== "string" ||
            typeof tipo !== "string"
        ) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos."
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (
            !nomeLimpo ||
            nomeLimpo.length > 100 ||
            emailLimpo.length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo) ||
            senha.length < 8 ||
            Buffer.byteLength(senha, "utf8") > 72 ||
            !["cliente", "profissional"].includes(tipo)
        ) {
            return res.status(400).json({
                mensagem: "Confira os dados informados."
            });
        }

        // Verifica se o e-mail já existe.
        const existente = db.prepare(
            "SELECT idCliente FROM login WHERE email = ?"
        ).get(emailLimpo);

        if (existente) {
            return res.status(409).json({
                mensagem: "Não foi possível cadastrar com esses dados."
            });
        }

        // Protege a senha antes de armazená-la.
        const senhaHash = await bcrypt.hash(senha, 12);

        // Salva o usuário no SQLite.
        const resultado = db.prepare(`
            INSERT INTO login (nome, email, senha_hash, tipo)
            VALUES (?, ?, ?, ?)
        `).run(nomeLimpo, emailLimpo, senhaHash, tipo);

        return res.status(201).json({
            sucesso: true,
            mensagem: "Cadastro realizado com sucesso!",
            usuario: {
                id: resultado.lastInsertRowid,
                nome: nomeLimpo,
                email: emailLimpo,
                tipo
            }
        });

    } catch (erro) {
        if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                mensagem: "Não foi possível cadastrar com esses dados."
            });
        }

        next(erro);
    }
});

module.exports = router;
