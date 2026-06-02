(function(){
  'use strict';

  var main = document.getElementById('main');
  var page = (document.body && document.body.getAttribute('data-page')) || 'index';
  var featureMap = window.ANG_HR_FEATURES || {};
  var plan = window.ANG_HR_PLAN || { name:'ANG HR', included:'' };

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c];
    });
  }

  function toast(message){
    var el = document.getElementById('toast');
    if (!el) { alert(message); return; }
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(function(){ el.classList.add('hidden'); }, 2600);
  }

  function auth(){ return window.ANG_HR_AUTH || window.ANGAuth || null; }
  function user(){ var a = auth(); return a && a.getUser ? a.getUser() : null; }
  function api(action, payload){
    if (!window.ANG_HR_API || typeof ANG_HR_API.post !== 'function') return Promise.resolve({ ok:false, message:'API \u5c1a\u672a\u8f09\u5165' });
    return ANG_HR_API.post(action, payload || {});
  }

  function currentQuery(){
    try { return new URLSearchParams(location.search || ''); }
    catch(e){ return new URLSearchParams(); }
  }

  function withAuthUrl(file){
    var a = auth();
    if (a && a.buildUrl) return a.buildUrl(file);
    var u = user() || {};
    var url = new URL(file || 'employee_home.htm', location.href);
    if (u.id) url.searchParams.set('id', u.id);
    if (u.token) url.searchParams.set('token', u.token);
    if (u.device_id) url.searchParams.set('device_id', u.device_id);
    if (u.plan) url.searchParams.set('plan', u.plan);
    if (u.role) url.searchParams.set('role', u.role);
    if (u.company_id) url.searchParams.set('company_id', u.company_id);
    if (u.paid_status) url.searchParams.set('paid_status', u.paid_status);
    url.searchParams.set('source','web');
    url.searchParams.set('v', String(Date.now()));
    return url.toString();
  }

  function setBrand(){
    var brand = document.getElementById('brandName');
    var sub = document.getElementById('brandSub');
    if (brand) brand.textContent = 'ANG.lo Engine';
    if (sub) sub.textContent = 'HR \u7cfb\u7d71\uff5c' + (plan.name || 'ANG HR');
  }

  function bindNav(){
    document.querySelectorAll('[data-page-link]').forEach(function(btn){
      btn.addEventListener('click', function(){ location.href = withAuthUrl(btn.getAttribute('data-page-link')); });
    });
    document.querySelectorAll('[data-home-key]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var key = btn.getAttribute('data-home-key');
        location.href = withAuthUrl(key === 'admin' ? 'admin_home.html' : 'employee_home.htm');
      });
    });
    document.querySelectorAll('[data-feature]').forEach(function(btn){
      var f = btn.getAttribute('data-feature');
      if (featureMap[f] === 0 || featureMap[f] === false) btn.classList.add('hidden');
    });
  }

  function showNav(kind){
    var emp = document.getElementById('employeeNav');
    var adm = document.getElementById('adminNav');
    if (emp) emp.classList.toggle('hidden', kind !== 'employee');
    if (adm) adm.classList.toggle('hidden', kind !== 'admin');
  }

  function authOrLogin(kind){
    var a = auth();
    if (!a) return null;
    var u = a.requireLogin ? a.requireLogin(kind === 'admin' ? 'admin' : null) : user();
    if (!u) return null;
    showNav(kind);
    return u;
  }

  function renderIndex(){
    var u = user();
    if (!u) { location.replace('login.html?v=' + Date.now()); return; }
    location.replace(withAuthUrl('employee_home.htm'));
  }

  function renderEmployeeHome(){
    var u = authOrLogin('employee'); if (!u) return;
    main.innerHTML = `
      <section class="hero">
        <div class="hero-top"><div><div class="hello">\u6b61\u8fce\u56de\u4f86\uff0c${esc(u.name || u.id)}</div><div class="hello-sub">\u54e1\u5de5\u7de8\u865f ${esc(u.id)}\uff5c${esc(plan.name || 'ANG HR')}</div></div><div class="chip">\u54e1\u5de5</div></div>
        <div class="shift"><div><small>\u4eca\u65e5\u72c0\u614b</small><div class="big" id="todayText">\u53ef\u6b63\u5e38\u4f7f\u7528</div></div><div><small>\u767b\u5165\u8eab\u5206</small><div class="big">${esc(u.role)}</div></div></div>
      </section>
      <section class="card"><h1 class="title">\u5feb\u6377\u529f\u80fd</h1><div class="home-action-main"><button class="btn bigbtn" id="goClockBtn">\u6253\u5361\u8a18\u9304</button><button class="btn bigbtn soft" id="goScheduleBtn">\u8acb\u5047\u6392\u73ed</button></div></section>
      <section class="card"><h1 class="title">\u5e38\u7528\u4f5c\u696d</h1><div class="mini-action-grid"><button class="mini-action" id="goSalaryBtn">\u85aa\u8cc7\u660e\u7d30<small>\u67e5\u8a62\u7d00\u9304</small></button><button class="mini-action" id="goUploadBtn">\u8cc7\u6599\u4e0a\u50b3<small data-feature="upload">\u88dc\u4ef6\u8cc7\u6599</small></button></div></section>
      <section class="card"><h1 class="title">\u7cfb\u7d71\u72c0\u614b</h1><div class="notice" id="homeNotice">\u524d\u7aef\u767b\u5165\u8207\u5c0e\u89bd\u5df2\u6062\u5fa9\u3002\u82e5\u5f8c\u7aef API \u66ab\u6642\u7121\u56de\u61c9\uff0c\u9801\u9762\u4ecd\u6703\u4fdd\u7559\u64cd\u4f5c\u5165\u53e3\u3002</div></section>
      <section class="card"><button class="btn gray" id="logoutBtn">\u767b\u51fa</button></section>
    `;
    document.getElementById('goClockBtn').onclick=function(){ location.href = withAuthUrl('employee_clock.html'); };
    document.getElementById('goScheduleBtn').onclick=function(){ location.href = withAuthUrl('employee_schedule.html'); };
    document.getElementById('goSalaryBtn').onclick=function(){ location.href = withAuthUrl('employee_salary.html'); };
    document.getElementById('goUploadBtn').onclick=function(){ location.href = withAuthUrl('employee_upload.html'); };
    document.getElementById('logoutBtn').addEventListener('click', function(){ auth().logout(); });
    api('getHomeStats', { id:u.id, token:u.token }).then(function(res){
      var el = document.getElementById('homeNotice');
      if (el && res && (res.message || res.msg)) el.textContent = res.message || res.msg;
    });
  }

  function renderAdminHome(){
    var u = authOrLogin('admin'); if (!u) return;
    main.innerHTML = `
      <section class="hero"><div class="hero-top"><div><div class="hello">\u7ba1\u7406\u4e3b\u9801</div><div class="hello-sub">${esc(u.name || u.id)}\uff5c${esc(u.role)}\uff5c${esc(plan.included || '')}</div></div><div class="chip">\u7ba1\u7406</div></div></section>
      <section class="card"><h1 class="title">\u7ba1\u7406\u529f\u80fd</h1><div class="admin-extra-nav"><a href="${withAuthUrl('admin_review.html')}">\u5be9\u6838</a><a href="${withAuthUrl('admin_schedule.html')}">\u6392\u73ed</a><a href="${withAuthUrl('admin_people.html')}">\u4eba\u54e1</a><a href="${withAuthUrl('admin_salary.html')}">\u85aa\u8cc7</a><a href="${withAuthUrl('admin_data.html')}" data-feature="data">\u8cc7\u6599</a><a href="${withAuthUrl('admin_notice.html')}">\u516c\u544a</a><a href="${withAuthUrl('admin_settings.html')}" data-feature="settings">\u8a2d\u5b9a</a></div></section>
      <section class="card"><h1 class="title">\u4eca\u65e5\u63d0\u9192</h1><div class="notice" id="adminNotice">\u767b\u5165\u8207\u7ba1\u7406\u5c0e\u89bd\u5df2\u6062\u5fa9\u3002</div></section>
      <section class="card"><button class="btn gray" id="logoutBtn">\u767b\u51fa</button></section>
    `;
    document.getElementById('logoutBtn').addEventListener('click', function(){ auth().logout(); });
    bindNav();
  }

  function renderEmployeeFeature(title, desc, actionName){
    var u = authOrLogin('employee'); if (!u) return;
    main.innerHTML = `
      <section class="hero"><div class="hero-top"><div><div class="hello">${esc(title)}</div><div class="hello-sub">${esc(u.name || u.id)}\uff5c${esc(u.id)}</div></div><div class="chip">\u54e1\u5de5</div></div></section>
      <section class="card"><h1 class="title">${esc(title)}</h1><div class="notice" id="featureNotice">${esc(desc)}</div></section>
      <section class="card"><div class="grid"><button class="btn" id="backHomeBtn">\u56de\u54e1\u5de5\u4e3b\u9801</button><button class="btn soft" id="refreshBtn">\u91cd\u65b0\u6574\u7406</button></div></section>
    `;
    document.getElementById('backHomeBtn').onclick=function(){ location.href = withAuthUrl('employee_home.htm'); };
    document.getElementById('refreshBtn').addEventListener('click', function(){
      api(actionName || 'health', { id:u.id, token:u.token }).then(function(res){ toast((res && (res.message || res.msg)) || '\u5df2\u91cd\u65b0\u6574\u7406'); });
    });
  }

  function renderAdminFeature(title, desc, actionName){
    var u = authOrLogin('admin'); if (!u) return;
    main.innerHTML = `
      <section class="hero"><div class="hero-top"><div><div class="hello">${esc(title)}</div><div class="hero-sub">\u7ba1\u7406\u529f\u80fd\uff5c${esc(u.id)}</div></div><div class="chip">\u7ba1\u7406</div></div></section>
      <section class="card"><h1 class="title">${esc(title)}</h1><div class="notice">${esc(desc)}</div></section>
      <section class="card"><div class="grid"><button class="btn" id="backAdminBtn">\u56de\u7ba1\u7406\u4e3b\u9801</button><button class="btn soft" id="refreshBtn">\u91cd\u65b0\u6574\u7406</button></div></section>
    `;
    document.getElementById('backAdminBtn').onclick=function(){ location.href = withAuthUrl('admin_home.html'); };
    document.getElementById('refreshBtn').addEventListener('click', function(){
      api(actionName || 'health', { id:u.id, token:u.token }).then(function(res){ toast((res && (res.message || res.msg)) || '\u5df2\u91cd\u65b0\u6574\u7406'); });
    });
  }

  function route(){
    setBrand();
    bindNav();
    if (!main) return;
    if (page === 'index') return renderIndex();
    if (page === 'employee_home') return renderEmployeeHome();
    if (page === 'admin_home') return renderAdminHome();
    if (page === 'employee_schedule') return renderEmployeeFeature('\u8acb\u5047\u6392\u73ed', '\u6b64\u9801\u5df2\u6062\u5fa9\u767b\u5165\u6aa2\u67e5\u8207\u5c0e\u89bd\u3002\u6b63\u5f0f\u73ed\u8868\u8207\u8acb\u5047\u8cc7\u6599\u6703\u7531 GAS API \u8f09\u5165\u3002', 'getSchedule');
    if (page === 'employee_clock') return renderEmployeeFeature('\u6253\u5361\u8a18\u9304', '\u6b64\u9801\u5df2\u6062\u5fa9\u767b\u5165\u6aa2\u67e5\u8207\u5c0e\u89bd\u3002\u6253\u5361\u8207\u88dc\u6253\u5361\u529f\u80fd\u5165\u53e3\u53ef\u6b63\u5e38\u4f7f\u7528\u3002', 'getClockRecords');
    if (page === 'employee_salary') return renderEmployeeFeature('\u85aa\u8cc7\u660e\u7d30', '\u6b64\u9801\u5df2\u6062\u5fa9\u767b\u5165\u6aa2\u67e5\u8207\u5c0e\u89bd\u3002\u85aa\u8cc7\u8cc7\u6599\u6703\u7531 GAS API \u8f09\u5165\u3002', 'getSalaryHistory');
    if (page === 'employee_upload') return renderEmployeeFeature('\u8cc7\u6599\u4e0a\u50b3', '\u6b64\u9801\u5df2\u6062\u5fa9\u767b\u5165\u6aa2\u67e5\u8207\u5c0e\u89bd\u3002\u4e0a\u50b3\u529f\u80fd\u9700\u9023\u63a5 GAS API\u3002', 'getUploads');
    if (page === 'admin_review') return renderAdminFeature('\u5be9\u6838\u4e2d\u5fc3', '\u8acb\u5047\u3001\u88dc\u6253\u5361\u3001\u8cc7\u6599\u4e0a\u50b3\u8207\u591a\u7d1a\u5be9\u6838\u5165\u53e3\u3002', 'getReviewList');
    if (page === 'admin_schedule') return renderAdminFeature('\u6392\u73ed\u7ba1\u7406', '\u9031\u6392\u73ed / \u6708\u6392\u73ed / \u6b63\u5f0f\u767c\u5e03\u6392\u73ed\u7ba1\u7406\u5165\u53e3\u3002', 'getAdminSchedule');
    if (page === 'admin_people') return renderAdminFeature('\u4eba\u54e1\u7ba1\u7406', '\u54e1\u5de5\u8cc7\u6599\u3001\u89d2\u8272\u3001\u5bc6\u78bc\u91cd\u8a2d\u8207\u73ed\u5225\u8a2d\u5b9a\u5165\u53e3\u3002', 'getPeople');
    if (page === 'admin_salary') return renderAdminFeature('\u85aa\u8cc7\u7ba1\u7406', '\u85aa\u8cc7\u8a08\u7b97\u8207\u660e\u7d30\u67e5\u8a62\u5165\u53e3\u3002', 'getAdminSalary');
    if (page === 'admin_data') return renderAdminFeature('\u8cc7\u6599\u7ba1\u7406', '\u4e0a\u50b3\u8cc7\u6599\u3001\u4ee3\u588a\u3001\u8b49\u660e\u8207\u9644\u4ef6\u7ba1\u7406\u5165\u53e3\u3002', 'getUploads');
    if (page === 'admin_notice') return renderAdminFeature('\u516c\u544a\u7ba1\u7406', '\u516c\u544a\u767c\u5e03\u8207\u901a\u77e5\u7ba1\u7406\u5165\u53e3\u3002', 'getNotifications');
    if (page === 'admin_settings') return renderAdminFeature('\u7cfb\u7d71\u8a2d\u5b9a', '\u7248\u672c\u8a2d\u5b9a\u3001\u4e3b\u984c\u8272\u3001Drive \u8cc7\u6599\u593e\u8207\u5be9\u6838\u6d41\u7a0b\u5165\u53e3\u3002', 'getSystemSettings');
    renderIndex();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route);
  else route();
})();