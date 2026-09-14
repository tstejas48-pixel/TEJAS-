(function (global) {
  'use strict';

  let supabaseClient = null;

  async function createSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    if (!global.supabase?.createClient) return null;

    const response = await fetch('/api/auth/config');
    const config = await response.json();
    if (!config.url || !config.key) return null;

    supabaseClient = global.supabase.createClient(config.url, config.key);
    return supabaseClient;
  }

  async function completeOAuthSession() {
    const client = await createSupabaseClient();
    if (!client || !global.TLT_AUTH) return;

    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (data.session?.user) {
      global.TLT_AUTH.loginOAuthUser(data.session.user);
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || 'profile.html';
      window.location.href = decodeURIComponent(returnUrl);
    }
  }

  async function startGoogleAuth() {
    const client = await createSupabaseClient();
    if (!client) {
      global.showToast('Google sign-in is not configured yet. Add Supabase OAuth settings first.', 'error');
      return;
    }

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login.html` }
    });
    if (error) global.showToast(error.message, 'error');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await completeOAuthSession();
    } catch (error) {
      console.error('Google OAuth session error:', error);
      global.showToast('Google sign-in could not be completed. Please try again.', 'error');
    }

    document.querySelectorAll('#googleLoginBtn, #googleRegisterBtn').forEach(button => {
      button.addEventListener('click', startGoogleAuth);
    });
  });
})(window);