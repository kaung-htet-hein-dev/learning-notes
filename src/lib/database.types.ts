// Hand-written to match supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` if the schema grows.

export type SelfTestItem = { q: string; a: string };

type EntryRow = {
  id: string;
  slug: string;
  url: string[] | null; // url[0] is the primary source
  title: string;
  description: string;
  author: string | null;
  source_name: string | null;
  read_at: string; // YYYY-MM-DD
  body_md: string;
  self_test: SelfTestItem[];
  my_note: string | null;
  tags: string[];
  word_count: number;
  search: unknown;
  created_at: string;
  updated_at: string;
};

type EntryInsert = {
  id?: string;
  slug: string;
  url?: string[] | null;
  title: string;
  description: string;
  author?: string | null;
  source_name?: string | null;
  read_at?: string;
  body_md: string;
  self_test?: SelfTestItem[];
  my_note?: string | null;
  tags?: string[];
};

export type Database = {
  public: {
    Tables: {
      entries: {
        Row: EntryRow;
        Insert: EntryInsert;
        Update: Partial<EntryInsert>;
        Relationships: [];
      };
    };
    Views: {
      tag_counts: {
        Row: { tag: string; count: number };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
