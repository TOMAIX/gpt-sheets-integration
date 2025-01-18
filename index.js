const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authenticateGoogle = async () => {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    return sheets;
};

// Endpoint simplificado
app.post('/registrar', async (req, res) => {
    try {
        const { descricao } = req.body;
        
        const sheets = await authenticateGoogle();
        const spreadsheetId = '1LnuZSS55zNOaRVrQggbAJQ1G-epN0TbZzR7i4iEoTVo';
        const range = 'Loja 1!A2';  // Mudado para "Loja 1"
        const values = [[new Date().toLocaleString(), descricao]];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: { values }
        });

        res.json({ success: true, message: "Registrado com sucesso" });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ success: false, message: "Erro ao registrar" });
    }
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em 0.0.0.0:${port}`);
});
