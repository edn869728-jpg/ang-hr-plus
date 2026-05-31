(function(){const page=document.body.dataset.page||'index',main=document.getElementById('main'),empNav=document.getElementById('employeeNav'),adminNav=document.getElementById('adminNav');const emp=['employee_home','employee_schedule','employee_clock','employee_salary','employee_upload'],adm=['admin_home','admin_review','admin_schedule','admin_salary','admin_people','admin_settings','admin_data','admin_notice'];function has(f){const v=ANG_HR_FEATURES[f];return v===true||v===1||typeof v==='number'}function cleanLoginValue(v){
  v = String(v || '');
  if (v.indexOf('<?') >= 0 || v.indexOf('?>') >= 0 || v.toUpperCase().indexOf('TYPEOF ID') >= 0 || v.toUpperCase().indexOf('UNDEFINED') >= 0) {
    return '';
  }
  return v.replace(/[<>"'?=]/g, '').trim();
}
function clearBadStoredLogin(){
  const keys = ['ang_employee_id','ang_employee_name','ang_employee_role','ang_hr_token'];
  const v = String(localStorage.getItem('ang_employee_id') || '');
  if (v.indexOf('<?') >= 0 || v.indexOf('?>') >= 0 || v.toUpperCase().indexOf('TYPEOF ID') >= 0 || v.toUpperCase().indexOf('UNDEFINED') >= 0) {
    keys.forEach(k => localStorage.removeItem(k));
  }
}

function toast(m){const el=document.getElementById('toast');el.textContent=m;el.classList.remove('hidden');setTimeout(()=>el.classList.add('hidden'),2600)}function route(f){location.href=f}function homeKey(){if(page==='employee_home'){if(has('admin'))route('admin_home.html');return}if(page==='admin_home'){route('employee_home.html');return}if(adm.includes(page))route('admin_home.html');else route('employee_home.html')}function applyBrand(){document.getElementById('brandSub').textContent=`HR 系統｜${ANG_HR_PLAN.name}｜${ANG_HR_PLAN.included}`}function feature(p){return{employee_home:'clock',employee_schedule:'leave',employee_clock:'clock',employee_salary:'salary',employee_upload:'upload',admin_home:'admin',admin_review:'review',admin_schedule:'admin_schedule',admin_salary:'admin_salary',admin_people:'people',admin_settings:'settings',admin_data:'data',admin_notice:'notice'}[p]||''}function guard(){clearBadStoredLogin();if(['index','login','activate','noperm'].includes(page))return true;if(!ANG_HR_AUTH.requireLogin())return false;const f=feature(page);if(f&&!has(f)){localStorage.setItem('ang_noperm_reason',`此版本未開放：${f}`);location.href='noperm.html';return false}return true}function nav(){empNav.classList.toggle('hidden',!emp.includes(page));adminNav.classList.toggle('hidden',!adm.includes(page));document.querySelectorAll('[data-feature]').forEach(el=>{if(!has(el.dataset.feature))el.classList.add('hidden')});document.querySelectorAll('[data-page-link]').forEach(b=>b.onclick=()=>route(b.dataset.pageLink));document.querySelectorAll('[data-home-key]').forEach(b=>b.onclick=homeKey)}function hero(t,s){return `<div class="hero"><div class="hero-top"><div><div class="hello">${t}</div><div class="hello-sub">${s}</div></div><div class="chip">${ANG_HR_PLAN.name}</div></div><div class="shift"><div><small>授權額度</small><div class="big">${ANG_HR_PLAN.included}</div></div><div><small>版本狀態</small><div class="big">正常</div></div></div></div>`}
  function legacyPageTarget(){
    const params = new URLSearchParams(location.search);
    const p = String(params.get('page') || '').toLowerCase().trim();
    const map = {
      employee:'employee_home.html',
      admin:'admin_home.html',
      clock:'employee_clock.html',
      mysalary:'employee_salary.html',
      salary:'employee_salary.html',
      upload:'employee_upload.html',
      schedule:'employee_schedule.html',
      leave:'employee_schedule.html',
      review:'admin_review.html',
      people:'admin_people.html',
      settings:'admin_settings.html',
      data:'admin_data.html',
      notice:'admin_notice.html',
      boss:'admin_home.html',
      creator:'admin_home.html',
      manager:'admin_home.html',
      login:'login.html',
      activate:'activate.html'
    };
    return map[p] || '';
  }

  function renderIndex(){const legacy=legacyPageTarget();if(legacy){location.href=legacy;return;}if((ANG_HR_AUTH.isLoggedIn?ANG_HR_AUTH.isLoggedIn():false)){const r=(ANG_HR_AUTH.user?ANG_HR_AUTH.user():ANG_HR_AUTH.currentUser()).role;location.href=(['admin','manager','creator'].includes(r))?'admin_home.html':'employee_home.html'}else location.href='login.html'}
  function renderLogin(){
    clearBadStoredLogin();
    localStorage.removeItem('ang_employee_id_template_garbage');
    const plan=window.ANG_HR_PLAN||{};
    const savedId=cleanLoginValue(localStorage.getItem('ang_employee_id')||'');

    main.innerHTML = `
      ${hero('ANG HR 登入','請輸入員工編號與密碼')}
      <section class="card">
        <label class="label" for="loginId">員工編號</label>
        <input id="loginId" autocomplete="username" placeholder="例如 ANG0603" value="">
        <label class="label" for="loginPassword">密碼</label>
        <input id="loginPassword" type="password" autocomplete="current-password" placeholder="請輸入密碼">
        <button class="btn" id="loginBtn">登入</button>
        <button class="btn soft" style="margin-top:8px" onclick="location.href='activate.html'">啟用 / 綁定帳號</button>
        <button class="btn gray" style="margin-top:8px" onclick="ANG_HR_APP.openForgotPassword()">忘記密碼 / 重設密碼</button>
      </section>
    `;

    const input=document.getElementById('loginId');
    if(input) input.value=savedId;

    document.getElementById('loginBtn').addEventListener('click', async function(){
      const btn=this;
      btn.disabled=true;
      btn.textContent='登入中...';
      const id=cleanLoginValue(document.getElementById('loginId').value).toUpperCase();
      const password=document.getElementById('loginPassword').value;
      if(!id){
        toast('請輸入員工編號');
        btn.disabled=false;
        btn.textContent='登入';
        return;
      }
      const res=await ANG_HR_API.post('login',{id,password});
      btn.disabled=false;
      btn.textContent='登入';
      if(!res.ok){
        toast(res.message||'登入失敗');
        return;
      }
      ANG_HR_AUTH.saveLogin(res);
      toast('登入成功');
      const role=String(res.role||'employee').toLowerCase();
      location.href=(role==='admin'||role==='manager'||role==='creator')?'admin_home.html':'employee_home.html';
    });
  }

  function renderActivate(){main.innerHTML=hero('啟用 / 綁定','首次使用或重新綁定裝置')+`<section class="card"><input placeholder="員工編號 ANGxxxx"><input placeholder="啟用碼"><button class="btn" onclick="ANG_HR_APP.demoAction('activate')">啟用帳號</button><button class="btn soft" style="margin-top:8px" onclick="location.href='login.html'">回登入</button></section>`}function renderNoPerm(){main.innerHTML=hero('無權限','功能未開放 / 方案到期 / 權限不足')+`<section class="card locked"><h3 class="title">無法進入</h3><div class="notice locked">${localStorage.getItem('ang_noperm_reason')||'此功能未開放或權限不足。'}</div><button class="btn soft" style="margin-top:10px" onclick="location.href='employee_home.html'">回員工主頁</button></section>`}async function renderEmployeeHome(){const t=await ANG_HR_API.post('getTodayStatus',{});main.innerHTML=hero(`哈囉，${(ANG_HR_AUTH.user?ANG_HR_AUTH.user():ANG_HR_AUTH.currentUser()).name||'員工'}`,'今日看板｜打開首頁即可打卡')+`<section class="card"><div class="row"><h3 class="title">今日打卡卡片</h3><span class="badge">GPS</span></div><div class="grid"><div class="tile"><b>今日班別</b><span>${t.shift||'A 08:00-16:00'}</span></div><div class="tile"><b>今日狀態</b><span>${t.status||'待上班打卡'}</span></div><div class="tile"><b>應上班</b><span>08:00</span></div><div class="tile"><b>應下班</b><span>16:00</span></div></div><div class="home-action-main" style="margin-top:10px"><button class="btn bigbtn" onclick="ANG_HR_APP.clockNow('in')">上班打卡</button><button class="btn bigbtn soft" onclick="ANG_HR_APP.clockNow('out')">下班打卡</button></div></section><section class="card"><div class="row"><h3 class="title">常用申請</h3><span class="badge">精簡</span></div><div class="mini-action-grid"><button class="mini-action" onclick="location.href='employee_schedule.html'">請假<small>到請假區</small></button><button class="mini-action" onclick="location.href='employee_clock.html'">補打卡<small>到補卡區</small></button>${has('upload')?`<button class="mini-action" onclick="location.href='employee_upload.html'">資料補件<small>收據/證明</small></button>`:''}</div></section><section class="card"><div class="row"><h3 class="title">今日 / 明日 / 後天</h3><span class="badge">提醒</span></div><div class="todo-grid"><div class="todo-item"><div><b>今日</b><span>${t.status||'待上班打卡'}</span></div><div class="todo-pill">今日</div></div><div class="todo-item"><div><b>明日</b><span>${t.tomorrow||'明日 A 班'}</span></div><div class="todo-pill">明日</div></div><div class="todo-item"><div><b>後天</b><span>${t.afterTomorrow||'後天休'}</span></div><div class="todo-pill">後天</div></div></div></section>`}function renderSchedule(){
    main.innerHTML=hero('請假排班','上半部正式班表 / 排休，下半部請假申請')+
    (has('schedule')?`<section class="card">
      <div class="row"><h3 class="title">正式班表 / 排休</h3><span class="badge">全店班表</span></div>
      <div class="notice" style="margin-bottom:10px">排班月曆顯示全店 / 全分店正式班表；自己有班但請假會保留班表並灰色淡化。</div>
      <div class="calendar" id="calSchedule"></div>
      <div class="legend"><span><i class="dot" style="background:#FF87E0"></i>上班</span><span><i class="dot" style="background:#8089FF"></i>其他員工</span><span><i class="dot" style="background:#9ca3af"></i>自己請假</span></div>
      <div class="week-row">${['週一','週二','週三','週四','週五','週六','週日'].map(d=>`<button class="btn soft">${d}</button>`).join('')}</div>
      <button class="btn" style="margin-top:10px" onclick="ANG_HR_APP.demoAction('submitPreselect')">送出排休</button>
    </section>`:'')+
    `<section class="card">
      <div class="row"><h3 class="title">請假申請</h3><span class="badge">依班表計算</span></div>
      <div class="calendar" id="calLeave"></div>
      <div class="notice" style="margin-top:10px;margin-bottom:10px">
        請假依正式班表與當日班別計算，不固定 1 天 = 8 小時。整天請假只填日期與天數；部分時數可另外填時數與分鐘。
      </div>

      <div class="grid3" id="leaveTypeGrid" style="margin-top:10px">
        ${['事假','病假','特休','生理假','家庭照顧假','婚假','公傷假','公假','安胎假','陪產檢假','喪假','育嬰留停'].map((t,i)=>`<button type="button" class="btn soft leave-type ${i===0?'active-type':''}" data-type="${t}">${t}<small style="display:block;font-size:10px;margin-top:4px">${i===0?'建議提前申請':'依規定使用'}</small></button>`).join('')}
      </div>

      <label class="label" style="margin-top:12px">開始日期</label>
      <input id="leaveStartDate" type="date">

      <div class="grid">
        <div>
          <label class="label">請假天數</label>
          <div class="grid" style="grid-template-columns:54px 1fr 54px">
            <button type="button" class="btn soft" id="leaveDaysMinus">－</button>
            <input id="leaveDays" type="number" min="0" step="1" value="1" style="text-align:center">
            <button type="button" class="btn soft" id="leaveDaysPlus">＋</button>
          </div>
          <div class="notice" style="padding:8px 10px;font-size:12px">天數只用整數，整天請假會逐日看正式班表。</div>
        </div>
        <div>
          <label class="label">部分時數</label>
          <div class="grid" style="grid-template-columns:1fr 1fr">
            <select id="leaveHours">${Array.from({length:13},(_,i)=>`<option value="${i}">${i} 小時</option>`).join('')}</select>
            <select id="leaveMinutes">${[0,15,30,45].map(m=>`<option value="${m}">${m} 分</option>`).join('')}</select>
          </div>
          <div class="notice" style="padding:8px 10px;font-size:12px">時數可 0.5；分鐘固定 0 / 15 / 30 / 45。</div>
        </div>
      </div>

      <div class="card" style="background:var(--grad);color:#fff;margin-top:10px">
        <div style="font-size:13px;font-weight:900;opacity:.95">即時換算結果</div>
        <div id="leaveCalcDays" style="font-size:34px;font-weight:900;margin-top:6px">1 天</div>
        <div id="leaveCalcHours" style="font-size:14px;font-weight:900">共 8.0 小時｜依當日正式班表計算</div>
        <div id="leaveCalcBreakdown" style="font-size:12px;font-weight:800;margin-top:8px;opacity:.9">A班 8.0 小時</div>
      </div>

      <label class="label">請假事由 / 補充說明</label>
      <textarea id="leaveReason" placeholder="例如：看診、家庭因素、個人事務"></textarea>
      <button class="btn" onclick="ANG_HR_APP.submitLeaveFromForm()">確認送出</button>
    </section>`;
    ANG_HR_CAL.drawCalendar(document.getElementById('calSchedule'),'schedule');
    ANG_HR_CAL.drawCalendar(document.getElementById('calLeave'),'leave');
    bindLeaveCalc();
}

function getDemoShiftForDate(dateObj){
    if(!(dateObj instanceof Date) || isNaN(dateObj)) return {code:'A', hours:8, text:'A班 08:00-16:00'};
    const day=dateObj.getDate();
    if(day%7===0) return {code:'休', hours:0, text:'休假'};
    if(day%4===1) return {code:'A', hours:8, text:'A班 08:00-16:00'};
    if(day%4===2) return {code:'B', hours:4, text:'B班 08:00-12:00'};
    if(day%4===3) return {code:'C', hours:6, text:'C班 13:00-19:00'};
    return {code:'D', hours:11, text:'D班 08:00-19:00'};
}

function parseDateInput(value){
    if(!value){
      const d=new Date();
      d.setHours(0,0,0,0);
      return d;
    }
    const parts=value.split('-').map(Number);
    return new Date(parts[0], parts[1]-1, parts[2]);
}

function roundHalfHour(num){
    return Math.round(num*2)/2;
}

function getSelectedLeaveType(){
    const active=document.querySelector('.leave-type.active-type');
    return active ? active.dataset.type : '事假';
}

function calcLeaveResult(){
    const start=parseDateInput(document.getElementById('leaveStartDate')?.value);
    let days=parseInt(document.getElementById('leaveDays')?.value||'0',10);
    if(isNaN(days)||days<0) days=0;
    days=Math.floor(days);
    const hours=parseFloat(document.getElementById('leaveHours')?.value||'0')||0;
    const minutes=parseInt(document.getElementById('leaveMinutes')?.value||'0',10)||0;
    const partial=roundHalfHour(hours + minutes/60);

    let fullDayHours=0;
    const breakdown=[];
    for(let i=0;i<days;i++){
      const d=new Date(start);
      d.setDate(start.getDate()+i);
      const shift=getDemoShiftForDate(d);
      fullDayHours += shift.hours;
      breakdown.push(`${d.getMonth()+1}/${d.getDate()} ${shift.code} ${shift.hours.toFixed(1)}h`);
    }

    const total=roundHalfHour(fullDayHours + partial);
    const mode = days>0 && partial>0 ? '整天 + 部分時數' : (days>0 ? '整天請假' : '部分請假');
    return {
      leaveType:getSelectedLeaveType(),
      startDate:document.getElementById('leaveStartDate')?.value || '',
      days,
      partialHours:partial,
      totalHours:total,
      calcMode:'schedule_based',
      mode,
      breakdown
    };
}

function updateLeaveCalc(){
    const res=calcLeaveResult();
    const daysEl=document.getElementById('leaveCalcDays');
    const hoursEl=document.getElementById('leaveCalcHours');
    const bdEl=document.getElementById('leaveCalcBreakdown');
    if(daysEl) daysEl.textContent=`${res.days} 天`;
    if(hoursEl) hoursEl.textContent=`共 ${res.totalHours.toFixed(1)} 小時｜${res.leaveType}｜依當日正式班表計算`;
    if(bdEl) bdEl.textContent=res.breakdown.length ? res.breakdown.join('、') + (res.partialHours ? `、部分 ${res.partialHours.toFixed(1)}h` : '') : `部分請假 ${res.partialHours.toFixed(1)}h`;
}

function bindLeaveCalc(){
    const dateEl=document.getElementById('leaveStartDate');
    if(dateEl && !dateEl.value){
      const d=new Date();
      dateEl.value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    document.querySelectorAll('.leave-type').forEach(btn=>{
      btn.addEventListener('click',()=>{
        document.querySelectorAll('.leave-type').forEach(x=>x.classList.remove('active-type'));
        btn.classList.add('active-type');
        updateLeaveCalc();
      });
    });
    ['leaveStartDate','leaveDays','leaveHours','leaveMinutes'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.addEventListener('input',updateLeaveCalc);
      if(el) el.addEventListener('change',updateLeaveCalc);
    });
    const minus=document.getElementById('leaveDaysMinus');
    const plus=document.getElementById('leaveDaysPlus');
    const input=document.getElementById('leaveDays');
    if(minus) minus.addEventListener('click',()=>{input.value=Math.max(0,(parseInt(input.value||'0',10)||0)-1);updateLeaveCalc();});
    if(plus) plus.addEventListener('click',()=>{input.value=(parseInt(input.value||'0',10)||0)+1;updateLeaveCalc();});
    updateLeaveCalc();
}

async function submitLeaveFromForm(){
    const result=calcLeaveResult();
    const reason=document.getElementById('leaveReason')?.value || '';
    if(!result.startDate){toast('請先選擇開始日期');return;}
    if(result.totalHours<=0){toast('請假時數不可為 0');return;}
    if(!reason.trim()){toast('請輸入請假事由');return;}
    const payload={
      leaveType:result.leaveType,
      startDate:result.startDate,
      days:result.days,
      partialHours:result.partialHours,
      totalHours:result.totalHours,
      displayDays:result.days,
      displayHours:result.totalHours,
      reason:reason.trim(),
      calcMode:'schedule_based',
      mode:result.mode,
      breakdown:result.breakdown,
      includeBreak:false,
      breakMinutes:0
    };
    const res=await ANG_HR_API.post('employeeLeave',payload);
    toast(res.message || (res.ok?'請假已送出':'請假送出失敗'));
}
function renderClock(){main.innerHTML=hero('打卡記錄','自己每日打卡、補卡、加班、外勤與 iOS 捷徑')+`<section class="card"><div class="row"><h3 class="title">打卡月曆</h3><span class="badge">自己紀錄</span></div><div class="calendar" id="calClock"></div></section><section class="card"><h3 class="title">補打卡</h3><select><option>上班</option><option>下班</option><option>加班上班</option><option>加班下班</option></select><input type="date"><textarea placeholder="補打卡原因"></textarea><button class="btn" onclick="ANG_HR_APP.demoAction('submitEmployeeClockFix')">送出補打卡</button></section><section class="card"><h3 class="title">加班 / 外勤 / iOS 捷徑</h3><div class="grid"><button class="btn soft" onclick="ANG_HR_APP.clockNow('ot_in')">加班上班</button><button class="btn soft" onclick="ANG_HR_APP.clockNow('ot_out')">加班下班</button><button class="btn soft" onclick="ANG_HR_APP.clockNow('field_in')">外勤打卡</button><button class="btn soft" onclick="ANG_HR_APP.demoAction('generateIosShortcutJson')">iOS 捷徑</button></div></section>`;ANG_HR_CAL.drawCalendar(document.getElementById('calClock'),'clock')}function renderSalary(){main.innerHTML=hero('薪資明細','每日預估薪資、工時與薪資單')+`<section class="card"><div class="calendar" id="calSalary"></div></section><section class="card"><div class="grid"><div class="tile"><b>本週工時</b><span>0h</span></div><div class="tile"><b>本月工時</b><span>0h</span></div><div class="tile"><b>本月預估</b><span>$0</span></div><div class="tile"><b>待確認</b><span>0 筆</span></div></div><button class="btn" style="margin-top:10px" onclick="ANG_HR_APP.demoAction('downloadSalarySlip')">下載薪資單</button></section>`;ANG_HR_CAL.drawCalendar(document.getElementById('calSalary'),'salary')}function renderUpload(){main.innerHTML=hero('資料上傳','證明、收據、代墊、請款、外勤回報')+`<section class="card"><div class="calendar" id="calUpload"></div></section><section class="card"><h3 class="title">上傳類型</h3><div class="grid">${['醫生證明','收據補件','代墊申請','請款申請','外勤回報','其他'].map(t=>`<button class="btn soft upload-type" data-type="${t}">${t}</button>`).join('')}</div><input id="uploadType" readonly placeholder="請先選擇類型" style="margin-top:10px"><div id="claimBox" class="hidden"><input type="number" placeholder="金額"><input placeholder="項目，例如油資、材料"></div><button class="btn soft" onclick="ANG_HR_APP.getLocationText()">取得 / 更新位置</button><input id="locationText" readonly placeholder="尚未取得位置"><input id="uploadFile" type="file"><div id="fileName" class="notice hidden"></div><textarea placeholder="補充說明"></textarea><button class="btn" onclick="ANG_HR_APP.demoAction('submitEmployeeUpload')">送出資料</button></section>`;ANG_HR_CAL.drawCalendar(document.getElementById('calUpload'),'upload');bindUpload()}function renderAdminHome(){main.innerHTML=hero('管理主頁','摘要載入｜詳細資料進分頁才載入')+`<section class="card"><div class="grid"><div class="tile"><b>待審核</b><span>0 件</span></div><div class="tile"><b>今日異常</b><span>0 件</span></div><div class="tile"><b>今日出勤</b><span>正常</span></div><div class="tile"><b>未打卡</b><span>0 人</span></div></div></section><section class="card"><div class="grid"><button class="btn soft" onclick="location.href='admin_review.html'">審核</button>${has('admin_schedule')?`<button class="btn soft" onclick="location.href='admin_schedule.html'">排班</button>`:''}<button class="btn soft" onclick="location.href='admin_salary.html'">薪資</button><button class="btn soft" onclick="location.href='admin_people.html'">人員</button>${has('settings')?`<button class="btn soft" onclick="location.href='admin_settings.html'">系統</button>`:''}${has('data')?`<button class="btn soft" onclick="location.href='admin_data.html'">資料</button>`:''}<button class="btn soft" onclick="location.href='admin_notice.html'">公告</button></div></section>`}function renderReview(){const rows=['請假審核','補打卡審核'];if(has('upload'))rows.push('資料上傳審核','代墊 / 請款審核');if(has('multi_review'))rows.push('多級審核 currentStep');main.innerHTML=hero('審核中心','防連點、空白卡過濾、顯示更多')+`<section class="card">${rows.map(r=>`<div class="todo-item"><div><b>${r}</b><span>目前 0 件待處理</span></div><button class="btn soft" style="width:auto" onclick="ANG_HR_APP.demoAction('adminSetReviewStatus')">處理</button></div>`).join('')}</section>`}function renderAdminSchedule(){main.innerHTML=hero('管理排班','週排班、月排班、正式發布、班別管理')+`<section class="card"><div class="calendar" id="calAdminSchedule"></div></section><section class="card"><div class="grid"><button class="btn soft">週排班</button><button class="btn soft">月排班</button><button class="btn soft">發布正式班表</button><button class="btn soft">班別管理</button></div></section>`;ANG_HR_CAL.drawCalendar(document.getElementById('calAdminSchedule'),'adminSchedule')}function renderAdminSalary(){main.innerHTML=hero('薪資管理','工時計算、薪資試算、薪資週期')+`<section class="card"><div class="table-wrap"><table><thead><tr><th>員編</th><th>姓名</th><th>月薪</th><th>時薪</th><th>休假</th><th>加班</th><th>扣款</th><th>實發</th></tr></thead><tbody><tr><td>ANG0603</td><td>小米</td><td>36000</td><td>190</td><td>0</td><td>0</td><td>0</td><td>36000</td></tr></tbody></table></div></section>`}function renderPeople(){main.innerHTML=hero('人員管理','員工、角色、店舖、顏色、班別')+`<section class="card"><div class="grid"><input placeholder="員工編號 ANGxxxx"><input placeholder="姓名"><select><option>employee</option><option>admin</option><option>manager</option><option>creator</option></select><input placeholder="班別"></div><button class="btn">新增 / 儲存人員</button></section>`}function renderSettings(){main.innerHTML=hero('系統設定','Premium：品牌、權限、API、Drive、版本授權')+`<section class="card"><div class="grid"><input placeholder="公司名稱"><input placeholder="LOGO URL"><input type="color" value="#FF87E0"><input type="color" value="#CCA4FF"><input placeholder="Drive 資料夾 ID" value="10ED2Bd72agzl6ZyuQYFAHdl0de02zgv0"><input placeholder="Webhook / API"></div><button class="btn" onclick="ANG_HR_APP.demoAction('saveBrandSettings')">儲存設定</button></section>`}function renderData(){main.innerHTML=hero('資料中心','匯出、備份、API 紀錄、錯誤紀錄')+`<section class="card"><div class="grid"><button class="btn soft">匯出打卡</button><button class="btn soft">匯出請假</button><button class="btn soft">匯出排班</button><button class="btn soft">匯出薪資</button><button class="btn soft">備份</button><button class="btn soft">錯誤紀錄</button></div></section>`}function renderNotice(){main.innerHTML=hero('公告管理','全體公告、指定店舖、指定員工、主管提醒')+`<section class="card"><select><option>全體公告</option><option>指定店舖</option><option>指定員工</option><option>主管提醒</option></select><textarea placeholder="公告內容"></textarea><button class="btn" onclick="ANG_HR_APP.demoAction('publishNotice')">發布公告</button></section>`}function bindUpload(){document.querySelectorAll('.upload-type').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.upload-type').forEach(x=>x.classList.remove('active-type'));btn.classList.add('active-type');document.getElementById('uploadType').value=btn.dataset.type;document.getElementById('claimBox').classList.toggle('hidden',!(btn.dataset.type==='代墊申請'||btn.dataset.type==='請款申請'))});const f=document.getElementById('uploadFile');if(f)f.onchange=()=>{const box=document.getElementById('fileName');box.textContent=f.files&&f.files[0]?'已選檔案：'+f.files[0].name:'';box.classList.toggle('hidden',!box.textContent)}}async function demoAction(a){const r=await ANG_HR_API.post(a,{});toast(r.message||(r.ok?'完成':'失敗'))}function clockNow(kind){if(!navigator.geolocation){demoAction('clock');return}navigator.geolocation.getCurrentPosition(async pos=>{const r=await ANG_HR_API.post('clock',{kind,lat:pos.coords.latitude,lng:pos.coords.longitude});toast(r.message||`${kind} 打卡成功`)},()=>toast('無法取得定位，請開啟位置權限'),{enableHighAccuracy:true,timeout:10000})}function getLocationText(){const el=document.getElementById('locationText');if(!navigator.geolocation){el.value='此裝置不支援定位';return}navigator.geolocation.getCurrentPosition(pos=>{el.value=pos.coords.latitude.toFixed(5)+','+pos.coords.longitude.toFixed(5)},()=>el.value='定位失敗，請開啟權限')}
function openChangePassword(){
    const box=document.createElement('div');
    box.className='card';
    box.style.position='fixed';
    box.style.left='12px';
    box.style.right='12px';
    box.style.bottom='100px';
    box.style.zIndex='120';
    box.style.maxWidth='560px';
    box.style.margin='0 auto';
    box.innerHTML=`
      <div class="row"><h3 class="title">修改密碼</h3><button class="btn gray" style="width:auto;padding:8px 12px" id="closePwBox">關閉</button></div>
      <label class="label">舊密碼</label><input id="oldPassword" type="password" placeholder="請輸入舊密碼">
      <label class="label">新密碼</label><input id="newPassword" type="password" placeholder="至少 6 碼">
      <label class="label">再次輸入新密碼</label><input id="newPassword2" type="password" placeholder="再次輸入新密碼">
      <button class="btn" id="submitChangePassword">確認修改</button>
    `;
    document.body.appendChild(box);
    document.getElementById('closePwBox').onclick=()=>box.remove();
    document.getElementById('submitChangePassword').onclick=async()=>{
      const oldPassword=document.getElementById('oldPassword').value;
      const newPassword=document.getElementById('newPassword').value;
      const newPassword2=document.getElementById('newPassword2').value;
      if(!oldPassword){toast('請輸入舊密碼');return;}
      if(!newPassword || newPassword.length<6){toast('新密碼至少 6 碼');return;}
      if(newPassword!==newPassword2){toast('兩次新密碼不一致');return;}
      const res=await ANG_HR_API.post('changePassword',{oldPassword,newPassword});
      if(!res.ok){toast(res.message||'修改失敗');return;}
      toast(res.message||'密碼已修改，請重新登入');
      setTimeout(()=>{ANG_HR_AUTH.logout();},900);
    };
}

function openForgotPassword(){
    const box=document.createElement('div');
    box.className='card';
    box.style.position='fixed';
    box.style.left='12px';
    box.style.right='12px';
    box.style.bottom='80px';
    box.style.zIndex='120';
    box.style.maxWidth='560px';
    box.style.margin='0 auto';
    box.innerHTML=`
      <div class="row"><h3 class="title">忘記 / 重設密碼</h3><button class="btn gray" style="width:auto;padding:8px 12px" id="closeForgotBox">關閉</button></div>
      <div class="notice">輸入員工編號後送出，系統會建立重設申請；管理員或 Creator 可在人員管理重設臨時密碼。</div>
      <label class="label">員工編號</label><input id="forgotEmployeeId" placeholder="例如 ANG0603">
      <button class="btn" id="submitForgotPassword">送出重設申請</button>
    `;
    document.body.appendChild(box);
    document.getElementById('closeForgotBox').onclick=()=>box.remove();
    document.getElementById('submitForgotPassword').onclick=async()=>{
      const employeeId=String(document.getElementById('forgotEmployeeId').value||'').trim().toUpperCase();
      if(!employeeId){toast('請輸入員工編號');return;}
      const res=await ANG_HR_API.post('requestPasswordReset',{employeeId});
      toast(res.message || (res.ok?'已送出重設申請':'送出失敗'));
      if(res.ok) box.remove();
    };
}

function openResetEmployeePassword(employeeId){
    const id=employeeId || prompt('請輸入要重設密碼的員工編號，例如 ANG0603');
    if(!id) return;
    const temp=prompt('請輸入臨時密碼，至少 6 碼');
    if(!temp) return;
    if(temp.length<6){toast('臨時密碼至少 6 碼');return;}
    ANG_HR_API.post('resetEmployeePassword',{
      employeeId:String(id).trim().toUpperCase(),
      tempPassword:temp,
      forceChangePassword:true
    }).then(res=>toast(res.message || (res.ok?'已重設密碼':'重設失敗')));
}

function render(){if(window.__ANG_BOOT_FALLBACK_TIMER__)clearTimeout(window.__ANG_BOOT_FALLBACK_TIMER__);if(!guard())return;applyBrand();nav();({index:renderIndex,login:renderLogin,activate:renderActivate,noperm:renderNoPerm,employee_home:renderEmployeeHome,employee_schedule:renderSchedule,employee_clock:renderClock,employee_salary:renderSalary,employee_upload:renderUpload,admin_home:renderAdminHome,admin_review:renderReview,admin_schedule:renderAdminSchedule,admin_salary:renderAdminSalary,admin_people:renderPeople,admin_settings:renderSettings,admin_data:renderData,admin_notice:renderNotice}[page]||renderIndex)()}window.ANG_HR_APP={toast,demoAction,clockNow,getLocationText,homeKey,submitLeaveFromForm,openChangePassword,openForgotPassword,openResetEmployeePassword};window.addEventListener('error',function(e){
  var main=document.getElementById('main');
  if(main){
    main.innerHTML='<section class="card"><h1 class="title">前端載入錯誤</h1><div class="notice">'+String(e.message||e.error||'未知錯誤')+'</div></section>';
  }
});
document.addEventListener('DOMContentLoaded',function(){try{render();}catch(e){console.error(e);var m=document.getElementById('main');if(m)m.innerHTML='<section class="card"><h1 class="title">前端錯誤</h1><div class="notice">'+String(e.message||e)+'</div></section>';}})})();