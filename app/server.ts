import { getDatabase, getRuntimeEnv } from "../lib/compat";
import { getChatGPTUser } from "./chatgpt-auth";
import { defaultProjects, type Project } from "./data";
import { z } from "zod";

const runtimeEnv = getRuntimeEnv();

export function database() {
  return getDatabase();
}

export async function isAdmin() {
  const u = await getChatGPTUser();
  const adminEmail = String(runtimeEnv.ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "");
  return !!u && !!adminEmail && u.email.toLowerCase() === adminEmail.toLowerCase();
}

export function sameOrigin(r: Request) {
  const o = r.headers.get("origin");
  return !!o && o === new URL(r.url).origin;
}

export const projectSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/),
  title: z.string().trim().min(1).max(100),
  category: z.enum(["Websites", "Branding", "Graphics", "Motion"]),
  subtitle: z.string().trim().max(150),
  description: z.string().trim().min(1).max(3000),
  contribution: z.string().trim().max(200),
  url: z.string().url().startsWith("https://").max(2000),
  image: z.string().max(2000).refine(
    (v) => !v || /^\/(assets|api\/media)\/[a-zA-Z0-9_./-]+$/.test(v) || /^https:\/\//.test(v),
    "Use an HTTPS image URL or upload an image.",
  ),
  color: z.string().regex(/^#[a-fA-F0-9]{6}$/),
  featured: z.boolean(),
  published: z.boolean(),
  order: z.number().int().min(0).max(10000),
});

export async function readProjects(includeHidden = false): Promise<Project[]> {
  const rows = await database().prepare("SELECT data FROM projects").all<{ data: string }>();
  const map = new Map(defaultProjects.map((p) => [p.id, p]));
  for (const row of rows.results) {
    const p = JSON.parse(row.data) as Project;
    map.set(p.id, p);
  }
  return [...map.values()].filter((p) => includeHidden || p.published).sort((a, b) => a.order - b.order);
}

export const noStore = { "Cache-Control": "no-store" };

export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: noStore });
}
