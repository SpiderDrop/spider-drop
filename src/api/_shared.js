export function getObjectKey(userEmail, suffix) {
  return `${process.env.AWS_BUCKET_PREFIX}${userEmail.toLowerCase()}${suffix}`;
}

export async function mapSpiders(objects, prefix, recursive = false) {
  const filter = recursive
    ? object => object.Key.startsWith(prefix) && object.Key !== prefix
    : object => {
        const units = object.Key.replace(prefix, "").split("/");
        return (
          object.Key.startsWith(prefix) &&
          object.Key !== prefix &&
          (units.length === 1 || units[1] === "")
        );
      };

  return objects.filter(filter).map(object => {
    const pathUnits = object.Key.split("/");
    return {
      ...object,
      // TODO: Specify correct value bases on user setting.
      sharing: false,
      immediateKey: pathUnits[pathUnits.length - 2],
      name: decodeURI(pathUnits.filter((unit) => unit.length > 0).pop()),
      path: pathUnits.slice(2, pathUnits.length).join("/"),
      isBox: object.Key.endsWith("/")
    };
  });
}

export async function getKeyMiddleware(req, res, next) {
  res.locals.key = req.path.replace("/", "");
  next();
}
