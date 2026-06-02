(function(window){
  'use strict';

  function str(v){ return v == null ? '' : String(v).trim(); }

  function getQuery(){
    var out = {};
    try {
      var sp = new URLSearchParams(location.search || '');
      sp.forEach(function(v,k){ out[k] = str(v); });
    } catch(err) {}
    return out;
  }

  function getApiUrl(){
    var q = getQuery();
    var cfg = window.ANG_HR_CONFIG || {};
    return str(q.api || q.api_url || q.gas || cfg.apiUrl || cfg.proxyUrl || '');
  }

  function demoAllowed(action, payload){
    var code = str(payload.activation_code || payload.activationCode || payload.token).toLowerCase();
    return !getApiUrl() && (code.indexOf('act_test') === 0 || code.indexOf('test') === 0 || code === 'demo');
  }

  function demoResponse(action, payload){
    var id = str(payload.id || payload.employee_id).toUpperCase();
    var plan = str(payload.plan || window.ANG_HR_DEFAULT_PLAN || 'basic').toLowerCase();
    if (['basic','plus','premium'].indexOf(plan) < 0) plan = 'basic';
    var role = id === 'ANG0603' ? 'creator' : 'employee';
    var tokenSeed = [id, plan, payload.device_id || '', Date.now()].join('|');
    var token = 'demo_' + btoa(unescape(encodeURIComponent(tokenSeed))).replace(/[^A-Za-z0-9]/g,'').slice(0,42);
    return Promise.resolve({
      ok: true,
      message: 'Demo 模式：已用測試啟用碼換發臨時 token。正式環境請設定 GAS API。',
      id: id,
      name: id,
      role: role,
      plan: plan,
      token: token,
      expires_in: 3600,
      company_id: 'C-DEMO',
      company_name: 'ANG Demo Company',
      paid_status: 'active',
      seat_limit: 5
    });
  }

  async function post(action, payload){
    payload = payload || {};
    payload.action = action;
    payload.app = 'ang_hr';
    payload.client_build = 'secure-device-login-v4';

    if (demoAllowed(action, payload)) return demoResponse(action, payload);

    var url = getApiUrl();
    if (!url) return { ok:false, message:'尚未設定 GAS API URL，且啟用碼不是測試碼。' };

    try {
      var headers = { 'Content-Type':'text/plain;charset=utf-8' };
      var auth = window.ANGAuth && window.ANGAuth.getToken ? window.ANGAuth.getToken() : '';
      if (auth) payload.authorization = 'Bearer ' + auth;
      payload.csrf = window.ANGAuth && window.ANGAuth.getCSRFToken ? window.ANGAuth.getCSRFToken() : '';

      var res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
      var text = await res.text();
      var json;
      try { json = JSON.parse(text); }
      catch(err){ return { ok:false, message:'API 回傳不是 JSON：' + text.slice(0,120) }; }
      return json;
    } catch(err) {
      return { ok:false, message:'API 連線失敗：' + (err && err.message ? err.message : err) };
    }
  }

  window.ANG_HR_API = window.ANG_HR_API || { post: post, getApiUrl: getApiUrl, getQuery: getQuery };
})(window);
