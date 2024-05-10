import { Router } from "express";
import { deleteObject, putObject, getSignedUrl } from "../core/s3.js";
import { getKeyMiddleware, getObjectKey } from "./_shared.js";
import { getSpiderShareList, insertSpiderSharedWith, isInSpiderShareList, revokeAllSpiderSharedList } from "./db/shared-spiders.js";
import { withTransaction } from "../core/db.js";
import { sendSpiderShared } from "./emails/senders.js";

export const spidersRouter = Router();
spidersRouter.use(getKeyMiddleware);

spidersRouter.get("/preview-url/*", async (req, res) => {
  const key = res.locals.key.replace("preview-url/", "");
  const sharedSpiderKey = encodeURI(req.query.spiderKey);

  let spiderAbsoluteKey;
  if (req.query.spiderKey) {
    if (await isInSpiderShareList(sharedSpiderKey, res.locals.email)) {
      spiderAbsoluteKey = sharedSpiderKey;
    } else {
      res.status(403).json({
        message:
          "Cannot get preview url for a spider you do not have access to.",
      });
    }
  } else if (key.length === 0) {
    res.status(400).json({
      message: "Cannot get preview url for an unnamed spider.",
    });
  } else {
    spiderAbsoluteKey = getObjectKey(res.locals.email, `/${key}`);
  }

  if (spiderAbsoluteKey) {
    const url = await getSignedUrl(
      spiderAbsoluteKey,
      parseInt(process.env.PREVIEW_URL_LIFETIME_SECONDS)
    );
    res.status(200).json({ url });
  }
});

spidersRouter.get("/share-list/*", async (req, res) => {
  const key = res.locals.key.replace("share-list/", "");
  const absoluteKey = getObjectKey(res.locals.email, `/${key}`);

  return res
    .status(200)
    .json((await getSpiderShareList(absoluteKey)).map((el) => el.shared_with));
});

spidersRouter.put("/share-list/*", async (req, res) => {
  const key = res.locals.key.replace("share-list/", "");
  if (key.length === 0) {
    res.status(400).json({
      message: "Cannot share an unnamed spider.",
    });
  } else {
    const absoluteKey = getObjectKey(res.locals.email, `/${key}`);
    const shareList = await req.body;

    await withTransaction(async (tx) => {
      await revokeAllSpiderSharedList(tx, absoluteKey);

      for (const email of shareList) {
        await insertSpiderSharedWith(tx, absoluteKey, email);
        sendSpiderShared(email, absoluteKey, res.locals.email);
      }

      res.status(200).json(shareList);
    });
  }
});

spidersRouter.put("/*", async (req, res) => {
  if (res.locals.key.length === 0) {
    res.status(400).json({ message: "Cannot create an unnamed spider." });
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

