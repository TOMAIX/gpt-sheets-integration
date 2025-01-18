const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 3000;

// ... (código de autenticação do Google)

// Endpoint curto e amigável
app.get('/r/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        
        // Decodifica o código (exemplo: L5-cliente-pediu-informacao)
        const [loja, ...descricaoParts] = codigo.split('-');
        const loja_id = loja.replace('L', '');
        const descricao = descricaoParts.join(' ');

        // Registra na planilha
        const sheets = await authenticateGoogle();
        const spreadsheetId = '1LnuZSS55zNOaRVrQggbAJQ1G-epN0TbZzR7i4iEoTVo';
        const range = 'Sheet1!A2';
        const values = [[new Date().toLocaleString(), loja_id, descricao]];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: { values }
        });

        // Retorna uma página amigável para mobile
        res.send(`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                            text-align: center; 
                            padding: 20px;
                            background: #f0f2f5;
                            margin: 0;
                            height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .card {
                            background: white;
                            padding: 30px;
                            border-radius: 15px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            width: 85%;
                            max-width: 320px;
                            margin: auto;
                        }
                        .success {
                            font-size: 64px;
                            margin: 10px 0;
                        }
                        h2 {
                            margin: 15px 0;
                            color: #1a1a1a;
                        }
                        .close {
                            margin-top: 20px;
                            color: #666;
                            font-size: 15px;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="success">✅</div>
                        <h2>Atendimento Registrado!</h2>
                        <p class="close">Você já pode fechar esta janela</p>
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).send(`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        /* mesmo CSS anterior */
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="error">❌</div>
                        <h2>Erro ao Registrar</h2>
                        <p class="close">Por favor, tente novamente</p>
                    </div>
                </body>
            </html>
        `);
    }
});
