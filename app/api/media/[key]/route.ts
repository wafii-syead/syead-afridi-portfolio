import { getBucket } from "../../../../lib/compat";

export async function GET(_r: Request, c: { params: Promise<{ key: string }> }) {
  const { key } = await c.params;
  if (!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(key)) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = getBucket();
  const object = await bucket.get(key);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public,max-age=31536000,immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
