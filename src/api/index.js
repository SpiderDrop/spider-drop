import { Router } from "express";

export const apiRouter = Router();

apiRouter.get("/hello", (_, res) => {
  res.status(200).send("Whatup from API");
});
