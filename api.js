const ANG_HR_API = (() => {
  const cfg = window.ANG_HR_CONFIG || {};
  async function post(action, payload = {}) {
    if (!cfg.apiBaseUrl) return { ok: false, message: '尚未設定 apiBaseUrl' };
    const res = await fetch(cfg.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action }, payload))
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch (err) { return { ok: false, message: 'API 回傳格式錯誤', raw: text }; }
  }
  return { post };
})();
