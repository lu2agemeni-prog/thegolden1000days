import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/mock-db';

export { isSupabaseConfigured };

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isSupabaseConfigured() && url && key) {
    return createBrowserClient(url, key);
  }

  // Fallback in-memory / API mock client
  return createBrowserMockClient();
}

function createBrowserMockClient() {
  return {
    auth: {
      async getUser() {
        return {
          data: {
            user: {
              id: 'c0000000-0000-0000-0000-000000000001',
              email: 'admin@health.gov.eg',
            },
          },
          error: null,
        };
      },
      async signInWithPassword({ email, password }: { email: string; password?: string }) {
        const res = await fetch('/api/mock-db/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'signin', email, password }),
        });
        const data = await res.json();
        return data;
      },
      async signUp({ email, password }: { email: string; password?: string }) {
        const res = await fetch('/api/mock-db/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'signup', email, password }),
        });
        const data = await res.json();
        return data;
      },
      async signOut() {
        await fetch('/api/mock-db/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'signout' }),
        });
        return { error: null };
      },
      async exchangeCodeForSession(_code: string) {
        return { data: {}, error: null };
      },
    },

    from(table: string) {
      return new ClientQueryBuilder(table);
    },
  };
}

class ClientQueryBuilder implements PromiseLike<{ data: any; error: any }> {
  private table: string;
  private method: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: any;
  private filters: Array<{ type: string; col?: string; val?: any; raw?: string }> = [];
  private orderConfig?: { col: string; ascending?: boolean };
  private limitCount?: number;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private selectCols: string = '*';

  constructor(table: string) {
    this.table = table;
  }

  select(cols: string = '*') {
    this.selectCols = cols;
    return this;
  }

  insert(payload: any) {
    this.method = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.method = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.method = 'delete';
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ type: 'eq', col, val });
    return this;
  }

  or(raw: string) {
    this.filters.push({ type: 'or', raw });
    return this;
  }

  ilike(col: string, val: string) {
    this.filters.push({ type: 'ilike', col, val });
    return this;
  }

  gte(col: string, val: any) {
    this.filters.push({ type: 'gte', col, val });
    return this;
  }

  lte(col: string, val: any) {
    this.filters.push({ type: 'lte', col, val });
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderConfig = { col, ascending: options?.ascending ?? true };
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      const res = await fetch('/api/mock-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: this.table,
          method: this.method,
          payload: this.payload,
          filters: this.filters,
          order: this.orderConfig,
          limit: this.limitCount,
          single: this.isSingle,
          maybeSingle: this.isMaybeSingle,
          selectCols: this.selectCols,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}
