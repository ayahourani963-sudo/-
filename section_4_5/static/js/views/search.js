// صفحة (13): البحث المتقدم والفلاتر — توسيع النطاق + تخفيف المعايير
import { S, api, $, $$, esc, dateAr, today, debounce, CAT_ICON } from "../core.js";
import { icon, toast, badge, empty, skeleton, alertBox, hydrateImages } from "../ui.js";

const RELAX_STEPS = [["place", "المكان"], ["dates", "التاريخ"], ["color", "اللون"], ["category", "النوع"]];

export async function searchView(root) {
  root.className = "container narrow";
  const mine = (await api("/api/items/mine?kind=lost&status=open")).items;
  const cats = Object.entries(S.meta.categories).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
  const cols = Object.entries(S.meta.colors).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
  root.innerHTML = `<div class="page-head"><h1>${icon("search")} البحث المتقدم</h1><button class="btn sec s" id="fr">${icon("x")} مسح الفلاتر</button></div>
    <div class="card mb" id="fbox">
      <div class="iconfield">${icon("search")}<input class="input" id="q" placeholder="ابحث بالكلمات: محفظة، مفاتيح، هاتف…"></div>
      <div class="grid g4 mt">
        <div><label class="lbl" style="margin-top:0">النوع</label><select class="select" id="fc"><option value="">الكل</option>${cats}</select></div>
        <div><label class="lbl" style="margin-top:0">اللون</label><select class="select" id="fl"><option value="">الكل</option>${cols}</select></div>
        <div><label class="lbl" style="margin-top:0">من تاريخ</label><input class="input" id="fd1" type="date" max="${today()}"></div>
        <div><label class="lbl" style="margin-top:0">إلى تاريخ</label><input class="input" id="fd2" type="date" max="${today()}"></div>
      </div>
      <label class="lbl">المكان</label><div class="iconfield">${icon("pin")}<input class="input" id="fp" placeholder="الحي / الشارع / المحطة"></div>
      <div class="grid g2 mt">
        <label class="sw-toggle"><input type="checkbox" id="fw"><div><b>توسيع النطاق</b><span>يشمل نتائج أبعد زمنياً ومكانياً.</span></div></label>
        <label class="sw-toggle"><input type="checkbox" id="fx"><div><b>تخفيف المعايير</b><span>إن لم توجد نتائج نتجاهل الفلاتر تدريجياً (المكان ثم التاريخ ثم اللون ثم النوع).</span></div></label>
      </div></div>
    <div id="active" class="fchips"></div><div id="res"></div>`;

  const val = () => ({ q: $("#q").value.trim(), category: $("#fc").value, color: $("#fl").value, place: $("#fp").value.trim(), date_from: $("#fd1").value, date_to: $("#fd2").value });
  const qs = (f, wide) => new URLSearchParams({ ...f, wide: wide ? "1" : "0" }).toString();
  const labels = { category: "النوع", color: "اللون", place: "المكان", date_from: "من", date_to: "إلى" };

  const drawActive = () => {
    const f = val(), pretty = { category: S.meta.categories[f.category], color: S.meta.colors[f.color], place: f.place, date_from: f.date_from && dateAr(f.date_from), date_to: f.date_to && dateAr(f.date_to) };
    $("#active").innerHTML = Object.keys(labels).filter((k) => f[k]).map((k) => `<button class="fchip" data-clear="${k}">${labels[k]}: ${esc(pretty[k] || f[k])} ${icon("x")}</button>`).join("");
  };

  const card = (r) => `<div class="card pad0"><a class="item-card" href="#/item/${r.id}" style="text-decoration:none;color:inherit"><div class="pic">${r.images.length ? `<img data-img="${r.images[0]}" alt="">` : icon(CAT_ICON[r.category] || "package", "xl")}<span class="tr">${badge(r.relevance + "% صلة", "b-brand")}</span></div>
    <div class="body"><h3>${esc(r.title)}</h3><div class="meta"><span>${icon("pin")}${esc(r.location_text)}</span><span>${icon("calendar")}${dateAr(r.event_date)}</span></div></div></a>
    <div style="padding:0 16px 16px">${mine.length ? `<div class="row" style="flex-wrap:nowrap"><select class="select grow" id="lost-${r.id}">${mine.map((m) => `<option value="${m.id}">${esc(m.title)}</option>`).join("")}</select><button class="btn s grad" data-link="${r.id}">هذا غرضي</button></div>` : `<a class="btn s soft block" href="#/new/lost">سجّل بلاغ فقدان أولاً</a>`}</div></div>`;

  let seq = 0;
  const run = async () => {
    const my = ++seq; drawActive();
    $("#res").innerHTML = skeleton(3, 220);
    const wide = $("#fw").checked, relax = $("#fx").checked;
    try {
      let f = val(), dropped = [], { results } = await api("/api/search?" + qs(f, wide));
      if (relax && !results.length) {
        for (const [key, label] of RELAX_STEPS) {
          const had = key === "dates" ? f.date_from || f.date_to : f[key];
          if (!had) continue;
          f = { ...f, ...(key === "dates" ? { date_from: "", date_to: "" } : { [key]: "" }) }; dropped.push(label);
          ({ results } = await api("/api/search?" + qs(f, wide)));
          if (results.length) break;
        }
      }
      if (my !== seq) return;
      const note = dropped.length && results.length ? `<div class="mb">${alertBox("warn", "info", `لا توجد نتائج بالمعايير الكاملة، فخففنا: <b>${dropped.join("، ")}</b>. النتائج أدناه أقل دقة.`).replace('class="alert', 'class="alert relaxnote')}</div>` : "";
      $("#res").innerHTML = results.length
        ? `${note}<div class="resbar"><b>${results.length} نتيجة</b><span class="muted sm">مرتبة حسب الصلة</span></div><div class="grid auto">${results.map(card).join("")}</div>`
        : empty("search", "لا توجد نتائج مطابقة", "فعّل «توسيع النطاق» أو «تخفيف المعايير»، أو احذف بعض الفلاتر.", `<div class="row" style="justify-content:center"><button class="btn soft" id="widen">${icon("refresh")} توسيع النطاق</button><button class="btn sec" id="relax">${icon("filter")} تخفيف المعايير</button></div>`);
      hydrateImages($("#res"));
    } catch (e) { if (my === seq) $("#res").innerHTML = alertBox("bad", "alert", esc(e.message)); }
  };
  const d = debounce(run, 350);
  root.addEventListener("input", (e) => { if (e.target.closest("#fbox") && !e.target.matches('input[type=checkbox]')) d(); });
  root.addEventListener("change", (e) => { if (e.target.matches('#fbox input[type=checkbox], #fbox select, #fbox input[type=date]')) run(); });
  root.addEventListener("click", async (e) => {
    if (e.target.closest("#fr")) { $$("#q,#fc,#fl,#fp,#fd1,#fd2").forEach((x) => (x.value = "")); $("#fw").checked = $("#fx").checked = false; run(); }
    if (e.target.closest("#widen")) { $("#fw").checked = true; run(); }
    if (e.target.closest("#relax")) { $("#fx").checked = true; run(); }
    const c = e.target.closest("[data-clear]");
    if (c) { const m = { category: "#fc", color: "#fl", place: "#fp", date_from: "#fd1", date_to: "#fd2" }[c.dataset.clear]; $(m).value = ""; run(); }
    const l = e.target.closest("[data-link]");
    if (l) { try { const r = await api(`/api/items/${l.dataset.link}/link`, { method: "POST", body: { lost_id: +$("#lost-" + l.dataset.link).value } }); toast("تم الربط. تابع طلب المطالبة من بلاغك"); location.hash = "#/item/" + r.lost_id; } catch (err) { toast(err.message, "err"); } }
  });
  run();
}
