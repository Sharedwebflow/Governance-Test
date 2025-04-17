
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool;
let db;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.warn("DATABASE_URL not set, using in-memory fallback");
  // Create mock implementations that return empty results
  db = {
    select: () => ({
      from: () => ({
        where: () => [],
        limit: () => [],
        orderBy: () => []
      })
    }),
    insert: () => ({
      values: () => ({
        returning: () => [{}],
        onConflictDoNothing: () => ({})
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => [{}]
        })
      })
    }),
    delete: () => ({
      where: () => ({})
    })
  } as any;
  pool = {} as any;
}

export { pool, db };
