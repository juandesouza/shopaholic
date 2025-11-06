import { createSupabaseServerClient } from './server'

export async function pingDatabase(): Promise<boolean> {
  // Lightweight call: try selecting from a guaranteed system view that exists in all Postgres DBs
  // We avoid auth; this uses anon key only.
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('pg_catalog.pg_tables' as unknown as string).select('schemaname').limit(1)
  // Even if table access is restricted, the client creation itself is what we care about here.
  return !error
}
