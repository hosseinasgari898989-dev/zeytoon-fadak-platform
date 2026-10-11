/* لایه‌ی API فروشگاه؛ خطای شبکه نباید باعث سفید شدن صفحه شود. */
(function(){
  "use strict";
  function base(){return String(window.FADAK_API_BASE||"").trim().replace(/\/+$/,"");}
  function isConfigured(){return Boolean(base());}
  async function request(path,options){
    var root=base();if(!root)throw new Error("نشانی API هنوز تنظیم نشده است.");
    options=options||{};var headers=Object.assign({"Accept":"application/json"},options.headers||{});
    if(options.body&&!headers["Content-Type"])headers["Content-Type"]="application/json";
    var response=await fetch(root+path,Object.assign({},options,{headers:headers}));
    var data=await response.json().catch(function(){return {};});
    if(!response.ok)throw new Error((data&&data.detail)||("خطای سرور ("+response.status+")"));
    return data;
  }
  function idempotencyKey(){return window.crypto&&typeof window.crypto.randomUUID==="function"?window.crypto.randomUUID():"fadak-"+Date.now()+"-"+Math.random().toString(36).slice(2);}
  function createOrder(payload){return request("/api/orders",{method:"POST",headers:{"Idempotency-Key":idempotencyKey()},body:JSON.stringify(payload)});}
  function trackOrder(code,last4){return request("/api/orders/track",{method:"POST",body:JSON.stringify({code:code,phoneLast4:last4})});}
  function getCatalog(){return request("/api/catalog",{method:"GET"});}
  function sendLead(type,payload){return request("/api/"+type,{method:"POST",body:JSON.stringify(payload)});}
  window.FadakApi=Object.freeze({base:base,isConfigured:isConfigured,createOrder:createOrder,trackOrder:trackOrder,getCatalog:getCatalog,sendLead:sendLead});
})();