import { Router } from "express";
import { deleteObject, putObject } from "../core/s3.js";
import { getKeyMiddleware, getObjectKey } from "./_shared.js";

export const spidersRouter = Router();
spidersRouter.use(getKeyMiddleware);

spidersRouter.put("/*", async (req, res) => {
  if (res.locals.key.length === 0) {
    res.status(400).json({ message: "Cannot create an unnamed box." });
  } else {
    await putObject(
      req.body,
      getObjectKey(res.locals.email, `/${res.locals.key}`)
    );
    res.status(201).send();
  }
});

spidersRouter.delete("/*", async (_req, res) => {
  if (res.locals.key.length === 0) {
    res.status(400).json({ message: "Cannot delete an unnamed spider." });
  } else {
    await deleteObject(getObjectKey(res.locals.email, `/${res.locals.key}`));
    res.status(200).send();
  }
});
