const API_BASE = '/api';

/**
 * Helper to get active auth header (from localStorage or guest)
 */
function getAuthHeaders() {
  const token = localStorage.getItem('cyberguard_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // System Health
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Auth
  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Module 1: Terms & Conditions
  async analyzeTC(text, title = 'Terms of Service Analysis', userApiKey = null) {
    const res = await fetch(`${API_BASE}/tc/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        text,
        title,
        user_api_key: userApiKey || localStorage.getItem('cyberguard_gemini_key') || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to analyze terms' }));
      throw new Error(err.detail || 'Analysis failed');
    }
    return res.json();
  },

  async uploadTCDocument(file, title = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    const key = localStorage.getItem('cyberguard_gemini_key');
    if (key) formData.append('user_api_key', key);

    const res = await fetch(`${API_BASE}/tc/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload analysis failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  // Module 2: Email Phishing
  async analyzePhishing({ rawEmail, sender, replyTo, subject, body, userApiKey = null }) {
    const res = await fetch(`${API_BASE}/phishing/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        raw_email: rawEmail || null,
        sender: sender || null,
        reply_to: replyTo || null,
        subject: subject || null,
        body: body || null,
        user_api_key: userApiKey || localStorage.getItem('cyberguard_gemini_key') || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Phishing analysis failed' }));
      throw new Error(err.detail || 'Analysis failed');
    }
    return res.json();
  },

  async uploadEmlFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const key = localStorage.getItem('cyberguard_gemini_key');
    if (key) formData.append('user_api_key', key);

    const res = await fetch(`${API_BASE}/phishing/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'EML upload analysis failed' }));
      throw new Error(err.detail || 'EML upload failed');
    }
    return res.json();
  },

  // Module 3: Website Security
  async checkWebsite(url) {
    const res = await fetch(`${API_BASE}/website/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Website check failed' }));
      throw new Error(err.detail || 'Website check failed');
    }
    return res.json();
  },

  // Module 4: Privacy Compliance
  async checkCompliance({ text, frameworks = ['GDPR', 'CCPA', 'DPDP'], title = '' }) {
    const res = await fetch(`${API_BASE}/compliance/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        text,
        frameworks,
        title: title || 'Privacy Compliance Audit',
        user_api_key: localStorage.getItem('cyberguard_gemini_key') || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Compliance audit failed' }));
      throw new Error(err.detail || 'Compliance audit failed');
    }
    return res.json();
  },

  // Module 5: Unified Risk Audit
  async runUnifiedAudit({ url, policyText, emailText, title }) {
    const res = await fetch(`${API_BASE}/unified/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        url: url || null,
        policy_text: policyText || null,
        email_text: emailText || null,
        title: title || 'Unified Security & Privacy Audit',
        user_api_key: localStorage.getItem('cyberguard_gemini_key') || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unified audit failed' }));
      throw new Error(err.detail || 'Unified audit failed');
    }
    return res.json();
  },

  // Module 6: Scans & Reports
  async getScans(moduleType = null, limit = 50) {
    let endpoint = `${API_BASE}/scans?limit=${limit}`;
    if (moduleType && moduleType !== 'all') {
      endpoint += `&module_type=${encodeURIComponent(moduleType)}`;
    }
    const res = await fetch(endpoint, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load past scans');
    return res.json();
  },

  async getScanById(scanId) {
    const res = await fetch(`${API_BASE}/scans/${scanId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Scan not found');
    return res.json();
  },

  async compareScans(scanId1, scanId2) {
    const res = await fetch(`${API_BASE}/scans/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        scan_id_1: scanId1,
        scan_id_2: scanId2,
      }),
    });
    if (!res.ok) throw new Error('Failed to compare scans');
    return res.json();
  },

  async deleteScan(scanId) {
    const res = await fetch(`${API_BASE}/scans/${scanId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete scan');
    return res.json();
  },

  getPdfUrl(scanId) {
    return `${API_BASE}/scans/${scanId}/pdf`;
  },
};
