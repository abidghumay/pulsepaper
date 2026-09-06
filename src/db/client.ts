import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DbClient {
  query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
  isPglite: boolean;
}

let activeClient: DbClient | null = null;

export async function getDbClient(): Promise<DbClient> {
  if (activeClient) {
    return activeClient;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    console.log('[Database] Connecting to PostgreSQL via DATABASE_URL...');
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false }
    });

    activeClient = {
      isPglite: false,
      query: async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
        const res = await pool.query(text, params);
        return {
          rows: res.rows as T[],
          rowCount: res.rowCount ?? res.rows.length
        };
      },
      exec: async (sql: string): Promise<void> => {
        await pool.query(sql);
      },
      close: async () => {
        await pool.end();
        activeClient = null;
      }
    };

    return activeClient;
  }

  // Fallback to embedded PGlite (pure WASM PostgreSQL)
  console.log('[Database] DATABASE_URL not specified; using embedded PGlite (persistent PostgreSQL WASM)...');
  const { PGlite } = await import('@electric-sql/pglite');
  const dataDir = path.resolve(process.cwd(), '.pgdata');
  const pglite = new PGlite(dataDir);

  activeClient = {
    isPglite: true,
    query: async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
      const res = await pglite.query(text, params);
      const rowCount = (res as any).affectedRows ?? (res as any).rowCount ?? res.rows.length;
      return {
        rows: res.rows as T[],
        rowCount
      };
    },
    exec: async (sql: string): Promise<void> => {
      await pglite.exec(sql);
    },
    close: async () => {
      await pglite.close();
      activeClient = null;
    }
  };

  return activeClient;
}
