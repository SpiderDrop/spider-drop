import { Router } from "express";
import { deleteObject, putObject, getSignedUrl } from "../core/s3.js";
import { getKeyMiddleware, getObjectKey } from "./_shared.js";

export const spidersRouter = Router();
spidersRouter.use(getKeyMiddleware);

spidersRouter.get("/preview-url/*", async (_req, res) => {
  const key = res.locals.key.replace("preview-url/", "");
  if (key.length === 0) {
    res.status(400).json({
      message: "Cannot get preview url for an unnamed spider.",
    });
  } else {
    const url = await getSignedUrl(
      getObjectKey(res.locals.email, `/${key}`),
      parseInt(process.env.PREVIEW_URL_LIFETIME_SECONDS)
    );
    res.status(200).json({ url });
  }
});

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
