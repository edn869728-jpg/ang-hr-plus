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
    if (!window.ANG_HR_API || typeof ANG_HR_API.post !== 'function') return Promise.resolve({ ok:false, message:'API 尚未載入' });
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
    var url = new URL(file || 'employee_home.html', location.href);
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
    if (sub) sub.textContent = 'HR 系統｜' + (plan.name || 'ANG HR');
  }

  function bindNav(){
    document.querySelectorAll('[data-page-link]').forEach(function(btn){
      btn.addEventListener('click', function(){ location.href = withAuthUrl(btn.getAttribute('data-page-link')); });
    });
    document.querySelectorAll('[data-home-key]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var key = btn.getAttribute('data-home-key');
        location.href = withAuthUrl(key === 'admin' ? 'admin_home.html' : 'employee_home.html');
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
    // App 登入後一律先進員工主頁，不因 creator/admin 自動跳管理頁，避免卡跳轉。
    location.replace(withAuthUrl('employee_home.html'));
  }

  function renderEmployeeHome(){
    var u = authOrLogin('employee'); if (!u) return;
    main.innerHTML = `
      <section class="hero">
        <div class="hero-top"><div><div class="hello">歡迎回來，${esc(u.name || u.id)}</div><div class="hello-sub">員工編號 ${esc(u.id)}｜${esc(plan.name || 'ANG HR')}</div></div><div class="chip">員工主頁</div></div>
        <div class="shift"><div><small>今日狀態</small><div class="big" id="todayText">可正常使用</div></div><div><small>登入身分</small><div class="big">${esc(u.role)}</div></div></div>
      </section>
      <section class="card"><h1 class="title">快捷功能</h1><div class="home-action-main"><button class="btn bigbtn" id="goClockBtn">打卡記錄</button><button class="btn bigbtn soft" id="goScheduleBtn">請假排班</button></div></section>
      <section class="card"><h1 class="title">常用作業</h1><div class="mini-action-grid"><button class="mini-action" id="goSalaryBtn">薪資明細<small>查詢紀錄</small></button><button class="mini-action" id="goUploadBtn">資料上傳<small>收據/證明</small></button><button class="mini-action" id="logoutBtn">登出<small>切換帳號</small></button></div></section>
      <section class="card"><h1 class="title">系統狀態</h1><div class="notice" id="homeNotice">前端登入與導覽已恢復。若後端 API 暫時無回應，頁面仍會保留操作入口。</div></section>
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
      <section class="hero"><div class="hero-top"><div><div class="hello">管理主頁</div><div class="hello-sub">${esc(u.name || u.id)}｜${esc(u.role)}｜${esc(plan.included || '')}</div></div><div class="chip">管理</div></div><div class="shift"><div><small>審核流程</small><div class="big">啟用</div></div><div><small>版本</small><div class="big">${esc(plan.name || 'ANG HR')}</div></div></div></section>
      <section class="card"><h1 class="title">管理功能</h1><div class="admin-extra-nav"><a href="${withAuthUrl('admin_review.html')}">審核</a><a href="${withAuthUrl('admin_schedule.html')}">排班</a><a href="${withAuthUrl('admin_people.html')}">人員</a><a href="${withAuthUrl('admin_salary.html')}">薪資</a><a href="${withAuthUrl('admin_data.html')}">資料</a><a href="${withAuthUrl('admin_settings.html')}">系統</a></div></section>
      <section class="card"><h1 class="title">今日提醒</h1><div class="notice" id="adminNotice">登入與管理導覽已恢復。</div></section>
      <section class="card"><button class="btn gray" id="logoutBtn">登出</button></section>
    `;
    document.getElementById('logoutBtn').addEventListener('click', function(){ auth().logout(); });
  }

  function renderEmployeeFeature(title, desc, actionName){
    var u = authOrLogin('employee'); if (!u) return;
    main.innerHTML = `
      <section class="hero"><div class="hero-top"><div><div class="hello">${esc(title)}</div><div class="hello-sub">${esc(u.name || u.id)}｜${esc(u.id)}</div></div><div class="chip">員工</div></div></section>
      <section class="card"><h1 class="title">${esc(title)}</h1><div class="notice" id="featureNotice">${esc(desc)}</div></section>
      <section class="card"><div class="grid"><button class="btn" id="backHomeBtn">回員工主頁</button><button class="btn soft" id="refreshBtn">重新整理</button></div></section>
    `;
    document.getElementById('backHomeBtn').onclick=function(){ location.href = withAuthUrl('employee_home.html'); };
    document.getElementById('refreshBtn').addEventListener('click', function(){
      api(actionName || 'health', { id:u.id, token:u.token }).then(function(res){ toast((res && (res.message || res.msg)) || '已重新整理'); });
    });
  }

  function renderAdminFeature(title, desc, actionName){
    var u = authOrLogin('admin'); if (!u) return;
    main.innerHTML = `
      <section class="hero"><div class="hero-top"><div><div class="hello">${esc(title)}</div><div class="hello-sub">管理功能｜${esc(u.id)}</div></div><div class="chip">管理</div></div></section>
      <section class="card"><h1 class="title">${esc(title)}</h1><div class="notice">${esc(desc)}</div></section>
      <section class="card"><div class="grid"><button class="btn" id="backAdminBtn">回管理主頁</button><button class="btn soft" id="refreshBtn">重新整理</button></div></section>
    `;
    document.getElementById('backAdminBtn').onclick=function(){ location.href = withAuthUrl('admin_home.html'); };
    document.getElementById('refreshBtn').addEventListener('click', function(){
      api(actionName || 'health', { id:u.id, token:u.token }).then(function(res){ toast((res && (res.message || res.msg)) || '已重新整理'); });
    });
  }

  function route(){
    setBrand();
    bindNav();
    if (!main) return;
    if (page === 'index') return renderIndex();
    if (page === 'employee_home') return renderEmployeeHome();
    if (page === 'admin_home') return renderAdminHome();
    if (page === 'employee_schedule') return renderEmployeeFeature('請假排班', '此頁已恢復登入檢查與導覽。正式班表與請假資料會由 GAS API 載入。', 'getSchedule');
    if (page === 'employee_clock') return renderEmployeeFeature('打卡記錄', '此頁已恢復登入檢查與導覽。打卡與補打卡功能入口可正常使用。', 'getClockRecords');
    if (page === 'employee_salary') return renderEmployeeFeature('薪資明細', '此頁已恢復登入檢查與導覽。薪資資料會由 GAS API 載入。', 'getSalaryHistory');
    if (page === 'employee_upload') return renderEmployeeFeature('資料上傳', '此頁已恢復登入檢查與導覽。上傳功能需連接 GAS API。', 'getUploads');
    if (page === 'admin_review') return renderAdminFeature('審核中心', '請假、補打卡、資料上傳與多級審核入口。', 'getReviewList');
    if (page === 'admin_schedule') return renderAdminFeature('排班管理', '週排班 / 月排班 / 正式發布排班管理入口。', 'getAdminSchedule');
    if (page === 'admin_people') return renderAdminFeature('人員管理', '員工資料、角色、密碼重設與班別設定入口。', 'getPeople');
    if (page === 'admin_salary') return renderAdminFeature('薪資管理', '薪資計算與明細查詢入口。', 'getAdminSalary');
    if (page === 'admin_data') return renderAdminFeature('資料管理', '上傳資料、代墊、證明與附件管理入口。', 'getUploads');
    if (page === 'admin_notice') return renderAdminFeature('公告管理', '公告發布與通知管理入口。', 'getNotifications');
    if (page === 'admin_settings') return renderAdminFeature('系統設定', '版本設定、主題色、Drive 資料夾與審核流程入口。', 'getSystemSettings');
    renderIndex();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route);
  else route();
})();
