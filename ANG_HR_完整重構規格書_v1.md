# ANG HR 系統完整重構規格書 v1

## 核心原則

- Basic / Plus / Premium 外觀一致，差異只在功能與權限。
- 限制功能要真的限制：前端入口不顯示、直接輸入網址也擋、後端 action 也擋。
- GitHub Pages = 前端。
- GAS = API 後端。
- Google Sheets = 資料庫。
- Google Drive = 附件。
- 三版本共用後端資料表，不拆三套資料表。
- 初始化只補缺表缺欄，不刪既有資料。
- 手機優先，iPhone / Android 都要好操作。
- 首頁只抓摘要，詳細資料進分頁才載入。

## 版本方案

### Basic｜微型店家版

目標：
- 5 人內
- 無需投保公司
- 單店
- 小吃店、早餐店、飲料店、工作室、小團隊

包含：
- 1 店
- 5 人

功能：
- 登入
- 員工首頁
- GPS 上班打卡
- GPS 下班打卡
- 補打卡
- 請假
- 公告查看
- 個人工時
- 預估薪資
- 老闆 / 管理者基本審核
- 基本人員管理

不包含：
- 正式排班發布
- 資料上傳
- 代墊 / 請款
- 進階系統設定
- API
- Drive 附件
- 多級審核

### Plus｜多店標準版

包含：
- 5 店
- 25 人

增加：
- 正式排班
- 希望休 / 排休
- 資料上傳
- 醫生證明
- 收據補件
- 代墊申請
- 請款申請
- 班別管理
- 薪資試算
- 打卡 / 請假 / 補卡 / 上傳審核

### Premium｜連鎖店完整版

包含：
- 8 店
- 80 人

增加：
- Creator 後台
- 系統設定
- 權限管理
- 多級審核
- API
- Webhook
- LINE 通知
- Drive 附件
- 自訂資料夾
- 自訂班別
- 自訂薪資規則
- 多店舖 / 多分店管理
- 跨店支援

加購：
- 店舖包：+1 店 +5 人
- 人員包：+10 人

## 正式前端檔案架構

```text
index.html
login.html
activate.html
noperm.html

employee_home.html
employee_schedule.html
employee_clock.html
employee_salary.html
employee_upload.html

admin_home.html
admin_review.html
admin_schedule.html
admin_salary.html
admin_people.html
admin_settings.html
admin_data.html
admin_notice.html

assets/
  app.css
  app.js
  api.js
  config.js
  features.js
  calendars.js
  auth.js
  pwa/
    manifest.json
    service-worker.js
    icon-192.png
    icon-512.png
```

## index.html｜App Shell

用途：
- 不當員工首頁。
- 讀 localStorage token。
- 驗證登入狀態。
- 判斷 role。
- 自動導向員工或管理主頁。

流程：
```text
開啟 index.html
↓
讀 localStorage
↓
沒有 token → login.html
↓
呼叫 auth / employeeBootstrap
↓
判斷 role
↓
導向 employee_home.html 或 admin_home.html
```

## login.html

欄位：
- 員工編號
- 密碼
- 登入按鈕

登入成功存：
- ang_employee_id
- ang_employee_name
- ang_employee_role
- ang_hr_token
- ang_theme_colors
- ang_brand_settings
- ang_features

規則：
- 員工 ID 格式 ANGxxxx。
- 帳號比對不分大小寫。
- token 用來辨識身分。
- 登入後優先用 localStorage，不要每頁靠網址。

## 主頁鍵邏輯

- employee_home.html 按主頁 → admin_home.html
- admin_home.html 按主頁 → employee_home.html
- 員工其他頁按主頁 → employee_home.html
- 管理其他頁按主頁 → admin_home.html

不是跳選單。

## 員工端底部導航

```text
請假排班
打卡記錄
員工主頁
薪資明細
資料上傳
```

中間首頁鍵：
- 圓弧
- 凸起
- 比其他按鈕高
- 特別突出

## 管理端底部導航

```text
管理主頁
審核
排班
人員
系統
```

依版本限制顯示。

## employee_home.html｜員工主頁

首頁不放一整排重複快捷。

應有：
- 個人資訊
- 今日班別
- 今日狀態
- 今日打卡卡片
- 上班打卡
- 下班打卡
- 今日 / 明日 / 後天提醒
- 待處理件數
- 主管通知
- 公告
- 近期動態
- 少量常用提醒

今日打卡卡片：
- 班別
- 狀態
- 應上班
- 應下班
- 實際上班
- 實際下班
- 今日計薪工時
- 異常提醒
- 缺下班卡快速申請

API：
- getTodayStatus
- getHomeStats
- getNotifications
- getNoticesForEmployee
- getRecentActivities

## employee_schedule.html｜請假排班

上半部：
- 正式班表 / 排休月曆

下半部：
- 請假申請

正式班表月曆：
- 顯示全店 / 全分店所有人的正式班表。
- 顯示格式：姓名 / 班別。
- 每位員工用個人顏色。
- 自己有班但請假：班表仍顯示，用灰色 / 淡化 / 刪線。
- 只顯示已發布正式班表。
- 排除休假類型。

排休：
- 排休放月曆上方。
- 週一到週日一排。
- 手機不足時可橫向滑動。
- 送出排休。
- 依排休開放 / 截止規則控制。

排休狀態：
- isPreselectOpen
- loadPreselectStatus
- restoreScheduleState
- ang_schedule_confirm_map
- ang_schedule_week_offset
- ang_schedule_selected

請假假別 12 個：
- 事假
- 病假
- 特休
- 生理假
- 家庭照顧假
- 婚假
- 公傷假
- 公假
- 安胎假
- 陪產檢假
- 喪假 / 陪伴告別假
- 育嬰留停

請假時間制：
- 日期
- 小時
- 分鐘
- 分鐘固定 5 分鐘一格或 0 / 15 / 30 / 45
- 請假天數只整數
- 請假時數可 0.5

請假計算：
- 依正式班表。
- 不固定一天 8 小時。
- 多日請假逐日依班別累計。

## employee_clock.html｜打卡記錄

首頁放立即打卡。

打卡記錄頁放：
- 自己每日打卡月曆
- 打卡查詢
- 補打卡
- 加班打卡
- iOS 捷徑打卡設定
- 外勤模式設定

打卡月曆顯示：
- 上班時間
- 下班時間
- 加班上班
- 加班下班
- 補打卡狀態
- 異常狀態
- 遲到
- 早退
- 缺卡

補打卡：
- 類型：上班 / 下班 / 加班上班 / 加班下班
- 日期
- 小時
- 分鐘
- 原因
- 送出後進審核

GPS 打卡：
- 公司打卡要回傳位置。
- 依公司 / 店舖座標判斷距離。
- 外勤模式可不限制公司附近，但一定要回傳位置。
- 預留 NFC / QR code / 裝置綁定。

iOS 捷徑打卡：
- 產生 iOS Shortcut JSON
- 複製 JSON
- 重新綁定裝置
- sendClockFromShortcut
- 一鍵上班打卡
- 一鍵下班打卡
- 外勤模式

## employee_salary.html｜薪資明細

包含：
- 薪資月曆
- 每日預估薪資
- 本週工時
- 本月工時
- 預估薪資
- 薪資單查詢
- 薪資單下載
- 薪資明細彈窗

薪資單內容：
- 底薪
- 時薪
- 加班費
- 餐費
- 遲到扣款
- 早退扣款
- 請假扣款
- 其他加扣項
- 實發合計

## employee_upload.html｜資料上傳

包含：
- 資料上傳月曆
- 上傳類型
- 附件
- 位置回傳
- 請款 / 代墊表格
- 上傳狀態
- 補件提醒

上傳類型：
- 醫生證明
- 收據補件
- 代墊申請
- 請款申請
- 外勤回報
- 其他

請款 / 代墊欄位：
- 金額
- 項目
- 用途
- 日期
- 是否有收據
- 附件
- 備註
- 位置

UI 行為：
- 上傳類型按鈕有 active 狀態。
- 選代墊 / 請款才顯示金額與項目欄位。
- 位置按鈕可取得位置 / 取消位置。
- 顯示已選檔名。
- 送出成功後清表單。

Drive 上傳：
- fileName
- fileMime
- fileData
- saveAttachmentToDrive
- attachmentUrl
- 上傳成功顯示 Drive 連結
- 失敗顯示真錯誤
- 管理審核頁可開附件

## admin_home.html｜管理主頁

只抓摘要。

顯示：
- 待審核數
- 今日異常數
- 今日出勤數
- 今日未打卡
- 異常打卡
- 即將截止排休
- 最新公告
- 管理通知
- 快速進入管理功能

## admin_review.html｜審核中心

審核項目：
- 請假審核
- 補打卡審核
- 資料上傳審核
- 代墊審核
- 請款審核
- 留言審核
- 排休 / 希望休確認

規則：
- 空白卡過濾
- 顯示更多
- 預設 5 筆
- 防連點 REVIEW_BUSY
- 多級審核 currentStep
- 通過 / 退回要有 loading 與明確提示

## admin_schedule.html｜管理排班

功能：
- 週排班
- 月排班
- 發布正式班表
- 班別管理
- 人員顏色
- 店舖 / 分店切換
- 跨店支援
- 待發布班表
- 排班發布記錄

資料邏輯：
- 預選休假表 = 提報表
- 週排班紀錄 / 月排班紀錄 = 正式計算表
- 打卡 = 實際來
- 薪資 = 正式班表 + 實際打卡

## admin_salary.html｜薪資管理

功能：
- 工時計算
- 薪資試算
- 薪資匯出
- 薪資週期設定

欄位：
- 員工編號
- 員工姓名
- 月薪
- 時薪
- 休假天數
- 請假扣款
- 遲到扣款
- 早退扣款
- 加班費
- 餐費
- 合計
- 實發

薪資週期：
- 週薪 / 月薪
- 週起算日
- 月起算日
- 鎖定星期
- 鎖定日期

## admin_people.html｜人員管理

功能：
- 新增員工
- 停用員工
- 角色設定
- 店舖 / 分店設定
- 人員顏色
- 班別
- 薪資規則
- token
- 員工 ID

規則：
- 員工 ID：ANGxxxx
- 帳號比對不分大小寫
- 系統設定值小寫
- 人員資料 Q 欄 = 班別

角色：
- Creator
- Admin
- Manager
- Employee

目前：
- ANG0603 = Creator
- ANG0606 = Manager
- ANG0601 = Admin

## admin_settings.html｜系統設定

Premium 才有。

功能：
- 公司名稱
- 系統名稱
- LOGO URL
- 主標題
- 副標題
- 品牌文字
- 主題顏色
- 漸層方向
- 顏色變化順序
- 店舖管理
- 分店管理
- Drive 上傳資料夾
- 班別規則
- 薪資規則
- 審核流程
- 權限設定
- API 設定
- Webhook
- LINE 通知
- 方案版本
- 到期日
- 店舖額度
- 人員額度
- 是否停用
- 是否試用

Drive 預設資料夾：
```text
10ED2Bd72agzl6ZyuQYFAHdl0de02zgv0
```

## admin_data.html｜資料中心

Premium 才有。

功能：
- 資料匯出
- 打卡資料
- 請假資料
- 排班資料
- 薪資資料
- 上傳紀錄
- 審核紀錄
- API 紀錄
- 錯誤紀錄
- 備份

## admin_notice.html｜公告管理

功能：
- 全體公告
- 指定店舖公告
- 指定員工通知
- 主管提醒
- 系統提醒

員工端顯示：
- 主管通知
- 公告
- 系統提醒

## 留言交流

員工端：
- 留言標題
- 留言內容
- 送出留言

管理端：
- 留言審核
- 通過
- 退回

## 主題顏色

預設四色：
```text
#FF87E0
#CCA4FF
#8089FF
#59DDFF
```

功能：
- 可調整四個顏色
- 可調整漸層方向
- 可切換變化順序
- 可重置主題
- 自動保存
- 下次進入直接套用
- 每個人可有自己的主題色
- ANG0603 小米 = Mayhem 橘

## API action 對照

```text
login
register
clock
employeeBootstrap
employeeLeave
employeeClockFix
employeeUpload
refreshWebCode
employeeMessage

adminBootstrap
adminSetReviewStatus
saveDeadlineSettings
saveBrandSettings

getTodayStatus
getHomeStats
getNotifications
getNoticesForEmployee
getRecentActivities

getSalaryHistory
getSalaryDetail
downloadSalarySlip

submitPreselect
submitEmployeeUpload
submitEmployeeClockFix

getPublishedScheduleForCalendar
getShiftTypes

generateIosShortcutJson
sendClockFromShortcut
rebindDevice

getSettingsHash
checkForUpdates
```

## 權限限制

前端：
- 隱藏入口
- 直接輸入網址導到 noperm.html
- 不渲染內頁區塊

後端：
- Basic 呼叫 employeeUpload → 未開放
- Basic 呼叫 schedulePublish → 未開放
- Plus 呼叫 apiSettings → 未開放
- 方案到期 → 未開放
- 人數超過 → 禁止新增
- 店數超過 → 禁止新增店舖

## PWA

要有：
- manifest.json
- service-worker.js
- icon-192.png
- icon-512.png
- theme-color
- display standalone
- start_url
- viewport-fit=cover
- safe-area-inset-bottom

## 錯誤與互動

所有按鈕：
- 按下要有 loading
- 成功要提示
- 失敗要顯示明確錯誤
- 不能無反應
- 防重複送出
- 成功 / 失敗後恢復按鈕

## GitHub Pages 注意事項

- 檔案要放 repo 根目錄
- 不要多包資料夾
- 檔名大小寫一致
- 每個跳頁目標都要存在

## Flutter 對照

```text
lib/main.dart
lib/main_basic.dart
lib/main_plus.dart
lib/main_premium.dart
```

## 最重要的資料規則

1. 三版本共用底層資料欄位。
2. Basic 不刪欄位。
3. Plus 不少資料表。
4. Premium 不做完全不同結構。
5. 只用功能開關、權限限制、前端隱藏、後端阻擋。
6. 欄位未來升級要能直接用。
7. 初始化只補缺表缺欄，不刪資料。

## UI 重點

- Basic 也要漂亮。
- Basic 也要保留核心月曆風格。
- Plus / Premium 只是功能更多。
- Schedule / 月曆是核心賣點。
- 字不能太小。
- 月曆事件字至少 12～13px。
- 手機按鈕要大。
- 底部導航要好按。
- iPhone Home Bar 不要擋。
