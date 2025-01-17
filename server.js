const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");

const app = express();

// Configurar o body-parser para processar JSON
app.use(bodyParser.json());

// Configurar a autenticação com o Google
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json", // Certifique-se de que o arquivo está na pasta do projeto
  scopes: ["https://www.googleapis.com/auth/spreadsheets"], // Permissão para acessar o Google Sheets
});

const sheets = google.sheets({ version: "v4", auth });

// ID da planilha (substitua pelo ID correto da sua planilha)
const SPREADSHEET_ID = "1LnuZSS55zNOaRVrQggbAJQ1G-epN0TbZzR7i4iEoTVo";

// Rota principal
app.get("/", (req, res) => {
  res.send("Servidor está funcionando!");
});

// Rota para registrar o atendimento no Google Sheets
app.post("/registrar", async (req, res) => {
  const { idLoja, descricaoAtendimento } = req.body;

  // Verificar se os dados obrigatórios foram enviados
  if (!idLoja || !descricaoAtendimento) {
    return res.status(400).send("ID da loja e descrição do atendimento são obrigatórios.");
  }

  try {
    // Registrar os dados no Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "A1", // Insere os dados a partir da célula A1
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [new Date().toISOString(), idLoja, descricaoAtendimento], // Horário/Data, ID da Loja, Descrição
        ],
      },
    });

    res.send({
      mensagem: "Registro adicionado com sucesso!",
      dadosRegistrados: {
        horario: new Date().toISOString(),
        idLoja,
        descricaoAtendimento,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar no Google Sheets:", error);
    res.status(500).send("Erro ao registrar no Google Sheets.");
  }
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});