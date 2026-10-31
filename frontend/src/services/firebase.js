/**
 * Google OAuth service — no Firebase needed.
 * Uses @react-oauth/google for sign-in flow.
 */

const GOOGLE_CLIENT_ID = '263557227236-48gioclk6ponlkk1frddtdj5cd3f6peq.apps.googleusercontent.com';

export { GOOGLE_CLIENT_ID };

localStorage.removeItem('cg_google_token');
localStorage.removeItem('cg_google_token_expires_at');

// Store/retrieve Google auth state
export const googleAuth = {
  setUser(user) {
    localStorage.setItem('cg_google_user', JSON.stringify(user));
  },
  getUser() {
    try {
      const raw = localStorage.getItem('cg_google_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  signOut() {
    localStorage.removeItem('cg_google_user');
    localStorage.removeItem('cg_google_token');
    localStorage.removeItem('cg_google_token_expires_at');
    window.location.reload();
  },
};
