// صفحة (16): مركز التواصل (المحادثة) بعد تأكيد المطابقة والملكية (UC014) + الإبلاغ عن مشكلة (UC018)
import { S, api, $, $$, esc, ago, timeAr } from "../core.js";
import { icon, empty, toast, modal, confirmBox, alertBox, badge } from "../ui.js";

export async function chatView(root, id) {
  root.className = "container";
  root.innerHTML = `<div class="chatwrap ${id ? "thread-open" : ""}" id="cw">
    <div class="card pad0 convlist-card"><div style="padding:14px 16px;border-bottom:1px solid var(--line)"><b>المحادثات</b></div><div class="convlist" id="convs"></div></div>
    <div class="card pad0 thread-card thread" id="thread"></div></div>`;
  let timers = [], lastId = 0, rendered = new Set(), cv = null, me = null, stopped = false;
  const loadList = async () => {
    const { conversations } = await api("/api/conversations");
    $("#convs").innerHTML = conversations.length ? conversations.map((c) => `<a class="conv ${String(c.id) === String(id) ? "on" : ""}" href="#/chat/${c.id}">
      <span class="avatar">${esc((c.other_name || "?")[0])}</span><span class="grow"><div class="row between gap-s"><b>${esc(c.other_name)}</b>${c.unread ? `<span class="badge b-bad">${c.unread}</span>` : ""}</div>
      <div class="lastm">${esc(c.last ? c.last.body : "لا رسائل بعد")}</div><div class="xs muted">${esc(c.found.title)}</div></span></a>`).join("")
      : empty("chat", "لا توجد محادثات", "تُفتح المحادثة بعد موافقة صاحب بلاغ العثور على طلب المطالبة.");
    return conversations;
  };
  await loadList();
  timers.push(setInterval(() => { if (!stopped) loadList().catch(() => {}); }, 15000));
  if (!id) {
    $("#thread").innerHTML = `<div class="empty" style="margin:auto">${empty("message", "اختر محادثة", "اختر محادثة من القائمة لعرض الرسائل.")}</div>`;
    return () => { stopped = true; timers.forEach(clearInterval); };
  }
  const bubble = (m) => `<div class="bub ${m.mine ? "me" : "them"} ${m.fail ? "fail" : ""}" data-mid="${m.id}">${esc(m.body)}<time>${m.fail ? `فشل الإرسال — <a href="#" data-retry="${m.id}" style="color:inherit;text-decoration:underline">إعادة المحاولة</a>` : timeAr(m.created_at)}</time></div>`;
  const add = (msgs) => {
    const box = $("#msgs"); const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    msgs.forEach((m) => { if (rendered.has(m.id)) return; rendered.add(m.id); lastId = Math.max(lastId, m.id); box.insertAdjacentHTML("beforeend", bubble(m)); });
    if (atBottom) box.scrollTop = box.scrollHeight;
  };
  const r = await api(`/api/conversations/${id}`);
  cv = r.conversation; me = r.me;
  const closed = cv.status !== "open";
  const myItem = cv.my_role === "lost_owner" ? cv.lost.id : cv.found.id;
  const ctx = `<div class="ctxbar">${icon("shield")}<span class="grow"><b>${esc(cv.found.title)}</b> · تم تأكيد المطابقة والملكية</span>${closed ? badge("مغلقة", "b-mute") : badge("نشطة", "b-ok")}</div>`;
  $("#thread").innerHTML = `<div class="thread-head"><a class="btn icon ghost" href="#/chats" aria-label="رجوع" style="display:none" id="back">${icon("arrow")}</a>
      <span class="avatar">${esc(cv.other_name[0])}</span><div class="grow"><b>${esc(cv.other_name)}</b><div class="muted xs">${esc(cv.found.title)}</div></div>
      <div class="menu"><button class="btn icon ghost" id="tm" aria-label="خيارات">${icon("menu")}</button><div class="menu-pop hide" id="tp">
        ${cv.match_status === "approved" ? `<button id="done">${icon("check")} تأكيد تسليم الغرض</button>` : ""}<button id="rep">${icon("flag")} الإبلاغ عن مشكلة</button><a href="#/support">${icon("help")} مشكلة تقنية في التطبيق</a><a href="#/item/${myItem}">${icon("package")} عرض بلاغي</a></div></div></div>
    ${ctx}<div class="msgs" id="msgs">${alertBox("info", "shield", "<span class='safe'>التقِ في مكان عام، ولا تشارك بيانات حساسة. يمكنك الإبلاغ عن أي سلوك غير مناسب.</span>")}</div>
    ${closed ? `<div class="composer"><div class="alert ok grow">${icon("check")}<div class="txt">تم تسليم الغرض وأُغلقت هذه المحادثة.</div></div></div>`
      : `<div class="qchips">${["أين نلتقي؟ أقترح مكاناً عاماً", "متى يناسبك الموعد؟", "شكراً لك، وصلني الغرض"].map((t) => `<button type="button" data-qc="${t}">${t}</button>`).join("")}</div><div class="composer"><textarea class="textarea" id="inp" rows="1" maxlength="1000" placeholder="اكتب رسالتك…" aria-label="الرسالة"></textarea><button class="btn grad icon" id="send" aria-label="إرسال">${icon("send")}</button></div>`}`;
  if (window.matchMedia("(max-width:860px)").matches) $("#back").style.display = "";
  add(r.messages); $("#msgs").scrollTop = $("#msgs").scrollHeight;
  const tm = $("#tm"), tp = $("#tp"); tm.addEventListener("click", (e) => { e.stopPropagation(); tp.classList.toggle("hide"); });
  document.addEventListener("click", () => tp && tp.classList.add("hide"), { once: false });
  const key = `lf_draft_${id}`;
  const inp = $("#inp");
  $$(".qchips [data-qc]").forEach((b) => b.addEventListener("click", () => { if (inp) { inp.value = b.dataset.qc; inp.dispatchEvent(new Event("input")); inp.focus(); } }));
  const pending = new Map();
  const doSend = async (body, tempId) => {
    try {
      const { message } = await api(`/api/conversations/${id}/messages`, { method: "POST", body: { body } });
      const el = $(`[data-mid="${tempId}"]`); if (el) el.remove();
      pending.delete(tempId); add([message]);
    } catch (err) {
      const el = $(`[data-mid="${tempId}"]`); if (el) el.outerHTML = bubble({ id: tempId, body, mine: true, fail: true });
      toast(err.message, "err");
    }
  };
  if (inp) {
    inp.value = localStorage.getItem(key) || "";
    const grow = () => { inp.style.height = "auto"; inp.style.height = Math.min(inp.scrollHeight, 120) + "px"; };
    inp.addEventListener("input", () => { localStorage.setItem(key, inp.value); grow(); }); grow();
    const send = () => {
      const body = inp.value.trim(); if (!body) return;
      inp.value = ""; localStorage.removeItem(key); grow();
      const tempId = "t" + Date.now(); pending.set(tempId, body);
      $("#msgs").insertAdjacentHTML("beforeend", bubble({ id: tempId, body, mine: true, created_at: new Date().toISOString() }));
      $("#msgs").scrollTop = $("#msgs").scrollHeight; doSend(body, tempId);
    };
    $("#send").addEventListener("click", send);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
    $("#msgs").addEventListener("click", (e) => {
      const a = e.target.closest("[data-retry]"); if (!a) return; e.preventDefault();
      const t = a.dataset.retry; const body = pending.get(t) || ($(`[data-mid="${t}"]`) || {}).firstChild?.textContent;
      const el = $(`[data-mid="${t}"]`); if (el) el.outerHTML = bubble({ id: t, body, mine: true, created_at: new Date().toISOString() });
      doSend(body, t);
    });
  }
  const done = $("#done");
  done && done.addEventListener("click", async () => {
    if (!(await confirmBox("تأكيد التسليم", "هل تم تسليم الغرض واستلامه فعلاً؟ سيُغلق البلاغان والمحادثة.", "نعم، تم التسليم"))) return;
    try { await api(`/api/items/${myItem}/status`, { method: "POST", body: { status: "returned" } }); toast("تم تأكيد التسليم 🎉"); chatView(root, id); } catch (e) { toast(e.message, "err"); }
  });
  $("#rep").addEventListener("click", async () => {
    await modal({
      title: "الإبلاغ عن مشكلة في التواصل",
      body: `<label class="lbl">نوع المشكلة</label><select class="select" id="rk"><option value="spam">رسائل مزعجة</option><option value="abuse">إساءة أو سلوك غير لائق</option><option value="scam">احتيال أو طلب مال</option><option value="other">أخرى</option></select>
        <label class="lbl">وصف المشكلة</label><textarea class="textarea" id="rd" maxlength="500" placeholder="اشرح ما حدث (10 أحرف على الأقل)"></textarea>`,
      actions: [{ label: "إلغاء", value: null }, { label: "إرسال البلاغ", cls: "danger", run: async (ov) => {
        const r = await api(`/api/conversations/${id}/report`, { method: "POST", body: { kind: $("#rk", ov).value, description: $("#rd", ov).value } });
        toast(r.message); return true;
      } }],
    });
  });
  timers.push(setInterval(async () => {
    if (stopped || document.hidden) return;
    try { const x = await api(`/api/conversations/${id}?after=${lastId}`); if (x.messages.length) add(x.messages.filter((m) => !m.mine || !pending.size)); } catch (_) {}
  }, 4000));
  return () => { stopped = true; timers.forEach(clearInterval); };
}
