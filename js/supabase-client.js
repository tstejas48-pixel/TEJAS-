(function (global) {
  'use strict';

  let clientPromise;

  async function getClient() {
    if (clientPromise) return clientPromise;

    clientPromise = (async () => {
      if (!global.supabase?.createClient) return null;

      const response = await fetch('/api/auth/config');
      if (!response.ok) return null;

      const config = await response.json();
      if (!config.url || !config.key) return null;

      return global.supabase.createClient(config.url, config.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    })().catch(error => {
      console.error('Supabase client initialization failed:', error);
      return null;
    });

    return clientPromise;
  }

  global.TLT_SUPABASE = { getClient };
})(window);
