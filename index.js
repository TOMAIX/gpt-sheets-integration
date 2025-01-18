const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const twilio = require('twilio');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração Twilio
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

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

// Endpoint para receber mensagens do Twilio
app.post('/message', async (req, res) => {
    console.log("📱 Mensagem recebida:", req.body);
    
    try {
        const messageBody = req.body.Body; // Texto da mensagem
        const fromNumber = req.body.From;  // Número do remetente
        
        // Extrai o ID da loja e a descrição
        const matches = messageBody.match(/loja\s*(\d+)/i);
        const loja_id = matches ? matches[1] : null;
        const descricao_atendimento = messageBody;

        if (!loja_id) {
            // Se não encontrou o número da loja, pede para o usuário
            await twilioClient.messages.create({
                body: 'Por favor, informe o número da loja.',
                to: fromNumber,
                from: process.env.TWILIO_PHONE_NUMBER
            });
            return res.sendStatus(200);
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

        // Envia confirmação
        await twilioClient.messages.create({
            body: '✅ Atendimento registrado com sucesso!',
            to: fromNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({ error: error.message });
    }
});

// Inicia servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});
