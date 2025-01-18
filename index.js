const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const port = process.env.PORT || 3000;

// ... (resto do código do bot continua igual)

// Novo endpoint para registro via URL
app.get('/r/:loja/:texto', async (req, res) => {
    try {
        const { loja, texto } = req.params;
        const descricao = decodeURIComponent(texto);
        
        const sheets = await authenticateGoogle();
        const spreadsheetId = '1LnuZSS55zNOaRVrQggbAJQ1G-epN0TbZzR7i4iEoTVo';
        const range = 'Sheet1!A2';
        const values = [[new Date().toLocaleString(), loja, descricao]];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: { values }
        });

        res.send(`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { 
                            font-family: Arial; 
                            text-align: center; 
                            padding: 20px;
                            background: #f0f2f5;
                        }
                        .card {
                            background: white;
                            padding: 20px;
                            border-radius: 10px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            margin: 20px auto;
                            max-width: 300px;
                        }
                        .success {
                            color: #0a0;
                            font-size: 48px;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="success">✅</div>
                        <h2>Atendimento Registrado!</h2>
                        <p>Você já pode fechar esta janela.</p>
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).send('Erro ao registrar atendimento');
    }
});
