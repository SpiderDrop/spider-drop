import express from "express";
import { apiRouter } from "./api/index.js";
import { configRouter } from "./core/config.js";
import { auth, authRouter } from "./core/auth.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/config.json", configRouter);

app.use("/api", auth);
app.use("/api", apiRouter);
app.use(express.static("public", { extensions: ["html"] }));

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
