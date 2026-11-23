import React, { useMemo, useState, useEffect } from "react";
import {
  Search, Bell, ChevronDown, LayoutDashboard, FileText, SearchCheck,
  Settings, HelpCircle, LogOut, Menu, X, ArrowRight, Save, ImagePlus,
  MapPin, CalendarDays, Tag, CheckCircle2, AlertTriangle, Clock3,
  CircleCheck, CircleX, History, PencilLine, Eye, SlidersHorizontal,
  ChevronLeft, ChevronRight, Filter, MoreHorizontal, Upload, Trash2,
  ShieldCheck, Sparkles, Info, Check, XCircle
} from "lucide-react";
import { PageHeading, Field, StatusPill } from "./shared.jsx";

export function EditReport({ report, setReport, showToast = () => {} }) {
  const notify = showToast;
  const [draft, setDraft] = useState(report);
  useEffect(() => { setDraft(report); }, [report]);
  const [imageName, setImageName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const change = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));
  const submit = e => {
    e.preventDefault();
    const nextErrors = {};
    if (!draft.title.trim()) nextErrors.title = "يرجى إدخال اسم الغرض.";
    if (!draft.description.trim()) nextErrors.description = "يرجى كتابة وصف الغرض.";
    if (!draft.location.trim()) nextErrors.location = "يرجى تحديد المكان.";
    if (!draft.date) nextErrors.date = "يرجى اختيار التاريخ.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setReport(draft);
    notify("تم حفظ تعديلات البلاغ بنجاح.");
  };
  const reset = () => { setDraft(report); setErrors({}); setImageName(""); setImagePreview(""); };
  const onImage = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { notify("يرجى اختيار ملف صورة صالح.", "error"); return; }
    setImageName(file.name);
    setImagePreview(URL.createObjectURL(file));
  };
  if (report.status === "قيد المطالبة بالملكية") return <div className="page-content"><div className="notice-card"><div className="notice-icon"><Info size={18}/></div><div><strong>لا يمكن تعديل البلاغ حالياً</strong><p>البلاغ قيد المطالبة بالملكية، لذلك تم تعطيل تعديل التفاصيل وفق متطلبات النظام.</p></div></div></div>;
  return <div className="page-content">
    <PageHeading eyebrow="إدارة البلاغات / تعديل" title="تعديل بيانات البلاغ" description="حدّث معلومات الغرض المفقود أو المعثور عليه، ثم احفظ التغييرات." actions={<span className="report-id"><FileText size={15}/>{report.reportId}</span>} />
    <div className="two-column-layout">
      <form className="panel form-panel" onSubmit={submit}>
        <div className="panel-header"><div><h3>معلومات الغرض</h3><p>الحقول التي تحمل علامة * مطلوبة</p></div><StatusPill status={draft.status}/></div>
        <div className="form-grid">
          <Field label="اسم الغرض" required>
            <div className="input-icon"><Tag size={17}/><input value={draft.title} onChange={e => change("title", e.target.value)} placeholder="مثال: محفظة جلدية" /></div>
            {errors.title && <small className="error-text">{errors.title}</small>}
          </Field>
          <Field label="نوع البلاغ">
            <select value={draft.kind} onChange={e => change("kind", e.target.value)}><option>مفقود</option><option>معثور عليه</option></select>
          </Field>
          <Field label="تصنيف الغرض">
            <select value={draft.type} onChange={e => change("type", e.target.value)}><option>محفظة</option><option>هاتف</option><option>مفاتيح</option><option>حقيبة</option><option>وثائق</option><option>أخرى</option></select>
          </Field>
          <Field label="اللون">
            <div className="input-icon"><span className="color-dot brown" /><input value={draft.color} onChange={e => change("color", e.target.value)} placeholder="مثال: بني" /></div>
          </Field>
          <Field label="تاريخ الفقدان / العثور" required>
            <div className="input-icon"><CalendarDays size={17}/><input type="date" value={draft.date} onChange={e => change("date", e.target.value)} /></div>
            {errors.date && <small className="error-text">{errors.date}</small>}
          </Field>
          <Field label="المكان" required>
            <div className="input-icon"><MapPin size={17}/><input value={draft.location} onChange={e => change("location", e.target.value)} placeholder="أدخل المكان بالتفصيل" /></div>
            {errors.location && <small className="error-text">{errors.location}</small>}
          </Field>
          <div className="full-span">
            <Field label="وصف الغرض" required hint="أضف العلامات المميزة التي تساعد على التعرف على الغرض.">
              <textarea rows="4" value={draft.description} onChange={e => change("description", e.target.value)} placeholder="اكتب وصفاً واضحاً للغرض..." />
              {errors.description && <small className="error-text">{errors.description}</small>}
            </Field>
          </div>
          <div className="full-span">
            <Field label="صور الغرض" hint="اختار صورة واحدة للمعاينة. رفعها إلى الخادم يحتاج ربطاً بالـ API.">
              <label className="upload-area">
                {imagePreview ? <img className="upload-preview" src={imagePreview} alt="معاينة الصورة المحددة"/> : <div className="upload-symbol"><ImagePlus size={23}/></div>}
                <div><strong>{imageName || "اسحب الصورة إلى هنا أو اضغط للاختيار"}</strong><span>PNG أو JPG — معاينة محلية</span></div>
                <span className="upload-action"><Upload size={16}/> اختيار صورة</span>
                <input type="file" accept="image/*" onChange={onImage} hidden />
              </label>
              {imageName && <button type="button" className="text-button danger-text" onClick={() => {setImageName(""); setImagePreview("");}}> <Trash2 size={14}/> إزالة الصورة</button>}
            </Field>
          </div>
        </div>
        <div className="form-footer"><span className="saved-note"><ShieldCheck size={16}/> ستُحفظ التعديلات على هذا البلاغ</span><div className="button-group"><button type="button" className="btn btn-secondary" onClick={reset}>تراجع</button><button type="submit" className="btn btn-primary"><Save size={17}/> حفظ التعديلات</button></div></div>
      </form>
      <aside className="right-stack">
        <div className="panel preview-panel">
          <div className="panel-header"><div><h3>معاينة البلاغ</h3><p>كيف ستظهر المعلومات بعد الحفظ</p></div><Eye size={18} className="subtle-icon"/></div>
          <div className="preview-art"><div className="preview-art-icon"><Tag size={36}/></div><span className="floating-tag">{draft.kind}</span></div>
          <div className="preview-body"><div className="preview-title-row"><h3>{draft.title || "اسم الغرض"}</h3><StatusPill status={draft.status}/></div><p className="preview-description">{draft.description || "سيظهر وصف الغرض هنا..."}</p><div className="preview-meta"><span><MapPin size={15}/>{draft.location || "المكان غير محدد"}</span><span><CalendarDays size={15}/>{draft.date || "التاريخ غير محدد"}</span></div><div className="preview-tags"><span>{draft.type}</span><span>{draft.color || "لون غير محدد"}</span></div></div>
        </div>
        <div className="notice-card"><div className="notice-icon"><Info size={18}/></div><div><strong>تنبيه بخصوص الخصوصية</strong><p>لا تضف معلومات حساسة مثل كلمات المرور أو أرقام البطاقات في وصف الغرض.</p></div></div>
      </aside>
    </div>
  </div>;
}
