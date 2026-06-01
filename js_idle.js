
(function(window){
  'use strict';
  function $(id){return document.getElementById(id)}
  function text(id,v){const el=$(id); if(el) el.textContent = v == null ? '' : String(v)}
  function escapeHtml(str){return String(str==null?'':str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
  function renderUser(s){s=s||ANGDeviceAuth.getSession(); text('welcomeName',s?(s.name||s.id):'員工'); text('employeeIdText',s?s.id:'-'); text('deviceIdText',s?s.device_id:ANGDeviceAuth.getOrCreateDeviceId()); text('roleText',s?(s.role||ANGDeviceAuth.roleOf(s.id)):'-'); text('tokenStateText',s?'已儲存':'未登入')}
  function bindNav(active){document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>ANGDeviceAuth.go(btn.getAttribute('data-go')))); document.querySelectorAll('[data-active]').forEach(btn=>{if(btn.getAttribute('data-active')===active) btn.classList.add('active')})}
  function bottomNav(active){const nav=document.createElement('nav'); nav.className='bottom-nav'; nav.innerHTML=`<button class="nav-btn" data-go="clock" data-active="clock"><span class="nav-ico">🕒</span><span>打卡</span></button><button class="nav-btn" data-go="schedule" data-active="schedule"><span class="nav-ico">📅</span><span>班表</span></button><button class="nav-btn home" data-go="employee" data-active="employee"><span class="nav-ico">⌂</span><span>主頁</span></button><button class="nav-btn" data-go="salary" data-active="salary"><span class="nav-ico">💰</span><span>薪資</span></button><button class="nav-btn" data-go="upload" data-active="upload"><span class="nav-ico">📤</span><span>上傳</span></button>`; document.body.appendChild(nav); bindNav(active||'employee')}
  window.ANGApp = {$, text, escapeHtml, renderUser, bindNav, bottomNav};
})(window);
