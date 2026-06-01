# ANG HR Plus 完整前端包 v1

用法：
1. 解壓縮。
2. 把本資料夾內所有檔案直接放到 GitHub repo 根目錄。
3. 不要多包一層資料夾。
4. 到 assets/config.js 填入 GAS Web App URL。
5. 若未填 GAS URL，會使用 Demo fallback，可測畫面但不會寫入試算表。

包含：完整頁面、共用 assets、版本限制、主頁鍵真跳轉、月曆、PWA、API action 對接骨架。

v2_leave_calc：
- 請假申請改成依正式班表計算。
- 天數只整數。
- 時數可 0.5。
- 分鐘固定 0 / 15 / 30 / 45。
- 即時計算總時數與每日班別明細。
- 送出 payload 帶 calcMode: schedule_based。
- config.js 已填入此版本 GAS URL。

修正 v3：移除 GitHub Pages 不能解析的 GAS 模板語法，例如 <?= typeof ID !== 'undefined' ? ID : '' ?>。

v4_password：
- login.html 增加忘記密碼 / 重設密碼。
- employee_home.html 增加修改自己的密碼。
- admin_people.html 增加管理員重設員工密碼。
- 對應 GAS action：changePassword、requestPasswordReset、resetEmployeePassword。
- 修改成功後會登出並要求重新登入。

v5_login_clean：登入頁會自動清除舊 localStorage 裡的 GAS 模板殘留字串；另新增 reset_cache.html 可手動清除。

v6_login_hardfix：完全重寫 renderLogin，登入欄位 value 改為 JS 開頁後帶入，避免任何舊 GAS 模板片段顯示。

v7_repo_clean：
- 新增 employee.html / admin.html / clock.html / mysalary.html / upload.html 相容跳轉檔。
- 覆蓋 js_idle.html，避免舊 GAS 閒置跳 ?page=boss。
- index.html 支援舊 ?page=employee / ?page=clock / ?page=mysalary / ?page=upload 轉到新靜態頁。
- reset_cache.html 加強清除 localStorage / sessionStorage / cache。
- 建議 repo 先刪舊檔再整包上傳。

v8_login_submit_fix：
- 修正 cleanLoginValue 會把所有帳號清成空字串的錯誤。
- 重新覆蓋 assets/app.js，已通過語法檢查。
- 登入時會正確讀取目前 input 內的員工編號。
- 上傳後建議先開 reset_cache.html?v=8。

v9_login_standalone：login.html 改成獨立登入頁，不再經過 app.js renderLogin；前端直接讀 #loginId，送出 id / employeeId / account / password / pwd 給 GAS。
