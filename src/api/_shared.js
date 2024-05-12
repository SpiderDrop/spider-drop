import { listObjects } from "../core/s3.js";

export const ONE_SECOND_IN_MILLIS = 1_000;
export const MAX_SPIDERS_PER_BOX = 1_000_000;

export function getObjectKey(userEmail, suffix) {
  return `${process.env.AWS_BUCKET_PREFIX}${userEmail.toLowerCase()}${suffix}`;
}

const BoxOrSpiderIsNotRootDir = (boxOrSpider, rootDir) => {
  return boxOrSpider.Key.startsWith(rootDir) && boxOrSpider.Key !== rootDir;
};

export async function mapSpiders(objects, prefix, recursive = false) {
  const filter = recursive
    ? (object) => BoxOrSpiderIsNotRootDir(object, prefix)
    : (object) => {
        const units = object.Key.replace(prefix, "").split("/"); //List of boxes and spiders without root directory
        return (object) =>
          BoxOrSpiderIsNotRootDir(object, prefix) &&
          (units.length === 1 || units[1] === "");
      };

  const promises = objects.filter(filter).map(async (object) => {
    const pathUnits = object.Key.split("/");
    const isBox = object.Key.endsWith("/");
    if (isBox) {
      const objects = (await listObjects(MAX_SPIDERS_PER_BOX, object.Key)).Contents;
      const children = await mapSpiders(objects, object.Key);
      object.Size = children.length;
    } else {
      // Do nothing as size is already set in bytes for spiders.
    }

    return {
      ...object,
      // TODO: Specify correct value bases on user setting.
      sharing: false,
      immediateKey: pathUnits[pathUnits.length - 2],
      name: decodeURI(pathUnits.filter((unit) => unit.length > 0).pop()),
      path: pathUnits.slice(2, pathUnits.length).join("/"),
      isBox
    };
  });

  return Promise.allSettled(promises);
}

export async function getKeyMiddleware(req, res, next) {
  res.locals.key = req.path.replace("/", "");
  next();
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(x), ms));
}
