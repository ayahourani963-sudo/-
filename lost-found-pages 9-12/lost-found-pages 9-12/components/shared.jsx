import React from "react";
import { Info } from "lucide-react";

export const initialReport = {
  title: "محفظة جلدية بنية",
  type: "محفظة",
  color: "بني",
  date: "2026-10-18",
  location: "مكتبة الجامعة – الطابق الأول",
  description: "محفظة جلدية بنية صغيرة، تحتوي على بطاقات شخصية. فُقدت بالقرب من المكتبة.",
  status: "قيد البحث",
  reportId: "LF-2026-0184",
  kind: "مفقود"
};

export const initialMatches = [
  { id: "FD-1042", name: "محفظة جلدية بنية", category: "محافظ", color: "بني", location: "المبنى الرئيسي – الاستعلامات", date: "2026-10-19", score: 94, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85", description: "محفظة جلدية بنية صغيرة تم العثور عليها قرب المدخل الرئيسي." },
  { id: "FD-1038", name: "محفظة بنية صغيرة", category: "محافظ", color: "بني داكن", location: "مكتبة الجامعة", date: "2026-10-17", score: 86, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85", description: "محفظة صغيرة عُثر عليها في قاعة المطالعة." },
  { id: "FD-1019", name: "حافظة بطاقات جلدية", category: "بطاقات", color: "أسود/بني", location: "مبنى الكليات – الطابق الأول", date: "2026-10-16", score: 72, image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=900&q=85", description: "حافظة بطاقات جلدية رفيعة، التفاصيل الإضافية غير متاحة." }
];

export const statusOptions = ["قيد البحث", "تم العثور عليه", "قيد التحقق", "قيد المطالبة بالملكية", "تم الاسترجاع", "لم يعد الغرض مطلوباً"];

export function StatusPill({ status }) {
  const cls = status === "تم الاسترجاع" || status === "تم العثور عليه"
    ? "success" : status === "لم يعد الغرض مطلوباً" ? "muted" : status === "قيد التحقق" ? "warning" : "info";
  return <span className={`status-pill ${cls}`}><span className="status-dot" />{status}</span>;
}

export function PageHeading({ eyebrow, title, description, actions }) {
  return <div className="page-heading">
    <div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{description}</p></div>
    {actions && <div className="heading-actions">{actions}</div>}
  </div>;
}

export function Field({ label, children, hint, required }) {
  return <div className="field"><label>{label}{required && <span className="required"> *</span>}</label>{children}{hint && <small className="field-hint">{hint}</small>}</div>;
}
