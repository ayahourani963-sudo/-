# دمج القسم (صفحات 13–16)

1. انسخ المجلد `static/` فوق مجلد `static/` الحالي (يستبدل claims.js وchat.js ويضيف search.js وsupport.js وtheme-navy.css).
2. في index.html أضف بعد style.css:
   `<link rel="stylesheet" href="/static/theme-navy.css">`
3. في main.js:
   - احذف searchView من استيراد items.js، وأضف:
     `import { searchView } from "./views/search.js";`
     `import { supportView } from "./views/support.js";`
   - أضف مساراً داخل ROUTES: `[/^#\/support$/, "app", () => supportView, true],`
   - (اختياري) أضف في قائمة المستخدم: `<a href="#/support">${icon("flag")} الإبلاغ عن مشكلة</a>`
4. الخادم: صفحة (14) تحتاج `POST /api/support/report` (الحقول: category, title, description, steps, page, device, screenshot) ويعيد `{ticket_id, message}`.
