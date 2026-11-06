import { getDatabase, getRuntimeEnv } from "../lib/compat";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  const env = getRuntimeEnv();
  if (env.DB && typeof env.DB.prepare === "function") {
    return drizzle(env.DB, { schema });
  }

  return drizzle(getDatabase(), { schema });
}
