import { Router } from "express";
import { deleteObject, listObjects, putObject } from "../core/s3.js";
import { mapSpiders, getObjectKey, getKeyMiddleware, MAX_SPIDERS_PER_BOX } from "./_shared.js";

export const boxesRouter = Router();

boxesRouter.use(getKeyMiddleware);

boxesRouter.get("/*", async (_req, res) => {
  const objects = (await listObjects(MAX_SPIDERS_PER_BOX)).Contents;
  const suffix = res.locals.key.length === 0 ? "/" : `/${res.locals.key}/`;
  const prefix = getObjectKey(res.locals.email, suffix);
  res.status(200).send(await mapSpiders(objects, prefix));
});

boxesRouter.post("/*", async (_req, res) => {
  if (res.locals.key.length === 0) {
    res.status(400).json({ message: "Cannot create an unnamed box." });
  } else {
    await putObject(
      undefined,
      getObjectKey(res.locals.email, `/${res.locals.key}/`)
    );
    res.status(201).send();
  }
});

boxesRouter.delete("/*", async (_req, res) => {
  if (res.locals.key.length === 0) {
    res.status(400).json({ message: "Cannot delete an unnamed box." });
  } else {
    const prefix = getObjectKey(res.locals.email, `/${res.locals.key}/`);
    let objects = (await listObjects(MAX_SPIDERS_PER_BOX)).Contents;
    const allSpidersInBox = await mapSpiders(objects, prefix, true);

    // Delete spiders in folder
    for (const spider of allSpidersInBox) {
      await deleteObject(spider.Key);
    }

    // Delete the box
    await deleteObject(prefix);

    // It may take a second or 2 for the object to no longer show up in the listing of objects.
    objects = (await listObjects(MAX_SPIDERS_PER_BOX)).Contents;
    while (objects.some((obj) => obj.Key === prefix)) {
      await delay(ONE_SECOND_IN_MILLIS);
      objects = (await listObjects(MAX_SPIDERS_PER_BOX)).Contents;
    }

    res.status(200).send();
  }
});
