// صفحة (15): إدارة طلبات المطالبة بالملكية + تفاصيل المطالبة ونموذج التحقق (UC013, UC019–UC021)
import { api, $, $$, esc, dateAr, ago, CSTATUS, CAT_ICON } from "../core.js";
import { icon, toast, modal, confirmBox, kindBadge, badge, ring, bars, empty, skeleton, alertBox, gallery, hydrateImages, bindLightbox, questionBuilder, colorDot } from "../ui.js";

async function decide(id, kind) {
  if (kind === "approve") {
    if (!(await confirmBox("قبول المطالبة", "ستُكشف تفاصيل الغرض لطالب المطالبة وتُفتح محادثة بينكما. هل أنت متأكد من معقولية الطلب؟", "قبول"))) return false;
    const r = await api(`/api/claims/${id}/decision`, { method: "POST", body: { decision: "approve" } });
    toast("تم القبول وفُتحت المحادثة"); location.hash = "#/chat/" + r.conversation_id; return true;
  }
  const ok = await modal({ title: "رفض المطالبة", body: `<label class="lbl">سبب الرفض (اختياري، يظهر للمطالب)</label><textarea class="textarea" id="rn" maxlength="300"></textarea>`,
    actions: [{ label: "تراجع", value: null }, { label: "رفض الطلب", cls: "danger", run: async (ov) => { await api(`/api/claims/${id}/decision`, { method: "POST", body: { decision: "reject", note: $("#rn", ov).value } }); return true; } }] });
  if (ok) toast("تم رفض الطلب"); return !!ok;
}

export async function claimsView(root) {
  root.className = "container narrow";
  root.innerHTML = `<div class="page-head"><h1>${icon("shield")} إدارة طلبات المطالبة</h1></div>
    <div class="tabs" id="tabs"><button class="on" data-t="in">واردة (على أغراض عثرت عليها)</button><button data-t="out">مقدَّمة مني</button></div>
    <div id="list">${skeleton(3, 90)}</div>`;
  let d = await api("/api/claims"), tab = "in", only = false;
  const needs = (c) => ["requested", "awaiting_review"].includes(c.status);

  const claimantRow = (c) => {
    const [l, cls] = CSTATUS[c.status];
    return `<div class="claimant ${needs(c) ? "need" : ""}" data-c="${c.id}"><div class="row between" style="flex-wrap:nowrap"><div class="row gap-s grow"><span class="avatar">${esc((c.claimer_name || "؟")[0])}</span><div><b>${esc(c.claimer_name || "مدّعي الملكية")}</b><div class="muted xs">بخصوص: ${esc(c.lost_title || "")} · ${ago(c.created_at)}</div></div></div>
      <div class="row gap-s" style="flex-wrap:nowrap">${ring(c.score)}</div></div>
      <div class="row between mt">${badge(l, cls)}<div class="row gap-s">
        <button class="btn s sec" data-open="${c.id}">${icon("eye")} عرض التفاصيل</button>
        ${needs(c) ? `<button class="btn s grad" data-ok="${c.id}">${icon("check")} قبول</button><button class="btn s danger soft" data-no="${c.id}">${icon("x")} رفض</button>` : ""}
        ${c.status === "approved" && c.conversation_id ? `<a class="btn s soft" href="#/chat/${c.conversation_id}">${icon("chat")} المحادثة</a>` : ""}</div></div>
      <div class="detail hide"></div></div>`;
  };

  const draw = () => {
    if (tab === "in") {
      const list = d.incoming.filter((c) => !only || needs(c));
      const groups = {}; list.forEach((c) => (groups[c.found_id ?? c.found_title] ||= { title: c.found_title, items: [] }).items.push(c));
      const pending = d.incoming.filter(needs).length;
      $("#list").innerHTML = `<div class="row between mb"><span class="muted sm">${pending ? `<b style="color:#c2410c">${pending}</b> طلب بانتظار قرارك` : "لا توجد طلبات بانتظار قرارك"}</span><label class="check"><input type="checkbox" id="onlyNeed" ${only ? "checked" : ""}><span class="sm">إظهار ما يحتاج إجراءً فقط</span></label></div>`
        + (list.length ? Object.values(groups).map((g) => `<div class="card claimgrp mb"><div class="row between"><h3>${icon("package")} ${esc(g.title)}</h3>${badge(g.items.length + " مدّعٍ", "b-brand")}</div>${g.items.map(claimantRow).join("")}</div>`).join("")
          : empty("shield", "لا توجد طلبات واردة", "ستظهر هنا قائمة من يدّعون ملكية الأغراض التي سجلتها."));
    } else {
      $("#list").innerHTML = d.outgoing.length ? `<div class="col">${d.outgoing.map((c) => {
        const [l, cls] = CSTATUS[c.status], act = c.status === "awaiting_answers";
        return `<a class="card hover row between" style="text-decoration:none;color:inherit;flex-wrap:nowrap" href="#/claim/${c.id}"><div class="grow"><div class="row gap-s">${badge(l, cls)}${act ? badge("يحتاج إجراءً", "b-bad") : ""}</div>
          <h3 style="margin:6px 0 2px">${esc(c.found_title)}</h3><div class="muted sm">بخصوص بلاغك: ${esc(c.lost_title)} · ${ago(c.created_at)} · تطابق ${c.score}%</div></div>${icon("left")}</a>`;
      }).join("")}</div>` : empty("shield", "لم تقدّم أي مطالبة بعد", "افتح بلاغ فقدان وراجع التطابقات لتقديم طلب مطالبة.");
    }
  };
  const detail = async (row, id) => {
    const box = $(".detail", row);
    if (!box.classList.contains("hide")) return box.classList.add("hide");
    box.classList.remove("hide"); box.innerHTML = `<div class="skel" style="height:80px"></div>`;
    try {
      const { claim: c } = await api("/api/claims/" + id), r = c.rounds[c.rounds.length - 1];
      box.innerHTML = `<b>وصف المطالب:</b><p style="margin:4px 0 10px">${esc(c.message)}</p>
        ${r ? `<b>إجابات التحقق${c.rounds.length > 1 ? ` (الجولة ${r.round_no})` : ""}:</b><div class="mt">${qaList(r)}</div>` : `<p class="muted sm">لم تُرسَل أسئلة تحقق بعد.</p>`}
        ${c.status === "awaiting_review" ? `<div class="row between sm"><b>مؤشر التشابه مع علاماتك</b><b>${c.hint_score}%</b></div><div class="hintmeter mt"><i style="width:${c.hint_score}%"></i></div><p class="hint">مؤشر استرشادي وليس إثباتاً.</p>` : ""}
        <div class="row mt"><a class="btn s sec" href="#/claim/${c.id}">${icon("left")} الصفحة الكاملة${c.status === "requested" ? " وإعداد الأسئلة" : c.status === "awaiting_review" ? " / طلب معلومات إضافية" : ""}</a></div>`;
    } catch (e) { box.innerHTML = alertBox("bad", "alert", esc(e.message)); }
  };
  draw();
  root.addEventListener("change", (e) => { if (e.target.id === "onlyNeed") { only = e.target.checked; draw(); } });
  root.addEventListener("click", async (e) => {
    const t = e.target.closest("#tabs button");
    if (t) { $$("#tabs button").forEach((x) => x.classList.toggle("on", x === t)); tab = t.dataset.t; return draw(); }
    const o = e.target.closest("[data-open]"); if (o) return detail(o.closest(".claimant"), o.dataset.open);
    const ok = e.target.closest("[data-ok]"), no = e.target.closest("[data-no]");
    const b = ok || no; if (!b) return;
    try { if (await decide(+(ok || no).dataset[ok ? "ok" : "no"], ok ? "approve" : "reject") && no) { d = await api("/api/claims"); draw(); } } catch (err) { toast(err.message, "err"); }
  });
}

const ANS = { yes: "نعم", no: "لا" };
function stepper(c) {
  const s = c.status, hasQ = c.rounds.length > 0, answered = c.rounds.some((r) => r.answers);
  const steps = [["طلب المطالبة", "تم إرسال الطلب مع وصف الغرض"], ["أسئلة التحقق", "يجهّز صاحب بلاغ العثور الأسئلة"], ["إجابات المطالب", "يجيب طالب المطالبة عن الأسئلة"], ["المراجعة والقرار", "موافقة أو رفض أو طلب معلومات إضافية"], ["المحادثة والتسليم", "ترتيب التسليم داخل التطبيق"]];
  let cur = { requested: 1, awaiting_answers: 2, awaiting_review: 3, approved: 4, rejected: 3, cancelled: 0 }[s] ?? 0;
  if (s === "approved" && c.found.status === "returned") cur = 5;
  return `<div class="timeline">${steps.map(([t, d], i) => {
    const cls = i < cur ? "done" : i === cur ? "cur" : "todo";
    return `<div class="tl ${cls}"><span class="pt">${i < cur ? icon("check") : i + 1}</span><div><b>${t}</b><span class="muted xs">${d}</span></div></div>`;
  }).join("")}</div>`;
}

const qaList = (round) => round.questions.map((q) => {
  const a = round.answers && round.answers[String(q.id)];
  return `<div class="qa"><div class="q">${q.id}. ${esc(q.text)}</div>${a !== undefined && a !== null ? `<div class="a">${esc(ANS[a] || a)}</div>` : `<div class="muted sm">لم تتم الإجابة بعد</div>`}</div>`;
}).join("");

function answerForm(c, round) {
  const key = `lf_ans_${c.id}_${round.round_no}`;
  let draft = {}; try { draft = JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) {}
  const inputs = round.questions.map((q) => {
    const v = draft[q.id] || "";
    let f = "";
    if (q.type === "text") f = `<textarea class="textarea" data-q="${q.id}" maxlength="500" style="min-height:70px">${esc(v)}</textarea>`;
    else if (q.type === "yes_no") f = ["yes", "no"].map((o) => `<label class="opt"><input type="radio" name="q${q.id}" data-q="${q.id}" value="${o}" ${v === o ? "checked" : ""}>${ANS[o]}</label>`).join("");
    else f = q.options.map((o) => `<label class="opt"><input type="radio" name="q${q.id}" data-q="${q.id}" value="${esc(o)}" ${v === o ? "checked" : ""}>${esc(o)}</label>`).join("");
    return `<div class="qa"><div class="q">${q.id}. ${esc(q.text)}</div>${f}</div>`;
  }).join("");
  return { html: `<form id="af">${inputs}<p class="hint">تُحفظ إجاباتك مسودةً تلقائياً على جهازك. لا يمكن تعديلها بعد الإرسال.</p><div class="form-err"></div>
    <div class="row"><button class="btn grad" id="asub">${icon("send")} إرسال الإجابات</button><button type="button" class="btn danger soft" id="ccl">إلغاء الطلب</button></div></form>`,
  collect() { const o = {}; $$("#af [data-q]").forEach((el) => { if (el.type === "radio") { if (el.checked) o[el.dataset.q] = el.value; } else o[el.dataset.q] = el.value; }); return o; }, key };
}

export async function claimView(root, id) {
  root.className = "container narrow";
  root.innerHTML = skeleton(2, 180);
  let sig = "";
  const signature = (c) => `${c.status}|${c.rounds.length}|${c.rounds.filter((r) => r.answers).length}`;
  const draw = async () => {
    const { claim: c } = await api("/api/claims/" + id);
    sig = signature(c);
    const [sl, sc] = CSTATUS[c.status];
    const finder = c.role === "finder";
    const other = finder ? c.lost : c.found;
    const latest = c.rounds[c.rounds.length - 1];
    let panel = "";
    if (finder) {
      if (c.status === "requested") panel = `<div class="card"><h3>${icon("list")} إعداد نموذج التحقق</h3><p class="muted sm">اختر أسئلة تساعدك على تقدير معقولية الطلب. لا تضع الإجابات الصحيحة أو علاماتك السرية في الأسئلة.</p><div id="qb"></div><div class="row mt"><button class="btn grad" id="sendq">${icon("send")} إرسال الأسئلة للمطالب</button></div>
          <div class="sep"></div><div class="row"><span class="muted sm grow">أو اتخذ قراراً مباشراً دون أسئلة:</span><button class="btn s soft" data-d="approve">موافقة على التواصل</button><button class="btn s danger soft" data-d="reject">رفض الطلب</button></div></div>`;
      else if (c.status === "awaiting_answers") panel = `<div class="card">${alertBox("info", "clock", "بانتظار إجابة طالب المطالبة عن الأسئلة المرسلة.")}<div class="mt">${qaList(latest)}</div></div>`;
      else if (c.status === "awaiting_review") panel = `<div class="card"><h3>${icon("eye")} مراجعة الإجابات</h3><div class="mt">${qaList(latest)}</div>
          <div class="mt"><div class="row between sm"><b>مؤشر استرشادي: تشابه الإجابات مع علاماتك ووصفك</b><b>${c.hint_score}%</b></div><div class="hintmeter mt"><i style="width:${c.hint_score}%"></i></div>
          <p class="hint">مؤشر آلي وليس إثباتاً. اعتمد على حكمك وقارن الإجابات بعلاماتك السرية.</p></div>
          ${c.found.secret_details ? `<div class="alert info mt">${icon("lock")}<div class="txt"><b>علاماتك السرية (تراها أنت فقط):</b><br>${esc(c.found.secret_details)}</div></div>` : ""}
          <div class="row mt"><button class="btn grad" data-d="approve">${icon("check")} موافقة على التواصل</button><button class="btn soft" data-d="more">${icon("help")} طلب معلومات إضافية</button><button class="btn danger soft" data-d="reject">${icon("x")} رفض</button></div>
          ${c.rounds_left <= 0 ? `<p class="hint">بلغت الحد الأقصى لجولات الأسئلة.</p>` : ""}</div>`;
    } else {
      if (c.status === "requested") panel = `<div class="card">${alertBox("info", "clock", "أُرسل طلبك. بانتظار أن يجهّز صاحب الغرض أسئلة التحقق أو يتخذ قراراً.")}<div class="mt"><button class="btn danger soft" id="ccl">إلغاء الطلب</button></div></div>`;
      else if (c.status === "awaiting_answers") { const f = answerForm(c, latest); panel = `<div class="card"><h3>${icon("list")} أسئلة التحقق${c.rounds.length > 1 ? ` (الجولة ${latest.round_no})` : ""}</h3>
          ${c.note ? `<p class="muted sm">ملاحظة من صاحب الغرض: ${esc(c.note)}</p>` : ""}<p class="muted sm">أجب بدقة. الأسئلة لا تكشف أي تفاصيل عن الغرض.</p>${f.html}</div>`; root._af = f; }
      else if (c.status === "awaiting_review") panel = `<div class="card">${alertBox("info", "clock", "أُرسلت إجاباتك وهي بانتظار مراجعة صاحب بلاغ العثور.")}<div class="mt">${qaList(latest)}</div><div class="mt"><button class="btn danger soft" id="ccl">إلغاء الطلب</button></div></div>`;
    }
    if (c.status === "approved") panel = `<div class="card">${alertBox("ok", "check", "<b>تمت الموافقة على التواصل.</b> رتّب التسليم عبر المحادثة، والتقِ في مكان عام.")}<div class="mt row">${c.conversation_id ? `<a class="btn grad" href="#/chat/${c.conversation_id}">${icon("chat")} فتح المحادثة</a>` : ""}</div></div>`;
    if (c.status === "rejected") panel = `<div class="card">${alertBox("bad", "x", `<b>رُفض الطلب.</b>${c.note ? "<br>" + esc(c.note) : ""}`)}</div>`;
    if (c.status === "cancelled") panel = `<div class="card">${alertBox("warn", "x", "أُلغي هذا الطلب.")}</div>`;
    const prev = c.rounds.slice(0, -1);
    root.innerHTML = `<a class="crumb" href="#/claims">${icon("arrow")} المطالبات</a>
      <div class="page-head"><div><div class="row gap-s">${badge(sl, sc)}<span class="muted sm">${ago(c.created_at)}</span></div><h1 style="margin-top:6px">${finder ? "طلب مطالبة على غرضك" : "طلب مطالبتك بالغرض"}</h1></div>${ring(c.score)}</div>
      <div class="grid g2" style="grid-template-columns:minmax(0,1fr)">
        <div class="card"><h3>${icon("flag")} مسار الطلب</h3><div class="mt">${stepper(c)}</div></div>
        <div class="card"><div class="row between"><h3>${finder ? "بلاغ طالب المطالبة (فقدان)" : "الغرض المعثور عليه"}</h3>${kindBadge(other.kind)}</div>
          <h3 style="margin:6px 0">${esc(other.title)}</h3><div class="meta"><span>${icon(CAT_ICON[other.category] || "package")}${esc(other.category_label)}</span>${other.color ? `<span>${colorDot(other.color, other.color_label)}</span>` : ""}<span>${icon("pin")}${esc(other.location_text)}</span><span>${icon("calendar")}${dateAr(other.event_date)}</span></div>
          ${other.images.length ? `<div class="mt">${gallery(other.images)}</div>` : ""}${other.unlocked ? "" : `<p class="blurnote mt">${icon("eyeoff")} الصور والتفاصيل محجوبة حفاظاً على الخصوصية.</p>`}
          <details class="mt"><summary class="sm muted" style="cursor:pointer">كيف حُسبت درجة التطابق؟</summary>${bars(c.breakdown)}</details>
          ${finder ? `<div class="sep"></div><b>وصف المطالب:</b><p style="margin-top:6px">${esc(c.message)}</p>` : `<div class="sep"></div><b>رسالتك:</b><p style="margin-top:6px">${esc(c.message)}</p>`}</div>
        ${panel}
        ${prev.length ? `<details class="card"><summary class="bold" style="cursor:pointer">الجولات السابقة (${prev.length})</summary>${prev.map((r) => `<h4 class="mt">الجولة ${r.round_no}</h4>${qaList(r)}`).join("")}</details>` : ""}
      </div>`;
    bindLightbox(root); hydrateImages(root);
    if (finder && c.status === "requested") root._qb = questionBuilder($("#qb"), { category: c.found.category, color: c.found.color });
    const af = root._af;
    if (af && $("#af")) $("#af").addEventListener("input", () => localStorage.setItem(af.key, JSON.stringify(af.collect())));
    root.onclick = async (e) => {
      const btn = e.target.closest("button"); if (!btn) return;
      try {
        if (btn.id === "sendq") {
          const qs = root._qb.get(); if (!qs.length) return toast("أضف سؤالاً واحداً على الأقل", "err");
          btn.disabled = true; await api(`/api/claims/${id}/questions`, { method: "POST", body: { mode: "manual", questions: qs } }); toast("أُرسلت الأسئلة للمطالب"); draw();
        } else if (btn.id === "ccl") {
          if (!(await confirmBox("إلغاء الطلب", "هل تريد إلغاء طلب المطالبة؟ لن يُحتسب كمحاولة مرفوضة.", "إلغاء الطلب", true))) return;
          await api(`/api/claims/${id}/cancel`, { method: "POST", body: {} }); toast("تم إلغاء الطلب"); draw();
        } else if (btn.id === "asub") {
          e.preventDefault(); btn.disabled = true; btn.innerHTML = `<span class="spin"></span> جارٍ الإرسال…`;
          try { await api(`/api/claims/${id}/answers`, { method: "POST", body: { answers: af.collect() } }); localStorage.removeItem(af.key); toast("أُرسلت إجاباتك للمراجعة"); draw(); }
          catch (err) { const fe = $(".form-err", root); fe.innerHTML = alertBox("bad", "alert", esc(err.message)); btn.disabled = false; btn.innerHTML = `${icon("send")} إرسال الإجابات`; }
        } else if (btn.dataset.d === "approve") {
          if (!(await confirmBox("الموافقة على التواصل", "ستُكشف تفاصيل الغرض لطالب المطالبة وتُفتح محادثة بينكما. هل أنت متأكد من معقولية الطلب؟", "موافقة"))) return;
          const r = await api(`/api/claims/${id}/decision`, { method: "POST", body: { decision: "approve" } }); toast("تمت الموافقة وفُتحت المحادثة"); location.hash = "#/chat/" + r.conversation_id;
        } else if (btn.dataset.d === "reject") {
          const note = await modal({ title: "رفض الطلب", body: `<label class="lbl">سبب الرفض (اختياري، يظهر للمطالب)</label><textarea class="textarea" id="rn" maxlength="300"></textarea>`, actions: [{ label: "تراجع", value: null }, { label: "رفض الطلب", cls: "danger", run: async (ov) => { await api(`/api/claims/${id}/decision`, { method: "POST", body: { decision: "reject", note: $("#rn", ov).value } }); return true; } }] });
          if (note) { toast("تم رفض الطلب"); draw(); }
        } else if (btn.dataset.d === "more") {
          if (c.rounds_left <= 0) return toast("بلغت الحد الأقصى لجولات الأسئلة", "err");
          let qb; const ok = await modal({ wide: true, title: "طلب معلومات إضافية", body: `<label class="lbl">ملاحظة للمطالب (اختياري)</label><input class="input" id="mn" maxlength="300"><label class="lbl">الأسئلة الإضافية</label><div id="mq"></div>`,
            onMount: (ov) => { qb = questionBuilder($("#mq", ov), { category: c.found.category, color: c.found.color }); },
            actions: [{ label: "تراجع", value: null }, { label: "إرسال", cls: "grad", run: async (ov) => { const qs = qb.get(); if (!qs.length) throw new Error("أضف سؤالاً واحداً على الأقل"); await api(`/api/claims/${id}/decision`, { method: "POST", body: { decision: "more_info", mode: "manual", questions: qs, note: $("#mn", ov).value } }); return true; } }] });
          if (ok) { toast("أُرسلت الأسئلة الإضافية"); draw(); }
        }
      } catch (err) { toast(err.message, "err"); btn.disabled = false; }
    };
  };
  await draw();
  // تحديث تلقائي عند تغيّر حالة الطلب من الطرف الآخر (دون مقاطعة كتابة الإجابات)
  const t = setInterval(async () => {
    if (document.hidden || $("#af") && ($("#af").contains(document.activeElement))) return;
    try { const { claim: c } = await api("/api/claims/" + id); if (signature(c) !== sig) draw(); } catch (_) {}
  }, 8000);
  return () => clearInterval(t);
}
