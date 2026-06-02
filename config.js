/* ANG HR Router Frontend Config｜覆蓋版
 * 這份 config.js 可放在 ang-hr-basic / ang-hr-plus / ang-hr-premium 三個 repo 共用。
 * 實際方案由 Router GAS 的「公司授權」表判斷，不由前端決定。
 */
window.ANG_HR_CONFIG = Object.assign({}, window.ANG_HR_CONFIG || {}, {
  appName: 'ANG HR',
  routerApiUrl: 'https://script.google.com/macros/s/PASTE_YOUR_ROUTER_GAS_WEB_APP_ID/exec',
  defaultCompanyId: '',
  defaultEntryPage: 'employee_home',
  storagePrefix: 'ang_hr_',
  freeUpgradePrompt: {
    title: '覺得好用嗎？',
    message: '升級方案可以提升名額、延長資料保存、開啟審核、薪資、排班與更多管理功能。',
    ctaText: '快升級方案'
  }
});
