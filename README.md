## GCS Proxy (Serverless)

### Variáveis de ambiente (Vercel)

Defina UMA das opções abaixo nas Variáveis de Ambiente do projeto (Settings → Environment Variables):

- GOOGLE_APPLICATION_CREDENTIALS_BASE64: JSON da service account em Base64 (recomendado)
- GOOGLE_APPLICATION_CREDENTIALS_JSON: JSON da service account como string

Para gerar a versão Base64 a partir do arquivo JSON local:

```bash
base64 -w0 gcs-proxy-key.json > creds.b64
# copie o conteúdo de creds.b64 para a env GOOGLE_APPLICATION_CREDENTIALS_BASE64
```

Atenção ao campo private_key: mantenha as quebras de linha como \n quando usar a opção JSON em string.

### Execução local

Crie um arquivo .env (não comite) com uma das variáveis acima. O dev usa Express para emular serverless:

```bash
pnpm install
pnpm dev
# POST http://localhost:3000/api/fetch-image
```

### Exemplo de requisição

Endpoint: POST /api/fetch-image

Body JSON:

```json
{
  "url": "https://storage.googleapis.com/<bucket>/<objeto>",
  "token": null
}
```

- Se enviar "token", ele será usado direto (Bearer). Se não, o handler usa as credenciais do env para obter um access token via ADC.

Resposta: bytes do arquivo com os headers de conteúdo do GCS.

### Deploy na Vercel

- Suba o projeto e configure a env GOOGLE_APPLICATION_CREDENTIALS_BASE64 (ou JSON)
- A rota ficará em /api/fetch-image (Edge/Serverless function)

### Segurança

- Nunca comite arquivos de chave. Use somente envs. O .gitignore e .vercelignore já bloqueiam .env e json local.
