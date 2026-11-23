var pages=["signup","login","notifications","verify"];
var N=[
 {id:1,t:"match",i:"🎯",h:"مطابقة جديدة محتملة",p:"تم العثور على «محفظة جلدية سوداء» تشبه بلاغك المفقود في دمشق – المزة.",w:"قبل ٥ دقائق",u:1,go:"verify"},
 {id:2,t:"msg",i:"✉️",h:"رسالة من أحمد",p:"مرحباً، أعتقد أن المفاتيح التي نشرتها هي لسيارتي، هل يمكننا التواصل؟",w:"قبل ساعة",u:1},
 {id:3,t:"comment",i:"💬",h:"تعليق جديد على بلاغك",p:"رأيت شيئاً مشابهاً قرب موقف الباصات في الفرقان.",w:"قبل ٣ ساعات",u:1},
 {id:4,t:"match",i:"🎯",h:"مطابقة جديدة محتملة",p:"هاتف سامسونج موجود في اللاذقية قد يكون هاتفك.",w:"أمس",u:0,go:"verify"},
 {id:5,t:"msg",i:"✉️",h:"رسالة من فريق لقيتها",p:"تم قبول بلاغك ونشره بنجاح. شكراً لمساهمتك.",w:"قبل يومين",u:0}
];
var filter="all";
function $(i){return document.getElementById(i)}
function toast(m){var t=$("toast");t.textContent=m;t.hidden=false;clearTimeout(toast.x);toast.x=setTimeout(function(){t.hidden=true},2600)}

function route(){
  var h=(location.hash||"#signup").slice(1);if(pages.indexOf(h)<0)h="signup";
  document.querySelectorAll("[data-p]").forEach(function(s){s.hidden=s.dataset.p!==h});
  if(h==="verify"){$("vform").hidden=false;$("vok").hidden=true}
  window.scrollTo(0,0);
}

function render(){
  var c=N.filter(function(n){return n.u}).length;$("cnt").textContent=c||"";$("cnt").hidden=!c;
  var l=N.filter(function(n){return filter==="all"||n.t===filter});
  $("list").innerHTML=l.length?l.map(function(n){
    return '<div class="nt '+(n.u?'unread':'')+'"><div class="ic">'+n.i+'</div><div class="b"><h4>'+n.h+'</h4><div>'+n.p+'</div><div class="muted">'+n.w+'</div>'+
    (n.go?'<a class="btn" style="margin-top:8px;padding:6px 16px" href="#verify" data-r="'+n.id+'">أنا صاحب الغرض – تحقّق</a>':'')+'</div></div>'}).join(""):'<div class="card muted">لا توجد إشعارات.</div>';
}

$("tabs").onclick=function(e){var b=e.target.closest("button");if(!b)return;
  if(b.id==="readall"){N.forEach(function(n){n.u=0});render();return}
  filter=b.dataset.f;this.querySelectorAll("button").forEach(function(x){x.classList.toggle("on",x===b)});render()};
$("list").onclick=function(e){var a=e.target.closest("[data-r]");if(a){N.forEach(function(n){if(n.id==a.dataset.r)n.u=0});render()}};

// صفحة 1: إنشاء حساب
$("fs").onsubmit=function(e){e.preventDefault();
  var f=["s1","s2","s3","s5","s6"].some(function(i){return !$(i).value.trim()});
  if(f)return $("e1").textContent="يرجى تعبئة جميع الحقول المطلوبة.";
  if($("s6").value.length<6)return $("e1").textContent="كلمة المرور يجب ألا تقل عن ٦ أحرف.";
  if($("s6").value!==$("s7").value)return $("e1").textContent="كلمتا المرور غير متطابقتين.";
  $("e1").textContent="";toast("تم إنشاء حسابك بنجاح 🎉");location.hash="notifications"};

// صفحة 2: تسجيل الدخول
$("fl").onsubmit=function(e){e.preventDefault();
  if(!$("l1").value.trim()||!$("l2").value)return $("e2").textContent="أدخل بيانات الدخول كاملة.";
  $("e2").textContent="";toast("أهلاً بعودتك");location.hash="notifications"};

// صفحة 4: التحقق من الملكية
$("fv").onsubmit=function(e){e.preventDefault();
  if(!$("a1").value.trim()||!$("a2").value.trim()||!$("a3").value)return $("e3").textContent="يرجى الإجابة عن الأسئلة ١ و٢ و٣ على الأقل.";
  $("e3").textContent="";$("vform").hidden=true;$("vok").hidden=false;window.scrollTo(0,0)};

window.addEventListener("hashchange",route);
render();route();
