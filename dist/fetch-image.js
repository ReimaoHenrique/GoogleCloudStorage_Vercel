import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    try {
        const { url, token } = req.body;
        if (!url) {
            return res.status(400).json({ error: "Faltou URL" });
        }
        let accessToken = token ?? null;
        if (!accessToken) {
            const base64Creds = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
            const jsonCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
            let credentials;
            if (base64Creds) {
                try {
                    const decoded = Buffer.from(base64Creds, "base64").toString("utf8");
                    credentials = JSON.parse(decoded);
                }
                catch {
                    return res
                        .status(500)
                        .json({ error: "Credenciais BASE64 inválidas" });
                }
            }
            else if (jsonCreds) {
                try {
                    credentials = JSON.parse(jsonCreds);
                }
                catch {
                    return res.status(500).json({ error: "Credenciais JSON inválidas" });
                }
            }
            else {
                return res.status(500).json({
                    error: "Credenciais ausentes. Defina GOOGLE_APPLICATION_CREDENTIALS_BASE64 ou GOOGLE_APPLICATION_CREDENTIALS_JSON",
                });
            }
            const auth = new GoogleAuth({
                credentials,
                scopes: ["https://www.googleapis.com/auth/devstorage.read_only"],
            });
            const client = await auth.getClient();
            const fetched = await client.getAccessToken();
            accessToken =
                typeof fetched === "string" ? fetched : fetched?.token ?? null;
            if (!accessToken) {
                return res
                    .status(401)
                    .json({ error: "Não foi possível obter access token (ADC)" });
            }
        }
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
            return res.status(response.status).json({
                error: `Erro ao acessar bucket: ${response.statusText}`,
            });
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
        res.setHeader("Content-Length", buffer.length.toString());
        res.status(200).send(buffer);
    }
    catch (err) {
        console.error("Erro no fetch:", err);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
}
