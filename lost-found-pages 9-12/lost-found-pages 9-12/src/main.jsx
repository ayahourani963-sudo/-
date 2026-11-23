import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { SearchCheck, FileText, CircleCheck, History, Sparkles, Info } from "lucide-react";
import { EditReport, CloseReport, UpdateStatus, Matches, initialReport } from "../components/index.js";
import "../styles/reports.css";

const pageMeta = {
  edit: ["تعديل البلاغ", "إدارة بيانات البلاغ وتحديث تفاصيل الغرض"],
  close: ["إغلاق البلاغ", "تأكيد الحالة النهائية للبلاغ"],
  update: ["تحديث حالة البلاغ", "إضافة المستجدات ومراجعة سجل التحديثات"],
  matches: ["نتائج المطابقة", "مراجعة الأغراض التي قد تتطابق مع البلاغ"]
};

function DemoApp() {
  const [page, setPage] = useState("edit");
  const [report, setReport] = useState(initialReport);
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(window.__lfFeatureToast);
    window.__lfFeatureToast = window.setTimeout(() => setToast(null), 3200);
  }, []);
  const [title, subtitle] = pageMeta[page];
  return <div className="lf-feature-module">
    <header className="lf-feature-preview-topbar">
      <div className="lf-feature-preview-brand"><div className="lf-feature-brand-mark"><SearchCheck size={23}/></div><div><strong>منصة المفقودات</strong><small>LOST &amp; FOUND · FEATURE PAGES</small></div></div>
      <div className="lf-feature-preview-heading"><h1>{title}</h1><p>{subtitle}</p></div>
    </header>
    <nav className="lf-feature-tabs-wrap" aria-label="التنقل بين صفحات المعاينة">
      <button className={`lf-feature-tab ${page === "edit" ? "active" : ""}`} onClick={() => setPage("edit")}><FileText size={15}/> تعديل البلاغ </button>
      <button className={`lf-feature-tab ${page === "close" ? "active" : ""}`} onClick={() => setPage("close")}><CircleCheck size={15}/> إغلاق البلاغ </button>
      <button className={`lf-feature-tab ${page === "update" ? "active" : ""}`} onClick={() => setPage("update")}><History size={15}/> تحديث الحالة </button>
      <button className={`lf-feature-tab ${page === "matches" ? "active" : ""}`} onClick={() => setPage("matches")}><Sparkles size={15}/> نتائج المطابقة </button>
    </nav>
    <main className="lf-feature-preview-main">
      {page === "edit" && <EditReport report={report} setReport={setReport} showToast={notify}/>}
      {page === "close" && <CloseReport report={report} setReport={setReport} showToast={notify}/>}
      {page === "update" && <UpdateStatus report={report} setReport={setReport} showToast={notify}/>}
      {page === "matches" && <Matches report={report} showToast={notify}/>}
    </main>
    {toast && <div className={`toast ${toast.type}`} role="status"><span>{toast.message}</span></div>}
  </div>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><DemoApp/></React.StrictMode>);
