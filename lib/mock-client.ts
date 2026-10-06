import { mockDb } from './mock-db';

interface QueryFilter {
  type: 'eq' | 'or' | 'ilike' | 'gte' | 'lte';
  col?: string;
  val?: any;
  raw?: string;
}

function normalizeText(str: any): string {
  return String(str || '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase();
}

export function createMockClient(options?: { user?: any }) {
  const defaultAdmin = mockDb.getCounselors(true).find((c) => c.is_admin && c.is_active) || mockDb.getCounselors(true)[0];
  const currentUser = options?.user ?? {
    id: defaultAdmin.user_id || defaultAdmin.id,
    email: defaultAdmin.email || 'admin@health.gov.eg',
  };

  return {
    auth: {
      async getUser() {
        return { data: { user: currentUser }, error: null };
      },
      async signInWithPassword({ email }: { email: string; password?: string }) {
        const counselor = mockDb.getCounselors(true).find((c) => c.email === email) || defaultAdmin;
        return {
          data: {
            user: { id: counselor.user_id || counselor.id, email: counselor.email || email },
            session: { access_token: 'mock-token' },
          },
          error: null,
        };
      },
      async signUp({ email }: { email: string; password?: string }) {
        return {
          data: {
            user: { id: crypto.randomUUID(), email },
            session: null,
          },
          error: null,
        };
      },
      async signOut() {
        return { error: null };
      },
      async exchangeCodeForSession(_code: string) {
        return { data: {}, error: null };
      },
    },

    from(tableName: string) {
      return new MockTableQuery(tableName);
    },
  };
}

class MockTableQuery implements PromiseLike<{ data: any; error: any; count?: number | null }> {
  private tableName: string;
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private selectedCols: string = '*';
  private selectOptions?: { count?: string; head?: boolean };
  private filters: QueryFilter[] = [];
  private orderCol?: string;
  private orderAsc: boolean = true;
  private limitCount?: number;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private mutationPayload: any;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = '*', options?: { count?: string; head?: boolean }) {
    this.selectedCols = columns;
    this.selectOptions = options;
    return this;
  }

  insert(payload: any) {
    this.action = 'insert';
    this.mutationPayload = payload;
    return this;
  }

  update(payload: any) {
    this.action = 'update';
    this.mutationPayload = payload;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ type: 'eq', col, val });
    return this;
  }

  or(rawCondition: string) {
    this.filters.push({ type: 'or', raw: rawCondition });
    return this;
  }

  ilike(col: string, pattern: string) {
    this.filters.push({ type: 'ilike', col, val: pattern });
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

  order(col: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.orderCol = col;
    this.orderAsc = options?.ascending ?? true;
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

  // Execute query and resolve promise
  private async execute(): Promise<{ data: any; error: any; count?: number | null }> {
    try {
      if (this.action === 'insert') {
        let insertedItem: any;
        if (this.tableName === 'clients') {
          insertedItem = mockDb.upsertClient(this.mutationPayload);
        } else if (this.tableName === 'visits') {
          insertedItem = mockDb.createVisit(this.mutationPayload);
        } else if (this.tableName === 'counselors') {
          insertedItem = mockDb.createCounselor(this.mutationPayload);
        } else {
          insertedItem = { id: crypto.randomUUID(), ...this.mutationPayload };
        }
        return { data: insertedItem, error: null };
      }

      if (this.action === 'update') {
        const idFilter = this.filters.find((f) => f.type === 'eq' && f.col === 'id');
        const id = idFilter?.val;
        let updatedItem: any;
        if (this.tableName === 'clients' && id) {
          const client = mockDb.getClient(id);
          if (client) Object.assign(client, this.mutationPayload, { updated_at: new Date().toISOString() });
          updatedItem = client;
        } else if (this.tableName === 'visits' && id) {
          updatedItem = mockDb.updateVisit(id, this.mutationPayload);
        } else if (this.tableName === 'counselors' && id) {
          updatedItem = mockDb.updateCounselor(id, this.mutationPayload);
        }
        return { data: updatedItem, error: null };
      }

      if (this.action === 'delete') {
        const idFilter = this.filters.find((f) => f.type === 'eq' && f.col === 'id');
        const id = idFilter?.val;
        if (id) {
          if (this.tableName === 'visits') mockDb.deleteVisit(id);
          else if (this.tableName === 'counselors') mockDb.deleteCounselor(id);
        }
        return { data: null, error: null };
      }

      // SELECT
      let rows: any[] = [];
      if (this.tableName === 'counselors') {
        rows = [...mockDb.getCounselors(true)];
      } else if (this.tableName === 'clients') {
        rows = [...mockDb.getClients()];
      } else if (this.tableName === 'visits') {
        rows = mockDb.getVisits().map((v) => {
          const client = mockDb.getClient(v.client_id);
          const counselor = v.counselor_id ? mockDb.getCounselor(v.counselor_id) : null;
          return {
            ...v,
            client,
            counselor,
          };
        });
      }

      // Apply filters
      for (const filter of this.filters) {
        if (filter.type === 'eq') {
          rows = rows.filter((r) => r[filter.col!] === filter.val);
        } else if (filter.type === 'gte') {
          rows = rows.filter((r) => r[filter.col!] >= filter.val);
        } else if (filter.type === 'lte') {
          rows = rows.filter((r) => r[filter.col!] <= filter.val);
        } else if (filter.type === 'ilike') {
          const raw = String(filter.val || '');
          const term = raw.startsWith('%') && raw.endsWith('%') ? raw.slice(1, -1) : raw.replace(/^%|%$/g, '');
          const cleanVal = normalizeText(term);
          rows = rows.filter((r) =>
            normalizeText(r[filter.col!]).includes(cleanVal)
          );
        } else if (filter.type === 'or' && filter.raw) {
          // e.g. "national_id.ilike.%123%,phone.ilike.%123%"
          const parts = filter.raw.split(',');
          rows = rows.filter((r) => {
            return parts.some((p) => {
              const [col, op, pat] = p.split('.');
              if (op === 'ilike' && pat) {
                const term = pat.startsWith('%') && pat.endsWith('%') ? pat.slice(1, -1) : pat.replace(/^%|%$/g, '');
                const cleanVal = normalizeText(term);
                return normalizeText(r[col]).includes(cleanVal);
              }
              return false;
            });
          });
        }
      }

      const totalCount = rows.length;

      // Order
      if (this.orderCol) {
        const col = this.orderCol;
        const asc = this.orderAsc;
        rows.sort((a, b) => {
          const va = a[col] ?? '';
          const vb = b[col] ?? '';
          if (va < vb) return asc ? -1 : 1;
          if (va > vb) return asc ? 1 : -1;
          return 0;
        });
      }

      // Limit
      if (this.limitCount !== undefined) {
        rows = rows.slice(0, this.limitCount);
      }

      if (this.selectOptions?.head) {
        return {
          data: null,
          count: totalCount,
          error: null,
        };
      }

      if (this.isSingle) {
        if (rows.length === 0) {
          return { data: null, error: new Error('No rows found'), count: 0 };
        }
        return { data: rows[0], error: null, count: 1 };
      }

      if (this.isMaybeSingle) {
        return { data: rows[0] || null, error: null, count: rows.length };
      }

      return {
        data: rows,
        count: totalCount,
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}
