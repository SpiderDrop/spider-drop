import { db } from "../../core/db.js";

export async function revokeAllSpiderSharedList(tx, spiderKey) {
  const q = `
    UPDATE shared_spiders
    SET revoked_at=GETDATE()
    WHERE spider_key=@SpiderKey;
  `;

  const request = tx.request();
  return request
    .input("SpiderKey", spiderKey)
    .query(q);
}


export async function insertSpiderSharedWith(tx, spiderKey, sharedWith) {
  const q = `
    INSERT INTO shared_spiders(spider_key, shared_with)
    VALUES(@SpiderKey, LOWER(@SharedWith));
  `;

  const request = tx.request();
  return request
    .input("SpiderKey", spiderKey)
    .input("SharedWith", sharedWith)
    .query(q);
}

export async function getSpiderShareList(spiderKey) {
  const q = `
    SELECT shared_spider_id, shared_with
    FROM shared_spiders
    WHERE revoked_at IS NULL AND spider_key=@SpiderKey;
  `;

  const request = await db();
  const response = await request.input("SpiderKey", spiderKey).query(q);

  return response.recordset;
}

export async function isInSpiderShareList(spiderKey, email) {
  const q = `
    SELECT 1 FROM shared_spiders
    WHERE spider_key=@SpiderKey AND shared_with=LOWER(@Email) AND revoked_at IS NULL;
  `;

  const request = await db();
  const response = await request
    .input("SpiderKey", spiderKey)
    .input("Email", email)
    .query(q);

  return response.recordset.length > 0;
}
