import { Router } from "express";
import { mapSpiders, getObjectKey, getKeyMiddleware } from "./shared/shared.js";
import { listObjects } from "../core/s3.js";

export const searchObjectRouter = Router();
const MAX_SPIDERS_PER_BOX = 1_000_000;

searchObjectRouter.use(getKeyMiddleware);

searchObjectRouter.get("/*", async (_req, res) => {
  const filter = _req.query.filter;
  const objects = (await listObjects(MAX_SPIDERS_PER_BOX)).Contents;
  const suffix = res.locals.key.length === 0 ? "/" : `/${res.locals.key}/`;
  const prefix = getObjectKey(res.locals.email, suffix);
  const spiders = await mapSpiders(objects, prefix, true);
  const searchResults = spiders.filter((object) => {
    return object.name.includes(filter??"");
  });
  res.status(200).send(searchResults);
});
