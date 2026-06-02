(function(window, document) {
  'use strict';

  var KEYS = {
    session: 'ang_hr_session',
    id: 'ang_employee_id',
    name: 'ang_employee_name',
    role: 'ang_employee_role',
    token: 'ang_hr_token',
    deviceId: 'device_id',
    plan: 'ang_hr_plan',
    companyId: 'ang_hr_company_id',
    companyName: 'ang_hr_company_name',
    paidStatus: 'ang_hr_paid_status',
    source: 'ang_hr_source',
    legacyLogin: 'emp_logged_in',
    legacyName: 'emp_name',
    legacyIsLoggedIn: 'isLoggedIn',
    legacyLoginId: 'loginId',
    legacyToken: 'token',
    legacyAuthToken: 'auth_token'
  };

  function str(v) {
    return v === null || v === undefined ? '' : String(v).trim();
  }

  function getQuery() {
    var out = {};
    try {
      var sp = new URLSearchParams(window.location.search || '');
      sp.forEach(function(value, key) { out[key] = str(value); });
    } catch (err) {}
    return out;
  }

  function cleanId(v) {
    var id = str(v).replace(/[^A-Za-z0-9_-]/g, '').toUpperCase();
    if (!id) return '';
    if (id.indexOf('ANG') !== 0 && /^\d+$/.test(id)) return 'ANG' + id.padStart(4, '0');
    return id;
  }

  function cleanRole(v) {
    var r = str(v || 'employee').toLowerCase();
    if (!r) return 'employee';
    return r;
  }

  function normalizePlan(v) {
    var p = str(v).toLowerCase();
    if (p === 'premium') return 'premium';
    if (p === 'plus') return 'plus';
    return 'basic';
  }

  function detectPlan() {
    var q = getQuery();
    var href = String(window.location.href || '').toLowerCase();
    if (q.plan) return normalizePlan(q.plan);
    if (q.mode) return normalizePlan(q.mode);
    if (href.indexOf('premium') >= 0) return 'premium';
    if (href.indexOf('plus') >= 0) return 'plus';
    return normalizePlan(localStorage.getItem(KEYS.plan) || 'basic');
  }

  function saveLogin(res, fallbackId) {
    res = res || {};
    var q = getQuery();

    var id = cleanId(
      res.id || res.employeeId || res.employee_id || res.account || res.userId || res.userid ||
      (res.user && (res.user.id || res.user.employeeId || res.user.account)) ||
      q.id || q.ID || fallbackId || localStorage.getItem(KEYS.id) ||
      localStorage.getItem(KEYS.legacyLogin) || localStorage.getItem(KEYS.legacyLoginId)
    );

    if (!id) return false;

    var name = str(
      res.name || res.nickname || res.displayName ||
      (res.user && (res.user.name || res.user.nickname || res.user.displayName)) ||
      q.name || q.nickname || localStorage.getItem(KEYS.name) || localStorage.getItem(KEYS.legacyName) || id
    ) || id;

    var role = cleanRole(
      res.role || res.permission || (res.user && (res.user.role || res.user.permission)) ||
      q.role || localStorage.getItem(KEYS.role) || (id === 'ANG0603' ? 'creator' : 'employee')
    );

    var token = str(
      res.token || res.loginToken || res.sessionToken || res.official_token ||
      (res.user && (res.user.token || res.user.loginToken || res.user.sessionToken)) ||
      q.token || q.TOKEN || localStorage.getItem(KEYS.token) || localStorage.getItem(KEYS.legacyAuthToken) ||
      localStorage.getItem(KEYS.legacyToken)
    );

    var deviceId = str(res.device_id || res.deviceId || q.device_id || q.deviceId || q.device || localStorage.getItem(KEYS.deviceId));
    var plan = normalizePlan(res.plan || q.plan || localStorage.getItem(KEYS.plan) || detectPlan());
    var companyId = str(res.company_id || res.companyId || q.company_id || q.companyId || localStorage.getItem(KEYS.companyId));
    var companyName = str(res.company_name || res.companyName || q.company_name || q.companyName || localStorage.getItem(KEYS.companyName));
    var paidStatus = str(res.paid_status || res.paidStatus || q.paid_status || q.paidStatus || localStorage.getItem(KEYS.paidStatus) || 'active');
    var source = str(res.source || q.source || 'web');

    var session = {
      ok: true,
      id: id,
      employeeId: id,
      employee_id: id,
      name: name,
      role: role,
      token: token,
      device_id: deviceId,
      plan: plan,
      company_id: companyId,
      company_name: companyName,
      paid_status: paidStatus,
      source: source,
      updated_at: new Date().toISOString()
    };

    try {
      localStorage.setItem(KEYS.session, JSON.stringify(session));
      localStorage.setItem(KEYS.id, id);
      localStorage.setItem(KEYS.name, name);
      localStorage.setItem(KEYS.role, role);
      localStorage.setItem(KEYS.token, token);
      localStorage.setItem(KEYS.deviceId, deviceId);
      localStorage.setItem(KEYS.plan, plan);
      localStorage.setItem(KEYS.companyId, companyId);
      localStorage.setItem(KEYS.companyName, companyName);
      localStorage.setItem(KEYS.paidStatus, paidStatus);
      localStorage.setItem(KEYS.source, source);
      localStorage.setItem(KEYS.legacyLogin, id);
      localStorage.setItem(KEYS.legacyName, name);
      localStorage.setItem(KEYS.legacyIsLoggedIn, 'true');
      localStorage.setItem(KEYS.legacyLoginId, id);
      localStorage.setItem(KEYS.legacyToken, token);
      localStorage.setItem(KEYS.legacyAuthToken, token);

      sessionStorage.setItem(KEYS.id, id);
      sessionStorage.setItem(KEYS.role, role);
      sessionStorage.setItem(KEYS.legacyLogin, id);
      sessionStorage.setItem(KEYS.legacyLoginId, id);
      sessionStorage.setItem(KEYS.legacyIsLoggedIn, 'true');
      sessionStorage.setItem(KEYS.legacyToken, token);
    } catch (err) {}

    window.ANG_CURRENT_SESSION = session;
    window.ANG_APP_LOGIN = {
      id: id,
      token: token,
      device_id: deviceId,
      plan: plan,
      role: role,
      company_id: companyId,
      company_name: companyName,
      paid_status: paidStatus,
      source: source
    };
    return true;
  }

  function bootstrapFromQuery() {
    var q = getQuery();
    if (q.id || q.ID || q.token || q.TOKEN || q.device_id || q.deviceId || q.plan || q.role) {
      return saveLogin({
        id: q.id || q.ID,
        token: q.token || q.TOKEN,
        device_id: q.device_id || q.deviceId || q.device,
        plan: q.plan || q.mode,
        role: q.role,
        company_id: q.company_id || q.companyId,
        company_name: q.company_name || q.companyName,
        paid_status: q.paid_status || q.paidStatus,
        source: q.source || 'app'
      });
    }
    return false;
  }

  function getUser() {
    bootstrapFromQuery();

    try {
      var raw = localStorage.getItem(KEYS.session);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && s.id) {
          return {
            id: cleanId(s.id),
            employeeId: cleanId(s.id),
            name: str(s.name || s.id),
            role: cleanRole(s.role),
            token: str(s.token),
            device_id: str(s.device_id),
            plan: normalizePlan(s.plan),
            company_id: str(s.company_id),
            company_name: str(s.company_name),
            paid_status: str(s.paid_status || 'active')
          };
        }
      }
    } catch (err) {}

    var id = cleanId(localStorage.getItem(KEYS.id) || localStorage.getItem(KEYS.legacyLogin) || localStorage.getItem(KEYS.legacyLoginId) || sessionStorage.getItem(KEYS.legacyLogin));
    if (!id) return null;

    return {
      id: id,
      employeeId: id,
      name: localStorage.getItem(KEYS.name) || localStorage.getItem(KEYS.legacyName) || id,
      role: cleanRole(localStorage.getItem(KEYS.role) || (id === 'ANG0603' ? 'creator' : 'employee')),
      token: localStorage.getItem(KEYS.token) || localStorage.getItem(KEYS.legacyAuthToken) || localStorage.getItem(KEYS.legacyToken) || '',
      device_id: localStorage.getItem(KEYS.deviceId) || '',
      plan: normalizePlan(localStorage.getItem(KEYS.plan) || detectPlan()),
      company_id: localStorage.getItem(KEYS.companyId) || '',
      company_name: localStorage.getItem(KEYS.companyName) || '',
      paid_status: localStorage.getItem(KEYS.paidStatus) || 'active'
    };
  }

  function getSession() {
    return getUser();
  }

  function isLoggedIn() {
    return !!getUser();
  }

  function clearSession() {
    try {
      Object.keys(KEYS).forEach(function(k) {
        localStorage.removeItem(KEYS[k]);
        sessionStorage.removeItem(KEYS[k]);
      });
      ['emp_id','employee_id','auth_id','auth_token','auth_device_id'].forEach(function(k) {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    } catch (err) {}
    window.ANG_CURRENT_SESSION = null;
    window.ANG_APP_LOGIN = null;
  }

  function logout() {
    clearSession();
    location.href = 'login.html?v=' + Date.now();
  }

  function requireLogin(roleGroup) {
    var user = getUser();
    if (!user) {
      location.replace('login.html?v=' + Date.now());
      return null;
    }
    if (roleGroup === 'admin') {
      var r = cleanRole(user.role);
      if (!(r === 'admin' || r === 'manager' || r === 'creator')) {
        location.replace('employee_home.htm?v=' + Date.now());
        return null;
      }
    }
    return user;
  }

  function buildUrl(file) {
    var u = getUser() || {};
    var fname = file || 'employee_home.htm';
    var url = new URL(fname, window.location.href);
    if (u.id) url.searchParams.set('id', u.id);
    if (u.token) url.searchParams.set('token', u.token);
    if (u.device_id) url.searchParams.set('device_id', u.device_id);
    url.searchParams.set('plan', u.plan || detectPlan());
    url.searchParams.set('role', u.role || 'employee');
    url.searchParams.set('company_id', u.company_id || '');
    url.searchParams.set('paid_status', u.paid_status || 'active');
    url.searchParams.set('source', 'web');
    return url.toString();
  }

  function goHome() {
    var u = getUser();
    var isAdmin = u && ['admin','manager','creator'].indexOf(cleanRole(u.role)) >= 0;
    location.href = buildUrl(isAdmin ? 'admin_home.html' : 'employee_home.htm');
  }

  function goPage(file) {
    location.href = buildUrl(file || 'employee_home.htm');
  }

  bootstrapFromQuery();

  window.ANG_HR_AUTH = {
    saveLogin: saveLogin,
    getUser: getUser,
    getSession: getSession,
    isLoggedIn: isLoggedIn,
    logout: logout,
    clear: clearSession,
    clearSession: clearSession,
    requireLogin: requireLogin,
    cleanId: cleanId,
    cleanRole: cleanRole,
    getQuery: getQuery,
    bootstrapFromQuery: bootstrapFromQuery,
    buildUrl: buildUrl,
    goHome: goHome,
    goPage: goPage
  };

  window.ANGAuth = window.ANG_HR_AUTH;
})(window, document);