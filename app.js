
(function(window){
  'use strict';
  const cfg = window.ANG_HR_CONFIG || {};
  const routes = cfg.routes || {};
  const storagePrefix = 'ang_hr_' + (cfg.version || 'app') + '_';

  function qs(){ return new URLSearchParams(window.location.search || ''); }
  function clean(v){ return String(v == null ? '' : v).trim(); }
  function normalizeId(input){
    let raw = clean(input).toUpperCase().replace(/\s+/g,'');
    if (!raw) return '';
    const m1 = raw.match(/^ANG\d{1,8}$/);
    if (m1) return 'ANG' + raw.replace(/^ANG/,'').padStart(4,'0');
    const m2 = raw.match(/(\d{1,8})/);
    if (m2) return 'ANG' + m2[1].padStart(4,'0');
    return raw;
  }
  function storageKeys(){
    return {
      id: storagePrefix + 'id',
      token: storagePrefix + 'token',
      name: storagePrefix + 'name',
      role: storagePrefix + 'role',
      logged: storagePrefix + 'logged'
    };
  }
  function save(auth){
    const k = storageKeys();
    const id = normalizeId(auth && auth.id);
    if (!id) return null;
    const name = clean(auth.name || auth.displayName || localStorage.getItem(k.name) || id);
    const token = clean(auth.token || localStorage.getItem(k.token) || '');
    const role = clean(auth.role || localStorage.getItem(k.role) || guessRole(id));
    localStorage.setItem(k.id, id);
    localStorage.setItem(k.name, name);
    localStorage.setItem(k.token, token);
    localStorage.setItem(k.role, role);
    localStorage.setItem(k.logged, 'true');
    // 舊版相容鍵，避免跳頁後抓不到員工 ID
    localStorage.setItem('emp_logged_in', id);
    localStorage.setItem('loginId', id);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('emp_name', name);
    if (token) localStorage.setItem('loginToken', token);
    return {id, name, token, role};
  }
  function get(){
    const p = qs();
    const k = storageKeys();
    const urlId = normalizeId(p.get('id') || p.get('ID') || p.get('emp') || '');
    const urlName = clean(p.get('name') || p.get('NAME') || '');
    const urlToken = clean(p.get('token') || p.get('TOKEN') || '');
    if (urlId) return save({id:urlId, name:urlName || localStorage.getItem(k.name) || localStorage.getItem('emp_name') || urlId, token:urlToken || localStorage.getItem(k.token) || localStorage.getItem('loginToken') || ''});
    const id = normalizeId(localStorage.getItem(k.id) || localStorage.getItem('emp_logged_in') || localStorage.getItem('loginId') || '');
    if (!id) return null;
    return save({id, name: localStorage.getItem(k.name) || localStorage.getItem('emp_name') || id, token: localStorage.getItem(k.token) || localStorage.getItem('loginToken') || '', role: localStorage.getItem(k.role) || guessRole(id)});
  }
  function clear(){
    const k = storageKeys();
    Object.keys(k).forEach(function(x){ localStorage.removeItem(k[x]); });
    ['emp_logged_in','loginId','isLoggedIn','emp_name','loginToken','authToken'].forEach(function(x){ localStorage.removeItem(x); });
  }
  function guessRole(id){
    id = normalizeId(id);
    if (id === 'ANG0603') return 'creator';
    if (id === 'ANG0606') return 'manager';
    if (id === 'ANG0601') return 'admin';
    return 'employee';
  }
  function pageFile(key){
    if (key === 'employee') return cfg.employeeHome || routes.employee || 'employee_home.html';
    return routes[key] || key || 'index.html';
  }
  function buildUrl(key, extra, options){
    const file = pageFile(key);
    const url = new URL(file, window.location.href);
    const auth = options && options.noAuth ? null : get();
    if (auth && auth.id) url.searchParams.set('id', auth.id);
    if (auth && auth.token) url.searchParams.set('token', auth.token);
    if (auth && auth.name && auth.name !== auth.id) url.searchParams.set('name', auth.name);
    if (extra) Object.keys(extra).forEach(function(k){ if (extra[k] !== undefined && extra[k] !== null && extra[k] !== '') url.searchParams.set(k, extra[k]); });
    return url.pathname.split('/').pop() + url.search + url.hash;
  }
  function go(key, extra, options){ window.location.href = buildUrl(key, extra, options); }
  function requireLogin(){
    const auth = get();
    if (!auth || !auth.id){ go('login', null, {noAuth:true}); return null; }
    const p = qs();
    if (!p.get('id') && !p.get('ID')) {
      const url = new URL(window.location.href);
      url.searchParams.set('id', auth.id);
      if (auth.token) url.searchParams.set('token', auth.token);
      if (auth.name && auth.name !== auth.id) url.searchParams.set('name', auth.name);
      window.history.replaceState(null, '', url.pathname.split('/').pop() + url.search + url.hash);
    }
    window.currentId = auth.id;
    window.currentName = auth.name;
    window.currentRole = auth.role;
    return auth;
  }
  function logout(){ clear(); go('login', null, {noAuth:true}); }
  function hasGoogle(){ return typeof google !== 'undefined' && google && google.script && google.script.run; }
  function toast(message){
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message || '';
    el.style.display = 'block';
    clearTimeout(window.__angToastTimer);
    window.__angToastTimer = setTimeout(function(){ el.style.display = 'none'; }, 2600);
  }
  window.ANGAuth = {cfg, qs, clean, normalizeId, save, get, clear, logout, guessRole, pageFile, buildUrl, go, requireLogin, hasGoogle, toast};
})(window);
