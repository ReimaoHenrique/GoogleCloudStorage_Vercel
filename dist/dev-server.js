import "dotenv/config";
import express from "express";
import generateToken from "./generate-token.js";
const app = express();
app.use(express.json());
app.post("/api/generate-token", (req, res) => generateToken(req, res));
app.listen(3000, () => {
    console.log("🚀 Serverless emulado rodando em http://localhost:3000");
});
