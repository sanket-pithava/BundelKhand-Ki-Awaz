import { createServerFn } from "@tanstack/react-start";
import { getMongoDb } from "@/lib/db";
import crypto from "node:crypto";

// 1. Generic Get Resource
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

    return docs.map((d: any) => {
      const { _id, ...rest } = d;
      return {
        ...rest,
        id: (d.id || _id?.toString() || "") as string,
      };
    });
  });

// 2. Generic Save Resource (Insert or Update)
export const adminSaveResourceFn = createServerFn({ method: "POST" })
  .validator(
    (params: {
      table: string;
      id?: string;
      data: Record<string, any>;
    }) => params,
  )
  .handler(async ({ data: params }) => {
    const db = await getMongoDb();
    const table = params.table;
    const incomingId = params.id || params.data.id;

    if (incomingId) {
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

// 3. Generic Delete Resource
export const adminDeleteResourceFn = createServerFn({ method: "POST" })
  .validator((params: { table: string; id: string }) => params)
  .handler(async ({ data: params }) => {
    const db = await getMongoDb();
    await db.collection(params.table).deleteOne({
      $or: [{ id: params.id }, { _id: params.id }],
    } as any);
    return { success: true };
  });

// 4. Selectors Data for EditDrawer and Forms
export const adminGetSelectorsDataFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const db = await getMongoDb();
    const [categories, districts, subDistricts, publishedArticles] = await Promise.all([
      db.collection("categories").find({}).sort({ sort_order: 1, name: 1 }).toArray(),
      db.collection("districts").find({}).sort({ sort_order: 1, name: 1 }).toArray(),
      db.collection("sub_districts").find({}).sort({ name: 1 }).toArray(),
      db.collection("articles").find({ status: "published" }).sort({ publish_at: -1 }).limit(200).project({ id: 1, title: 1 }).toArray(),
    ]);

    return {
      categories: categories.map((c: any) => ({ id: c.id || c._id?.toString(), name: c.name, slug: c.slug })),
      districts: districts.map((d: any) => ({ id: d.id || d._id?.toString(), name: d.name, slug: d.slug })),
      subDistricts: subDistricts.map((s: any) => ({ id: s.id || s._id?.toString(), name: s.name, jila_id: s.jila_id })),
      articles: publishedArticles.map((a: any) => ({ id: a.id || a._id?.toString(), title: a.title })),
    };
  });

// 5. Article Manager: Full List with Placements
export const adminGetArticlesListFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const db = await getMongoDb();
    const [articles, hero, breaking, top10, categories, districts] = await Promise.all([
      db.collection("articles").find({}).sort({ created_at: -1 }).limit(300).toArray(),
      db.collection("homepage_hero").find({}).toArray(),
      db.collection("homepage_breaking").find({}).toArray(),
      db.collection("homepage_top10").find({}).toArray(),
      db.collection("categories").find({}).toArray(),
      db.collection("districts").find({}).toArray(),
    ]);

    const catMap = new Map(categories.map((c: any) => [c.id || c._id?.toString(), c.name]));
    const distMap = new Map(districts.map((d: any) => [d.id || d._id?.toString(), d.name]));
    const heroMap = new Map(hero.map((h: any) => [h.article_id, h.id || h._id?.toString()]));
    const breakingMap = new Map(breaking.map((b: any) => [b.article_id, b.id || b._id?.toString()]));
    const top10Map = new Map(top10.map((t: any) => [t.article_id, t.id || t._id?.toString()]));

    return articles.map((a: any) => {
      const artId = a.id || a._id?.toString();
      return {
        ...a,
        id: artId,
        category: a.category || catMap.get(a.category_id) || "Uncategorized",
        district: a.district || distMap.get(a.district_id) || null,
        hero: heroMap.has(artId) ? { id: heroMap.get(artId) } : null,
        breaking: breakingMap.has(artId) ? { id: breakingMap.get(artId) } : null,
        top10: top10Map.has(artId) ? { id: top10Map.get(artId) } : null,
      };
    });
  });

// 6. Toggle Placement for Article
export const adminToggleArticlePlacementFn = createServerFn({ method: "POST" })
  .validator((params: { table: string; articleId: string; placementId: string | null }) => params)
  .handler(async ({ data: params }) => {
    const db = await getMongoDb();
    if (params.placementId) {
      // Remove
      await db.collection(params.table).deleteOne({
        $or: [{ id: params.placementId }, { article_id: params.articleId }],
      } as any);
      return { action: "removed" };
    } else {
      // Add
      const minDoc = await db.collection(params.table).find({}).sort({ sort_order: 1 }).limit(1).toArray();
      const minSort = minDoc[0]?.sort_order ?? 0;
      const newId = crypto.randomUUID();
      await db.collection(params.table).insertOne({
        id: newId,
        _id: newId,
        article_id: params.articleId,
        sort_order: minSort - 1,
        created_at: new Date().toISOString(),
      } as any);
      return { action: "added", id: newId };
    }
  });

// 7. Placement Manager: Get Placements with Populated Articles
export const adminGetPlacementsFn = createServerFn({ method: "POST" })
  .validator((params: { table: string }) => params)
  .handler(async ({ data: params }) => {
    const db = await getMongoDb();
    const placements = await db.collection(params.table).find({}).sort({ sort_order: 1 }).toArray();
    const articleIds = placements.map((p: any) => p.article_id).filter(Boolean);

    const articles = await db.collection("articles").find({ id: { $in: articleIds } }).toArray();
    const artMap = new Map(articles.map((a: any) => [a.id, a]));

    return placements.map((p: any) => {
      const art = artMap.get(p.article_id);
      return {
        id: p.id || p._id?.toString(),
        sort_order: p.sort_order ?? 0,
        article_id: p.article_id,
        article: art
          ? {
            title: art.title,
            image_url: art.image_url || art.image,
            category: art.category,
            district: art.district,
          }
          : null,
      };
    });
  });

// 8. Placement Manager: Add Article
export const adminAddPlacementFn = createServerFn({ method: "POST" })
  .validator((params: { table: string; articleId: string }) => params)
  .handler(async ({ data: params }) => {
    const db = await getMongoDb();
    const existing = await db.collection(params.table).findOne({ article_id: params.articleId });
    if (existing) throw new Error("Article is already in this placement section");

    const maxDoc = await db.collection(params.table).find({}).sort({ sort_order: -1 }).limit(1).toArray();
    const maxSort = maxDoc[0]?.sort_order ?? 0;
    const newId = crypto.randomUUID();

    await db.collection(params.table).insertOne({
      id: newId,
      _id: newId,
      article_id: params.articleId,
      sort_order: maxSort + 1,
      created_at: new Date().toISOString(),
    } as any);

    return { success: true, id: newId };
  });

// 9. Pending News Manager: Get Pending Articles
export const adminGetPendingNewsFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const db = await getMongoDb();
    const articles = await db
      .collection("articles")
      .find({ approval_status: "Pending" })
      .sort({ created_at: -1 })
      .toArray();

    return articles.map((a: any) => ({
      ...a,
      id: a.id || a._id?.toString(),
    }));
  });

// 10. Pending News Manager: Approve or Reject
export const adminUpdateArticleApprovalFn = createServerFn({ method: "POST" })
  .validator((params: { id: string; action: "Approved" | "Rejected"; approvedBy?: string }) => params)
  .handler(async ({ data: params }) => {
    const db = await getMongoDb();
    const payload: Record<string, any> = {
      approval_status: params.action,
      approved_by: params.approvedBy || "admin",
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (params.action === "Approved") {
      payload.status = "published";
    } else {
      payload.status = "draft";
    }

    await db.collection("articles").updateOne(
      { $or: [{ id: params.id }, { _id: params.id }] } as any,
      { $set: payload },
    );

    return { success: true };
  });

// 11. Article Picker Modal: Search Articles
export const adminSearchArticlesForPickerFn = createServerFn({ method: "POST" })
  .validator((params: { search?: string; categoryId?: string; page: number; limit: number }) => params)
  .handler(async ({ data: params }) => {
    const db = await getMongoDb();
    const query: Record<string, any> = { status: "published" };

    if (params.search) {
      query.title = { $regex: params.search, $options: "i" };
    }
    if (params.categoryId) {
      query.category_id = params.categoryId;
    }

    const skip = params.page * params.limit;
    const docs = await db
      .collection("articles")
      .find(query)
      .sort({ publish_at: -1, created_at: -1 })
      .skip(skip)
      .limit(params.limit)
      .toArray();

    return docs.map((d: any) => ({
      id: d.id || d._id?.toString(),
      title: d.title,
      slug: d.slug,
      image_url: d.image_url || d.image || "",
      publish_at: d.publish_at || d.created_at || "",
      category: d.category ? { name: typeof d.category === "string" ? d.category : d.category.name } : null,
      district: d.district ? { name: typeof d.district === "string" ? d.district : d.district.name } : null,
    }));
  });

// 12. Save Uploaded Media to Static Files
export const saveMediaFileFn = createServerFn({ method: "POST" })
  .validator((params: { base64: string; filename?: string }) => params)
  .handler(async ({ data: params }) => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const crypto = await import("node:crypto");

    const match = params.base64.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) return { url: params.base64 };

    let ext = match[1].toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    const buffer = Buffer.from(match[2], "base64");
    const filename = `${params.filename || "upload-" + crypto.randomUUID()}.${ext}`;

    const dirs = [
      path.resolve("public", "uploads"),
      path.resolve("dist", "client", "uploads"),
      path.resolve("app", "dist", "client", "uploads"),
    ];

    for (const dir of dirs) {
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, filename), buffer);
      } catch (e) {}
    }

    return { url: `/uploads/${filename}` };
  });
