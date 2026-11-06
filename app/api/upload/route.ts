import { getBucket } from "../../../lib/compat";
import { isAdmin, json, sameOrigin } from "../../server";

export async function POST(r: Request) {
  if (!(await isAdmin()) || !sameOrigin(r)) return json({ error: "Not authorized" }, 403);
  if (Number(r.headers.get("content-length")) > 6_500_000) return json({ error: "Use an image smaller than 6 MB." }, 413);

  try {
    const data = await r.formData();
    const file = data.get("file");
    if (!(file instanceof File) || file.size > 6_000_000 || file.size < 12) {
      return json({ error: "Use a PNG, JPEG or WebP under 6 MB." }, 400);
    }

    const b = new Uint8Array(await file.arrayBuffer());
    const kind =
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
        ? "png"
        : b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
          ? "jpg"
          : String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP"
            ? "webp"
            : null;

    if (!kind) return json({ error: "This image format is not supported." }, 400);

    const bucket = getBucket();
    const key = `${crypto.randomUUID()}.${kind}`;
    await bucket.put(key, b, { httpMetadata: { contentType: kind === "jpg" ? "image/jpeg" : `image/${kind}` } });
    return json({ url: `/api/media/${key}` });
  } catch {
    return json({ error: "Image could not be uploaded." }, 500);
  }
}
