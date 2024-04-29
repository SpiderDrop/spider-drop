import express from "express";
import { apiRouter } from "./api/index.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use("/api", apiRouter);
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
