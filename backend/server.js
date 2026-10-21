const express = require("express");
const cors = require("cors");
const { config } = require("dotenv");

const app = express();
const PORT = 3000;

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

// ============================
//      PRIMEIRA ROTA API
// ============================

app.get("/api/status", (req, res)=>{
    res.json({
        sucesso: true,
        mensagem: "API funcionando!"
    });
});

// ===============================
//        INCIAR SERVIDOR
// ===============================

app.listen(PORT, () =>{
    console.log(`API rodando em http://localhost:${PORT}`)
})

// ===============================
//             TESTE
// ===============================


app.post("/api/teste", (req, res) => {
    console.log("Dados recebidos:", req.body);

    res.json({
        mensagem: "Informações recebidas com sucesso!",
        dadosRecebidos: req.body
    });
});

const path = require("path");

app.use(express.static(
    path.join(__dirname, "../frontend")
));

// ===============================================================
const Database = require("better-sqlite3");

const db = new Database(
    path.join(__dirname, "../database/fixly.db")
);

const authRoutes = require("./routes/auth");

app.use("/api/auth", (req, res, next) => {
    // Disponibiliza a conexão para as rotas.
    req.db = db;
    next();
}, authRoutes);
