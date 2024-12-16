import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';  // Importar o módulo CORS
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());  // Permitir requisições de origens externas
app.use(bodyParser.json());

app.post('/send-to-sheets', async (req, res) => {
  try {
    const { loja_id, descricao_atendimento } = req.body;

    if (!loja_id || !descricao_atendimento) {
      return res.status(400).send("Erro: Dados incompletos.");
    }

    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfztaAf2zBuETKrpNHM20pQeCvTPJN5dpFDq_iU8deBWj6UQvrXEol9KMC60DmZqS_/exec";

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loja_id: loja_id,
        descricao_atendimento: descricao_atendimento
      }),
    });

    const result = await response.text();
    res.status(200).send({ message: "Dados enviados com sucesso!", result });
  } catch (error) {
    console.error("Erro ao enviar dados:", error);
    res.status(500).send("Erro ao processar os dados.");
  }
});
app.get('/', (req, res) => {
  res.send('Servidor funcionando! 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


