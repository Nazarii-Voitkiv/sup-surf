import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase configuration missing');
}

// Дополнительные параметры подключения
const connectionOptions: SupabaseClientOptions<'public'> = {
  auth: {
    persistSession: false, // Не сохраняем сессию в localStorage
    autoRefreshToken: true // Автоматически обновляем токен
  },
  global: {
    headers: { 'x-application-name': 'sup-surf' }
  }
};

// Если указаны дополнительные параметры в .env
if (process.env.DB_CONNECT_TIMEOUT) {
  connectionOptions.db = {
    ...connectionOptions.db,
    schema: 'public',
    timeout: parseInt(process.env.DB_CONNECT_TIMEOUT, 10)
  };
}

export default createClient(supabaseUrl, supabaseKey, connectionOptions);
