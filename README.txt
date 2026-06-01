ANG HR Plus｜Device Login v3 覆蓋包

直接覆蓋 repo：ang-hr-plus

核心變更：
- 不用密碼
- 不允許只靠員工 ID 登入
- 第一次必須使用專屬連結 id + token
- 前端產生 device_id 並儲存
- 之後自動登入
- 所有功能 payload 帶 id / token / device_id
- Basic 修正 employee_home.htm，不再導到 #clean-v7

正式串 GAS：
1. 將 gas/程式碼_device_login模組.js 補進 GAS 專案。
2. 在 config.js 填入 gasEndpoint 或讓 GAS HTML 使用 google.script.run。
3. 管理員用 admin_device_links.html 建立登入連結。
