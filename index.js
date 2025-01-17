const express = require('express');
const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const authenticateGoogle = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    return sheets;
};

app.post('/send-to-sheets', async (req, res) => {
    const { loja_id, descricao_atendimento } = req.body;

    if (!loja_id || !descricao_atendimento) {
        return res.status(400).send({ message: 'Dados faltando: loja_id ou descricao_atendimento' });
    }

    try {
        const sheets = await authenticateGoogle();
        const spreadsheetId = '1LnuZSS55zNOaRVrQggbAJQ1G-epN0TbZzR7i4iEoTVo';
        const value = [
            [new Date().toLocaleString(), loja_id, descricao_atendimento],
        ];
        const resource = { values: value };

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource,
        });

        res.send({
            message: 'Dados recebidos e processados!',
            loja_id,
            descricao_atendimento,
        });
    } catch (error) {
        console.error('Erro ao registrar dados no Google Sheets:', error);
        res.status(500).send({ message: 'Erro ao registrar dados no Google Sheets' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
