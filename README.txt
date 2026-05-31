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
