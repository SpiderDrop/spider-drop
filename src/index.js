import express from "express";
import { apiRouter } from "./api/index.js";
import { configRouter } from "./core/config.js";
import { auth, authRouter } from "./core/auth.js";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();
config();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/config.json", configRouter);

app.use("/api", auth);
app.use("/api", apiRouter);
app.use(express.static("src/public", { extensions: ["html"] }));

let publicPath = path.join(__dirname, "public");

app.get("/*", function(req, res) {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
