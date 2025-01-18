const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração do bot do Telegram
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

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

// Função para registrar atendimento
const registrarAtendimento = async (loja_id, descricao_atendimento) => {
    try {
        const sheets = await authenticateGoogle();
        const spreadsheetId = '1LnuZSS55zNOaRVrQggbAJQ1G-epN0TbZzR7i4iEoTVo';
        const range = 'Sheet1!A2';
        const values = [[new Date().toLocaleString(), loja_id, descricao_atendimento]];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: { values }
        });

        return true;
    } catch (error) {
        console.error('Erro ao registrar:', error);
        return false;
    }
};

// Manipulador de mensagens do Telegram
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    // Verifica se a mensagem menciona uma loja
    const lojaMatch = text.match(/loja\s*(\d+)/i);
    
    if (lojaMatch) {
        const loja_id = lojaMatch[1];
        const sucesso = await registrarAtendimento(loja_id, text);
        
        if (sucesso) {
            bot.sendMessage(chatId, '✅ Atendimento registrado com sucesso!');
        } else {
            bot.sendMessage(chatId, '❌ Erro ao registrar atendimento. Tente novamente.');
        }
    } else {
        bot.sendMessage(chatId, 'Por favor, me diga o número da loja.');
    }
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor funcionando! 🚀');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});
