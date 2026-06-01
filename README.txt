ANG HR Plus｜GitHub Pages 前端覆蓋包

本包內容：
- login.html / index.html：登入頁
- employee_home.htm：員工首頁完整頁
- employee_home.html：員工首頁完整頁或相容頁，已移除 #clean-v7 跳轉
- employee_clock.html：打卡中心，按鈕會帶入員工 ID
- employee_salary.html：薪資頁入口
- employee_upload.html：資料上傳入口
- employee_schedule.html：正式班表入口
- admin_*.html：管理入口與主要管理頁骨架
- config.js：版本設定與路由
- assets/auth.js：登入、ID 正規化、跳轉保留 id/token
- assets/app.js：共用 UI 與底部導航
- assets/js_idle.js / js_idle.html：15 分鐘閒置登出修正版

重要修正：
1. Basic 正確首頁是 employee_home.htm，不再導向 employee_home.html#clean-v7。
2. 每次跳頁都保留 id / token / name，避免打卡或管理頁缺少員工 ID。
3. localStorage 同時寫入新版與舊版 key，避免剛登入、跳出去再回來抓不到帳號。
4. google.script.run 判斷已改成 typeof google !== 'undefined'，在 GitHub Pages 預覽不會噴錯。
5. 底部導航恢復五鍵樣式，中間主頁按鈕加高凸起。

覆蓋方式：
把本資料夾內所有檔案直接複製到 GitHub repo：ang-hr-plus 的根目錄後 commit / push。

注意：
本次對話只拿到 employee.html、js_idle.html、HR 系統整理.txt，沒有拿到完整 GAS「程式碼.js」與三個 repo 的完整原檔。
所以這包是「GitHub 前端核心修正版」，不是完整 GAS 後端覆蓋包。
