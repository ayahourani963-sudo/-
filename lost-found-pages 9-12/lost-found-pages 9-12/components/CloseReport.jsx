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

export function CloseReport({ report, setReport, showToast = () => {} }) {
  const notify = showToast;
  const [choice, setChoice] = useState("تم الاسترجاع");
  const [note, setNote] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const confirm = () => {
    setReport(prev => ({...prev, status: choice}));
    setShowConfirm(false); setDone(true);
    notify(`تم تحديث حالة البلاغ إلى «${choice}».`);
  };
  return <div className="page-content">
    <PageHeading eyebrow="إدارة البلاغات / الإغلاق" title="إغلاق البلاغ" description="اختار الحالة النهائية المناسبة للبلاغ بعد مراجعة تفاصيله." />
    <div className="narrow-content">
      <div className="panel close-report-card">
        <div className="close-illustration"><div className="close-illustration-inner"><CheckCircle2 size={38}/></div><span className="sparkle sparkle-one">✦</span><span className="sparkle sparkle-two">✧</span></div>
        <div className="centered-heading"><h3>هل انتهت متابعة هذا البلاغ؟</h3><p>راجع بيانات البلاغ واختار الحالة التي تعبّر عن وضعه الحالي.</p></div>
        <div className="report-summary">
          <div className="summary-icon"><Tag size={23}/></div><div className="summary-copy"><strong>{report.title}</strong><span>رقم البلاغ: {report.reportId}</span><small><MapPin size={13}/>{report.location}</small></div><StatusPill status={report.status}/>
        </div>
        <div className="section-label">الحالة النهائية</div>
        <div className="choice-grid">
          <button type="button" className={`status-choice ${choice === "تم الاسترجاع" ? "selected resolved" : ""}`} onClick={() => {setChoice("تم الاسترجاع"); setDone(false);}}>
            <span className="choice-icon green"><CheckCircle2 size={21}/></span><span><strong>تم الاسترجاع</strong><small>تم العثور على الغرض أو إعادته لصاحبه.</small></span><span className="radio-indicator">{choice === "تم الاسترجاع" && <Check size={12}/>}</span>
          </button>
          <button type="button" className={`status-choice ${choice === "لم يعد الغرض مطلوباً" ? "selected closed" : ""}`} onClick={() => {setChoice("لم يعد الغرض مطلوباً"); setDone(false);}}>
            <span className="choice-icon gray"><XCircle size={21}/></span><span><strong>لم يعد الغرض مطلوباً</strong><small>إيقاف متابعة البلاغ دون اعتباره محلولاً.</small></span><span className="radio-indicator">{choice === "لم يعد الغرض مطلوباً" && <Check size={12}/>}</span>
          </button>
        </div>
        <Field label="ملاحظة الإغلاق (اختياري)">
          <textarea rows="3" value={note} onChange={e => setNote(e.target.value)} placeholder="أضيف سبب الإغلاق أو تفاصيل الحل..." />
        </Field>
        <div className="warning-box"><AlertTriangle size={18}/><p>تأكد من اختيار الحالة الصحيحة. قد يؤثر الإغلاق على ظهور البلاغ ضمن نتائج البحث النشطة.</p></div>
        {done && <div className="inline-success"><CheckCircle2 size={17}/> تم تحديث الحالة.</div>}
        <div className="form-footer"><button className="btn btn-secondary" onClick={() => {setChoice("تم الاسترجاع"); setNote(""); setDone(false);}}>إعادة ضبط</button><button className="btn btn-primary" onClick={() => setShowConfirm(true)}><CheckCircle2 size={17}/> تأكيد {choice === "تم الاسترجاع" ? "الحل" : "الإغلاق"}</button></div>
      </div>
    </div>
    {showConfirm && <div className="modal-backdrop" role="presentation" onMouseDown={e => {if(e.target === e.currentTarget) setShowConfirm(false);}}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className="modal-icon"><AlertTriangle size={24}/></div><h3 id="confirm-title">تأكيد تغيير حالة البلاغ</h3><p>هل أنت متأكدة من تغيير حالة «{report.title}» إلى «{choice}»؟</p>{note && <div className="modal-note">الملاحظة: {note}</div>}<div className="button-group"><button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>مراجعة</button><button className="btn btn-primary" onClick={confirm}>نعم، تأكيد</button></div></div></div>}
  </div>;
}
