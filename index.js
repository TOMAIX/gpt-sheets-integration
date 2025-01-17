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

// Endpoint GET para registro fácil
app.get('/register', async (req, res) => {
    console.log("🔍 Recebendo dados via GET:", req.query);
    
    try {
        const { loja_id, descricao_atendimento } = req.query;
        
        if (!loja_id || !descricao_atendimento) {
            return res.send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h2>❌ Erro: Dados incompletos</h2>
                        <p>Faltam informações necessárias.</p>
                    </body>
                </html>
            `);
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

        // Retorna página de sucesso
        res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h2>✅ Atendimento Registrado!</h2>
                    <p>Você já pode fechar esta janela.</p>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('❌ Erro:', error);
        res.send(`
            <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h2>❌ Erro no Registro</h2>
                    <p>Houve um problema ao registrar o atendimento.</p>
                </body>
            </html>
        `);
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
