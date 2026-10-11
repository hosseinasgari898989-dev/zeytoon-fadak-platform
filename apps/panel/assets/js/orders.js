(function(){
  "use strict";
  var ACCOUNT_KEY="fadak-accounting-standalone-v3";
  var TOKEN_KEY=ACCOUNT_KEY+"-token";
  var baseInput=document.getElementById("apiBase");
  var tokenInput=document.getElementById("apiToken");
  var connectionStatus=document.getElementById("connectionStatus");
  var workspace=document.getElementById("workspace");
  var orders=[],activeOrder=null,toastTimer=null,apiBase="";
  var statusLabels={new:"ثبت سفارش",confirmed:"تأیید سفارش",awaiting_payment:"در انتظار پرداخت",paid:"پرداخت‌شده",preparing:"در حال آماده‌سازی",shipped:"ارسال‌شده",delivered:"تحویل‌شده",cancelled:"لغوشده"};
  function escapeHtml(value){return String(value==null?"":value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]});}
  function digits(value){return String(value||"").replace(/[۰-۹]/g,function(c){return "۰۱۲۳۴۵۶۷۸۹".indexOf(c);}).replace(/[٠-٩]/g,function(c){return "٠١٢٣٤٥٦٧٨٩".indexOf(c);});}
  function number(value){var n=Number(value);return Number.isFinite(n)?n:0;}
  function money(value){return Math.round(number(value)).toLocaleString("fa-IR")+" تومان";}
  function paymentLabel(value){var labels={unpaid:"پرداخت‌نشده",paid:"پرداخت‌شده",not_configured:"درگاه غیرفعال",pending_confirmation:"در انتظار تأیید"};return labels[value]||value||"نامشخص";}
  function dateLabel(value){if(!value)return "—";var date=new Date(value);if(Number.isNaN(date.getTime()))return "—";try{return new Intl.DateTimeFormat("fa-IR",{dateStyle:"medium",timeStyle:"short"}).format(date);}catch(e){return date.toLocaleString();}}
  function notice(text,kind){connectionStatus.textContent=text;connectionStatus.className="status-note"+(kind?" "+kind:"");}
  function popup(text){var node=document.getElementById("toast");node.textContent=text;node.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(function(){node.classList.remove("show");},3200);}
  function getStoredBase(){try{var state=JSON.parse(localStorage.getItem(ACCOUNT_KEY)||"null");return state&&state.settings&&state.settings.apiBase||window.location.origin;}catch(e){return window.location.origin;}}
  function setBusy(value){var button=document.getElementById("connectButton");button.disabled=!!value;button.textContent=value?"در حال اتصال…":"اتصال و دریافت سفارش‌ها";}
  async function api(path,options){
    if(!apiBase)throw new Error("ابتدا نشانی سرور را وارد کن.");
    options=options||{};
    var headers=Object.assign({"Accept":"application/json","Authorization":"Bearer "+String(tokenInput.value||"").trim()},options.headers||{});
    if(options.body)headers["Content-Type"]="application/json";
    var response=await fetch(apiBase+path,Object.assign({},options,{headers:headers}));
    var data=await response.json().catch(function(){return {};});
    if(!response.ok){var detail=data&&data.detail;if(typeof detail!=="string")detail=detail?JSON.stringify(detail):"HTTP "+response.status;throw new Error(detail);}
    return data;
  }
  async function connect(){
    apiBase=String(baseInput.value||"").trim().replace(/\/+$/,"");
    var token=String(tokenInput.value||"").trim();
    if(!/^https?:\/\//i.test(apiBase))throw new Error("نشانی باید با http:// یا https:// شروع شود.");
    if(!token)throw new Error("کلید مدیریتی را وارد کن.");
    sessionStorage.setItem(TOKEN_KEY,token);
    notice("در حال بررسی سرور و دریافت سفارش‌ها…","");
    setBusy(true);
    try{
      var health=await api("/health");
      if(!health||health.ok!==true)throw new Error("سرور آماده نیست.");
      await refreshOrders();
      notice("اتصال برقرار است · نسخه "+String(health.version||"نامشخص"),"success");
      workspace.hidden=false;
    }finally{setBusy(false);}
  }
  async function refreshOrders(){
    var data=await api("/api/admin/orders?limit=100");
    orders=Array.isArray(data.orders)?data.orders:[];
    workspace.hidden=false;
    renderMetrics();
    renderOrders();
  }
  function renderMetrics(){
    var open=orders.filter(function(o){return ["new","confirmed","awaiting_payment"].indexOf(o.status)>=0;}).length;
    var processing=orders.filter(function(o){return ["paid","preparing","shipped"].indexOf(o.status)>=0;}).length;
    var delivered=orders.filter(function(o){return o.status==="delivered";}).length;
    var total=orders.reduce(function(sum,o){return sum+number(o.total);},0);
    var data=[
      ["تمام سفارش‌ها",orders.length,"ثبت‌شده در سرور"],
      ["نیازمند پیگیری",open,"ثبت، تأیید یا پرداخت"],
      ["در جریان",processing,"پرداخت‌شده تا ارسال"],
      ["ارزش سفارش‌ها",money(total),"مجموع سفارش‌های فهرست"],
    ];
    document.getElementById("metrics").innerHTML=data.map(function(item){return '<div class="metric"><div class="label">'+escapeHtml(item[0])+'</div><strong>'+escapeHtml(item[1])+'</strong><small>'+escapeHtml(item[2])+'</small></div>';}).join("");
    document.getElementById("resultSummary").textContent=delivered.toLocaleString("fa-IR")+" سفارش تحویل شده · "+orders.length.toLocaleString("fa-IR")+" سفارش در فهرست";
  }
  function renderOrders(){
    var q=digits(document.getElementById("searchInput").value).trim().toLowerCase();
    var status=document.getElementById("statusFilter").value;
    var items=orders.filter(function(o){
      var customer=o.customer||{};
      var text=[o.code,customer.name,customer.phone,customer.city].join(" ").toLowerCase();
      return (status==="all"||o.status===status)&&(!q||digits(text).toLowerCase().indexOf(q)>=0);
    });
    var list=document.getElementById("ordersList");
    if(!items.length){
      list.innerHTML='<div class="empty-state"><strong>'+(orders.length?"سفارشی با این فیلتر پیدا نشد":"هنوز سفارشی ثبت نشده است")+'</strong><span>'+(orders.length?"عبارت جست‌وجو یا وضعیت را تغییر بده.":"پس از ثبت سفارش مشتری، این بخش به‌روزرسانی می‌شود.")+'</span></div>';
      return;
    }
    list.innerHTML=items.map(function(o){
      var c=o.customer||{},statusClass=/^[a-z_]+$/.test(o.status||"")?o.status:"new";
      var itemCount=(o.items||[]).reduce(function(n,i){return n+number(i.q);},0);
      return '<article class="order-card">'+
        '<div class="card-top"><div><div class="order-code">'+escapeHtml(o.code)+'</div><div class="order-date">'+escapeHtml(dateLabel(o.createdAt))+'</div></div><span class="pill '+statusClass+'">'+escapeHtml(o.statusLabel||statusLabels[o.status]||o.status||"نامشخص")+'</span></div>'+
        '<div class="buyer-row"><div class="buyer-avatar">'+escapeHtml((c.name||"م").slice(0,1))+'</div><div><strong>'+escapeHtml(c.name||"مشتری")+'</strong><small>'+escapeHtml(c.phone||"شماره ثبت نشده")+'</small></div></div>'+
        '<div class="card-info"><div class="info-bit"><small>شهر</small><b>'+escapeHtml(c.city||"—")+'</b></div><div class="info-bit"><small>تعداد کالا</small><b>'+itemCount.toLocaleString("fa-IR")+' عدد</b></div></div>'+
        '<div class="card-bottom"><div class="card-total"><small>مبلغ سفارش</small><strong>'+escapeHtml(money(o.total))+'</strong></div><button class="btn subtle" type="button" data-open="'+escapeHtml(o.code)+'">جزئیات و تغییر وضعیت ←</button></div>'+
      '</article>';
    }).join("");
  }
  function openDetails(code){
    activeOrder=orders.find(function(o){return o.code===code;});
    if(!activeOrder)return;
    var o=activeOrder,c=o.customer||{};
    document.getElementById("detailTitle").textContent=o.code;
    document.getElementById("detailStatus").value=o.status||"new";
    document.getElementById("detailNote").value="";
    document.getElementById("detailStatusMessage").textContent="";
    var rows=(o.items||[]).map(function(item){return "<tr><td>"+escapeHtml(item.n)+"</td><td>"+escapeHtml(item.l)+"</td><td>"+escapeHtml(item.q)+"</td><td>"+escapeHtml(money(number(item.p)*number(item.q)))+"</td></tr>";}).join("");
    var warning=o.paymentStatus==="not_configured"?'<div class="payment-warning">درگاه پرداخت آنلاین هنوز تنظیم نشده است. سفارش را پرداخت‌شده علامت نزن مگر پرداخت را از راه مطمئن دیگری بررسی کرده باشی.</div>':"";
    document.getElementById("detailContent").innerHTML=
      '<div class="detail-columns">'+
       '<section class="detail-box"><h4>اطلاعات مشتری</h4><p><b>'+escapeHtml(c.name||"—")+'</b></p><p>موبایل: <b dir="ltr">'+escapeHtml(c.phone||"—")+'</b></p><p>شهر: '+escapeHtml(c.city||"—")+'</p><p>کد پستی: '+escapeHtml(c.postalCode||"—")+'</p><p>نشانی: '+escapeHtml(c.address||"—")+'</p></section>'+
       '<section class="detail-box"><h4>ارسال و پرداخت</h4><p>ارسال: '+escapeHtml(o.delivery||"—")+'</p><p>روش پرداخت: '+escapeHtml(o.payment||"—")+'</p><p>وضعیت پرداخت: <b>'+escapeHtml(paymentLabel(o.paymentStatus))+'</b></p><p>ثبت: '+escapeHtml(dateLabel(o.createdAt))+'</p></section>'+
      '</div>'+
      '<section class="detail-box" style="margin-top:12px"><h4>اقلام سفارش</h4><table class="detail-items"><thead><tr><th>کالا</th><th>اندازه</th><th>تعداد</th><th>مبلغ</th></tr></thead><tbody>'+rows+'</tbody></table><p><b>جمع کل: '+escapeHtml(money(o.total))+'</b></p></section>'+
      (o.notes?'<section class="detail-box" style="margin-top:12px"><h4>یادداشت مشتری</h4><p>'+escapeHtml(o.notes)+'</p></section>':"")+
      warning;
    var dialog=document.getElementById("detailDialog");
    if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","open");
  }
  async function saveStatus(event){
    event.preventDefault();
    if(!activeOrder)return;
    var button=document.getElementById("saveStatusButton");
    var status=document.getElementById("detailStatus").value;
    var note=document.getElementById("detailNote").value.trim();
    button.disabled=true;button.textContent="در حال ذخیره…";
    try{
      await api("/api/admin/orders/"+encodeURIComponent(activeOrder.code)+"/status",{method:"PATCH",body:JSON.stringify({status:status,note:note})});
      var changedCode=activeOrder.code;
      await refreshOrders();
      activeOrder=orders.find(function(o){return o.code===changedCode;})||activeOrder;
      document.getElementById("detailStatus").value=activeOrder.status;
      document.getElementById("detailStatusMessage").textContent="وضعیت سفارش در سرور ذخیره شد.";
      document.getElementById("detailStatusMessage").className="status-note success";
      popup("وضعیت سفارش به‌روزرسانی شد.");
    }catch(error){
      var msg=document.getElementById("detailStatusMessage");msg.textContent="ذخیره انجام نشد: "+error.message;msg.className="status-note error";
    }finally{button.disabled=false;button.textContent="ذخیره وضعیت";}
  }
  document.getElementById("connectForm").addEventListener("submit",function(event){event.preventDefault();connect().catch(function(error){workspace.hidden=true;notice("اتصال انجام نشد: "+error.message,"error");});});
  document.getElementById("refreshButton").addEventListener("click",function(){refreshOrders().then(function(){notice("فهرست با موفقیت تازه شد.","success");}).catch(function(error){notice("دریافت سفارش‌ها انجام نشد: "+error.message,"error");});});
  document.getElementById("searchInput").addEventListener("input",renderOrders);
  document.getElementById("statusFilter").addEventListener("change",renderOrders);
  document.getElementById("ordersList").addEventListener("click",function(event){var button=event.target.closest("[data-open]");if(button)openDetails(button.getAttribute("data-open"));});
  document.getElementById("detailForm").addEventListener("submit",saveStatus);
  document.getElementById("closeDialog").addEventListener("click",function(){document.getElementById("detailDialog").close();});
  document.getElementById("detailDialog").addEventListener("click",function(event){if(event.target===this)this.close();});
  baseInput.value=getStoredBase();
  tokenInput.value=sessionStorage.getItem(TOKEN_KEY)||"";
  if(tokenInput.value&&baseInput.value){
    connect().catch(function(error){notice("اتصال خودکار انجام نشد: "+error.message,"error");});
  }
})();