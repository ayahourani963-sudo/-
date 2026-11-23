import React, { useMemo, useState, useEffect } from "react";
import {
  Search, Bell, ChevronDown, LayoutDashboard, FileText, SearchCheck,
  Settings, HelpCircle, LogOut, Menu, X, ArrowRight, Save, ImagePlus,
  MapPin, CalendarDays, Tag, CheckCircle2, AlertTriangle, Clock3,
  CircleCheck, CircleX, History, PencilLine, Eye, SlidersHorizontal,
  ChevronLeft, ChevronRight, Filter, MoreHorizontal, Upload, Trash2,
  ShieldCheck, Sparkles, Info, Check, XCircle
} from "lucide-react";
import { PageHeading, StatusPill, initialMatches } from "./shared.jsx";

function MatchCard({ item, onView }) {
  return <article className="match-card">
    <div className="match-image-wrap"><img src={item.image} alt={item.name} className="match-image" style={{filter:"none"}} onError={e => {e.currentTarget.style.display="none";}}/><span className="match-score"><Sparkles size={13}/>{item.score}% تطابق</span><button className="image-more icon-button" aria-label="عرض تفاصيل الغرض" onClick={() => onView(item)}><MoreHorizontal size={19}/></button></div>
    <div className="match-card-body"><div className="match-category">{item.category} <span>•</span> {item.color}</div><h3>{item.name}</h3><p>{item.description}</p><div className="match-meta"><span><MapPin size={14}/>{item.location}</span><span><CalendarDays size={14}/>{item.date}</span></div><div className="match-scorebar"><div><span>درجة التشابه</span><strong>{item.score}%</strong></div><div className="progress-track"><span style={{width: `${item.score}%`}} /></div></div><button className="btn btn-outline full-button" onClick={() => onView(item)}><Eye size={16}/> عرض التفاصيل <ChevronLeft size={16}/></button></div>
  </article>;
}

export function Matches({ report, showToast = () => {} }) {
  const notify = showToast;
  const [query, setQuery] = useState("");
  const [minScore, setMinScore] = useState("0");
  const [category, setCategory] = useState("all");
  const [color, setColor] = useState("all");
  const [place, setPlace] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("score");
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState([]);
  const results = useMemo(() => initialMatches.filter(m => (m.name + m.description + m.location + m.color).toLowerCase().includes(query.toLowerCase()) && m.score >= Number(minScore) &&
      (category === "all" || m.category === category) &&
      (color === "all" || m.color === color) &&
      (!place || m.location.toLowerCase().includes(place.toLowerCase())) &&
      (!fromDate || m.date >= fromDate) && (!toDate || m.date <= toDate)).sort((a,b) => sort === "score" ? b.score-a.score : sort === "date" ? b.date.localeCompare(a.date) : a.name.localeCompare(b.name)), [query, minScore, sort, category, color, place, fromDate, toDate]);
  if (["تم الاسترجاع", "لم يعد الغرض مطلوباً"].includes(report?.status)) {
    return <div className="page-content"><PageHeading eyebrow="البحث الذكي / المطابقة" title="نتائج المطابقة المحتملة" description="تظهر المطابقات للبلاغات النشطة فقط."/><div className="notice-card"><div className="notice-icon"><Info size={18}/></div><div><strong>البلاغ مغلق</strong><p>تم إيقاف عرض المطابقات النشطة لهذا البلاغ بعد تغيير حالته إلى «{report.status}».</p></div></div></div>;
  }
  return <div className="page-content">
    <PageHeading eyebrow="البحث الذكي / المطابقة" title="نتائج المطابقة المحتملة" description="أغراض عُثر عليها وقد تتشابه مع مواصفات بلاغك. راجع التفاصيل قبل اتخاذ أي إجراء." actions={<span className="ai-tag"><Sparkles size={15}/> مطابقة ذكية</span>} />
    <div className="match-report-banner"><div className="match-banner-icon"><SearchCheck size={24}/></div><div className="match-banner-copy"><span>نتائج مرتبطة بالبلاغ</span><strong>{report?.title || "البلاغ الحالي"}</strong><small><MapPin size={13}/> {report?.location || "المكان غير محدد"} <span>•</span> رقم البلاغ {report?.reportId || "—"}</small></div><div className="banner-count"><strong>{results.length}</strong><span>نتائج محتملة</span></div></div>
    <div className="match-toolbar">
      <label className="match-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث بالاسم أو المكان أو الوصف..." />{query && <button className="clear-search" onClick={() => setQuery("")} aria-label="مسح البحث"><X size={15}/></button>}</label>
      <div className="toolbar-select"><SlidersHorizontal size={16}/><label htmlFor="score-filter">أقل نسبة</label><select id="score-filter" value={minScore} onChange={e => setMinScore(e.target.value)}><option value="0">كل النتائج</option><option value="70">70% فأكثر</option><option value="80">80% فأكثر</option><option value="90">90% فأكثر</option></select></div>
      <div className="toolbar-select"><Filter size={16}/><label htmlFor="sort-matches">ترتيب</label><select id="sort-matches" value={sort} onChange={e => setSort(e.target.value)}><option value="score">الأكثر تطابقاً</option><option value="date">الأحدث</option><option value="name">الاسم</option></select></div>
    </div>
    <div className="match-filters-grid">
      <label className="match-filter-field"><span>نوع الغرض</span><select value={category} onChange={e => setCategory(e.target.value)}><option value="all">كل الأنواع</option>{[...new Set(initialMatches.map(x => x.category))].map(x => <option key={x} value={x}>{x}</option>)}</select></label>
      <label className="match-filter-field"><span>اللون</span><select value={color} onChange={e => setColor(e.target.value)}><option value="all">كل الألوان</option>{[...new Set(initialMatches.map(x => x.color))].map(x => <option key={x} value={x}>{x}</option>)}</select></label>
      <label className="match-filter-field"><span>المكان</span><input value={place} onChange={e => setPlace(e.target.value)} placeholder="مثال: المكتبة" /></label>
      <label className="match-filter-field"><span>من تاريخ</span><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></label>
      <label className="match-filter-field"><span>إلى تاريخ</span><input type="date" value={toDate} min={fromDate || undefined} onChange={e => setToDate(e.target.value)} /></label>
      <button type="button" className="filter-reset" onClick={() => {setQuery("");setMinScore("0");setCategory("all");setColor("all");setPlace("");setFromDate("");setToDate("");setSort("score");}}>إعادة ضبط الفلاتر</button>
    </div>
    <div className="results-heading"><div><h3>الأغراض المقترحة</h3><p>تم ترتيب النتائج حسب درجة التشابه.</p></div><span>{results.length} نتائج</span></div>
    {results.length ? <div className="matches-grid">{results.map(item => <MatchCard key={item.id} item={item} onView={setSelected}/>)}</div> : <div className="empty-state"><div><Search size={27}/></div><h3>لا توجد نتائج مطابقة</h3><p>جرّبي تغيير كلمات البحث أو خفض نسبة المطابقة.</p><button className="btn btn-secondary" onClick={() => {setQuery("");setMinScore("0");setCategory("all");setColor("all");setPlace("");setFromDate("");setToDate("");}}>مسح الفلاتر</button></div>}
    <div className="match-disclaimer"><Info size={17}/><p><strong>مهم:</strong> درجة التشابه مؤشر مساعد وليست تأكيداً لملكية الغرض. تحقق من العلامات المميزة قبل المطالبة به.</p></div>
    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={e => {if(e.target === e.currentTarget) setSelected(null);}}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="match-modal-title"><button className="modal-close icon-button" onClick={() => setSelected(null)} aria-label="إغلاق"><X size={19}/></button><img src={selected.image} alt={selected.name} className="detail-modal-image" style={{filter:"none"}}/><div className="detail-modal-content"><span className="match-score inline-score"><Sparkles size={13}/>{selected.score}% تطابق</span><h3 id="match-modal-title">{selected.name}</h3><p>{selected.description}</p><div className="detail-facts"><span><Tag size={15}/> التصنيف: {selected.category}</span><span><MapPin size={15}/> {selected.location}</span><span><CalendarDays size={15}/> {selected.date}</span><span><FileText size={15}/> رقم الغرض: {selected.id}</span></div><div className="warning-box"><ShieldCheck size={18}/><p>لا تظهر بيانات صاحب الغرض. يجب التحقق من الملكية عبر إجراءات المنصة.</p></div><div className="button-group"><button className="btn btn-secondary" onClick={() => setSelected(null)}>إغلاق</button><button className="btn btn-primary" onClick={() => {setSaved(prev => prev.includes(selected.id) ? prev : [...prev, selected.id]); notify("تمت إضافة النتيجة إلى قائمة المتابعة."); setSelected(null);}}><CheckCircle2 size={16}/>{saved.includes(selected.id) ? "تمت المتابعة" : "متابعة النتيجة"}</button></div></div></div></div>}
  </div>;
}
