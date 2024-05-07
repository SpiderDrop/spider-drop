export function getObjectKey(userEmail, suffix) {
  return `${process.env.AWS_BUCKET_PREFIX}${userEmail.toLowerCase()}${suffix}`;
}

export async function mapSpiders(objects, prefix, recursive = false) {
  console.log(prefix);
  console.log(objects);
  const filter = recursive
    ? (object) => object.Key.startsWith(prefix) && object.Key !== prefix
    : (object) => {
        const units = object.Key.replace(prefix, "").split("/");
        return (
          object.Key.startsWith(prefix) &&
          object.Key !== prefix &&
          (units.length === 1 || units[1] === "")
        );
      };

  return objects.filter(filter).map((object) => {
    return {
      ...object,
      // TODO: Specify correct value bases on user setting.
      sharing: false,
      path: object.Key.split("/")[2],
      isBox: object.Key.endsWith("/"),
    };
  });
}

export async function getKeyMiddleware(req, res, next) {
  res.locals.key = req.path.replace("/", "");
  next();
}
