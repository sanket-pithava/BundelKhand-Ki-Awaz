import { createRequire } from "node:module";
if (typeof (globalThis as any).require === "undefined") {
  try {
    (globalThis as any).require = createRequire(import.meta.url);
  } catch (e) {
    // Ignore in non-Node environments
  }
}

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (
    request: Request,
    env: unknown,
    ctx: unknown,
  ) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) =>
        (m as { default?: ServerEntry }).default ??
        (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(
  body: string,
  responseStatus: number,
): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(
    consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`),
  );
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // 1. Serve dynamic images from MongoDB
      if (url.pathname.startsWith("/api/media/")) {
        try {
          const fullId = decodeURIComponent(url.pathname.replace("/api/media/", ""));
          const id = fullId.split(".")[0];
          const { getMongoDb } = await import("@/lib/db");
          const db = await getMongoDb();
          const doc = await db.collection("media").findOne({
            $or: [{ _id: id }, { _id: fullId }, { filename: fullId }, { filename: id }]
          } as any);

          if (!doc || !doc.data) {
            return new Response("Media Not Found", { status: 404 });
          }

          const buffer = doc.data.buffer ? doc.data.buffer : doc.data;
          return new Response(buffer, {
            status: 200,
            headers: {
              "Content-Type": doc.contentType || "image/jpeg",
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (mediaErr) {
          console.error("❌ Error serving media from MongoDB:", mediaErr);
          return new Response("Internal Server Error", { status: 500 });
        }
      }

      // 2. Handle image uploads directly to MongoDB
      if (url.pathname === "/api/upload" && request.method === "POST") {
        try {
          const formData = await request.formData();
          const file = formData.get("file") as File | null;
          if (!file) {
            return new Response(JSON.stringify({ error: "No file provided" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const originalName = file.name || "image.jpg";
          const ext = originalName.split(".").pop() || "jpg";
          const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const fullFileName = `${id}.${ext}`;

          const { getMongoDb } = await import("@/lib/db");
          const db = await getMongoDb();
          await db.collection("media").insertOne({
            _id: id,
            filename: fullFileName,
            originalName,
            contentType: file.type || `image/${ext}`,
            data: buffer,
            size: buffer.length,
            created_at: new Date(),
          } as any);

          console.log(`✅ Uploaded media to MongoDB: ${fullFileName} (${buffer.length} bytes)`);

          return new Response(
            JSON.stringify({ url: `/api/media/${fullFileName}` }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (uploadErr: any) {
          console.error("❌ Upload error in /api/upload:", uploadErr);
          return new Response(
            JSON.stringify({ error: uploadErr.message || "Upload failed" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      // 3. Fallthrough to TanStack Start SSR
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
