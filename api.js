(function(window){
  'use strict';
  window.ANG_HR_CONFIG = window.ANG_HR_CONFIG || {};

  /*
    v4 預設不在 GitHub Pages 前端硬寫 GAS URL。
    建議：
    1. App 登入連結帶 api=https://script.google.com/macros/s/.../exec
    2. 或之後改成 Cloudflare Worker /api/proxy
    3. 測試階段若留空，只有 act_test / test 開頭的測試啟用碼會走 Demo 模式。
  */
  window.ANG_HR_CONFIG.apiUrl = window.ANG_HR_CONFIG.apiUrl || '';
  window.ANG_HR_CONFIG.proxyUrl = window.ANG_HR_CONFIG.proxyUrl || '';
  window.ANG_HR_CONFIG.idleMinutes = 15;
})(window);
