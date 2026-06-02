(function(window, document){
  'use strict';

  function ready(fn){ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function str(v){ return v == null ? '' : String(v); }
  function esc(v){ return str(v).replace(/[&<>'"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]; }); }
  function pageName(){
    var p = (document.body && document.body.dataset && document.body.dataset.page) || '';
    if (p) return p;
    var file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/i,'');
    return file || 'index';
  }
  function mainEl(){ return document.getElementById('main') || document.querySelector('main.app-shell'); }
  function toast(msg){ if(window.ANGAuth && ANGAuth.toast) ANGAuth.toast(msg); else alert(msg); }
  function isAdmin(role){ return ['admin','manager','creator'].indexOf(String(role || '').toLowerCase()) >= 0; }
  function featureAllowed(feature){
    var m = window.ANG_HR_FEATURES || {};
    if (m[feature] === false || m[feature] === 0) return false;
    return true;
  }
  function route(file){ if(window.ANGAuth) ANGAuth.goPage(file); else location.href = file; }

  function bindIndexLogin(){
    var form = document.getElementById('loginForm');
    if (!form || !window.ANGAuth) return;

    var q = ANGAuth.getQuery();
    var idInput = document.getElementById('loginId');
    var codeInput = document.getElementById('activationCode');
    var deviceInput = document.getElementById('deviceId');
    var clearBtn = document.getElementById('clearBtn');

    if (idInput && q.id) idInput.value = ANGAuth.normalizeId(q.id);
    if (codeInput && (q.activation_code || q.activationCode || q.code || q.token)) codeInput.value = q.activation_code || q.activationCode || q.code || q.token;
    if (deviceInput && (q.device_id || q.deviceId || q.device)) deviceInput.value = q.device_id || q.deviceId || q.device;

    if ((q.autologin === '1' || q.source === 'app' || q.app === 'ang_hr') && q.id && (q.activation_code || q.activationCode || q.code || q.token)) {
      setTimeout(function(){ form.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true })); }, 120);
    }

    form.addEventListener('submit', async function(e){
      e.preventDefault();
      var btn = document.getElementById('loginBtn');
      if (btn) { btn.disabled = true; btn.textContent = '啟用中...'; }
      var res = await ANGAuth.activate({
        id: idInput ? idInput.value : '',
        activation_code: codeInput ? codeInput.value : '',
        device_id: deviceInput ? deviceInput.value : '',
        plan: window.ANG_HR_DEFAULT_PLAN || document.body.dataset.plan || ''
      });
      if (btn) { btn.disabled = false; btn.textContent = '啟用並登入'; }
      if (!res || !res.ok) { toast((res && res.message) || '啟用失敗'); return; }
      toast('登入成功');
      setTimeout(function(){ ANGAuth.goHome(); }, 220);
    });

    if (clearBtn) clearBtn.addEventListener('click', function(){
      ANGAuth.clearSession();
      if (idInput) idInput.value = '';
      if (codeInput) codeInput.value = '';
      if (deviceInput) deviceInput.value = '';
      toast('已清除登入資料');
    });
  }

  function layoutNav(kind){
    var old = document.querySelector('.bottom-nav');
    if (old) old.remove();
    if (!window.ANGAuth || !ANGAuth.isLoggedIn()) return;
    var nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.innerHTML = '<button class="nav-btn" data-go="employee_schedule.html"><span class="nav-ico">📅</span><span>排班</span></button>'+
      '<button class="nav-btn" data-go="employee_clock.html"><span class="nav-ico">🕒</span><span>打卡</span></button>'+
      '<button class="nav-btn home active" data-go="employee_home.htm"><span class="nav-ico">⌂</span><span>主頁</span></button>'+
      '<button class="nav-btn" data-go="employee_salary.html"><span class="nav-ico">💰</span><span>薪資</span></button>'+
      '<button class="nav-btn" data-go="employee_upload.html"><span class="nav-ico">📤</span><span>上傳</span></button>';
    nav.querySelectorAll('[data-go]').forEach(function(btn){ btn.addEventListener('click', function(){ route(btn.getAttribute('data-go')); }); });
    document.body.appendChild(nav);
  }

  function renderEmployeeHome(){
    if(!ANGAuth.requireLogin()) return;
    var u = ANGAuth.getUser();
    var m = mainEl();
    if (!m) return;
    m.innerHTML = '<header class="topbar"><div class="brand"><div class="logo-mark">A</div><div><h1>ANG HR</h1><p>安全裝置登入 v4</p></div></div><div class="pill">'+esc(u.plan || '')+'</div></header>'+
      '<section class="grid"><div class="card span-12"><div class="card-title">歡迎回來，'+esc(u.name || u.id)+'</div><div class="notice">員工編號 '+esc(u.id)+'｜角色 '+esc(u.role)+'｜方案 '+esc(u.plan)+'</div><div class="row"><button class="btn primary" data-go="employee_clock.html">打卡記錄</button><button class="btn light" data-go="employee_schedule.html">請假排班</button><button class="btn gray" id="logoutBtn">登出</button></div></div></section>';
    m.querySelectorAll('[data-go]').forEach(function(b){ b.addEventListener('click', function(){ route(b.getAttribute('data-go')); }); });
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', function(){ ANGAuth.logout(); });
    layoutNav('employee');
  }

  function renderAdminHome(){
    if(!ANGAuth.requireLogin('admin')) return;
    var u = ANGAuth.getUser();
    var m = mainEl();
    if (!m) return;
    m.innerHTML = '<header class="topbar"><div class="brand"><div class="logo-mark">A</div><div><h1>管理主頁</h1><p>權限由 GAS 驗證回傳</p></div></div><div class="pill">'+esc(u.role)+'</div></header>'+
      '<section class="grid"><div class="card span-12"><div class="card-title">管理功能</div><div class="row"><button class="btn primary" data-go="admin_review.html">審核</button><button class="btn light" data-go="admin_schedule.html">排班</button><button class="btn light" data-go="admin_people.html">人員</button><button class="btn light" data-go="admin_settings.html">系統</button><button class="btn gray" id="logoutBtn">登出</button></div></div></section>';
    m.querySelectorAll('[data-go]').forEach(function(b){ b.addEventListener('click', function(){ route(b.getAttribute('data-go')); }); });
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', function(){ ANGAuth.logout(); });
  }

  function renderSimple(title, admin){
    if(!ANGAuth.requireLogin(admin ? 'admin' : null)) return;
    var u = ANGAuth.getUser();
    var m = mainEl(); if(!m) return;
    m.innerHTML = '<header class="topbar"><div class="brand"><div class="logo-mark">A</div><div><h1>'+esc(title)+'</h1><p>'+esc(u.id)+'｜secure v4</p></div></div></header><section class="grid"><div class="card span-12"><div class="notice">此頁已套用安全裝置登入 v4。資料操作需由 GAS 再驗證 token / device_id / role / plan。</div><div class="row"><button class="btn gray" id="backBtn">返回</button></div></div></section>';
    var back = document.getElementById('backBtn'); if(back) back.addEventListener('click', function(){ route(admin ? 'admin_home.html' : 'employee_home.htm'); });
    if(!admin) layoutNav('employee');
  }

  function routePage(){
    if(!window.ANGAuth) { console.error('ANGAuth is not defined'); return; }
    ANGAuth.bootstrapFromQuery({ autoRedirect:false });
    ANGAuth.installGlobals();
    var p = pageName();
    if (p === 'index' || p === 'login') { bindIndexLogin(); return; }
    if (p === 'employee_home' || p === 'employee_home.htm') return renderEmployeeHome();
    if (p === 'admin_home') return renderAdminHome();
    if (p.indexOf('admin_') === 0) return renderSimple(p.replace(/_/g,' '), true);
    if (p.indexOf('employee_') === 0) return renderSimple(p.replace(/_/g,' '), false);
  }

  window.ANGApp = window.ANGApp || {};
  window.ANGApp.route = route;
  window.ANGApp.renderEmployeeHome = renderEmployeeHome;
  window.ANGApp.renderAdminHome = renderAdminHome;
  window.goPage = route;
  window.goClock = function(){ route('employee_clock.html'); };
  window.goSalary = function(){ route('employee_salary.html'); };
  window.goUpload = function(){ route('employee_upload.html'); };
  window.goIndex = function(){ route('employee_home.htm'); };
  window.logout = function(){ if(window.ANGAuth) ANGAuth.logout(); };

  ready(routePage);
})(window, document);
