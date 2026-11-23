// صفحة (14): الإبلاغ عن مشكلة — الدعم الفني للمشاكل التقنية في التطبيق
// يتطلب نقطة نهاية: POST /api/support/report  ← { category, title, description, steps, page, device, screenshot } → { ticket_id, message }
import { api, $, esc } from "../core.js";
import { icon, toast, alertBox } from "../ui.js";

const CATS = { crash: "تعطّل أو خطأ في التطبيق", login: "تسجيل الدخول والحساب", upload: "رفع الصور", match: "المطابقة والبحث", notify: "الإشعارات", chat: "المحادثة", display: "مشكلة في العرض أو التصميم", other: "أخرى" };

async function shot(file) {
  const bmp = await createImageBitmap(file), k = Math.min(1, 1100 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", 0.8);
}

export async function supportView(root) {
  root.className = "container narrow";
  const prevPage = sessionStorage.getItem("lf_prev") || "";
  let screenshot = null;
  root.innerHTML = `<a class="crumb" href="#/">${icon("arrow")} الرئيسية</a>
    <div class="page-head"><h1>${icon("flag")} الإبلاغ عن مشكلة</h1></div>
    <div id="box" class="card"><p class="muted sm">أخبرنا بما حدث وسيراجعه فريق الدعم الفني. هذه الصفحة للمشاكل التقنية في التطبيق؛ للإبلاغ عن سلوك مستخدم استخدم خيار الإبلاغ داخل المحادثة.</p>
      <form id="sf" novalidate>
        <label class="lbl" for="sc">نوع المشكلة</label><select class="select" id="sc">${Object.entries(CATS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
        <label class="lbl" for="st">عنوان مختصر</label><input class="input" id="st" maxlength="100" placeholder="مثال: لا تظهر الصور بعد الرفع"><div class="field-err" id="e-t"></div>
        <label class="lbl" for="sd">وصف المشكلة</label><textarea class="textarea" id="sd" maxlength="1500" placeholder="ماذا حدث؟ وماذا كنت تتوقع؟ (10 أحرف على الأقل)"></textarea><div class="field-err" id="e-d"></div>
        <label class="lbl" for="ss">خطوات تكرار المشكلة (اختياري)</label><textarea class="textarea" id="ss" maxlength="800" style="min-height:70px" placeholder="1) افتح… 2) اضغط…"></textarea>
        <label class="lbl">لقطة شاشة (اختياري)</label>
        <div class="row"><label class="btn soft s">${icon("image")} اختيار صورة<input type="file" id="sf-img" accept="image/*" hidden></label><span class="muted sm" id="sf-name"></span><button type="button" class="btn s ghost hide" id="sf-rm">${icon("x")} إزالة</button></div>
        <label class="check mt"><input type="checkbox" id="sdev" checked><span class="sm">إرفاق معلومات الجهاز والمتصفح والصفحة الحالية لتسريع الحل (لا تتضمن بياناتك الشخصية).</span></label>
        <div class="alert bad mt hide" id="serr">${icon("alert")}<div class="txt" id="serrT"></div></div>
        <div class="row mt"><button class="btn grad" id="ssend">${icon("send")} إرسال البلاغ</button><a class="btn sec" href="#/">إلغاء</a></div>
      </form></div>`;
  const err = (m) => { $("#serr").classList.toggle("hide", !m); $("#serrT").textContent = m || ""; };
  $("#sf-img").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { screenshot = await shot(f); $("#sf-name").textContent = f.name; $("#sf-rm").classList.remove("hide"); } catch (_) { toast("تعذرت قراءة الصورة", "err"); }
    e.target.value = "";
  });
  $("#sf-rm").addEventListener("click", () => { screenshot = null; $("#sf-name").textContent = ""; $("#sf-rm").classList.add("hide"); });
  $("#sf").addEventListener("submit", async (e) => {
    e.preventDefault(); err("");
    const title = $("#st").value.trim(), description = $("#sd").value.trim();
    $("#e-t").textContent = title.length < 3 ? "أدخل عنواناً للمشكلة" : ""; $("#e-d").textContent = description.length < 10 ? "اشرح المشكلة (10 أحرف على الأقل)" : "";
    if (title.length < 3 || description.length < 10) return;
    const btn = $("#ssend"); btn.disabled = true; btn.innerHTML = `<span class="spin"></span> جارٍ الإرسال…`;
    const device = $("#sdev").checked ? { ua: navigator.userAgent, lang: navigator.language, screen: `${screen.width}x${screen.height}`, viewport: `${innerWidth}x${innerHeight}`, theme: document.documentElement.dataset.theme, online: navigator.onLine } : null;
    try {
      const r = await api("/api/support/report", { method: "POST", body: { category: $("#sc").value, title, description, steps: $("#ss").value.trim(), page: prevPage || location.hash, device, screenshot } });
      $("#box").innerHTML = `<div class="ticket">${alertBox("ok", "check", "<b>تم استلام بلاغك.</b> شكراً لمساعدتنا في تحسين التطبيق.").replace("alert ok", "alert ok").trim()}${r.ticket_id ? `<div class="mt muted sm">رقم البلاغ</div><div class="num">#${esc(r.ticket_id)}</div>` : ""}<p class="muted sm">${esc(r.message || "سنراجع المشكلة ونتواصل معك عبر الإشعارات عند الحاجة.")}</p><a class="btn grad" href="#/">العودة للرئيسية</a></div>`;
    } catch (ex) { err(ex.message); btn.disabled = false; btn.innerHTML = `${icon("send")} إرسال البلاغ`; }
  });
}
