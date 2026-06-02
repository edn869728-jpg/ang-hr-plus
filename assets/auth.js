/* ANG HR Router Auth｜覆蓋版
 * 功能：
 * 1. 登入前先問 Router GAS：company_id 對應哪個 plan / frontend_url / gas_api_url。
 * 2. 登入再打實際版本 GAS，而不是直接寫死 Basic / Premium。
 * 3. 存 localStorage/sessionStorage，讓 employee/admin 頁面可共用 ANG_HR_API.post。
 */
(function(){
  'use strict';

  var cfg = window.ANG_HR_CONFIG || {};
  var ROUTER_URL = String(cfg.routerApiUrl || '').trim();
  var KEY_ROUTE = 'ang_hr_route';
  var KEY_SESSION = 'ang_hr_session';

  function clean(v){ return String(v == null ? '' : v).trim(); }
  function lower(v){ return clean(v).toLowerCase(); }
  function qs(id){ return document.getElementById(id); }

  function normalizePlan(v){
    var s = lower(v);
    if (s === '免費' || s === 'freemium' || s === 'free_plan') return 'free';
    if (s === '標準' || s === 'standard') return 'basic';
    if (s === 'pro') return 'plus';
    if (s === 'premiun') return 'premium';
    if (['free','basic','plus','trial','premium'].indexOf(s) >= 0) return s;
    return 'free';
  }

  function joinUrl(base, path){
    base = clean(base);
    path = clean(path);
    if (!base) return path;
    if (!path) return base;
    if (base.slice(-1) !== '/') base += '/';
    if (path.charAt(0) === '/') path = path.slice(1);
    return base + path;
  }

  function parseJsonText(text){
    try { return JSON.parse(text || '{}'); }
    catch(e){ return { ok:false, message:'回傳不是 JSON：' + String(text || '').slice(0,120) }; }
  }

  function postJson(url, payload){
    url = clean(url);
    if (!url) return Promise.resolve({ ok:false, message:'缺少 API URL' });
    return fetch(url, {
      method:'POST',
      headers:{ 'Content-Type':'application/json; charset=utf-8' },
      body: JSON.stringify(payload || {})
    }).then(function(res){ return res.text().then(parseJsonText); })
      .catch(function(err){ return { ok:false, message:'連線失敗：' + (err && err.message ? err.message : err) }; });
  }

  function getQuery(){
    var out = {};
    try { new URLSearchParams(location.search).forEach(function(v,k){ out[k]=v; }); } catch(e) {}
    return out;
  }

  function saveRoute(route){
    route = route || {};
    var plan = normalizePlan(route.plan);
    var obj = {
      company_id: clean(route.company_id || route.companyId),
      company_name: clean(route.company_name || route.companyName),
      plan: plan,
      frontend_url: clean(route.frontend_url || route.frontendUrl),
      gas_api_url: clean(route.gas_api_url || route.api_url || route.gasApiUrl),
      max_users: route.max_users || route.seat_limit || '',
      retention_days: route.retention_days || '',
      showUpgradePrompt: !!(route.showUpgradePrompt || route.show_upgrade_prompt),
      upgradePrompt: route.upgradePrompt || null,
      resolved_at: new Date().toISOString()
    };
    localStorage.setItem(KEY_ROUTE, JSON.stringify(obj));
    localStorage.setItem('ang_hr_company_id', obj.company_id);
    localStorage.setItem('ang_hr_company_name', obj.company_name);
    localStorage.setItem('ang_hr_plan', obj.plan);
    localStorage.setItem('ang_hr_edition', obj.plan);
    localStorage.setItem('ang_hr_frontend_url', obj.frontend_url);
    localStorage.setItem('ang_hr_api_url', obj.gas_api_url);
    localStorage.setItem('ang_hr_gas_api_url', obj.gas_api_url);
    localStorage.setItem('ang_hr_show_upgrade_prompt', obj.showUpgradePrompt ? 'true' : 'false');

    sessionStorage.setItem('ang_hr_plan', obj.plan);
    sessionStorage.setItem('ang_hr_edition', obj.plan);
    sessionStorage.setItem('ang_hr_api_url', obj.gas_api_url);
    sessionStorage.setItem('ang_hr_gas_api_url', obj.gas_api_url);
    return obj;
  }

  function getRoute(){
    try { return JSON.parse(localStorage.getItem(KEY_ROUTE) || '{}') || {}; }
    catch(e){ return {}; }
  }

  function saveSession(session){
    session = session || {};
    var route = getRoute();
    var obj = Object.assign({}, route, session, {
      id: clean(session.id || session.empId || session.employee_id).toUpperCase(),
      token: clean(session.token),
      role: clean(session.role || 'employee'),
      name: clean(session.name || session.nickname || session.id || ''),
      plan: normalizePlan(session.plan || route.plan),
      login_at: new Date().toISOString()
    });

    localStorage.setItem(KEY_SESSION, JSON.stringify(obj));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginId', obj.id);
    localStorage.setItem('emp_logged_in', obj.id);
    localStorage.setItem('emp_id', obj.id);
    localStorage.setItem('employee_id', obj.id);
    localStorage.setItem('auth_id', obj.id);
    localStorage.setItem('auth_token', obj.token);
    localStorage.setItem('token', obj.token);
    localStorage.setItem('ang_hr_role', obj.role);
    localStorage.setItem('ang_hr_plan', obj.plan);
    localStorage.setItem('ang_hr_edition', obj.plan);

    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('loginId', obj.id);
    sessionStorage.setItem('emp_logged_in', obj.id);
    sessionStorage.setItem('emp_id', obj.id);
    sessionStorage.setItem('employee_id', obj.id);
    sessionStorage.setItem('auth_token', obj.token);
    sessionStorage.setItem('token', obj.token);
    return obj;
  }

  function resolveCompany(companyId){
    companyId = clean(companyId || cfg.defaultCompanyId || getQuery().company_id || getQuery().companyId);
    if (!companyId) return Promise.resolve({ ok:false, message:'請輸入公司代碼 company_id' });
    if (!ROUTER_URL || ROUTER_URL.indexOf('PASTE_YOUR_ROUTER_GAS_WEB_APP_ID') >= 0) {
      return Promise.resolve({ ok:false, message:'尚未設定 Router GAS Web App URL' });
    }
    return postJson(ROUTER_URL, { action:'resolveCompany', company_id: companyId, source:'web_login' })
      .then(function(res){ if (res && res.ok) saveRoute(res); return res; });
  }

  function apiPost(action, payload){
    var route = getRoute();
    var gasUrl = clean(route.gas_api_url || localStorage.getItem('ang_hr_gas_api_url') || localStorage.getItem('ang_hr_api_url'));
    payload = payload || {};
    payload.action = action;
    payload.plan = normalizePlan(payload.plan || route.plan || localStorage.getItem('ang_hr_plan'));
    payload.company_id = clean(payload.company_id || route.company_id || localStorage.getItem('ang_hr_company_id'));
    if (!payload.id) payload.id = clean(localStorage.getItem('auth_id') || localStorage.getItem('emp_id') || localStorage.getItem('loginId'));
    if (!payload.token) payload.token = clean(localStorage.getItem('auth_token') || localStorage.getItem('token'));
    return postJson(gasUrl, payload);
  }

  function loginWithRouter(form){
    form = form || {};
    var companyId = clean(form.company_id || form.companyId);
    var id = clean(form.id || form.empId || form.account).toUpperCase();
    var password = clean(form.password || form.token || form.pass);
    if (!companyId) return Promise.resolve({ ok:false, message:'請輸入公司代碼' });
    if (!id) return Promise.resolve({ ok:false, message:'請輸入員工編號' });
    if (!password) return Promise.resolve({ ok:false, message:'請輸入密碼' });

    return resolveCompany(companyId).then(function(route){
      if (!route || !route.ok) return route;
      var saved = getRoute();
      return postJson(saved.gas_api_url, {
        action:'login',
        id:id,
        password:password,
        company_id:saved.company_id,
        plan:saved.plan,
        source:'web_login_router'
      }).then(function(loginRes){
        if (!loginRes || !loginRes.ok) return loginRes;
        var session = saveSession({
          id: loginRes.id || loginRes.empId || id,
          token: loginRes.token,
          role: loginRes.role,
          name: loginRes.name || loginRes.nickname,
          plan: saved.plan,
          company_id: saved.company_id,
          company_name: saved.company_name
        });
        return Object.assign({}, loginRes, { route:saved, session:session });
      });
    });
  }

  function buildEntryUrl(route, session){
    route = route || getRoute();
    session = session || {};
    var base = clean(route.frontend_url || localStorage.getItem('ang_hr_frontend_url') || './');
    var url = new URL(base, location.href);
    url.searchParams.set('id', clean(session.id || localStorage.getItem('emp_id')));
    url.searchParams.set('token', clean(session.token || localStorage.getItem('auth_token')));
    url.searchParams.set('company_id', clean(route.company_id || localStorage.getItem('ang_hr_company_id')));
    url.searchParams.set('plan', normalizePlan(route.plan || localStorage.getItem('ang_hr_plan')));
    url.searchParams.set('api', clean(route.gas_api_url || localStorage.getItem('ang_hr_gas_api_url')));
    url.searchParams.set('gas_api_url', clean(route.gas_api_url || localStorage.getItem('ang_hr_gas_api_url')));
    url.searchParams.set('entry', cfg.defaultEntryPage || 'employee_home');
    url.searchParams.set('source', 'router_login');
    url.searchParams.set('v', Date.now());
    return url.toString();
  }

  function showUpgradePromptIfNeeded(){
    var route = getRoute();
    var show = route.showUpgradePrompt || localStorage.getItem('ang_hr_show_upgrade_prompt') === 'true';
    if (!show) return;
    var p = route.upgradePrompt || cfg.freeUpgradePrompt || {};
    var title = clean(p.title || '覺得好用嗎？');
    var message = clean(p.message || '升級方案可以提升名額、延長資料保存、開啟審核、薪資、排班與更多管理功能。');
    var cta = clean(p.ctaText || p.cta || '快升級方案');
    if (window.Swal && Swal.fire) {
      Swal.fire({ icon:'info', title:title, text:message, confirmButtonText:cta });
    } else {
      setTimeout(function(){ alert(title + '\n\n' + message + '\n\n' + cta); }, 350);
    }
  }

  window.ANG_HR_ROUTER_AUTH = {
    resolveCompany: resolveCompany,
    loginWithRouter: loginWithRouter,
    saveRoute: saveRoute,
    getRoute: getRoute,
    saveSession: saveSession,
    buildEntryUrl: buildEntryUrl,
    showUpgradePromptIfNeeded: showUpgradePromptIfNeeded,
    postJson: postJson
  };

  window.ANG_HR_API = window.ANG_HR_API || {};
  window.ANG_HR_API.post = apiPost;

  document.addEventListener('DOMContentLoaded', function(){
    var q = getQuery();
    var companyId = clean(q.company_id || q.companyId || cfg.defaultCompanyId);
    if (companyId && ROUTER_URL && ROUTER_URL.indexOf('PASTE_YOUR_ROUTER_GAS_WEB_APP_ID') < 0) {
      resolveCompany(companyId).then(function(){});
    }
    if (localStorage.getItem('isLoggedIn') === 'true') {
      showUpgradePromptIfNeeded();
    }
  });
})();
