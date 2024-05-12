import { Router } from "express";
import { getSpiderShareList, insertSpiderSharedWith, isInSpiderShareList, revokeAllSpiderSharedList } from "./db/shared-spiders.js";
import { withTransaction } from "../core/db.js";
import { sendSpiderShared } from "./emails/senders.js";
import { deleteObject, getSignedDownloadUrl, listObjects, getSignedUploadUrl } from "../core/s3.js";
import { delay, getKeyMiddleware, getObjectKey, MAX_SPIDERS_PER_BOX, ONE_SECOND_IN_MILLIS } from "./shared/shared.js";

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
    const url = await getSignedDownloadUrl(
      spiderAbsoluteKey,
      parseInt(process.env.PREVIEW_URL_LIFETIME_SECONDS)
    );
    res.status(200).json({ url });
  }
});

spidersRouter.get("/upload-url/*", async (req, res) => {
  const key = res.locals.key.replace("upload-url/", "");

  if (key.length === 0) {
    res.status(400).json({ message: "Cannot create an unnamed spider." });
  } else {
    const newObjectKey = getObjectKey(res.locals.email, `/${key}`);

    const url = await getSignedUploadUrl(
      newObjectKey,
      parseInt(process.env.UPLOAD_URL_LIFETIME_SECONDS || 180)
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

spidersRouter.delete("/*", async (_req, res) => {
  if (res.locals.key.length === 0) {
    res.status(400).json({ message: "Cannot delete an unnamed spider." });
  } else {
    const objectKey = getObjectKey(res.locals.email, `/${res.locals.key}`);
    await deleteObject(objectKey);

    // It may take a second or 2 for the object to no longer show up in the listing of objects.
    let objects = (await listObjects(MAX_SPIDERS_PER_BOX)).Contents;
    while (objects.some((obj) => obj.Key === objectKey)) {
      await delay(ONE_SECOND_IN_MILLIS);
      objects = (await listObjects(MAX_SPIDERS_PER_BOX)).Contents;
    }

    res.status(200).send();
  }
});

