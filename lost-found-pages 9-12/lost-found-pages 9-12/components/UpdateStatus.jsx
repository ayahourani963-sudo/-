import React, { useMemo, useState, useEffect } from "react";
import {
  Search, Bell, ChevronDown, LayoutDashboard, FileText, SearchCheck,
  Settings, HelpCircle, LogOut, Menu, X, ArrowRight, Save, ImagePlus,
  MapPin, CalendarDays, Tag, CheckCircle2, AlertTriangle, Clock3,
  CircleCheck, CircleX, History, PencilLine, Eye, SlidersHorizontal,
  ChevronLeft, ChevronRight, Filter, MoreHorizontal, Upload, Trash2,
  ShieldCheck, Sparkles, Info, Check, XCircle
} from "lucide-react";
import { PageHeading, Field, StatusPill, statusOptions } from "./shared.jsx";

export function UpdateStatus({ report, setReport, showToast = () => {} }) {
  const notify = showToast;
  const [status, setStatus] = useState(report.status);
  useEffect(() => setStatus(report.status), [report.status]);
  const [details, setDetails] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [history, setHistory] = useState([
    { id: 1, status: "قيد البحث", details: "تم تسجيل البلاغ وإضافته إلى قائمة البحث.", date: "2026-10-18", time: "10:42 ص" },
    { id: 2, status: "قيد البحث", details: "تمت مراجعة تفاصيل البلاغ.", date: "2026-10-19", time: "02:15 م" }
  ]);
  const submit = e => {
    e.preventDefault();
    if (!details.trim()) { notify("أضيف تفاصيل قصيرة عن المستجدات.", "error"); return; }
    setReport(prev => ({...prev, status}));
    setHistory(prev => [{id: Date.now(), status, details: details.trim(), date, time: new Date().toLocaleTimeString("ar", {hour:"2-digit", minute:"2-digit"})}, ...prev]);
    setDetails("");
    notify("تمت إضافة تحديث جديد إلى سجل البلاغ.");
  };
  return <div className="page-content">
    <PageHeading eyebrow="إدارة البلاغات / التحديثات" title="تحديث حالة البلاغ" description="سجّلي أي معلومات جديدة طرأت على البلاغ لتبقى التفاصيل محدثة." actions={<span className="report-id"><History size={15}/>{report.reportId}</span>} />
    <div className="two-column-layout update-layout">
      <form className="panel form-panel" onSubmit={submit}>
        <div className="panel-header"><div><h3>إضافة تحديث جديد</h3><p>أدخلي الحالة الحالية والتفاصيل الجديدة</p></div><span className="panel-icon"><History size={19}/></span></div>
        <div className="current-status-box"><span>الحالة الحالية للبلاغ</span><div><StatusPill status={report.status}/><ArrowRight size={16}/><strong>الحالة الجديدة</strong></div></div>
        <Field label="الحالة الجديدة" required>
          <select value={status} onChange={e => setStatus(e.target.value)}>{statusOptions.map(s => <option key={s}>{s}</option>)}</select>
        </Field>
        <Field label="تاريخ التحديث" required>
          <div className="input-icon"><CalendarDays size={17}/><input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
        </Field>
        <Field label="تفاصيل المستجدات" required hint="مثال: تم التواصل مع مكتب الاستعلامات، ولا يزال البحث جارياً.">
          <textarea rows="6" value={details} onChange={e => setDetails(e.target.value)} placeholder="اكتب ما الذي تغيّر منذ آخر تحديث..." required />
        </Field>
        <div className="notice-card compact"><div className="notice-icon"><Info size={17}/></div><div><strong>نصيحة</strong><p>اكتب معلومات واضحة ومحددة، وتجنبي إضافة بيانات شخصية حساسة.</p></div></div>
        <div className="form-footer"><button type="button" className="btn btn-secondary" onClick={() => {setStatus(report.status); setDetails("");}}>إلغاء</button><button type="submit" className="btn btn-primary"><Save size={17}/> نشر التحديث</button></div>
      </form>
      <section className="panel timeline-panel">
        <div className="panel-header"><div><h3>سجل التحديثات</h3><p>التغييرات المسجلة على هذا البلاغ</p></div><span className="count-badge">{history.length} تحديثات</span></div>
        <div className="timeline">
          {history.map((item, index) => <div className="timeline-item" key={item.id}><div className={`timeline-marker ${index === 0 ? "latest" : ""}`}>{index === 0 ? <Clock3 size={15}/> : <Check size={15}/>}</div><div className="timeline-content"><div className="timeline-top"><StatusPill status={item.status}/><time>{item.date}</time></div><p>{item.details}</p><small>{item.time}</small></div></div>)}
        </div>
        <div className="timeline-footer"><Clock3 size={15}/> تظهر التحديثات الجديدة في أعلى السجل.</div>
      </section>
    </div>
  </div>;
}
