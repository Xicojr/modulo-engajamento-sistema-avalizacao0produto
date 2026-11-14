import { createClient } from '@supabase/supabase-js';

export interface Account {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  salt: string;
  created_at: string;
  updated_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseKey.includes('your-anon-key'),
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseKey as string)
  : null;

// In-memory store fallback for development/testing when Supabase credentials are not yet configured
const inMemoryAccounts: Account[] = [];

export async function findAccountByEmail(email: string): Promise<Account | null> {
  const normalizedEmail = email.toLowerCase().trim();

  if (supabase) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Error finding account by email:', error);
      throw error;
    }
    return data as Account | null;
  }

  const found = inMemoryAccounts.find((acc) => acc.email === normalizedEmail);
  return found || null;
}

export async function insertAccount(
  accountData: Omit<Account, 'created_at' | 'updated_at'>,
): Promise<Account> {
  const now = new Date().toISOString();
  const newAccount: Account = {
    ...accountData,
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    const { data, error } = await supabase.from('accounts').insert([newAccount]).select().single();

    if (error) {
      console.error('[Supabase] Error inserting account:', error);
      throw error;
    }
    return data as Account;
  }

  console.warn(
    '[Development] Supabase credentials not found in env. Persisting account in local runtime store.',
  );
  inMemoryAccounts.push(newAccount);
  return newAccount;
}
