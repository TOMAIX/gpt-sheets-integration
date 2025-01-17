const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Autenticação Google
const authenticateGoogle = async () => {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth: await auth.getClient() });
};

// Endpoint Webhook simplificado
app.post('/webhook', async (req, res) => {
    try {
        // Extrai dados do body
        const { loja_id, descricao_atendimento } = req.body;
        
        if (!loja_id || !descricao_atendimento) {
            return res.status(400).json({
                success: false,
                message: "Dados incompletos"
            });
        }

        // Conecta ao Google Sheets
        const sheets = await authenticateGoogle();
        
        // Prepara dados
        const spreadsheetId = '1LnuZSS55zNOaRVrQggbAJQ1G-epN0TbZzR7i4iEoTVo';
        const range = 'Sheet1!A2';
        const values = [[new Date().toLocaleString(), loja_id, descricao_atendimento]];

        // Registra na planilha
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: { values }
        });

        // Responde sucesso
        res.json({
            success: true,
            message: "Atendimento registrado com sucesso"
        });

    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({
            success: false,
            message: "Erro ao registrar atendimento"
        });
    }
});

// Mantém endpoints anteriores
app.post('/send-to-sheets', async (req, res) => {
    /* ... código existente ... */
});

app.get('/register', async (req, res) => {
    /* ... código existente ... */
});

// Inicia servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});
