(function(window, document){
  'use strict';

  var SESSION_KEY = 'ang_hr_secure_session_v4';
  var CSRF_KEY = 'ang_hr_csrf_v4';
  var LEGACY_KEYS = [
    'ang_employee_id','ang_employee_name','ang_employee_role','ang_hr_token',
    'emp_logged_in','emp_name','isLoggedIn','loginId','auth_token','token','device_id','auth_device_id',
    'ang_hr_plan','ang_hr_role','ang_hr_company_id','ang_hr_company_name','ang_hr_paid_status','ang_hr_source',
    'ang_hr_session','ang_hr_session_v1'
  ];

  function str(v){ return v == null ? '' : String(v).trim(); }
  function normalizeId(v){
    var id = str(v).toUpperCase().replace(/\s+/g,'').replace(/[^A-Z0-9_-]/g,'');
    if (!id) return '';
    if (id.indexOf('ANG') !== 0 && /^\d+$/.test(id)) id = 'ANG' + id.padStart(4,'0');
    return id;
  }
  function normalizePlan(v){
    var p = str(v || window.ANG_HR_DEFAULT_PLAN || 'basic').toLowerCase();
    return p === 'premium' || p === 'plus' ? p : 'basic';
  }
  function normalizeRole(v){
    var r = str(v).toLowerCase();
    if (['creator','manager','admin','employee'].indexOf(r) >= 0) return r;
    return 'employee';
  }
  function getQuery(){
    var out = {};
    try { new URLSearchParams(location.search || '').forEach(function(v,k){ out[k]=str(v); }); } catch(err) {}
    return out;
  }
  function now(){ return Date.now(); }
  function expiresAt(seconds){
    var s = parseInt(seconds || '3600', 10);
    if (!isFinite(s) || s <= 0) s = 3600;
    return now() + s * 1000;
  }
  function getCSRFToken(){
    var t = sessionStorage.getItem(CSRF_KEY);
    if (!t) {
      t = 'csrf_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(CSRF_KEY, t);
    }
    return t;
  }

  function clearUrlSensitiveParams(){
    try {
      var url = new URL(location.href);
      ['activation_code','activationCode','code','token','TOKEN','api','api_url','gas','autologin'].forEach(function(k){ url.searchParams.delete(k); });
      history.replaceState({}, document.title, url.toString());
    } catch(err) {}
  }

  function saveSession(res){
    res = res || {};
    var id = normalizeId(res.id || res.employee_id || res.employeeId || res.account || (res.user && (res.user.id || res.user.employee_id)) || '');
    var token = str(res.token || res.session_token || res.sessionToken || res.loginToken || (res.user && (res.user.token || res.user.sessionToken)) || '');
    var deviceId = str(res.device_id || res.deviceId || res.device || localStorage.getItem('device_id') || '');
    if (!id || !token) return { ok:false, message:'登入回應缺少 id 或 token，已拒絕儲存。' };

    var session = {
      ok: true,
      id: id,
      name: str(res.name || res.nickname || res.displayName || (res.user && (res.user.name || res.user.nickname)) || id),
      role: normalizeRole(res.role || res.permission || (res.user && (res.user.role || res.user.permission))),
      plan: normalizePlan(res.plan),
      token: token,
      device_id: deviceId,
      company_id: str(res.company_id || res.companyId || ''),
      company_name: str(res.company_name || res.companyName || ''),
      paid_status: str(res.paid_status || res.paidStatus || 'active'),
      seat_limit: parseInt(res.seat_limit || res.seatLimit || '5', 10) || 5,
      expires_at: parseInt(res.expires_at || res.expiresAt || '', 10) || expiresAt(res.expires_in || res.expiresIn || 3600),
      source: str(res.source || 'device'),
      saved_at: new Date().toISOString()
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    sessionStorage.setItem('ang_hr_token', session.token);
    sessionStorage.setItem('ang_employee_id', session.id);
    sessionStorage.setItem('ang_employee_role', session.role);
    sessionStorage.setItem('device_id', session.device_id);

    /* legacy compatibility: only non-secret basics in localStorage */
    localStorage.setItem('ang_employee_id', session.id);
    localStorage.setItem('ang_employee_name', session.name);
    localStorage.setItem('emp_logged_in', session.id);
    localStorage.setItem('emp_name', session.name);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginId', session.id);
    localStorage.setItem('device_id', session.device_id);
    localStorage.setItem('ang_hr_plan', session.plan);
    localStorage.setItem('ang_hr_company_id', session.company_id);
    localStorage.setItem('ang_hr_paid_status', session.paid_status);

    window.ANG_CURRENT_SESSION = session;
    window.ANG_APP_LOGIN = { id:session.id, token:session.token, device_id:session.device_id, plan:session.plan, role:session.role, source:'app' };
    return { ok:true, session:session };
  }

  function getSession(){
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && s.id && s.token) return s;
      }
    } catch(err) {}

    var id = normalizeId(localStorage.getItem('ang_employee_id') || localStorage.getItem('emp_logged_in') || localStorage.getItem('loginId'));
    if (!id) return { id:'', token:'', role:'', plan:normalizePlan(), device_id:'' };
    return {
      id: id,
      token: str(sessionStorage.getItem('ang_hr_token') || ''),
      role: normalizeRole(sessionStorage.getItem('ang_employee_role') || ''),
      plan: normalizePlan(localStorage.getItem('ang_hr_plan')),
      name: str(localStorage.getItem('ang_employee_name') || localStorage.getItem('emp_name') || id),
      device_id: str(localStorage.getItem('device_id') || sessionStorage.getItem('device_id') || ''),
      company_id: str(localStorage.getItem('ang_hr_company_id') || ''),
      paid_status: str(localStorage.getItem('ang_hr_paid_status') || ''),
      expires_at: 0
    };
  }

  function getToken(){
    var s = getSession();
    if (!s || !s.token) return '';
    if (s.expires_at && now() > Number(s.expires_at)) { clearSession(); return ''; }
    return s.token;
  }

  function isLoggedIn(){ return !!getToken(); }
  function getUser(){
    var s = getSession();
    if (!s || !s.id || !getToken()) return null;
    return { id:s.id, employeeId:s.id, name:s.name || s.id, role:s.role || 'employee', plan:s.plan || normalizePlan(), token:s.token, device_id:s.device_id || '', paid_status:s.paid_status || '' };
  }
  function user(){ return getUser() || { id:'', name:'', role:'', token:'', plan:normalizePlan(), device_id:'' }; }

  function clearSession(){
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(CSRF_KEY);
      sessionStorage.removeItem('ang_hr_token');
      sessionStorage.removeItem('ang_employee_id');
      sessionStorage.removeItem('ang_employee_role');
      sessionStorage.removeItem('device_id');
      LEGACY_KEYS.forEach(function(k){
        if (k !== 'device_id') localStorage.removeItem(k);
      });
    } catch(err) {}
    window.ANG_CURRENT_SESSION = null;
    window.ANG_APP_LOGIN = null;
  }

  function toast(msg){
    var el = document.getElementById('toast');
    if (!el) { alert(msg); return; }
    el.textContent = msg || '';
    el.classList.add('show');
    el.style.display = 'block';
    setTimeout(function(){ el.classList.remove('show'); el.style.display='none'; }, 2600);
  }

  function pageName(){
    var p = (document.body && document.body.dataset && document.body.dataset.page) || '';
    if (p) return p;
    var file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/i,'');
    return file || 'index';
  }

  function goPage(file){
    var s = getSession();
    var url = new URL(file, location.href);
    if (s.id) url.searchParams.set('id', s.id);
    if (s.device_id) url.searchParams.set('device_id', s.device_id);
    url.searchParams.set('plan', s.plan || normalizePlan());
    url.searchParams.set('source', 'web');
    location.href = url.toString();
  }
  function goHome(){ goPage('employee_home.htm'); }
  function goLogin(){ location.href = new URL('index.html', location.href).toString(); }
  function go(kind){ if(kind === 'admin') goPage('admin_home.html'); else goHome(); }
  function logout(){ clearSession(); goLogin(); }

  function requireLogin(roleGroup){
    var p = pageName();
    if (['index','login','activate','noperm'].indexOf(p) >= 0) return true;
    var u = getUser();
    if (!u) { goLogin(); return false; }
    if (roleGroup === 'admin') {
      var r = normalizeRole(u.role);
      if (['admin','manager','creator'].indexOf(r) < 0) { goPage('employee_home.htm'); return false; }
    }
    return true;
  }

  async function activate(input){
    input = input || {};
    var q = getQuery();
    var id = normalizeId(input.id || q.id || q.ID || localStorage.getItem('ang_employee_id') || '');
    var activationCode = str(input.activation_code || input.activationCode || input.code || q.activation_code || q.activationCode || q.code || q.token || q.TOKEN || '');
    var deviceId = str(input.device_id || input.deviceId || input.device || q.device_id || q.deviceId || q.device || localStorage.getItem('device_id') || '');
    var plan = normalizePlan(input.plan || q.plan || q.mode || window.ANG_HR_DEFAULT_PLAN);

    if (!id) return { ok:false, message:'缺少員工 ID' };
    if (!activationCode) return { ok:false, message:'缺少 activation_code / 啟用碼' };
    if (!deviceId) {
      deviceId = 'web_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('device_id', deviceId);
    }

    var res = await window.ANG_HR_API.post('deviceActivationLogin', {
      id: id,
      activation_code: activationCode,
      device_id: deviceId,
      plan: plan,
      source: q.source || 'web',
      app: q.app || 'ang_hr'
    });

    if (!res || !res.ok) return res || { ok:false, message:'啟用失敗' };
    res.id = res.id || id;
    res.device_id = res.device_id || deviceId;
    res.plan = res.plan || plan;
    res.source = q.source || 'device';
    var saved = saveSession(res);
    if (!saved.ok) return saved;
    clearUrlSensitiveParams();
    return { ok:true, session:saved.session, message:res.message || '啟用成功' };
  }

  function bootstrapFromQuery(options){
    options = options || {};
    var q = getQuery();
    var hasCode = !!(q.activation_code || q.activationCode || q.code || q.token || q.TOKEN);
    var id = normalizeId(q.id || q.ID || '');
    if (!id || !hasCode) return { fromQuery:false };

    activate({ id:id }).then(function(res){
      if (!res || !res.ok) { toast((res && res.message) || '啟用失敗'); return; }
      if (options.autoRedirect !== false && (q.autologin === '1' || q.source === 'app' || q.app === 'ang_hr')) {
        goHome();
      }
    });
    return { fromQuery:true };
  }

  function installGlobals(){
    window.currentId = (getSession().id || window.currentId || '');
    window.currentName = (getSession().name || getSession().id || window.currentName || '');
  }

  window.ANGAuth = {
    normalizeId: normalizeId,
    cleanId: normalizeId,
    cleanRole: normalizeRole,
    getQuery: getQuery,
    saveSession: saveSession,
    save: function(v){ return saveSession(v).ok; },
    saveLogin: saveSession,
    getSession: getSession,
    get: getSession,
    getUser: getUser,
    user: user,
    currentUser: user,
    isLoggedIn: isLoggedIn,
    getToken: getToken,
    getCSRFToken: getCSRFToken,
    clearSession: clearSession,
    clear: clearSession,
    logout: logout,
    requireLogin: requireLogin,
    activate: activate,
    bootstrapFromQuery: bootstrapFromQuery,
    installGlobals: installGlobals,
    goPage: goPage,
    goHome: goHome,
    goLogin: goLogin,
    go: go,
    toast: toast
  };

  window.ANG_HR_AUTH = window.ANG_HR_AUTH || window.ANGAuth;
  window.ANGAuth.installGlobals();
})(window, document);
