
/* ===== Fadak olive shop: data + behavior ===== */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fa=n=>Number(n).toLocaleString('fa-IR');
const money=n=>fa(n)+' تومان';
const toEn=s=>String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---- Editable settings (replace the placeholders with real info) ---- */
const CONFIG={
  fadakUrl:'https://basalam.com/fadak',
  phoneText:'[شماره‌ی تماس]', phoneTel:'',
  address:'قم، [نشانی فروشگاه یا مزرعه]',
  hours:'[ساعت پاسخ‌گویی]'
};

/* ---- Icons ---- */
const P={
leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
truck:'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
menu:'<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
check:'<path d="M20 6 9 17l-5-5"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
minus:'<path d="M5 12h14"/>',
ext:'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
award:'<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
route:'<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
drop:'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
store:'<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/><path d="M3 9h18"/>',
bag:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
help:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
card:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
sprout:'<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
factory:'<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>',
file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>',
send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'
};
const ic=(n,s=20)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||''}</svg>`;
const LOGO='<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M4 23C9 18 14 12 24 6" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M10 18C7 14 7 10 10 7C13 10 13 14 10 18Z" fill="#fff"/><path d="M17 12C14 9 15 5 18 3C21 6 20 9 17 12Z" fill="#FFE27A"/><ellipse cx="20" cy="21" rx="5" ry="3.6" transform="rotate(-30 20 21)" fill="#FFE27A"/></svg>';

/* ---- Data (sample prices: edit here) ---- */
const CATS=[
 {id:'olive',n:'زیتون',d:'شیشه‌ای؛ سبز، سیاه، پرورده و بی‌هسته',art:['jar','g','سبز']},
 {id:'oil',n:'روغن زیتون',d:'فرابکر در بطری شیشه‌ای و حلب',art:['bottle','','۵۰۰ میلی‌لیتر']},
 {id:'vacuum',n:'زیتون وکیوم',d:'نرم، سبک و آماده‌ی مصرف',art:['pouch','g','سبز']},
 {id:'canned',n:'زیتون کنسرو شده',d:'برای پیتزا، ساندویچ و آشپزی',art:['tin','g','سبز']}
];
const CAT_SPEC={
 olive:[['بسته‌بندی','شیشه‌ی دربسته با آب‌نمک'],['نگهداری','جای خنک و دور از نور؛ پس از باز کردن در یخچال'],['مناسب برای','صبحانه، سالاد و پیش‌غذا']],
 oil:[['بسته‌بندی','بطری شیشه‌ای یا قوطی فلزی'],['نگهداری','جای خنک و تاریک، دور از گرما'],['مناسب برای','سالاد، پخت‌وپز و مصرف روزانه']],
 vacuum:[['بسته‌بندی','کیسه‌ی وکیوم'],['نگهداری','جای خنک؛ پس از باز کردن در ظرف دربسته داخل یخچال'],['مناسب برای','مصرف روزانه و ارسال سبک']],
 canned:[['بسته‌بندی','قوطی فلزی'],['نگهداری','جای خنک و خشک؛ پس از باز کردن در ظرف دربسته در یخچال'],['مناسب برای','پیتزا، ساندویچ و آشپزی']]
};
const PRODUCTS=[
 {id:'o1',c:'olive',n:'زیتون سبز درشت شیشه‌ای',tag:'پرفروش',d:'زیتون سبز درشت با هسته در آب‌نمک؛ مناسب میز صبحانه و سالاد.',long:'زیتون سبز درشت و گوشتی با هسته که در شیشه‌ی دربسته و آب‌نمک عرضه می‌شود؛ طعم متعادل و بافت سفت.',art:['jar','g','سبز',{seed:3}],v:[{l:'۷۰۰ گرم',p:220000},{l:'۱٫۴ کیلو',p:410000}]},
 {id:'o2',c:'olive',n:'زیتون سیاه ممتاز شیشه‌ای',d:'زیتون سیاه با طعم ملایم و بافت نرم‌تر برای سالاد و پیتزا.',long:'زیتون سیاه ممتاز با طعم ملایم و کمی شیرین‌تر از سبز؛ مناسب سالاد، پیتزا و پیش‌غذا.',art:['jar','b','سیاه',{seed:8}],v:[{l:'۷۰۰ گرم',p:235000},{l:'۱٫۴ کیلو',p:440000}]},
 {id:'o3',c:'olive',n:'زیتون پرورده‌ی سنتی',tag:'جدید',tagc:'g',d:'زیتون پرورده با چاشنی‌های سنتی؛ همراه نان و پنیر عالی است.',long:'زیتون پرورده به سبک سنتی با چاشنی‌های ترش و شیرین؛ پیشنهاد ما کنار نان گرم و پنیر.',art:['jar','mix','پرورده',{seed:6,pepper:true}],v:[{l:'۵۰۰ گرم',p:260000},{l:'۱ کیلو',p:480000}]},
 {id:'o4',c:'olive',n:'زیتون بی‌هسته‌ی ویژه',d:'بدون هسته و آماده‌ی استفاده در ساندویچ، سالاد و غذا.',long:'زیتون بی‌هسته که تمیز و راحت مصرف می‌شود؛ مناسب کسانی که نمی‌خواهند هسته جدا کنند.',art:['jar','g','بی‌هسته',{seed:12,ring:true}],v:[{l:'۵۰۰ گرم',p:250000},{l:'۱ کیلو',p:470000}]},
 {id:'l1',c:'oil',n:'روغن زیتون فرابکر (قوطی فلزی)',tag:'پرفروش',d:'روغن زیتون فرابکر برای سالاد، پخت و مصرف روزانه.',long:'روغن زیتون فرابکر در قوطی فلزی که از نور محافظت می‌کند؛ مناسب سالاد، پخت‌وپز و مصرف روزانه.',art:['oiltin','','۳ لیتر'],v:[{l:'۱ لیتر',p:790000},{l:'۳ لیتر (حلب)',p:2250000}]},
 {id:'l2',c:'oil',n:'روغن زیتون فرابکر شیشه‌ای',tag:'هدیه',d:'بطری شیشه‌ای زیبا؛ هم برای مصرف، هم برای هدیه.',long:'روغن زیتون فرابکر در بطری شیشه‌ای تیره؛ ظاهری شیک برای میز غذا و هدیه.',art:['bottle','','۵۰۰ میلی‌لیتر'],v:[{l:'۲۵۰ میلی‌لیتر',p:260000},{l:'۵۰۰ میلی‌لیتر',p:440000}]},
 {id:'l3',c:'oil',n:'روغن زیتون فرابکر حلب بزرگ (اقتصادی)',d:'برای خانواده‌های پرمصرف و کسب‌وکارهای کوچک.',long:'حلب بزرگ روغن زیتون فرابکر؛ انتخاب اقتصادی برای مصرف زیاد در خانه یا آشپزخانه‌ی کسب‌وکار.',art:['oiltin','','۶ لیتر'],v:[{l:'۴ لیتر',p:2950000},{l:'۶ لیتر',p:4300000}]},
 {id:'v1',c:'vacuum',n:'زیتون سبز وکیوم',tag:'پرفروش',d:'زیتون سبز در کیسه‌ی وکیوم؛ سبک، نرم و آماده‌ی مصرف.',long:'زیتون سبز در بسته‌ی وکیوم؛ بافت نرم‌تر از شیشه‌ای و مناسب مصرف روزانه و ارسال سبک.',art:['pouch','g','سبز',{seed:11}],v:[{l:'۵۰۰ گرم',p:190000},{l:'۱ کیلو',p:360000}]},
 {id:'v2',c:'vacuum',n:'زیتون سیاه وکیوم',d:'زیتون سیاه نرم و خوش‌طعم در بسته‌ی وکیوم.',long:'زیتون سیاه در بسته‌ی وکیوم با بافت نرم و طعم ملایم.',art:['pouch','b','سیاه',{seed:5}],v:[{l:'۵۰۰ گرم',p:205000},{l:'۱ کیلو',p:390000}]},
 {id:'v3',c:'vacuum',n:'زیتون وکیوم بی‌هسته',d:'بدون هسته؛ آماده برای سالاد و ساندویچ.',long:'زیتون بی‌هسته در بسته‌ی وکیوم؛ تمیز، سبک و آماده‌ی استفاده.',art:['pouch','g','بی‌هسته',{seed:14,ring:true}],v:[{l:'۵۰۰ گرم',p:215000}]},
 {id:'v4',c:'vacuum',n:'زیتون وکیوم ادویه‌دار',tag:'جدید',tagc:'g',d:'با فلفل و سیر؛ مخصوص مهمانی و پیش‌غذا.',long:'زیتون وکیوم با ادویه‌ی فلفل و سیر؛ طعمی پرجان برای میز مهمانی.',art:['pouch','mix','ادویه‌دار',{seed:2,pepper:true}],v:[{l:'۵۰۰ گرم',p:215000}]},
 {id:'c1',c:'canned',n:'کنسرو زیتون سبز با هسته',d:'قوطی آماده؛ ماندگار و راحت برای آشپزخانه.',long:'کنسرو زیتون سبز با هسته در قوطی فلزی؛ راحت و آماده‌ی استفاده.',art:['tin','g','سبز'],v:[{l:'قوطی ۳۸۰ گرمی',p:120000},{l:'کارتن ۱۲ عددی',p:1350000}]},
 {id:'c2',c:'canned',n:'کنسرو زیتون بی‌هسته',d:'بدون هسته برای ساندویچ، پیتزا و سالاد.',long:'کنسرو زیتون بی‌هسته؛ یکنواخت و راحت برای استفاده در انواع غذا.',art:['tin','g','بی‌هسته',{ring:true}],v:[{l:'قوطی ۳۸۰ گرمی',p:130000},{l:'کارتن ۱۲ عددی',p:1450000}]},
 {id:'c3',c:'canned',n:'کنسرو زیتون حلقه‌ای',d:'برش حلقه‌ای برای پیتزا، ساندویچ و سالاد.',long:'کنسرو زیتون حلقه‌ای؛ برش آماده برای پیتزا، ساندویچ و سالاد.',art:['tin','b','حلقه‌ای',{ring:true}],v:[{l:'قوطی ۳۸۰ گرمی',p:125000},{l:'کارتن ۱۲ عددی',p:1400000}]},
 {id:'c4',c:'canned',n:'کنسرو زیتون سیاه',d:'زیتون سیاه آماده در قوطی؛ مناسب پیتزا و سالاد.',long:'کنسرو زیتون سیاه در قوطی فلزی؛ آماده برای پیتزا، سالاد و آشپزی.',art:['tin','b','سیاه'],v:[{l:'قوطی ۳۸۰ گرمی',p:125000},{l:'کارتن ۱۲ عددی',p:1400000}]}
];
const byId=id=>PRODUCTS.find(p=>p.id===id);
const BUNDLES=[
 {id:'intro',n:'پک آشنایی',d:'چهار طعم مختلف برای شروع.',items:[['o1',0,1],['v1',0,1],['c1',0,1],['l2',0,1]],scene:'intro'},
 {id:'family',n:'پک خانواده',d:'مصرف یک ماه یک خانواده‌ی متوسط.',items:[['l1',1,1],['o1',0,2],['v1',1,1],['c1',0,2]],scene:'family'},
 {id:'gift',n:'پک هدیه',d:'بسته‌بندی شیک برای مناسبت‌ها.',items:[['l2',1,1],['o3',0,1],['o4',0,1]],scene:'gift'}
];
const PLANS=[
 {n:'اشتراک خانگی',d:'هر ماه یک سبد زیتون و روغن برای خانه.',f:['انتخاب سبد دلخواه','ارسال ماهانه','امکان تغییر یا توقف هر ماه'],hot:true},
 {n:'کافه و رستوران',d:'تأمین منظم برای آشپزخانه‌ی کسب‌وکار.',f:['قیمت ویژه‌ی عمده','ارسال هفتگی یا ماهانه','فاکتور و هماهنگی تحویل']},
 {n:'هدیه‌ی فصلی',d:'هر فصل یک پک هدیه برای عزیزان.',f:['پک هدیه با بسته‌بندی شیک','کارت پیام شخصی','ارسال مستقیم به نشانی گیرنده']}
];
const TRUST=[['leaf','مستقیم از مزرعه','بدون واسطه از باغ‌های فدک'],['shield','پرداخت امن','درگاه معتبر و تأیید سفارش'],['truck','ارسال سراسری','با بسته‌بندی محکم'],['phone','پشتیبانی واقعی','قبل و بعد از خرید']];
const FEATS=[
 ['leaf','مستقیم از مزرعه','بدون واسطه از باغ‌های فدک در قم به شما می‌رسد.'],
 ['award','ارقام متنوع','کنسروالیا، آمیگدال، مانزانیا و بیشتر؛ برای هر سلیقه یک زیتون.'],
 ['box','بسته‌بندی محکم','شیشه، وکیوم و قوطی همراه کارتن مقاوم برای رسیدن سالم.'],
 ['eye','اطلاعات شفاف','نوع بسته، وزن و روش نگهداری هر محصول روشن نوشته شده است.'],
 ['heart','پشتیبانی پاسخ‌گو','قبل و بعد از خرید می‌توانید سؤال بپرسید و پیگیری کنید.'],
 ['card','پرداخت و مرجوعی روشن','شرایط پرداخت و رسیدگی به مشکل از قبل اعلام می‌شود.']
];
const STEPS=[['sprout','باغ و رشد','درخت‌ها در باغ فدک رشد می‌کنند.'],['leaf','برداشت','میوه در فصل خودش چیده می‌شود.'],['factory','فرآوری','آماده‌سازی و فرآوری مخصوص هر محصول.'],['eye','کنترل کیفیت','بررسی دسته و ثبت مشخصات.'],['box','بسته‌بندی','شیشه، وکیوم و قوطی با کارتن مقاوم.'],['truck','ارسال','تحویل به پست یا پیک و پیگیری.']];
const CMP=[
 ['بسته‌بندی','شیشه‌ی دربسته با آب‌نمک','کیسه‌ی وکیوم نرم','قوطی فلزی'],
 ['بافت','معمولاً سفت‌تر','نرم‌تر','یکنواخت و آماده'],
 ['مناسب برای','میز صبحانه و پیش‌غذا','مصرف روزانه و ارسال سبک','پیتزا، ساندویچ و آشپزی'],
 ['حمل و ارسال','سنگین‌تر به‌خاطر شیشه','سبک و کم‌حجم','مقاوم و مناسب انبار'],
 ['پس از باز کردن','در یخچال، داخل آب‌نمک','در یخچال، داخل ظرف دربسته','در یخچال، داخل ظرف دربسته']
];
const USES=[
 {id:'bf',n:'صبحانه',ids:['o1','v1','o4'],idea:'زیتون کنار نان، پنیر و چای؛ شیشه‌ای یا وکیوم برای مصرف روزانه راحت است.'},
 {id:'sal',n:'سالاد',ids:['l1','o2','v2'],idea:'روغن فرابکر با زیتون سیاه برای سالاد یونانی یا سالاد فصل.'},
 {id:'cook',n:'پخت‌وپز',ids:['l3','l1'],idea:'روغن را برای پخت‌وپز و سرخ‌کردن ملایم استفاده کنید؛ حجم بزرگ‌تر اقتصادی‌تر است.'},
 {id:'pizza',n:'پیتزا و ساندویچ',ids:['c3','c4','c1'],idea:'کنسرو حلقه‌ای و سیاه برای پیتزا و ساندویچ سریع‌ترین انتخاب است.'},
 {id:'party',n:'مهمانی',ids:['o3','v4','o4'],idea:'زیتون پرورده یا ادویه‌دار را در ظرف بریزید و کنار نان و پنیر بگذارید.'},
 {id:'gift',n:'هدیه',ids:['l2','o3'],idea:'بطری شیشه‌ای روغن با زیتون پرورده؛ یا پک هدیه‌ی آماده را از بخش پک‌ها بردارید.'}
];
const TIPS=[
 ['بعد از باز کردن زیتون چه کنم؟','زیتون را داخل آب‌نمک خودش و در ظرف دربسته در یخچال نگه دارید و با قاشق تمیز بردارید. اگر آب‌نمک کم شد، کمی آب‌نمک ملایم اضافه کنید.'],
 ['روغن زیتون را کجا نگه دارم؟','در جای خنک و تاریک و دور از گرمای اجاق و آفتاب نگه دارید و درِ آن را پس از هر استفاده ببندید.'],
 ['روغن زیتون برای چه غذاهایی مناسب است؟','برای سالاد، پخت ملایم و سرخ‌کردن سبک مناسب است. برای عطر و طعم بیشتر، چند قطره از آن را آخر کار روی غذا بریزید.'],
 ['با زیتون پرورده چه بخورم؟','با نان گرم، پنیر و گردو یا کنار غذای اصلی. قبل از مصرف کمی بیرون یخچال بماند تا طعمش بازتر شود.'],
 ['وقتی بسته رسید چه کنم؟','سالم بودن درِ بسته‌ها را بررسی کنید. اگر مشکلی دیدید همان لحظه عکس بگیرید و با ما در میان بگذارید.']
];
const FAQ=[
 ['چطور سفارش بدهم؟','از «سفارش سریع» یا «محصولات»، اندازه و تعداد را انتخاب کنید و ثبت سفارش بزنید. نام، تلفن و نشانی را بنویسید تا کد سفارش و متن آماده‌ی ارسال برای مزرعه را بگیرید.'],
 ['سفارش چه زمانی می‌رسد؟','بسته به شهر و روش ارسال فرق می‌کند. زمان تقریبی هنگام تأیید سفارش اعلام می‌شود.'],
 ['هزینه‌ی ارسال چقدر است؟','بر اساس شهر و وزن بسته محاسبه می‌شود و قبل از نهایی شدن سفارش به شما اعلام می‌شود.'],
 ['تفاوت زیتون شیشه‌ای، وکیوم و کنسروی چیست؟','جدول «راهنمای انتخاب» را ببینید: شیشه‌ای معمولاً سفت‌تر است، وکیوم نرم‌تر و سبک‌تر، و کنسرو برای مصرف آماده در پیتزا و ساندویچ راحت است.'],
 ['چطور پرداخت کنم؟','پس از تأیید سفارش، روش پرداخت (درگاه آنلاین یا طبق توافق با پشتیبانی) اعلام می‌شود.'],
 ['اگر بسته آسیب‌دیده رسید؟','همان روز از بسته عکس بگیرید و با ما تماس بگیرید تا پیگیری کنیم.'],
 ['خرید عمده هم دارید؟','بله؛ فرم «فروش عمده» را پر کنید تا قیمت ویژه و زمان‌بندی تأمین برایتان اعلام شود.'],
 ['می‌شود از مزرعه بازدید کرد؟','با هماهنگی قبلی. از بخش «تماس با ما» پیام بدهید.']
];
const CERTS=[['file','پروانه‌ی بهره‌برداری'],['shield','مجوز بهداشت'],['award','گواهی کیفیت یا ارگانیک (در صورت وجود)'],['check','نماد اعتماد الکترونیکی']];
const SHIPS=[['truck','ارسال با پست','به سراسر ایران با کارتن مقاوم؛ هزینه بر اساس شهر و وزن اعلام می‌شود.'],['pin','تحویل در قم','ارسال با پیک شهری یا دریافت حضوری با هماهنگی.'],['card','پرداخت','درگاه آنلاین یا طبق توافق با پشتیبانی؛ پس از تأیید سفارش.'],['shield','مرجوعی و پیگیری','در صورت آسیب یا مغایرت سفارش، پشتیبانی پیگیری می‌کند.']];

/* ---- State ---- */
const state={cat:'all',q:'',sort:'pop',qcat:'all',sel:{},use:'bf'};
let cart=[],orders=[];
try{cart=JSON.parse(localStorage.getItem('fadak_cart')||'[]')}catch(e){cart=[]}
try{orders=JSON.parse(localStorage.getItem('fadak_orders')||'[]')}catch(e){orders=[]}
cart=cart.filter(i=>byId(i.pid)&&byId(i.pid).v[i.vi]);
const saveCart=()=>{try{localStorage.setItem('fadak_cart',JSON.stringify(cart))}catch(e){}};
const saveOrders=()=>{try{localStorage.setItem('fadak_orders',JSON.stringify(orders.slice(0,20)))}catch(e){}};
const getSel=p=>state.sel[p.id]||0;
const qtyOf=(pid,vi)=>{const l=cart.find(i=>i.pid===pid&&i.vi===vi);return l?l.qty:0};
const cartCount=()=>cart.reduce((s,i)=>s+i.qty,0);
const cartTotal=()=>cart.reduce((s,i)=>s+byId(i.pid).v[i.vi].p*i.qty,0);

/* ---- Toast ---- */
let tt;
function toast(msg){const t=$('#toast');t.innerHTML=ic('check',18)+esc(msg);t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2200)}

/* ---- Cart ops ---- */
function addToCart(pid,vi,qty=1,silent){
  const l=cart.find(i=>i.pid===pid&&i.vi===vi);
  if(l)l.qty+=qty;else cart.push({pid,vi,qty});
  syncCart();
  if(!silent)toast('به سبد اضافه شد: '+byId(pid).n);
}
function setQty(pid,vi,q){
  const i=cart.findIndex(l=>l.pid===pid&&l.vi===vi);
  if(i<0){if(q>0)addToCart(pid,vi,q,true);return}
  if(q<=0)cart.splice(i,1);else cart[i].qty=Math.min(q,99);
  syncCart();
}
function syncCart(){
  saveCart();
  const n=cartCount(),t=cartTotal();
  $('#cartCount').textContent=fa(n);$('#bbCount').textContent=fa(n);
  $('#bbCount').style.display=n?'grid':'none';
  $('#qCount').textContent=fa(n);$('#qTotal').textContent=money(t);
  $('#drTotal').textContent=money(t);
  $$('#qList .q-row').forEach(updateRow);
  renderDrawer();
}
function renderDrawer(){
  const b=$('#drBody');
  if(!cart.length){b.innerHTML=`<div class="dr-empty">${ic('cart',44)}<p style="margin-top:10px">سبد خرید خالی است.</p><a class="btn btn-primary" style="margin-top:16px" href="#shop" data-act="closeDrawer">دیدن محصولات</a></div>`;return}
  b.innerHTML=cart.map(l=>{const p=byId(l.pid),v=p.v[l.vi];return `<div class="ci-row"><div class="q-thumb">${artFor(p.art)}</div><div><b>${p.n}</b><small>${v.l} · ${money(v.p)}</small><div class="stepper" style="margin-top:6px"><button data-act="dec" data-pid="${l.pid}" data-vi="${l.vi}" aria-label="کم کردن">${ic('minus',16)}</button><output>${fa(l.qty)}</output><button data-act="inc" data-pid="${l.pid}" data-vi="${l.vi}" aria-label="زیاد کردن">${ic('plus',16)}</button></div></div><button class="rm" data-act="rm" data-pid="${l.pid}" data-vi="${l.vi}" aria-label="حذف ${p.n}">${ic('trash',20)}</button></div>`}).join('');
}
function openDrawer(){const d=$('#drawer');d.inert=false;d.classList.add('on');d.setAttribute('aria-hidden','false');$('#scrim').classList.add('on');$('#drClose').focus()}
function closeDrawer(){const d=$('#drawer');d.classList.remove('on');d.setAttribute('aria-hidden','true');d.inert=true;$('#scrim').classList.remove('on')}

/* ---- Renderers ---- */
function renderStatic(){
  $('#defs').innerHTML=DEFS;
  $$('[data-ic]').forEach(e=>{e.innerHTML=ic(e.dataset.ic,+e.dataset.s||20)});
  ['#logoMark','#logoMark2','#cornerMark'].forEach(s=>{$(s).innerHTML=LOGO});
  $$('[data-fadak]').forEach(a=>a.href=CONFIG.fadakUrl);
  $('#heroArt').innerHTML=heroSVG();
  $('#farmArt').innerHTML=farmSVG();
  $('#mapArt').innerHTML=mapSVG();
  $('#trustList').innerHTML=TRUST.map(t=>`<li><span class="ti">${ic(t[0],26)}</span><div><b>${t[1]}</b><span>${t[2]}</span></div></li>`).join('');
  $('#featGrid').innerHTML=FEATS.map(f=>`<article class="feat reveal"><span class="fi">${ic(f[0],26)}</span><h3>${f[1]}</h3><p>${f[2]}</p></article>`).join('');
  $('#stepGrid').innerHTML=STEPS.map((s,i)=>`<article class="step reveal"><div class="sn">${fa(i+1)}</div><div class="si">${ic(s[0],26)}</div><h3>${s[1]}</h3><p>${s[2]}</p></article>`).join('');
  $('#cmpBody').innerHTML=CMP.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('');
  $('#tipList').innerHTML=TIPS.map(t=>`<details><summary>${t[0]}</summary><p>${t[1]}</p></details>`).join('');
  $('#faqList').innerHTML=FAQ.map(t=>`<details><summary>${t[0]}</summary><p>${t[1]}</p></details>`).join('');
  $('#certGrid').innerHTML=CERTS.map(c=>`<div class="cert reveal"><span class="ci">${ic(c[0],26)}</span><b>${c[1]}</b><span>جایگاه تصویر گواهی</span></div>`).join('');
  $('#shipGrid').innerHTML=SHIPS.map(c=>`<article class="feat reveal"><span class="fi">${ic(c[0],26)}</span><h3>${c[1]}</h3><p>${c[2]}</p></article>`).join('');
  $('#cPhone').textContent=CONFIG.phoneText;$('#cAddr').textContent=CONFIG.address;$('#cHours').textContent=CONFIG.hours;
  const tel=CONFIG.phoneTel?'tel:'+CONFIG.phoneTel:'#contact';
  $('#bbCall').href=tel;
  $('#planGrid').innerHTML=PLANS.map((p,i)=>`<article class="plan reveal ${p.hot?'hot':''}"><h3>${p.n}</h3><p style="color:var(--muted)">${p.d}</p><ul style="display:grid;gap:8px">${p.f.map(x=>`<li>${ic('check',18)}<span>${x}</span></li>`).join('')}</ul><button class="btn ${p.hot?'btn-primary':'btn-ghost'}" data-act="plan" data-i="${i}">ثبت درخواست اشتراک</button></article>`).join('');
  $('#bundleGrid').innerHTML=BUNDLES.map(b=>{
    const sum=b.items.reduce((s,[pid,vi,q])=>s+byId(pid).v[vi].p*q,0);
    return `<article class="bundle reveal"><div class="stage">${bundleSVG(b.scene)}</div><div class="bd"><h3>${b.n}</h3><p style="color:var(--muted);font-size:14.5px">${b.d}</p><ul>${b.items.map(([pid,vi,q])=>`<li>${ic('check',16)}<span>${q>1?fa(q)+' × ':''}${byId(pid).n} (${byId(pid).v[vi].l})</span></li>`).join('')}</ul><div class="bf"><div class="price">${money(sum)}</div><button class="btn btn-primary btn-sm" data-act="bundle" data-id="${b.id}">${ic('plus',18)}افزودن پک</button></div></div></article>`;
  }).join('');
}
function renderCats(){
  $('#catGrid').innerHTML=CATS.map(c=>`<button class="cat" data-act="cat" data-id="${c.id}"><div class="stage">${artFor(c.art)}</div><h3>${c.n}</h3><p>${c.d}</p><span class="go">${fa(PRODUCTS.filter(p=>p.c===c.id).length)} محصول ${ic('bolt',16)}</span></button>`).join('');
  const chips=[{id:'all',n:'همه'},...CATS].map(c=>`<button class="chip" data-act="shopcat" data-id="${c.id}" aria-pressed="${state.cat===c.id}">${c.n}</button>`).join('');
  $('#shopChips').innerHTML=chips;
  $('#qTabs').innerHTML=[{id:'all',n:'همه'},...CATS].map(c=>`<button class="chip" data-act="qtab" data-id="${c.id}" aria-pressed="${state.qcat===c.id}">${c.n}</button>`).join('');
}
function cardHTML(p){
  const v=p.v[getSel(p)];
  return `<article class="card" data-pid="${p.id}"><button class="stage" data-act="detail" data-pid="${p.id}" aria-label="جزئیات ${p.n}">${p.tag?`<span class="tag ${p.tagc||''}">${p.tag}</span>`:''}${artFor(p.art)}</button><h3>${p.n}</h3><p class="desc">${p.d}</p><div class="vars" role="group" aria-label="اندازه">${p.v.map((x,i)=>`<button class="chip" aria-pressed="${i===getSel(p)}" data-act="var" data-pid="${p.id}" data-i="${i}">${x.l}</button>`).join('')}</div><div class="buy"><div class="price" data-price>${money(v.p)}</div><button class="btn btn-primary btn-sm" data-act="add" data-pid="${p.id}">${ic('plus',18)}افزودن</button></div></article>`;
}
function renderShop(){
  let list=PRODUCTS.filter(p=>(state.cat==='all'||p.c===state.cat)&&(!state.q||(p.n+p.d).includes(state.q)));
  if(state.sort==='low')list=[...list].sort((a,b)=>a.v[0].p-b.v[0].p);
  if(state.sort==='high')list=[...list].sort((a,b)=>b.v[0].p-a.v[0].p);
  $('#shopGrid').innerHTML=list.length?list.map(cardHTML).join(''):'<p class="empty">محصولی با این مشخصات پیدا نشد.</p>';
  $$('#shopChips .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.id===state.cat));
}
function rowHTML(p){
  const i=getSel(p),v=p.v[i];
  return `<div class="q-row" data-pid="${p.id}"><div class="q-thumb">${artFor(p.art)}</div><div class="q-info"><b>${p.n}</b><div class="q-meta"><label class="sr" for="qs-${p.id}">اندازه‌ی ${p.n}</label><select class="sel" id="qs-${p.id}" data-act="qvar" data-pid="${p.id}">${p.v.map((x,k)=>`<option value="${k}" ${k===i?'selected':''}>${x.l}</option>`).join('')}</select><span class="q-price"><b data-qp>${money(v.p)}</b></span></div></div><div class="stepper"><button data-act="qm" data-pid="${p.id}" aria-label="کم کردن ${p.n}">${ic('minus',16)}</button><output data-qq>${fa(qtyOf(p.id,i))}</output><button data-act="qp" data-pid="${p.id}" aria-label="زیاد کردن ${p.n}">${ic('plus',16)}</button></div></div>`;
}
function updateRow(row){
  const p=byId(row.dataset.pid),i=getSel(p);
  $('[data-qq]',row).textContent=fa(qtyOf(p.id,i));
  $('[data-qp]',row).textContent=money(p.v[i].p);
}
function renderQuick(){
  $('#qList').innerHTML=PRODUCTS.filter(p=>state.qcat==='all'||p.c===state.qcat).map(rowHTML).join('');
  $$('#qTabs .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.id===state.qcat));
}
function miniHTML(p){
  const v=p.v[0];
  return `<div class="mini"><div class="q-thumb">${artFor(p.art)}</div><div><b>${p.n}</b><small>از ${money(v.p)}</small></div><button class="btn btn-primary btn-sm" data-act="add0" data-pid="${p.id}" aria-label="افزودن ${p.n}">${ic('plus',18)}</button></div>`;
}
function renderUse(){
  const u=USES.find(x=>x.id===state.use);
  $('#useChips').innerHTML=USES.map(x=>`<button class="chip" data-act="use" data-id="${x.id}" aria-pressed="${x.id===state.use}">${x.n}</button>`).join('');
  $('#useRes').innerHTML=`<div class="g-idea">${u.idea}</div>`+u.ids.map(id=>miniHTML(byId(id))).join('');
}

/* ---- Dialogs ---- */
function openDlg(d){if(!d.open)d.showModal()}
function closeDlg(d){if(d.open)d.close()}
const dlgHead=t=>`<div class="dlg-head"><h3>${t}</h3><button class="icon-btn" data-act="close" aria-label="بستن">${ic('x',22)}</button></div>`;
let pd={pid:null,vi:0,q:1};
function openProduct(pid){
  const p=byId(pid);pd={pid,vi:getSel(p),q:1};
  const d=$('#dlgProduct');
  d.innerHTML=`<div class="dlg">${dlgHead(p.n)}<div class="pd"><div class="stage">${artFor(p.art)}</div><div><p style="color:var(--muted)">${p.long}</p><div class="specs">${CAT_SPEC[p.c].map(s=>`<div><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div><div class="field"><label>اندازه</label><div class="vars" style="padding:0">${p.v.map((x,i)=>`<button class="chip" data-act="pvar" data-i="${i}" aria-pressed="${i===pd.vi}">${x.l}</button>`).join('')}</div></div><div class="buy" style="padding:14px 0 0;flex-wrap:wrap"><div class="price" id="pdPrice">${money(p.v[pd.vi].p)}</div><div style="display:flex;gap:8px;align-items:center"><div class="stepper"><button data-act="pdm" aria-label="کم کردن">${ic('minus',16)}</button><output id="pdQty">${fa(1)}</output><button data-act="pdp" aria-label="زیاد کردن">${ic('plus',16)}</button></div><button class="btn btn-primary" data-act="pdadd">${ic('cart',18)}افزودن به سبد</button></div></div></div></div></div>`;
  openDlg(d);
}
function orderText(o){
  const L=['سفارش جدید از سایت فروشگاه فدک','کد سفارش: '+o.code,'نام: '+o.name,'تلفن: '+o.phone,'شهر: '+o.city,'نشانی: '+o.address,'روش تحویل: '+o.delivery,'روش پرداخت: '+o.payment,'','اقلام:'];
  o.items.forEach(i=>L.push('- '+i.n+' ('+i.l+') × '+fa(i.q)+' = '+money(i.p*i.q)));
  L.push('','جمع کالاها: '+money(o.total));
  if(o.notes)L.push('توضیحات: '+o.notes);
  return L.join('\n');
}
function openCheckout(){
  if(!cart.length){toast('سبد خرید خالی است');return}
  closeDrawer();closeDlg($('#dlgProduct'));
  const d=$('#dlgCheckout');
  d.innerHTML=`<form class="dlg" id="coForm">${dlgHead('ثبت سفارش')}<div style="background:var(--surface-2);border-radius:16px;padding:12px 16px;margin-bottom:16px">${cart.map(l=>{const p=byId(l.pid),v=p.v[l.vi];return `<div style="display:flex;justify-content:space-between;gap:10px;font-size:14.5px;padding:4px 0"><span>${p.n} (${v.l}) × ${fa(l.qty)}</span><b>${money(v.p*l.qty)}</b></div>`}).join('')}<div style="display:flex;justify-content:space-between;font-weight:900;font-size:17px;border-top:1px dashed var(--line);margin-top:8px;padding-top:8px"><span>جمع کالاها</span><span>${money(cartTotal())}</span></div></div>
<div class="form-grid"><div class="field"><label for="co1">نام و نام خانوادگی</label><input id="co1" required autocomplete="name"></div><div class="field"><label for="co2">شماره‌ی موبایل</label><input id="co2" type="tel" inputmode="tel" required autocomplete="tel" placeholder="۰۹۱۲..."></div><div class="field"><label for="co3">شهر</label><input id="co3" required autocomplete="address-level2"></div><div class="field"><label for="co4">کد پستی (اختیاری)</label><input id="co4" inputmode="numeric" autocomplete="postal-code"></div><div class="field full"><label for="co5">نشانی کامل</label><textarea id="co5" required autocomplete="street-address"></textarea></div>
<div class="field full"><label>روش تحویل</label><div class="radio-row"><label><input type="radio" name="dl" value="ارسال با پست" checked>ارسال با پست</label><label><input type="radio" name="dl" value="پیک شهری قم">پیک شهری قم</label><label><input type="radio" name="dl" value="دریافت حضوری">دریافت حضوری</label></div></div>
<div class="field full"><label>روش پرداخت</label><div class="radio-row"><label><input type="radio" name="pm" value="پرداخت آنلاین پس از تأیید" checked>پرداخت آنلاین پس از تأیید</label><label><input type="radio" name="pm" value="طبق توافق با پشتیبانی">طبق توافق با پشتیبانی</label></div></div>
<div class="field full"><label for="co6">توضیحات (اختیاری)</label><textarea id="co6" placeholder="مثلاً زمان مناسب تحویل"></textarea></div></div>
<button class="btn btn-primary btn-block" style="margin-top:16px" type="submit">${ic('check',20)}ثبت سفارش</button></form>`;
  openDlg(d);
}
function newCode(){return 'FD-'+Date.now().toString(36).slice(-5).toUpperCase()+Math.floor(Math.random()*36).toString(36).toUpperCase()}
async function submitOrder(form){
  const g=id=>form.querySelector('#'+id).value.trim();
  const phone=toEn(g('co2')).replace(/\D/g,'');
  if(phone.length<10){toast('شماره‌ی تماس را درست وارد کنید');form.querySelector('#co2').focus();return}
  const button=form.querySelector('button[type="submit"]');
  if(button){button.disabled=true;button.textContent='در حال ثبت سفارش…'}
  const localItems=cart.map(l=>{const p=byId(l.pid),v=p.v[l.vi];return {n:p.n,l:v.l,q:l.qty,p:v.p}});
  const o={code:newCode(),date:Date.now(),name:g('co1'),phone,city:g('co3'),postalCode:toEn(g('co4')).replace(/\D/g,''),address:g('co5')+(g('co4')?' (کد پستی: '+g('co4')+')':''),notes:g('co6'),delivery:form.querySelector('input[name=dl]:checked').value,payment:form.querySelector('input[name=pm]:checked').value,items:localItems,total:cartTotal(),serverSaved:false};
  try{
    if(window.FadakApi&&window.FadakApi.isConfigured()){
      const result=await window.FadakApi.createOrder({name:o.name,phone:o.phone,city:o.city,postalCode:o.postalCode,address:g('co5'),notes:o.notes,delivery:o.delivery,payment:o.payment,items:cart.map(l=>({pid:l.pid,vi:(byId(l.pid).v[l.vi].apiVi===undefined?l.vi:byId(l.pid).v[l.vi].apiVi),qty:l.qty}))});
      o.serverSaved=true;o.code=result.code||o.code;o.total=Number(result.total||o.total);o.status=result.status||'new';o.paymentStatus=result.paymentStatus||'pending_confirmation';
      if(Array.isArray(result.items))o.items=result.items;
    }else{o.serverError='آدرس API تنظیم نشده است'}
  }catch(error){o.serverSaved=false;o.serverError=String(error&&error.message?error.message:'خطا در ارتباط با سرور')}
  orders.unshift(o);saveOrders();cart=[];syncCart();closeDlg($('#dlgCheckout'));
  if(button){button.disabled=false;button.textContent='ثبت سفارش'}
  showDone(o);
}

function shareLinks(text){
  const t=encodeURIComponent(text);
  return `<div class="share"><a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${t}">${ic('send',18)}ارسال در واتساپ</a><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(CONFIG.fadakUrl)}&text=${t}">${ic('send',18)}تلگرام</a><button class="btn btn-ghost btn-sm" data-act="copy" type="button">${ic('copy',18)}کپی متن</button></div>`;
}
let lastText='';
function showDone(o){
  lastText=orderText(o);
  const d=$('#dlgDone'),saved=o.serverSaved===true;
  const title=saved?'سفارش شما در سامانه ثبت شد':'پیش‌نویس سفارش آماده شد';
  const notice=saved?'سفارش در سرور ذخیره شد؛ برای اعلام هزینه‌ی ارسال و تأیید نهایی، متن زیر را برای مزرعه بفرستید.':'این سفارش هنوز در سرور ثبت نشده و فقط روی همین دستگاه نگهداری شده است. پیش از تحویل گرفتن سفارش، متن را برای مزرعه بفرستید یا اتصال سرور را بررسی کنید.';
  const paymentNote=o.paymentStatus==='not_configured'?' درگاه پرداخت آنلاین هنوز پیکربندی نشده؛ وضعیت پرداخت تا تأیید پشتیبانی، پرداخت‌شده نیست.':'';
  d.innerHTML='<div class="dlg done"><span class="ok">'+ic('check',38)+'</span><h3 style="font-size:24px;font-weight:900">'+title+'</h3><p style="color:var(--muted)">کد سفارش:</p><div class="code">'+esc(o.code)+'</div><p style="color:var(--muted);max-width:520px">'+esc(notice+paymentNote)+'</p><div class="msgbox" id="msgText">'+esc(lastText)+'</div>'+shareLinks(lastText)+'<button class="btn btn-ghost" data-act="close">بستن</button></div>';
  openDlg(d);
}

function showMessage(title,text){
  lastText=text;
  const d=$('#dlgMsg');
  d.innerHTML=`<div class="dlg done">${dlgHead(title).replace('class="dlg-head"','class="dlg-head" style="width:100%"')}<span class="ok">${ic('check',34)}</span><p style="color:var(--muted)">پیام شما آماده است. برای ارسال، یکی از دکمه‌های زیر را بزنید.</p><div class="msgbox">${esc(text)}</div>${shareLinks(text)}</div>`;
  openDlg(d);
}
function askForm(title,fields,build){
  const d=$('#dlgMsg');
  d.innerHTML=`<form class="dlg" id="askForm">${dlgHead(title)}<div class="form-grid">${fields.map((f,i)=>`<div class="field ${f.full?'full':''}"><label for="af${i}">${f.l}</label>${f.t==='area'?`<textarea id="af${i}" ${f.req?'required':''}></textarea>`:`<input id="af${i}" ${f.type?`type="${f.type}" inputmode="tel"`:''} ${f.req?'required':''}>`}</div>`).join('')}</div><button class="btn btn-primary btn-block" style="margin-top:16px" type="submit">آماده‌سازی پیام</button></form>`;
  $('#askForm').onsubmit=async e=>{
  e.preventDefault();const vals=fields.map((f,i)=>$('#af'+i).value.trim()),message=build(vals);
  if(window.FadakApi&&window.FadakApi.isConfigured()){
    const payload={name:vals[0]||'',phone:vals[1]||'',city:vals[2]||'',monthlyUse:title,notes:vals[3]||'',message:message};
    try{await window.FadakApi.sendLead('subscriptions',payload);showMessage(title,'درخواست در سامانه ثبت شد.\\n'+message)}
    catch(error){showMessage(title,'درخواست ذخیره نشد؛ اتصال سرور را بررسی کن یا متن زیر را برای مزرعه بفرست.\\n'+error.message+'\\n'+message)}
  }else showMessage(title,'این متن فقط آماده شده و به سرور ارسال نشده است. برای ثبت آنلاین، سرور را پیکربندی کن؛ در غیر این صورت متن را برای مزرعه بفرست.\\n'+message);
};
  openDlg(d);
}
function copyText(txt){
  const ok=()=>toast('متن کپی شد');
  try{navigator.clipboard.writeText(txt).then(ok,fb)}catch(e){fb()}
  function fb(){const a=document.createElement('textarea');a.value=txt;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){toast('کپی نشد؛ متن را دستی انتخاب کنید')}a.remove()}
}
async function trackOrder(code,last4=''){
  const c=toEn(code).trim().toUpperCase().replace(/\s/g,'');
  const box=$('#trackRes');
  if(!c){box.innerHTML='';return}
  if(window.FadakApi&&window.FadakApi.isConfigured()){
    const digits=toEn(last4).replace(/\D/g,'');
    if(digits.length!==4){box.innerHTML='<p style="color:var(--muted)">برای حفظ حریم خصوصی، چهار رقم آخر شماره‌ی موبایل سفارش را هم وارد کنید.</p>';return}
    box.textContent='در حال دریافت وضعیت از سرور…';
    try{
      const remote=await window.FadakApi.trackOrder(c,digits),timeline=Array.isArray(remote.timeline)?remote.timeline:[];
      const steps=timeline.map(function(x){return '<li style="padding:8px 0;border-bottom:1px solid var(--line)"><b>'+esc(x.label||x.status||'به‌روزرسانی')+'</b><small style="display:block;color:var(--muted)">'+esc(x.at||'')+(x.note?' — '+esc(x.note):'')+'</small></li>'}).join('');
      box.innerHTML='<div class="panel"><h3>وضعیت سفارش '+esc(remote.code||c)+'</h3><p>وضعیت فعلی: <b>'+esc(remote.statusLabel||remote.status||'در حال بررسی')+'</b></p><ul style="margin-top:8px">'+steps+'</ul></div>';
    }catch(error){box.innerHTML='<p style="color:var(--muted)">'+esc(error.message||'پیگیری سفارش ممکن نشد')+'</p>'}
    return;
  }
  const o=orders.find(x=>x.code===c);
  if(!o){box.innerHTML='<p style="color:var(--muted)">سفارشی با این کد روی این دستگاه پیدا نشد. اتصال سرور را فعال کنید یا کد را برای پشتیبانی بفرستید.</p>';return}
  box.innerHTML='<div class="panel"><h3>سفارش '+esc(o.code)+'</h3><p style="color:var(--muted)">حالت محلی: وضعیت این سفارش از سرور دریافت نشده است.</p><p>جمع کالاها: <b>'+money(o.total)+'</b></p></div>';
}

/* ---- Events ---- */
document.addEventListener('click',e=>{
  const dlg=e.target;
  if(dlg.tagName==='DIALOG'){closeDlg(dlg);return}
  const el=e.target.closest('[data-act]');
  if(!el)return;
  const act=el.dataset.act,pid=el.dataset.pid,vi=+el.dataset.vi;
  switch(act){
    case 'close':closeDlg(el.closest('dialog'));break;
    case 'detail':openProduct(pid);break;
    case 'var':{state.sel[pid]=+el.dataset.i;const card=el.closest('.card'),p=byId(pid);$$('.vars .chip',card).forEach((c,i)=>c.setAttribute('aria-pressed',i===+el.dataset.i));$('[data-price]',card).textContent=money(p.v[+el.dataset.i].p);const row=$(`#qList .q-row[data-pid="${pid}"]`);if(row){$('select',row).value=el.dataset.i;updateRow(row)}break}
    case 'add':addToCart(pid,getSel(byId(pid)),1);break;
    case 'add0':addToCart(pid,0,1);break;
    case 'cat':state.cat=el.dataset.id;state.q='';$('#q').value='';renderShop();document.getElementById('shop').scrollIntoView({behavior:'smooth'});break;
    case 'shopcat':state.cat=el.dataset.id;renderShop();break;
    case 'qtab':state.qcat=el.dataset.id;renderQuick();break;
    case 'qp':{const p=byId(pid),i=getSel(p);setQty(pid,i,qtyOf(pid,i)+1);break}
    case 'qm':{const p=byId(pid),i=getSel(p);setQty(pid,i,qtyOf(pid,i)-1);break}
    case 'inc':setQty(pid,vi,qtyOf(pid,vi)+1);break;
    case 'dec':setQty(pid,vi,qtyOf(pid,vi)-1);break;
    case 'rm':setQty(pid,vi,0);break;
    case 'closeDrawer':closeDrawer();break;
    case 'use':state.use=el.dataset.id;renderUse();break;
    case 'bundle':{const b=BUNDLES.find(x=>x.id===el.dataset.id);b.items.forEach(([p,v,q])=>addToCart(p,v,q,true));toast('پک «'+b.n+'» به سبد اضافه شد');openDrawer();break}
    case 'plan':{const pl=PLANS[+el.dataset.i];askForm('درخواست '+pl.n,[{l:'نام و نام خانوادگی',req:1},{l:'شماره‌ی تماس',req:1,type:'tel'},{l:'شهر'},{l:'سبد یا محصولات دلخواه',t:'area',full:1}],v=>`درخواست ${pl.n}\nنام: ${v[0]}\nتلفن: ${v[1]}\nشهر: ${v[2]}\nسبد دلخواه: ${v[3]||'—'}`);break}
    case 'pvar':{pd.vi=+el.dataset.i;const p=byId(pd.pid);$$('#dlgProduct .vars .chip').forEach((c,i)=>c.setAttribute('aria-pressed',i===pd.vi));$('#pdPrice').textContent=money(p.v[pd.vi].p);break}
    case 'pdp':pd.q=Math.min(99,pd.q+1);$('#pdQty').textContent=fa(pd.q);break;
    case 'pdm':pd.q=Math.max(1,pd.q-1);$('#pdQty').textContent=fa(pd.q);break;
    case 'pdadd':addToCart(pd.pid,pd.vi,pd.q);closeDlg($('#dlgProduct'));break;
    case 'copy':copyText(lastText);break;
  }
});
document.addEventListener('change',e=>{
  const el=e.target.closest('[data-act="qvar"]');
  if(el){state.sel[el.dataset.pid]=+el.value;const row=el.closest('.q-row');updateRow(row);const card=$(`#shopGrid .card[data-pid="${el.dataset.pid}"]`);if(card){$$('.vars .chip',card).forEach((c,i)=>c.setAttribute('aria-pressed',i===+el.value));$('[data-price]',card).textContent=money(byId(el.dataset.pid).v[+el.value].p)}}
});
document.addEventListener('submit',e=>{
  const f=e.target;
  if(f.id==='coForm'){e.preventDefault();submitOrder(f)}
});
$('#cartBtn').addEventListener('click',openDrawer);
$('#bbCart').addEventListener('click',openDrawer);
$('#drClose').addEventListener('click',closeDrawer);
$('#scrim').addEventListener('click',closeDrawer);
$('#drCheckout').addEventListener('click',openCheckout);
$('#qCheckout').addEventListener('click',openCheckout);
$('#qCart').addEventListener('click',openDrawer);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
$('#burger').addEventListener('click',()=>{const m=$('#mnav'),on=m.classList.toggle('on');$('#burger').setAttribute('aria-expanded',on)});
$('#mnav').addEventListener('click',e=>{if(e.target.tagName==='A'){$('#mnav').classList.remove('on');$('#burger').setAttribute('aria-expanded','false')}});
$('#q').addEventListener('input',e=>{state.q=e.target.value.trim();renderShop()});
$('#sort').addEventListener('change',e=>{state.sort=e.target.value;renderShop()});
$('#trackForm').addEventListener('submit',e=>{e.preventDefault();trackOrder($('#tcode').value,$('#tphone').value)});
$('#wholeForm').addEventListener('submit',async e=>{
  e.preventDefault();const v=['w1','w2','w3','w4','w5','w6'].map(i=>$('#'+i).value.trim());
  const payload={name:v[0],business:v[1],phone:v[2],city:v[3],monthlyUse:v[4],notes:v[5]};
  const note='درخواست قیمت عمده\nنام: '+v[0]+'\nکسب‌وکار: '+(v[1]||'—')+'\nتلفن: '+v[2]+'\nشهر: '+(v[3]||'—')+'\nمصرف ماهانه: '+v[4]+'\nتوضیحات: '+(v[5]||'—');
  if(window.FadakApi&&window.FadakApi.isConfigured()){
    try{await window.FadakApi.sendLead('wholesale',payload);showMessage('درخواست قیمت عمده','درخواست در سامانه ثبت شد. برای ادامه‌ی هماهنگی، متن زیر را هم می‌توانی برای مزرعه بفرستی.\n'+note)}
    catch(error){showMessage('ارسال درخواست انجام نشد','درخواست در سرور ذخیره نشد. اتصال را بررسی کن یا متن را از راه ارتباطی زیر ارسال کن.\n'+error.message+'\n'+note)}
  }else showMessage('درخواست قیمت عمده','این متن فقط آماده شده و به سامانه ارسال نشده است. برای ثبت آنلاین، سرور را پیکربندی کن؛ در غیر این صورت متن را برای مزرعه بفرست.\n'+note);
});
$('#contactForm').addEventListener('submit',async e=>{
  e.preventDefault();const v=['c1','c2','c3','c4'].map(i=>$('#'+i).value.trim());
  const payload={name:v[0],phone:v[1],subject:v[2],message:v[3]};
  const note='نام: '+v[0]+'\nتلفن: '+v[1]+'\nموضوع: '+v[2]+'\nپیام: '+v[3];
  if(window.FadakApi&&window.FadakApi.isConfigured()){
    try{await window.FadakApi.sendLead('contact',payload);showMessage('پیام به مزرعه‌ی فدک','پیام در سامانه ثبت شد.\n'+note)}
    catch(error){showMessage('ثبت پیام انجام نشد','پیام در سرور ذخیره نشد. اتصال را بررسی کن یا متن را برای مزرعه بفرست.\n'+error.message+'\n'+note)}
  }else showMessage('پیام به مزرعه‌ی فدک','این متن فقط آماده شده و به سرور ارسال نشده است. برای ارسال آنلاین، اتصال سرور را پیکربندی کن؛ در غیر این صورت متن را برای مزرعه بفرست.\n'+note);
});

/* ---- Init ---- */
renderStatic();renderCats();renderShop();renderQuick();renderUse();
$('#drawer').inert=true;
syncCart();
if(window.FadakApi&&window.FadakApi.isConfigured()){
  window.FadakApi.getCatalog().then(function(remote){
    if(!remote||!Array.isArray(remote.products))return;
    remote.products.forEach(function(item){
      var local=byId(item.id);
      if(local&&Array.isArray(item.v)&&item.v.length){
        var variants=item.v.filter(function(v){return v&&Number(v.p)>0;}).map(function(v){return {l:String(v.l||''),p:Number(v.p),apiVi:Number.isInteger(Number(v.vi))?Number(v.vi):undefined};});
        if(variants.length)local.v=variants;
      }
    });
    renderShop();renderQuick();renderUse();
  }).catch(function(){});
}
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12});
  $$('.reveal').forEach(el=>io.observe(el));
}else{$$('.reveal').forEach(el=>el.classList.add('in'))}
})();

