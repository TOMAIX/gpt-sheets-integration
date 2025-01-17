const express = require('express');
const cors = require('cors');  // Nova linha adicionada
const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());  // Nova linha adicionada
app.use(express.json());

// Criação da autenticação com a conta de serviço do Google
const authenticateGoogle = async () => {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    return sheets;
};

// Endpoint para receber os dados do atendimento
app.post('/send-to-sheets', async (req, res) => {
    // Loga o que está sendo recebido
    console.log("🛠️ Recebendo dados do GPT:", req.body);

    const { loja_id, descricao_atendimento } = req.body;

    // Verifica se os dados foram enviados
    if (!loja_id || !descricao_atendimento) {
        console.log("❌ Dados faltando:", { loja_id, descricao_atendimento });
        return res.status(400).send({ message: "Dados faltando: loja_id ou descricao_atendimento" });
    }

    try {
        // Autenticação com o Google Sheets
        const sheets = await authenticateGoogle();
        
        // ID da planilha
        const spreadsheetId = '1LnuZSS55zNOaRVrQggbAJQ1G-epN0TbZzR7i4iEoTVo';

        // Grava os dados na planilha
        const range = 'Sheet1!A2';
        const value = [
            [new Date().toLocaleString(), loja_id, descricao_atendimento],
        ];

        const resource = {
            values: value,
        };

        // Envia os dados para o Google Sheets
        console.log("📝 Tentando escrever na planilha...");
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource,
        });
        console.log("✅ Dados escritos com sucesso!");

        // Resposta de sucesso
        res.send({
            message: 'Dados recebidos e processados!',
            loja_id: loja_id,
            descricao_atendimento: descricao_atendimento,
        });
    } catch (error) {
        console.error('❌ Erro ao registrar dados no Google Sheets:', error);
        // Resposta de erro
        res.status(500).send({ 
            message: 'Erro ao registrar dados no Google Sheets',
            error: error.message 
        });
    }
});

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('Servidor funcionando! 🚀');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});
