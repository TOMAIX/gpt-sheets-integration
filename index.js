const express = require('express');  // Importa o Express
const { google } = require('googleapis');  // Importa o Google APIs
const app = express();  // Cria uma instância do Express
const port = process.env.PORT || 3000;  // Define a porta

// Middleware para processar o corpo da requisição em JSON
app.use(express.json());

// Função para autenticar no Google Sheets
const authenticateGoogle = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json', // Caminho do arquivo de credenciais
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    return sheets;
};

// Endpoint para receber os dados do atendimento
app.post('/send-to-sheets', async (req, res) => {
    const { loja_id, descricao_atendimento } = req.body;

    // Verifica se os dados foram enviados
    if (!loja_id || !descricao_atendimento) {
        return res.status(400).send({ message: "Dados faltando: loja_id ou descricao_atendimento" });
    }

    try {
        // Autentica no Google Sheets
        console.log("🔑 Autenticando no Google Sheets...");
        const sheets = await authenticateGoogle();

        // ID da sua planilha do Google Sheets
        const spreadsheetId = '1LnuZSS55zNOaRVrQggbAJQ1G-epN0TbZzR7i4iEoTVo'; // Substitua pela sua ID
        console.log(`📝 Enviando dados para a planilha com ID: ${spreadsheetId}`);

        // Configura os dados a serem enviados
        const range = 'Sheet1!A1'; // Nome da aba e intervalo
        const value = [
            [new Date().toLocaleString(), loja_id, descricao_atendimento],
        ];

        const resource = {
            values: value,
        };

        // Envia os dados para o Google Sheets
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource,
        });

        console.log("✅ Dados enviados para a planilha com sucesso!");

        // Retorna uma resposta de sucesso
        res.send({
            message: 'Dados recebidos e registrados na planilha com sucesso!',
            loja_id: loja_id,
            descricao_atendimento: descricao_atendimento,
        });
    } catch (error) {
        console.error('❌ Erro ao registrar dados no Google Sheets:', error);
        res.status(500).send({ message: 'Erro ao registrar dados no Google Sheets' });
    }
});

// Inicia o servidor na porta configurada
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
