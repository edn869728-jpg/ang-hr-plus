# ANG HR 實作順序 v1

## 第一階段：穩定架構

1. 拆共用檔案：
   - assets/app.css
   - assets/config.js
   - assets/features.js
   - assets/api.js
   - assets/app.js
   - assets/calendars.js
   - assets/auth.js

2. index.html 回歸 App Shell。
3. 補 login.html / activate.html / noperm.html。
4. 每個 HTML 只保留該頁內容，不再塞整包 JS。
5. 主頁鍵跳轉固定：
   - employee_home.html → admin_home.html
   - admin_home.html → employee_home.html

## 第二階段：員工端

1. employee_home.html
2. employee_schedule.html
3. employee_clock.html
4. employee_salary.html
5. employee_upload.html

## 第三階段：管理端

1. admin_home.html
2. admin_review.html
3. admin_schedule.html
4. admin_salary.html
5. admin_people.html
6. admin_notice.html
7. admin_settings.html
8. admin_data.html

## 第四階段：權限與版本

1. 前端 features.js 隱藏。
2. 直接網址導 noperm。
3. GAS 後端 processRequest 擋 action。
4. 方案到期 / 店數 / 人數限制。
5. 加購店舖包 / 人員包。

## 第五階段：PWA 與捷徑

1. manifest.json。
2. service-worker.js。
3. iOS 捷徑 JSON。
4. 裝置重新綁定。
