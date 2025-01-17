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
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    return sheets;
};

// Endpoint Webhook simplificado
app.post('/webhook', async (req, res) => {
    console.log("🔍 Recebendo dados no webhook:", req.body);
    
    try {
        const { loja_id, descricao_atendimento } = req.body;
        
        if (!loja_id || !descricao_atendimento) {
            console.log("❌ Dados incompletos:", { loja_id, descricao_atendimento });
            return res.status(400).json({
                success: false,
                message: "Dados incompletos - necessário loja_id e descricao_atendimento"
            });
        }

        // Conecta ao Google Sheets
        const sheets = await authenticateGoogle();
        
        // Prepara dados
        const spreadsheetId = '1LnuZSS55zNOaRVrQggbAJQ1G-epN0TbZzR7i4iEoTVo';
        const range = 'Sheet1!A2';
        const values = [[new Date().toLocaleString(), loja_id, descricao_atendimento]];

        console.log("📝 Tentando escrever na planilha...");

        // Registra na planilha
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: { values }
        });

        console.log("✅ Dados registrados com sucesso!");

        // Responde sucesso
        res.json({
            success: true,
            message: "Atendimento registrado com sucesso",
            data: {
                loja_id,
                descricao_atendimento,
                timestamp: new Date().toLocaleString()
            }
        });

    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({
            success: false,
            message: "Erro ao registrar atendimento",
            error: error.message
        });
    }
});

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('Servidor funcionando! 🚀');
});

// Inicia servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});