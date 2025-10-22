import fetch from "node-fetch";
import { Request, Response } from "express";

export default async function generateToken(req: Request, res: Response) {
  // pega as variáveis de ambiente corretas
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } =
    process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return res.status(400).json({ error: "Variáveis de ambiente faltando" });
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: GOOGLE_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = (await response.json()) as {
      access_token: string;
      expires_in: number;
      token_type: string;
    };

    if (!response.ok) {
      throw new Error(`Erro do Google: ${JSON.stringify(tokenData)}`);
    }

    // retorna só o access_token e expires_in pro frontend
    res.status(200).json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
    });
  } catch (err: any) {
    console.error("Erro ao gerar token:", err);
    res.status(500).json({ error: err.message });
  }
}
