export type RuntimeEnv = Record<string, any>;

function getGlobalRuntimeEnv(): RuntimeEnv {
  const globalScope = globalThis as any;
  if (globalScope?.env && typeof globalScope.env === "object") {
    return globalScope.env as RuntimeEnv;
  }

  if (typeof process !== "undefined" && process.env) {
    return process.env as RuntimeEnv;
  }

  return {} as RuntimeEnv;
}

export function getRuntimeEnv(): RuntimeEnv {
  return getGlobalRuntimeEnv();
}

export type PreparedStatementLike = {
  bind(...args: any[]): PreparedStatementLike;
  all<T = any>(): Promise<{ results: T[] }>;
  first<T = any>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
};

export type DatabaseLike = {
  prepare(sql: string): PreparedStatementLike;
};

type StoredRow = Record<string, any>;

type MemoryStore = {
  projects: Map<string, StoredRow>;
  inquiries: Map<string, StoredRow>;
  rateLimits: Map<string, { key: string; count: number; expires: number }>;
  uploads: Map<string, Uint8Array>;
  uploadMeta: Map<string, { contentType?: string }>;
};

function getMemoryStore(): MemoryStore {
  const globalScope = globalThis as any;
  if (!globalScope.__portfolio_memory_store) {
    globalScope.__portfolio_memory_store = {
      projects: new Map<string, StoredRow>(),
      inquiries: new Map<string, StoredRow>(),
      rateLimits: new Map<string, { key: string; count: number; expires: number }>(),
      uploads: new Map<string, Uint8Array>(),
      uploadMeta: new Map<string, { contentType?: string }>(),
    } satisfies MemoryStore;
  }

  return globalScope.__portfolio_memory_store as MemoryStore;
}

class MemoryPreparedStatement implements PreparedStatementLike {
  private params: any[] = [];

  constructor(
    private readonly sql: string,
    private readonly store: MemoryStore,
  ) {}

  bind(...args: any[]): PreparedStatementLike {
    this.params = args;
    return this;
  }

  async all<T = any>(): Promise<{ results: T[] }> {
    return { results: (await this.executeSelect()) as T[] };
  }

  async first<T = any>(): Promise<T | null> {
    if (this.sql.includes("INSERT INTO rate_limits") && this.sql.includes("RETURNING count")) {
      const key = String(this.params[0]);
      await this.executeMutation();
      return ({ count: this.store.rateLimits.get(key)?.count ?? 0 } as T);
    }

    const rows = await this.executeSelect();
    return (rows[0] as T) ?? null;
  }

  async run(): Promise<{ success: boolean }> {
    await this.executeMutation();
    return { success: true };
  }

  private async executeSelect(): Promise<StoredRow[]> {
    const sql = this.sql.trim();

    if (sql.startsWith("SELECT data FROM projects")) {
      return [...this.store.projects.values()].map((row) => ({ data: row.data }));
    }

    if (sql.startsWith("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 500")) {
      return [...this.store.inquiries.values()].sort((a, b) => Number(b.created_at ?? 0) - Number(a.created_at ?? 0)).slice(0, 500);
    }

    if (sql.startsWith("SELECT COUNT(*) AS n FROM inquiries WHERE email=? AND created_at>?")) {
      const email = String(this.params[0] ?? "");
      const cutoff = Number(this.params[1] ?? 0);
      const n = [...this.store.inquiries.values()].filter((row) => row.email === email && Number(row.created_at ?? 0) > cutoff).length;
      return [{ n }];
    }

    return [];
  }

  private async executeMutation(): Promise<void> {
    const sql = this.sql.trim();

    if (sql.includes("INSERT INTO projects")) {
      const [id, data, updatedAt] = this.params as [string, string, number];
      this.store.projects.set(id, { id, data, updated_at: updatedAt });
      return;
    }

    if (sql.includes("INSERT INTO inquiries")) {
      const [id, name, email, service, message, status, createdAt] = this.params as [
        string,
        string,
        string,
        string,
        string,
        string,
        number,
      ];
      this.store.inquiries.set(id, {
        id,
        name,
        email,
        service,
        message,
        status,
        created_at: createdAt,
      });
      return;
    }

    if (sql.includes("UPDATE inquiries SET status")) {
      const [status, id] = this.params as [string, string];
      const row = this.store.inquiries.get(id);
      if (row) {
        row.status = status;
        this.store.inquiries.set(id, row);
      }
      return;
    }

    if (sql.includes("INSERT INTO rate_limits")) {
      const [key, expires] = this.params as [string, number];
      const next = this.store.rateLimits.get(key) ?? { key, count: 0, expires: 0 };
      next.count += 1;
      next.expires = Number(expires);
      this.store.rateLimits.set(key, next);
      return;
    }

    if (sql.includes("DELETE FROM rate_limits WHERE expires <")) {
      const cutoff = Number(this.params[0] ?? 0);
      for (const [key, value] of this.store.rateLimits.entries()) {
        if (value.expires < cutoff) {
          this.store.rateLimits.delete(key);
        }
      }
    }
  }
}

class MemoryDatabase implements DatabaseLike {
  constructor(private readonly store: MemoryStore) {}

  prepare(sql: string): PreparedStatementLike {
    return new MemoryPreparedStatement(sql, this.store);
  }
}

export function getDatabase(): DatabaseLike {
  const runtimeEnv = getRuntimeEnv();
  const existingDb = runtimeEnv.DB;

  if (existingDb && typeof existingDb.prepare === "function") {
    return existingDb;
  }

  return new MemoryDatabase(getMemoryStore());
}

export function getBucket() {
  const runtimeEnv = getRuntimeEnv();
  const existingBucket = runtimeEnv.BUCKET;

  if (existingBucket && typeof existingBucket.put === "function" && typeof existingBucket.get === "function") {
    return existingBucket;
  }

  const store = getMemoryStore();

  return {
    async put(key: string, value: Uint8Array, options?: { httpMetadata?: { contentType?: string } }) {
      store.uploads.set(key, new Uint8Array(value));
      if (options?.httpMetadata?.contentType) {
        store.uploadMeta.set(key, { contentType: options.httpMetadata.contentType });
      }
    },
    async get(key: string) {
      const body = store.uploads.get(key);
      if (!body) {
        return null;
      }

      return {
        body,
        httpMetadata: store.uploadMeta.get(key) ?? {},
      };
    },
  };
}
