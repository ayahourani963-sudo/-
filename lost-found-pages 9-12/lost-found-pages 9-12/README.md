# Lost & Found — Feature Pages (UI Polish)

حزمة صفحات مستقلة ومهيأة للدمج مع مشروع الفريق. 

## محتويات الحزمة

- `components/EditReport.jsx` — تعديل البلاغ.
- `components/CloseReport.jsx` — إغلاق البلاغ.
- `components/UpdateStatus.jsx` — تحديث حالة البلاغ وسجل المستجدات.
- `components/MatchResults.jsx` — نتائج المطابقة والفلاتر.
- `components/shared.jsx` — البيانات التجريبية والمكونات المشتركة الصغيرة.
- `components/index.js` — نقطة تصدير سهلة للاستيراد.
- `styles/reports.css` — تنسيقات معزولة تحت `.lf-feature-module` لتقليل التعارض مع CSS مشروع الفريق.
- `src/main.jsx` — معاينة محلية للتنقل بين الصفحات الأربع فقط، وليست جزءاً مطلوباً من الدمج.

## تشغيل المعاينة

```bash
npm install
npm run dev
```

ثم افتح عنوان Vite الظاهر في الطرفية.

## الدمج في مشروع الفريق

1. انسخ مجلد `components` إلى مشروع React.
2. انسخ `styles/reports.css` إلى مشروع الفريق واستورده مرة واحدة.
3. لفّ مكان عرض الصفحة بمكوّن يحمل `className="lf-feature-module"` حتى تبقى جميع القواعد محصورة ضمن الوحدة ولا تتعارض مع تنسيقات المشروع.
4. استورد الصفحات:

```jsx
import {
  EditReport,
  CloseReport,
  UpdateStatus,
  Matches
} from "./components";
import "./styles/reports.css";
```

5. مرّر بيانات البلاغ ودوال التحديث من المكوّن الأب:

```jsx
<div className="lf-feature-module">
  {page === "edit" && <EditReport report={report} setReport={setReport} showToast={showToast} />}
  {page === "close" && <CloseReport report={report} setReport={setReport} showToast={showToast} />}
  {page === "update" && <UpdateStatus report={report} setReport={setReport} showToast={showToast} />}
  {page === "matches" && <Matches report={report} showToast={showToast} />}
</div>
```

يمكنكم وضع كل صفحة داخل route خاص بها بدلاً من شرط `page`.

## شكل البيانات المتوقع

يحتاج `report` إلى الحقول التالية على الأقل: `title`, `type`, `color`, `date`, `location`, `description`, `status`, `reportId`, `kind`.
`setReport` هو React state setter. `showToast(message, type)` اختياري، ويدعم `success` و`error`.

## ملاحظات وظيفية

- البيانات ونتائج المطابقة تجريبية ومحلية؛ لا يوجد Backend أو API أو حفظ دائم في قاعدة البيانات.
- سجل المستجدات داخل صفحة `UpdateStatus` محلي للمكوّن، ويمكن للفريق لاحقاً ربطه بالـ API أو رفعه إلى state مشترك.
- الصور في صفحة المطابقة تجريبية ومموهة بصرياً لإخفاء تفاصيل الغرض المعثور عليه.
- تمنع صفحة التعديل تغيير التفاصيل عندما تكون حالة البلاغ `قيد المطالبة بالملكية`.
- تخفي صفحة المطابقات النتائج النشطة عند إغلاق البلاغ بحالة `تم الاسترجاع` أو `لم يعد الغرض مطلوباً`.
- صفحة `src/main.jsx` تستخدم بيانات عينة، وهي مخصصة للمعاينة وليست جزءاً من الدمج النهائي.
