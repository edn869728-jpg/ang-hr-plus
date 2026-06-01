
(function(window){
  'use strict';
  function $(id){ return document.getElementById(id); }
  function safeText(id, text){ const el=$(id); if(el) el.textContent = text == null ? '' : String(text); }
  function escapeHtml(str){
    return String(str == null ? '' : str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function bindNav(active){
    document.querySelectorAll('[data-go]').forEach(function(btn){
      btn.addEventListener('click', function(){ ANGAuth.go(btn.getAttribute('data-go')); });
    });
    document.querySelectorAll('[data-active]').forEach(function(btn){
      if (btn.getAttribute('data-active') === active) btn.classList.add('active');
    });
  }
  function renderShellUser(auth){
    auth = auth || ANGAuth.get();
    safeText('welcomeName', auth ? (auth.name || auth.id) : '員工');
    safeText('employeeIdText', auth ? auth.id : '-');
    safeText('roleText', auth ? ANGAuth.guessRole(auth.id) : '-');
    safeText('versionName', (ANGAuth.cfg && ANGAuth.cfg.name) || 'ANG HR');
  }
  function bottomNav(active){
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.innerHTML = `
      <button class="nav-btn" data-go="clock" data-active="clock"><span class="nav-ico">🕒</span><span>打卡</span></button>
      <button class="nav-btn" data-go="schedule" data-active="schedule"><span class="nav-ico">📅</span><span>班表</span></button>
      <button class="nav-btn home" data-go="employee" data-active="employee"><span class="nav-ico">⌂</span><span>主頁</span></button>
      <button class="nav-btn" data-go="salary" data-active="salary"><span class="nav-ico">💰</span><span>薪資</span></button>
      <button class="nav-btn" data-go="upload" data-active="upload"><span class="nav-ico">📤</span><span>上傳</span></button>
    `;
    document.body.appendChild(nav);
    bindNav(active || 'employee');
  }
  window.ANGApp = {$, safeText, escapeHtml, bindNav, renderShellUser, bottomNav};
})(window);
