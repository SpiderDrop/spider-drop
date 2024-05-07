import { Router } from "express";
import { spidersRouter } from "./spiders.js";
import { boxesRouter } from "./boxes.js";

export const apiRouter = Router();

apiRouter.use("/spiders", spidersRouter);
apiRouter.use("/boxes", boxesRouter);
