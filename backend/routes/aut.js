const express = require("express");
const bcrypt = require("bcryptjs"); // Corrigido: tirado o 's' extra
const rateLimit = require("express-rate-limit");
const db = require("../db");

const router = express.Router();

// Rate Limiter para proteger contra ataques de força bruta
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Muitas tentativas. Tente novamente mais tarde"
    }
});

// ====================================
//             CADASTRO
// ====================================

router.post("/registrer", async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase(); // Corrigido: 'C' maiúsculo
        const senha = req.body.senha;

        // Validação dos dados recebidos
        if (
            typeof email !== "string" || 
            typeof senha !== "string" ||
            email.length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            senha.length < 8 ||
            Buffer.byteLength(senha, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "Confira os dados. A senha deve ter pelo menos 8 caracteres"
            });
        }

        // Se passar na validação, o seu código para salvar no banco entra aqui!
        return res.status(201).json({ message: "Dados válidos!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
});

    const [existing] = await db.execute(
        "SELECT idCliente FROM users WHERE email = ?", [email]
    );

    if (existing.lenght > 0 ) {
        return res.status(409).json({
            message: "Não foi possível cadastrar com esses dados."
        });
    }

    const senha = await bcrypt.hash(senha, 12);

//                    CADASTRO INCOMPLETO!!
// pois ainda falta os outros dados, estes são apensa referências para continuar produzindo

// ==============================================
//                   LOGIN
// ==============================================
router.post("/login", loginLimiter, async (req, res)=>{
    try {
        const email = req.body.email.trim().toLowerCase()
        const senha = req.body.senha
    }
})

module.exports = router;