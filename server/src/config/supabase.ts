import { config } from './env.js';

export class SupabaseClientFactory {
  static getClient(): any {
    if (!config.supabase.url || !config.supabase.anonKey) {
      return null;
    }
    return {
      from: (table: string) => {
        throw new Error(`Supabase queries should be routed via Repository implementations, not directly invoked for table: ${table}`);
      }
    };
  }
}
