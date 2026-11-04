const express = require('express');
const app = express.Router();

// Importa o banco

const db = require('../database/db.js');

app.get('/api/perfil', async (req, res) => {
    try {
        const user = await User.findById(req.idCliente);
        res.json({nome: user.nome, email: user.email})
    }
})
