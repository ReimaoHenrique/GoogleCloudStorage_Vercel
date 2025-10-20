import "dotenv/config";
import express from "express";
import fetchImage from "./fetch-image.js";

const app = express();
app.use(express.json());

app.post("/api/fetch-image", (req, res) => fetchImage(req, res));

app.listen(3000, () => {
  console.log("Serverless emulado rodando em http://localhost:3000");
});
