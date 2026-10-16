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