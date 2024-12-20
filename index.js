const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para processar o corpo da requisição em JSON
app.use(express.json());

// Endpoint para receber os dados do atendimento
app.post('/send-to-sheets', async (req, res) => {
    const { loja_id, descricao_atendimento } = req.body;

    // Retorna os dados recebidos
    res.send({
        message: 'Dados recebidos e processados!',
        loja_id: loja_id,
        descricao_atendimento: descricao_atendimento
    });
});

// Inicia o servidor na porta definida (3000 por padrão)
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

