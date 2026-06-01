
(function(window){
  'use strict';
  const cfg = window.ANG_HR_CONFIG || {};
  const prefix = 'ang_hr_' + (cfg.version || 'app') + '_';
  const keys = { id:prefix+'id', token:prefix+'token', name:prefix+'name', role:prefix+'role', device:prefix+'device_id', bound:prefix+'device_bound', verified:prefix+'last_verified_at' };
  function clean(v){ return String(v == null ? '' : v).trim(); }
  function qs(){ return new URLSearchParams(window.location.search || ''); }
  function normalizeId(input){
    let raw = clean(input).toUpperCase().replace(/\s+/g,'');
    if (!raw) return '';
    let ang = raw.match(/ANG\D*(\d{1,8})/i);
    let any = raw.match(/(\d{1,8})/);
    let n = ang ? ang[1] : (any ? any[1] : '');
    return n ? ('ANG' + n.padStart(4,'0')) : raw;
  }
  function randomId(){
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const arr = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(arr);
    else for (let i=0;i<arr.length;i++) arr[i] = Math.floor(Math.random()*256);
    return Array.from(arr).map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  function getOrCreateDeviceId(){
    let urlDevice = clean(qs().get('device_id') || qs().get('deviceId') || '');
    if (urlDevice) { localStorage.setItem(keys.device, urlDevice); return urlDevice; }
    let id = clean(localStorage.getItem(keys.device) || '');
    if (!id) { id = 'dev_' + randomId(); localStorage.setItem(keys.device, id); }
    return id;
  }
  function roleOf(id){ id = normalizeId(id); if (id === 'ANG0603') return 'creator'; if (id === 'ANG0606') return 'manager'; if (id === 'ANG0601') return 'admin'; return 'employee'; }
  function saveSession(s){
    const id = normalizeId(s && s.id);
    const token = clean(s && s.token);
    const name = clean((s && s.name) || id);
    const device_id = clean((s && s.device_id) || getOrCreateDeviceId());
    const role = clean((s && s.role) || roleOf(id));
    if (!id || !token || !device_id) return null;
    localStorage.setItem(keys.id, id);
    localStorage.setItem(keys.token, token);
    localStorage.setItem(keys.name, name);
    localStorage.setItem(keys.role, role);
    localStorage.setItem(keys.device, device_id);
    localStorage.setItem(keys.bound, 'true');
    localStorage.setItem(keys.verified, new Date().toISOString());
    localStorage.setItem('emp_logged_in', id);
    localStorage.setItem('loginId', id);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('emp_name', name);
    localStorage.setItem('loginToken', token);
    localStorage.setItem('ang_device_id', device_id);
    return { id, token, name, role, device_id };
  }
  function getSession(){
    const id = normalizeId(localStorage.getItem(keys.id) || localStorage.getItem('emp_logged_in') || localStorage.getItem('loginId') || '');
    const token = clean(localStorage.getItem(keys.token) || localStorage.getItem('loginToken') || '');
    const device_id = clean(localStorage.getItem(keys.device) || localStorage.getItem('ang_device_id') || '');
    if (!id || !token || !device_id) return null;
    return { id, token, device_id, name: clean(localStorage.getItem(keys.name) || localStorage.getItem('emp_name') || id), role: clean(localStorage.getItem(keys.role) || roleOf(id)) };
  }
  function clearSession(){
    Object.values(keys).forEach(k=>localStorage.removeItem(k));
    ['emp_logged_in','loginId','isLoggedIn','emp_name','loginToken','authToken','ang_device_id'].forEach(k=>localStorage.removeItem(k));
  }
  function keepDeviceOnly(){
    const device = getOrCreateDeviceId();
    clearSession();
    localStorage.setItem(keys.device, device);
    localStorage.setItem('ang_device_id', device);
    return device;
  }
  function hasGoogle(){ return typeof google !== 'undefined' && google && google.script && google.script.run; }
  function runGoogle(fn, payload){
    return new Promise((resolve)=>{
      if (!hasGoogle() || !google.script.run[fn]) { resolve({ok:false,msg:'google.script.run 不存在'}); return; }
      try {
        google.script.run.withSuccessHandler(res=>resolve(res || {ok:false,msg:'empty'})).withFailureHandler(err=>resolve({ok:false,msg:err && err.message ? err.message : String(err || 'error')}))[fn](payload);
      } catch(e) { resolve({ok:false,msg:e.message || String(e)}); }
    });
  }
  async function callApi(action, payload){
    payload = payload || {};
    payload.action = action;
    payload.version = cfg.version || '';
    if (hasGoogle()) {
      const map = { bind_device:'angBindDeviceLogin', verify_device:'angVerifyDeviceSession', create_link:'angCreateDeviceLoginLink', reset_device:'angResetEmployeeDevice' };
      return await runGoogle(map[action] || action, payload);
    }
    const endpoint = clean(cfg.gasEndpoint || cfg.apiUrl || '');
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
        return await res.json();
      } catch(e) { return {ok:false,msg:e.message || String(e)}; }
    }
    return {ok:true,preview:true,msg:'GitHub 前端預覽：未設定 gasEndpoint，已先完成本機儲存。正式部署時請填入 GAS Web App URL。'};
  }
  function readLink(){
    const p = qs();
    const id = normalizeId(p.get('id') || p.get('ID') || p.get('emp') || '');
    const token = clean(p.get('token') || p.get('TOKEN') || p.get('t') || '');
    const name = clean(p.get('name') || p.get('NAME') || '');
    return {id, token, name};
  }
  async function bindFromUrl(){
    const link = readLink();
    if (!link.id || !link.token) return {ok:false,need_link:true,msg:'缺少 id 或 token'};
    const device_id = getOrCreateDeviceId();
    const payload = {id:link.id, token:link.token, name:link.name, device_id, device_name:navigator.userAgent || '', device_platform:navigator.platform || 'web'};
    const res = await callApi('bind_device', payload);
    if (res && res.ok) {
      const session = saveSession({id:link.id, token:link.token, name:(res.name || link.name || link.id), role:res.role || roleOf(link.id), device_id});
      removeTokenFromUrl();
      return {ok:true,session,server:!res.preview,msg:res.msg || '裝置綁定成功'};
    }
    if (res && res.preview) {
      const session = saveSession({id:link.id, token:link.token, name:link.name || link.id, role:roleOf(link.id), device_id});
      removeTokenFromUrl();
      return {ok:true,session,server:false,msg:res.msg};
    }
    return res || {ok:false,msg:'裝置綁定失敗'};
  }
  async function verifySession(){
    const s = getSession();
    if (!s) return {ok:false,msg:'尚未登入'};
    const res = await callApi('verify_device', s);
    if (res && res.ok) { localStorage.setItem(keys.verified, new Date().toISOString()); return {ok:true,session:s,server:!res.preview,msg:res.msg || '驗證成功'}; }
    if (res && res.preview) return {ok:true,session:s,server:false,msg:res.msg};
    return res || {ok:false,msg:'驗證失敗'};
  }
  function removeTokenFromUrl(){
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('token'); url.searchParams.delete('TOKEN'); url.searchParams.delete('t');
      window.history.replaceState(null,'',url.pathname.split('/').pop() + url.search + url.hash);
    } catch(e) {}
  }
  function pageFile(key){ const r = cfg.routes || {}; if (key === 'employee') return cfg.employeeHome || r.employee || 'employee_home.html'; return r[key] || key || 'login.html'; }
  function buildUrl(key, extra){
    const file = pageFile(key);
    const s = getSession();
    const url = new URL(file, window.location.href);
    if (s && s.id) url.searchParams.set('id', s.id);
    if (extra) Object.keys(extra).forEach(k=>{ if(extra[k]!==undefined && extra[k]!==null && extra[k] !== '') url.searchParams.set(k, extra[k]); });
    return url.pathname.split('/').pop() + url.search + url.hash;
  }
  function go(key, extra){ window.location.href = buildUrl(key, extra); }
  async function requireLogin(){
    const s = getSession();
    if (!s) { window.location.href = pageFile('login'); return null; }
    window.currentId = s.id; window.currentName = s.name; window.currentToken = s.token; window.currentDeviceId = s.device_id; window.currentRole = s.role;
    return s;
  }
  function logout(){ clearSession(); window.location.href = pageFile('login'); }
  function toast(message){
    let el = document.getElementById('toast');
    if (!el) { el=document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el); }
    el.textContent = message || ''; el.style.display='block'; clearTimeout(window.__angToastTimer); window.__angToastTimer=setTimeout(()=>el.style.display='none',2600);
  }
  window.ANGDeviceAuth = {cfg, keys, clean, qs, normalizeId, randomId, getOrCreateDeviceId, roleOf, saveSession, getSession, clearSession, keepDeviceOnly, hasGoogle, callApi, readLink, bindFromUrl, verifySession, pageFile, buildUrl, go, requireLogin, logout, toast};
})(window);
