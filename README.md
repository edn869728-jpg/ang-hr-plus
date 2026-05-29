# ANG HR Plus

ANG HR Plus 是管理進階版前端。

## GitHub Pages 預計網址

```text
https://edn869728-jpg.github.io/ang-hr-plus/
```

## 版本定位

包含 Basic，另加：

- 主管 / 管理員入口
- 請假審核
- 補打卡審核
- 資料上傳審核
- 通知發布
- 希望休彙整
- 正式排班發布
- 基礎薪資試算

## 架構

```text
Flutter App / Browser
→ GitHub Pages 前端
→ GAS API
→ Google Sheets
```

## 設定

請在 `config.js` 設定 GAS Web App `/exec` 網址。

前端 repo 只放 UI 與 API 呼叫，不放私人資料或金鑰。
