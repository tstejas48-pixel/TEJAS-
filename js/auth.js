/**
 * ============================================================================
 * TEJAS LADIES TYLOR — Authentication System (Frontend Demo)
 * ============================================================================
 * IMPORTANT SECURITY NOTICE:
 * This authentication system operates locally in the browser using `localStorage`.
 * It is built for demonstration and client-side workflow evaluation.
 * In a real-world production deployment, this MUST be replaced by a secure backend
 * authentication API (such as OAuth2, JWT tokens, or secure session cookies with HTTPS).
 * Do NOT use localStorage to store unencrypted credentials in production.
 * ============================================================================
 */

(function (global) {
  'use strict';

  const STORAGE_USERS_KEY = 'tlt_registered_users';
  const STORAGE_CURRENT_USER_KEY = 'tlt_current_user';
  const STORAGE_REMEMBER_KEY = 'tlt_remember_me';

  // Seed default demonstration account if none exists
  function seedDefaultDemoAccount() {
    try {
      const existing = localStorage.getItem(STORAGE_USERS_KEY);
      if (!existing) {
        const demoUsers = [
          {
            id: 'USR-2026-001',
            fullName: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '+91 98765 43210',
            password: 'Password123!',
            createdAt: '2026-01-15',
            measurements: {
              bust: '36"',
              waist: '30"',
              hips: '39"',
              shoulder: '14.5"',
              blouseLength: '14"',
              kurtiLength: '42"',
              sleeveLength: '10"',
              armhole: '16"'
            },
            notes: 'Prefers deep back necklines with latkan ties for festive blouses.'
          }
        ];
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(demoUsers));
      }
    } catch (e) {
      console.warn('Unable to access localStorage for seeding default user:', e);
    }
  }

  // Initialize seed immediately
  seedDefaultDemoAccount();

  /**
   * Retrieve all registered demo users from localStorage
   */
  function getAllUsers() {
    try {
      const data = localStorage.getItem(STORAGE_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading registered users:', e);
      return [];
    }
  }

  /**
   * Save the full users array to localStorage
   */
  function saveAllUsers(users) {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to storage:', e);
    }
  }

  /**
   * Register a new demo user
   * @param {Object} userData - { fullName, email, phone, password }
   * @returns {Object} { success: boolean, message: string, user?: Object }
   */
  function registerUser(userData) {
    const users = getAllUsers();
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    // Check if email already exists
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please login.'
      };
    }

    const newUser = {
      id: 'USR-' + new Date().getFullYear() + '-' + String(users.length + 1).padStart(3, '0'),
      fullName: (userData.fullName || '').trim(),
      email: cleanEmail,
      phone: (userData.phone || '').trim(),
      password: userData.password, // In real production, this would be salted & hashed server-side
      createdAt: new Date().toISOString().split('T')[0],
      measurements: {
        bust: '',
        waist: '',
        hips: '',
        shoulder: '',
        blouseLength: '',
        kurtiLength: '',
        sleeveLength: '',
        armhole: ''
      },
      notes: ''
    };

    users.push(newUser);
    saveAllUsers(users);

    // Automatically log in the newly registered user
    loginUser(cleanEmail, userData.password, true);

    return {
      success: true,
      message: 'Account created successfully! Welcome to TEJAS LADIES TYLOR.',
      user: newUser
    };
  }

  /**
   * Log in an existing user
   * @param {string} email
   * @param {string} password
   * @param {boolean} remember
   * @returns {Object} { success: boolean, message: string, user?: Object }
   */
  function loginUser(email, password, remember = false) {
    const users = getAllUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        message: 'No account found with this email address.'
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please try again or use the demo login.'
      };
    }

    // Save session in localStorage (or sessionStorage if not remember)
    try {
      const sessionData = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      };
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(sessionData));
      if (remember) {
        localStorage.setItem(STORAGE_REMEMBER_KEY, cleanEmail);
      } else {
        localStorage.removeItem(STORAGE_REMEMBER_KEY);
      }
    } catch (e) {
      console.error('Session write error:', e);
    }

    return {
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      user
    };
  }

  /**
   * Create the same local session shape for a Supabase OAuth user.
   * Profile data remains compatible with the existing client-side demo flows.
   */
  function loginOAuthUser(oauthUser) {
    if (!oauthUser || !oauthUser.email) return null;

    const users = getAllUsers();
    const email = oauthUser.email.trim().toLowerCase();
    let user = users.find(existing => existing.email.toLowerCase() === email);

    if (!user) {
      user = {
        id: oauthUser.id || `GOOGLE-${Date.now()}`,
        fullName: oauthUser.user_metadata?.full_name || oauthUser.user_metadata?.name || email.split('@')[0],
        email,
        phone: '',
        password: '',
        createdAt: new Date().toISOString().split('T')[0],
        measurements: {
          bust: '', waist: '', hips: '', shoulder: '', blouseLength: '',
          kurtiLength: '', sleeveLength: '', armhole: ''
        },
        notes: ''
      };
      users.push(user);
      saveAllUsers(users);
    }

    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt
    }));

    return user;
  }

  /**
   * Log out the current user session
   */
  function logoutUser() {
    try {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    } catch (e) {
      console.error('Logout error:', e);
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean}
   */
  function isLoggedIn() {
    try {
      return !!localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    } catch (e) {
      return false;
    }
  }

  /**
   * Retrieve current active user profile
   * @returns {Object|null}
   */
  function getCurrentUser() {
    try {
      const session = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (!session) return null;

      const basic = JSON.parse(session);
      // Fetch full record from users table to get latest measurements/notes
      const users = getAllUsers();
      const full = users.find(u => u.id === basic.id || u.email.toLowerCase() === basic.email.toLowerCase());
      return full || basic;
    } catch (e) {
      console.error('Error fetching current user:', e);
      return null;
    }
  }

  /**
   * Update active user profile & measurements
   * @param {Object} updatedFields
   * @returns {boolean}
   */
  function updateUserProfile(updatedFields) {
    const current = getCurrentUser();
    if (!current) return false;

    const users = getAllUsers();
    const index = users.findIndex(u => u.id === current.id || u.email === current.email);

    if (index === -1) return false;

    // Merge updates
    const target = users[index];
    if (updatedFields.fullName) target.fullName = updatedFields.fullName.trim();
    if (updatedFields.phone) target.phone = updatedFields.phone.trim();
    if (updatedFields.measurements) {
      target.measurements = Object.assign({}, target.measurements, updatedFields.measurements);
    }
    if (typeof updatedFields.notes === 'string') {
      target.notes = updatedFields.notes.trim();
    }

    users[index] = target;
    saveAllUsers(users);

    // Update active session metadata
    try {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify({
        id: target.id,
        fullName: target.fullName,
        email: target.email,
        phone: target.phone,
        createdAt: target.createdAt
      }));
    } catch (e) {
      console.error('Error updating session user:', e);
    }

    return true;
  }

  /**
   * Route protection: redirects to login.html if user is not authenticated
   */
  function requireAuth(redirectUrl = 'login.html') {
    if (!isLoggedIn()) {
      const returnUrl = encodeURIComponent(window.location.pathname.split('/').pop() || 'index.html');
      window.location.href = `${redirectUrl}?returnUrl=${returnUrl}`;
    }
  }

  /**
   * Evaluate password strength
   * @param {string} password
   * @returns {Object} { score: number (0-4), label: string, color: string }
   */
  function checkPasswordStrength(password) {
    if (!password) return { score: 0, label: 'None', color: '#8A7E81', percent: 0 };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: '#C62828', percent: 25 };
      case 2:
        return { score: 2, label: 'Fair', color: '#F57F17', percent: 50 };
      case 3:
        return { score: 3, label: 'Good', color: '#1E88E5', percent: 75 };
      case 4:
        return { score: 4, label: 'Strong', color: '#2E7D32', percent: 100 };
      default:
        return { score: 0, label: 'Very Weak', color: '#C62828', percent: 10 };
    }
  }

  // Export public auth API to window
  global.TLT_AUTH = {
    registerUser,
    loginUser,
    loginOAuthUser,
    logoutUser,
    isLoggedIn,
    getCurrentUser,
    updateUserProfile,
    requireAuth,
    checkPasswordStrength,
    getRememberedEmail: () => localStorage.getItem(STORAGE_REMEMBER_KEY) || ''
  };

})(window);
