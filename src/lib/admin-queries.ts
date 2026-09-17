import { createServerFn } from "@tanstack/react-start";

export const adminGetResourceFn = createServerFn({ method: "POST" })
  .validator(
    (params: {
      table: string;
      orderBy?: string;
      ascending?: boolean;
      filter?: Record<string, any>;
    }) => params,
  )
  .handler(async ({ data: params }) => {
    const { getMongoDb } = await import("@/lib/db");
    const db = await getMongoDb();
    const sortField = params.orderBy || "created_at";
    const sortDir = params.ascending ? 1 : -1;
    const filter = params.filter || {};

    const docs = await db
      .collection(params.table)
      .find(filter)
      .sort({ [sortField]: sortDir })
      .limit(500)
      .toArray();

    return docs.map((d) => {
      const { _id, ...rest } = d;
      return {
        ...rest,
        id: (d.id || _id?.toString() || "") as string,
      };
    });
  });

export const adminSaveResourceFn = createServerFn({ method: "POST" })
  .validator(
    (params: {
      table: string;
      id?: string;
      data: Record<string, any>;
    }) => params,
  )
  .handler(async ({ data: params }) => {
    const { getMongoDb } = await import("@/lib/db");
    const db = await getMongoDb();
    const table = params.table;
    const incomingId = params.id || params.data.id;

    if (incomingId) {
      // Update
      const { id, _id, ...updatePayload } = params.data;
      updatePayload.updated_at = new Date().toISOString();

      await db
        .collection(table)
        .updateOne(
          { $or: [{ id: incomingId }, { _id: incomingId }] } as any,
          { $set: updatePayload },
          { upsert: true },
        );

      return { success: true, id: incomingId };
    } else {
      // Insert
      const newId = crypto.randomUUID();
      const newDoc = {
        ...params.data,
        id: newId,
        _id: newId,
        created_at: params.data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.collection(table).insertOne(newDoc as any);
      return { success: true, id: newId };
    }
  });

export const adminDeleteResourceFn = createServerFn({ method: "POST" })
  .validator((params: { table: string; id: string }) => params)
  .handler(async ({ data: params }) => {
    const { getMongoDb } = await import("@/lib/db");
    const db = await getMongoDb();
    await db.collection(params.table).deleteOne({
      $or: [{ id: params.id }, { _id: params.id }],
    } as any);
    return { success: true };
  });
