import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "Faltou URL" });
        }
        console.log("📥 Recebida URL:", url);
        // Gerar token automaticamente
        const base64Creds = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
        const jsonCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        let credentials;
        if (base64Creds) {
            console.log("🔑 Usando credenciais BASE64");
            const decoded = Buffer.from(base64Creds, "base64").toString("utf8");
            credentials = JSON.parse(decoded);
        }
        else if (jsonCreds) {
            console.log("🔑 Usando credenciais JSON");
            credentials = JSON.parse(jsonCreds);
        }
        else {
            console.log("❌ Nenhuma credencial encontrada");
            return res.status(500).json({
                error: "Credenciais ausentes no servidor",
            });
        }
        console.log("🔄 Gerando access token...");
        const auth = new GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/devstorage.read_only"],
        });
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;
        if (!accessToken) {
            console.log("❌ Falha ao gerar token");
            return res
                .status(401)
                .json({ error: "Não foi possível obter access token" });
        }
        console.log("✅ Token gerado com sucesso");
        // Fazer fetch da imagem
        console.log("🌐 Fazendo fetch da URL:", url);
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "User-Agent": "Node.js-Server",
            },
        });
        console.log("📊 Status da resposta:", response.status, response.statusText);
        if (!response.ok) {
            return res.status(response.status).json({
                error: `Erro ao acessar bucket: ${response.status} ${response.statusText}`,
            });
        }
        // Obter a imagem
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log("✅ Imagem baixada - Tamanho:", buffer.length, "bytes");
        // Enviar a imagem
        res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
        res.setHeader("Content-Length", buffer.length.toString());
        res.setHeader("Cache-Control", "public, max-age=3600"); // Cache de 1 hora
        console.log("🚀 Enviando imagem para o cliente...");
        res.status(200).send(buffer);
    }
    catch (err) {
        console.error("❌ Erro no fetch:", err);
        res.status(500).json({
            error: "Erro interno no servidor",
            details: err.message,
        });
    }
}
