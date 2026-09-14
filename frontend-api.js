/* Home Healthcare — safe frontend API adapter
 * Configure window.HOME_HEALTHCARE_API_URL with a public HTTPS API base URL.
 * Never put Supabase service-role/private keys in this file.
 */
(function () {
  const configured = (window.HOME_HEALTHCARE_API_URL || '').trim().replace(/\/$/, '');
  const api = {
    configured: Boolean(configured),
    baseUrl: configured,
    async request(path, options = {}) {
      if (!configured) {
        throw new Error('BACKEND_NOT_CONFIGURED');
      }
      const response = await fetch(configured + '/' + String(path).replace(/^\//, ''), {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      if (!response.ok) throw new Error('API_HTTP_' + response.status);
      const type = response.headers.get('content-type') || '';
      return type.includes('application/json') ? response.json() : response.text();
    }
  };
  window.HomeHealthcareAPI = api;
})();
