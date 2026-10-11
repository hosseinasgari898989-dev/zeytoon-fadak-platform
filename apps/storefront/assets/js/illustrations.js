
/* ===== Fadak olive illustrations (pure SVG, no external images) ===== */
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
let UID=0;
const OLIVE_FILL={g:'url(#gOliveG)',b:'url(#gOliveB)',p:'url(#gOliveP)'};

function leaf(x,y,rot,len=46,w=11){
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C${len*.25} ${-w} ${len*.75} ${-w} ${len} 0C${len*.75} ${w} ${len*.25} ${w} 0 0Z" fill="url(#gLeaf)"/><path d="M0 0C${len*.25} ${-w} ${len*.75} ${-w} ${len} 0Z" fill="#fff" opacity=".13"/><path d="M2 0L${len-5} 0" stroke="#24531C" stroke-width="1" opacity=".55"/></g>`;
}
function olive(x,y,rx,ry,rot,tone='g',opt={}){
  let s=`<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="${rx}" ry="${ry}" fill="${OLIVE_FILL[tone]||OLIVE_FILL.g}"/>`;
  s+=`<ellipse cx="${-rx*.36}" cy="${-ry*.42}" rx="${rx*.3}" ry="${ry*.15}" fill="#fff" opacity="${tone==='g'?.5:.32}" transform="rotate(-24 ${-rx*.36} ${-ry*.42})"/>`;
  s+=`<ellipse cx="${rx*.15}" cy="${ry*.55}" rx="${rx*.55}" ry="${ry*.18}" fill="#000" opacity=".12"/>`;
  if(opt.ring){s+=`<ellipse rx="${rx*.36}" ry="${ry*.4}" fill="#2A140C" opacity=".88"/><ellipse rx="${rx*.36}" ry="${ry*.4}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1"/>`}
  return s+'</g>';
}
function packed(tone,x0,y0,x1,y1,rx,ry,seed,opt={}){
  const w=x1-x0,h=y1-y0,cw=rx*1.78,ch=ry*1.72;
  const cols=Math.max(1,Math.floor(w/cw)),rows=Math.max(1,Math.floor(h/ch));
  let out='',k=0;
  for(let r=0;r<rows;r++)for(let c=0;c<=cols;c++){
    const off=(r%2)?cw/2:0;
    const x=x0+c*cw+off+(rnd(seed+k)-.5)*3,y=y0+ch/2+r*ch+(rnd(seed+k+50)-.5)*3;
    const rot=(rnd(seed+k+9)-.5)*90;
    const t=tone==='mix'?(k%3===0?'b':'g'):tone;
    out+=olive(x,y,rx,ry,rot,t,opt);
    k++;
  }
  return out;
}
function peppers(x0,y0,x1,y1,seed,n){
  let s='';
  for(let i=0;i<n;i++){
    const x=x0+rnd(seed+i)*(x1-x0),y=y0+rnd(seed+i+30)*(y1-y0),r=rnd(seed+i+60)*360;
    s+=`<ellipse cx="${x}" cy="${y}" rx="4.2" ry="1.7" fill="#D6382B" transform="rotate(${r} ${x} ${y})"/><ellipse cx="${x+4}" cy="${y+3}" rx="2.2" ry="2.2" fill="#F6F0DA"/>`;
  }
  return s;
}
function shadow(cx=120,cy=222,rx=72){return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="8" fill="#000" opacity=".2" filter="url(#fSoft)"/>`}
function sprig(x,y,sc=1,rot=0){
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"><path d="M-18 8Q0 -2 20 -10" stroke="#4A7A2A" stroke-width="2" fill="none" stroke-linecap="round"/>${leaf(-4,4,-35,18,5)}${leaf(4,0,-70,16,4.5)}${leaf(8,-4,30,16,4.5)}${leaf(-10,6,40,14,4)}${olive(-14,13,4.6,3.6,20,'g')}${olive(-4,15,4.2,3.4,-10,'g')}</g>`;
}
function wrap(inner,label){return `<svg viewBox="0 0 240 240" role="img" aria-label="${label||'زیتون فدک'}">${inner}</svg>`}

/* glass jar of olives */
function jarSVG(tone='g',label='سبز',opt={}){
  const id='cl'+(UID++),body='M52 86H188V198Q188 218 168 218H72Q52 218 52 198Z';
  let s=shadow();
  s+=`<defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>`;
  s+=`<rect x="70" y="60" width="100" height="32" rx="7" fill="url(#gGlass)" stroke="#9DB59A" stroke-opacity=".55"/>`;
  s+=`<path d="${body}" fill="url(#gGlass)" stroke="#9DB59A" stroke-opacity=".6"/>`;
  s+=`<g clip-path="url(#${id})"><rect x="50" y="102" width="142" height="118" fill="url(#gBrine)"/>${packed(tone,52,100,188,218,12.5,8.8,opt.seed||3,opt)}${opt.pepper?peppers(56,106,184,212,7,16):''}<rect x="50" y="102" width="142" height="5" fill="#fff" opacity=".22"/></g>`;
  s+=`<rect x="63" y="38" width="114" height="29" rx="9" fill="url(#gGold)"/>`;
  for(let x=72;x<170;x+=8)s+=`<path d="M${x} 43V63" stroke="#8C5F00" stroke-opacity=".3"/>`;
  s+=`<rect x="68" y="41" width="104" height="5" rx="2.5" fill="#fff" opacity=".45"/>`;
  s+=`<rect x="68" y="132" width="104" height="62" rx="7" fill="#FFFCEE" stroke="#D8C676"/><rect x="68" y="132" width="104" height="9" rx="4" fill="#2F7D32"/><rect x="68" y="185" width="104" height="9" rx="4" fill="#F4B400"/>`;
  s+=`<text x="120" y="164" text-anchor="middle" font-size="22" font-weight="900" fill="#1F5A25">فدک</text><text x="120" y="179" text-anchor="middle" font-size="10" font-weight="700" fill="#6B5200">زیتون ${label}</text>`;
  s+=sprig(86,150,.62,-20);
  s+=`<path d="M62 102H72V198H62Z" fill="#fff" opacity=".32"/><path d="M176 108H180V194H176Z" fill="#fff" opacity=".2"/>`;
  return wrap(s,'شیشه زیتون '+label);
}
/* vacuum pouch */
function pouchSVG(tone='g',label='سبز',opt={}){
  const id='cl'+(UID++),p='M54 64H186L196 80Q206 142 196 204L186 220H54L44 204Q34 142 44 80Z';
  let s=shadow(120,224,74);
  s+=`<defs><clipPath id="${id}"><path d="${p}"/></clipPath></defs>`;
  s+=`<path d="${p}" fill="url(#gGlass)" stroke="#9DB59A" stroke-opacity=".6"/>`;
  s+=`<g clip-path="url(#${id})"><rect x="40" y="80" width="160" height="130" fill="url(#gBrine)" opacity=".55"/>${packed(tone,44,84,196,206,12,8.6,opt.seed||11,opt)}${opt.pepper?peppers(50,90,190,206,3,18):''}`;
  s+=`<path d="M60 84L112 84L74 214L48 214Z" fill="#fff" opacity=".16"/><path d="M150 84L170 84L150 214L136 214Z" fill="#fff" opacity=".12"/>`;
  s+=`<path d="M70 100Q96 150 70 196M168 98Q148 148 170 198M118 92Q130 150 112 206" stroke="#fff" stroke-opacity=".28" stroke-width="1.4" fill="none"/>`;
  s+=`<rect x="44" y="64" width="152" height="17" fill="#F2F6EE" opacity=".82"/><rect x="44" y="203" width="152" height="17" fill="#F2F6EE" opacity=".82"/>`;
  for(let x=48;x<196;x+=5){s+=`<path d="M${x} 66V79M${x} 205V218" stroke="#B9C7B3" stroke-width="1"/>`}
  s+=`</g><path d="${p}" fill="none" stroke="#9DB59A" stroke-opacity=".5"/>`;
  s+=`<rect x="72" y="118" width="96" height="58" rx="10" fill="#FFFCEE" stroke="#D8C676"/><rect x="72" y="118" width="96" height="9" rx="4" fill="#2F7D32"/>`;
  s+=`<text x="120" y="150" text-anchor="middle" font-size="21" font-weight="900" fill="#1F5A25">فدک</text><text x="120" y="164" text-anchor="middle" font-size="10" font-weight="700" fill="#6B5200">وکیوم · ${label}</text>`;
  s+=sprig(88,138,.5,-20);
  return wrap(s,'زیتون وکیوم '+label);
}
/* canned olives tin */
function tinSVG(tone='g',label='سبز',opt={}){
  let s=shadow(120,222,66);
  s+=`<rect x="66" y="92" width="108" height="122" rx="9" fill="url(#gMetal)"/>`;
  s+=`<rect x="66" y="112" width="108" height="80" fill="url(#gTinLabel)"/><rect x="66" y="112" width="108" height="6" fill="#F4B400"/><rect x="66" y="186" width="108" height="6" fill="#F4B400"/>`;
  s+=`<text x="120" y="134" text-anchor="middle" font-size="17" font-weight="900" fill="#FFE27A">فدک</text>`;
  s+=`<circle cx="120" cy="157" r="19" fill="#FFFCEE" stroke="#F4B400" stroke-width="2"/>`;
  s+=olive(113,159,8,6,-20,tone==='mix'?'g':tone,opt)+olive(127,157,7.5,5.8,24,tone==='mix'?'b':tone,opt)+leaf(118,150,-60,16,4.2)+leaf(122,150,-120,14,4);
  s+=`<text x="120" y="182" text-anchor="middle" font-size="8.5" font-weight="700" fill="#FFF">زیتون ${label}</text>`;
  s+=`<rect x="66" y="96" width="108" height="3.5" fill="#fff" opacity=".45"/><rect x="66" y="205" width="108" height="3" fill="#000" opacity=".12"/><path d="M76 118V190" stroke="#fff" stroke-opacity=".3" stroke-width="5"/>`;
  s+=`<ellipse cx="120" cy="92" rx="54" ry="11" fill="url(#gMetal)" stroke="#8A949B" stroke-width="1"/><ellipse cx="120" cy="92" rx="45" ry="8" fill="#B7BFC5"/><ellipse cx="120" cy="91" rx="38" ry="6" fill="#C9D0D5"/>`;
  s+=`<ellipse cx="136" cy="91" rx="15" ry="4.8" fill="#E5E9EC" stroke="#8A949B"/><circle cx="108" cy="91" r="5.5" fill="none" stroke="#8A949B" stroke-width="2.4"/>`;
  s+=`<ellipse cx="120" cy="214" rx="54" ry="8" fill="#9099A0" opacity=".6"/>`;
  return wrap(s,'کنسرو زیتون '+label);
}
/* olive-oil glass bottle */
function bottleSVG(vol='۵۰۰ میلی‌لیتر',opt={}){
  const b='M106 36H134V76C134 90 166 100 166 136V206Q166 220 152 220H88Q74 220 74 206V136C74 100 106 90 106 76Z';
  let s=shadow(120,224,62);
  s+=`<path d="${b}" fill="url(#gBottle)"/>`;
  s+=`<path d="M74 150H166V206Q166 220 152 220H88Q74 220 74 206Z" fill="url(#gOil)" opacity=".55"/>`;
  s+=`<path d="M82 130C82 108 100 100 106 82V150H82Z" fill="#fff" opacity=".14"/><path d="M84 124H92V212H84Z" fill="#fff" opacity=".28"/><path d="M154 130H158V206H154Z" fill="#fff" opacity=".16"/><path d="M110 42H114V80H110Z" fill="#fff" opacity=".28"/>`;
  s+=`<rect x="102" y="14" width="36" height="28" rx="6" fill="url(#gGold)"/>`;
  for(let x=108;x<136;x+=6)s+=`<path d="M${x} 18V38" stroke="#8C5F00" stroke-opacity=".3"/>`;
  s+=`<rect x="106" y="17" width="28" height="4" rx="2" fill="#fff" opacity=".5"/>`;
  s+=`<rect x="80" y="128" width="80" height="78" rx="6" fill="#FFFAE6" stroke="#D8C676"/><rect x="80" y="128" width="80" height="8" fill="#F4B400"/><rect x="80" y="198" width="80" height="8" fill="#2F7D32"/>`;
  s+=sprig(120,148,.78,0);
  s+=`<text x="120" y="173" text-anchor="middle" font-size="17" font-weight="900" fill="#1F5A25">فدک</text><text x="120" y="185" text-anchor="middle" font-size="7.6" font-weight="800" fill="#6B5200">روغن زیتون فرابکر</text><text x="120" y="195" text-anchor="middle" font-size="6.4" fill="#6B5200">${vol}</text>`;
  return wrap(s,'بطری روغن زیتون');
}
/* olive-oil metal can */
function oilTinSVG(vol='۳ لیتر',opt={}){
  let s=shadow(120,224,68);
  s+=`<path d="M112 84C112 40 170 40 170 84" fill="none" stroke="#8C969D" stroke-width="7" stroke-linecap="round"/><path d="M112 84C112 46 168 46 168 84" fill="none" stroke="#DCE2E6" stroke-width="2.5" stroke-linecap="round"/>`;
  s+=`<rect x="64" y="78" width="112" height="140" rx="10" fill="url(#gMetal)"/>`;
  s+=`<rect x="64" y="78" width="112" height="12" rx="6" fill="#B9C1C7"/><rect x="64" y="206" width="112" height="12" rx="6" fill="#98A2A9"/>`;
  s+=`<rect x="72" y="98" width="96" height="100" rx="8" fill="url(#gTinLabel)"/><rect x="72" y="98" width="96" height="5" fill="#F4B400"/><rect x="72" y="193" width="96" height="5" fill="#F4B400"/>`;
  s+=`<ellipse cx="120" cy="140" rx="29" ry="27" fill="#FFFCEE" stroke="#F4B400" stroke-width="2.4"/>`;
  s+=sprig(120,142,1.05,0);
  s+=`<text x="120" y="122" text-anchor="middle" font-size="14" font-weight="900" fill="#FFE27A">فدک</text><text x="120" y="178" text-anchor="middle" font-size="9" font-weight="800" fill="#fff">روغن زیتون فرابکر</text><text x="120" y="190" text-anchor="middle" font-size="8" fill="#FFE27A">${vol}</text>`;
  s+=`<rect x="72" y="60" width="26" height="22" rx="4" fill="url(#gGold)"/><rect x="76" y="56" width="18" height="8" rx="3" fill="#C58A00"/><path d="M74 100V196" stroke="#fff" stroke-opacity=".28" stroke-width="5"/>`;
  return wrap(s,'حلب روغن زیتون');
}
/* ceramic bowl of olives */
function bowlSVG(tone='mix'){
  const id='cl'+(UID++);
  let s=shadow(120,222,80);
  s+=`<defs><clipPath id="${id}"><path d="M42 140Q120 56 198 140Z"/></clipPath></defs>`;
  s+=`<g clip-path="url(#${id})">${packed(tone,40,86,200,142,13,9.4,21)}</g>`;
  s+=`<path d="M34 138H206C206 190 174 218 120 218C66 218 34 190 34 138Z" fill="url(#gBowl)"/>`;
  s+=`<ellipse cx="120" cy="138" rx="86" ry="12" fill="#F4E9C8" stroke="#D8C676"/>`;
  s+=`<path d="M52 150Q60 190 104 206" stroke="#fff" stroke-opacity=".5" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  s+=`<path d="M62 168H178" stroke="#2F7D32" stroke-width="3" opacity=".7"/><path d="M70 178H170" stroke="#F4B400" stroke-width="3" opacity=".8"/>`;
  return wrap(s,'کاسه زیتون');
}
function artFor(a){
  const [k,tone,label,opt]=a;
  if(k==='jar')return jarSVG(tone,label,opt||{});
  if(k==='pouch')return pouchSVG(tone,label,opt||{});
  if(k==='tin')return tinSVG(tone,label,opt||{});
  if(k==='bottle')return bottleSVG(label,opt||{});
  if(k==='oiltin')return oilTinSVG(label,opt||{});
  if(k==='bowl')return bowlSVG(tone);
  return jarSVG();
}
function inner(svg){return svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}
function place(svg,x,y,w,cls=''){return `<g class="${cls}"><svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="0 0 240 240" overflow="visible">${inner(svg)}</svg></g>`}

/* hero scene */
function heroSVG(){
  let s=`<svg viewBox="0 0 640 580" role="img" aria-label="مجموعه محصولات زیتون فدک: روغن، زیتون شیشه‌ای، وکیوم و کنسرو">`;
  s+=`<circle cx="330" cy="290" r="250" style="fill:var(--yellow-l)"/><circle cx="360" cy="320" r="190" style="fill:var(--green-l)"/>`;
  s+=`<ellipse cx="330" cy="516" rx="290" ry="40" style="fill:var(--green-l)"/><ellipse cx="330" cy="510" rx="250" ry="30" fill="#2F7D32" opacity=".16"/>`;
  /* branch */
  s+=`<g class="sway"><path d="M-20 70C90 110 190 70 330 140" stroke="#7B5B38" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M80 98C110 60 150 50 190 62" stroke="#7B5B38" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const pts=[[20,86],[60,98],[104,98],[148,92],[190,90],[232,100],[276,118],[318,136],[110,90],[160,66],[200,64]];
  pts.forEach((p,i)=>{const up=i%2===0;s+=leaf(p[0],p[1],up?-52-rnd(i)*20:48+rnd(i)*20,64,15)});
  pts.slice(1,9).forEach((p,i)=>{if(i%2===0){s+=`<path d="M${p[0]} ${p[1]}Q${p[0]+4} ${p[1]+16} ${p[0]+2} ${p[1]+28}" stroke="#7B5B38" stroke-width="2" fill="none"/>`+olive(p[0]+2,p[1]+38,13,9.6,80,i%4===0?'b':'g')}});
  s+=`</g>`;
  /* products */
  s+=place(oilTinSVG('۳ لیتر'),340,176,230,'float d2');
  s+=place(bottleSVG('۵۰۰ میلی‌لیتر'),218,160,250,'float');
  s+=place(jarSVG('g','سبز',{seed:4}),20,262,270,'float d3');
  s+=place(pouchSVG('b','سیاه',{seed:9}),360,300,230,'float');
  s+=place(tinSVG('mix','سبز و سیاه'),246,346,200,'float d2');
  /* scattered olives */
  [[84,520,14,'g',20],[120,536,12,'b',-30],[540,520,13,'g',40],[500,540,11,'b',10],[300,552,12,'g',-20],[600,462,12,'g',30]].forEach(o=>{s+=olive(o[0],o[1],o[2],o[2]*.72,o[4],o[3])});
  s+=leaf(520,496,-20,42,10)+leaf(70,498,200,40,10);
  return s+'</svg>';
}
/* bundle scenes */
function bundleSVG(kind){
  let s=`<svg viewBox="0 0 360 220" role="img" aria-label="پک پیشنهادی">`;
  if(kind==='intro'){
    s+=place(jarSVG('g','سبز',{seed:2}),10,10,150)+place(pouchSVG('b','سیاه',{seed:5}),110,24,140)+place(tinSVG('g','سبز'),205,18,150)+place(bottleSVG('۲۵۰ میلی‌لیتر'),145,0,120);
  }else if(kind==='family'){
    s+=place(oiltinFix(),0,10,140)+place(jarSVG('g','سبز',{seed:2}),92,16,140)+place(jarSVG('b','سیاه',{seed:8}),176,10,150)+place(pouchSVG('g','سبز',{seed:12}),240,34,120)+place(tinSVG('g','سبز'),128,60,120);
  }else{
    s+=`<ellipse cx="180" cy="212" rx="140" ry="8" fill="#000" opacity=".14" filter="url(#fSoft)"/><rect x="50" y="128" width="260" height="82" rx="12" fill="#C9A15B"/><rect x="44" y="120" width="272" height="22" rx="8" fill="#B88A45"/><path d="M50 150H310" stroke="#8C6A2C" stroke-opacity=".35"/>`;
    s+=place(bottleSVG('۵۰۰ میلی‌لیتر'),62,6,150)+place(jarSVG('mix','پرورده',{seed:6,pepper:true}),150,12,140)+place(bowlSVG('g'),232,62,110);
    s+=`<rect x="166" y="120" width="28" height="90" fill="#2F7D32"/><rect x="166" y="120" width="28" height="90" fill="#fff" opacity=".12"/><path d="M180 156C150 120 128 150 158 164C168 168 176 162 180 156ZM180 156C210 120 232 150 202 164C192 168 184 162 180 156Z" fill="#F4B400" stroke="#B98200" stroke-width="1.5"/><circle cx="180" cy="158" r="8" fill="#FFD04A" stroke="#B98200" stroke-width="1.5"/>`;
  }
  return s+'</svg>';
}
function oiltinFix(){return oilTinSVG('۳ لیتر')}

/* farm landscape */
function farmSVG(){
  let s=`<svg viewBox="0 0 640 440" role="img" aria-label="باغ زیتون مزرعه فدک"><defs><linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3B8"/><stop offset=".55" stop-color="#FFFBE6"/><stop offset="1" stop-color="#EAF5D9"/></linearGradient><linearGradient id="gHill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9CF7D"/><stop offset="1" stop-color="#7DB14F"/></linearGradient><linearGradient id="gHill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FAA45"/><stop offset="1" stop-color="#4C8A32"/></linearGradient><linearGradient id="gSoil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CBF5A"/><stop offset="1" stop-color="#5E9A38"/></linearGradient></defs>`;
  s+=`<rect width="640" height="440" fill="url(#gSky)"/><circle cx="500" cy="92" r="44" fill="#F4B400" opacity=".9"/><circle cx="500" cy="92" r="64" fill="#F4B400" opacity=".16"/>`;
  s+=`<path d="M0 230C90 170 170 190 260 214C360 180 470 170 640 220V440H0Z" fill="url(#gHill1)"/>`;
  s+=`<path d="M0 290C120 240 240 260 340 280C450 250 560 250 640 280V440H0Z" fill="url(#gHill2)"/>`;
  s+=`<path d="M0 350C160 320 300 330 640 340V440H0Z" fill="url(#gSoil)"/>`;
  s+=`<path d="M300 440C310 400 330 370 350 340" stroke="#E9D9A2" stroke-width="26" fill="none" opacity=".75"/>`;
  const rows=[[238,.55,9],[280,.75,8],[330,1,6]];
  rows.forEach((r,ri)=>{const [y,sc,n]=r;for(let i=0;i<n;i++){const x=(640/n)*(i+.5)+(rnd(ri*20+i)-.5)*18;if(Math.abs(x-326)<40&&ri>0)continue;s+=tree(x,y+(rnd(i+ri)-.5)*8,sc,ri*10+i)}});
  /* farm hut */
  s+=`<g transform="translate(96 252)"><rect x="0" y="0" width="64" height="40" fill="#F6E9C9"/><path d="M-6 2L32 -26L70 2Z" fill="#C98A43"/><rect x="26" y="14" width="14" height="26" fill="#8C5A2B"/><rect x="8" y="12" width="12" height="12" fill="#9ED0E6"/></g>`;
  return s+'</svg>';
}
function tree(x,y,sc,seed){
  let s=`<g transform="translate(${x} ${y}) scale(${sc})"><ellipse cx="0" cy="34" rx="34" ry="7" fill="#000" opacity=".14"/><path d="M-4 34L-3 6M4 34L3 6M0 34L0 -2" stroke="#6E4B2A" stroke-width="6" stroke-linecap="round"/>`;
  [[-18,-12,22],[16,-14,22],[0,-26,26],[-4,-6,24]].forEach((c,i)=>{s+=`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${i%2?'#5C9A3A':'#4F8A31'}"/>`});
  s+=`<circle cx="-8" cy="-30" r="12" fill="#8CC46A" opacity=".55"/>`;
  for(let i=0;i<7;i++){s+=`<circle cx="${(rnd(seed+i)-.5)*52}" cy="${-30+rnd(seed+i+9)*40}" r="2.6" fill="${i%3===0?'#2E2230':'#B8DA70'}"/>`}
  return s+'</g>';
}
/* simple map */
function mapSVG(){
  let s=`<svg viewBox="0 0 520 300" role="img" aria-label="نقشه‌ی تقریبی موقعیت فروشگاه در قم"><rect width="520" height="300" fill="#EAF2DC"/>`;
  s+=`<path d="M0 210C90 190 140 240 240 220C330 200 420 230 520 205V300H0Z" fill="#D8E9C0"/>`;
  [[40,0,70,300],[0,70,520,28],[210,0,36,300],[0,170,520,22],[360,0,26,300],[100,110,300,14]].forEach(r=>{s+=`<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="#fff" opacity=".85" transform="rotate(${r[0]===100?0:0})"/>`});
  for(let i=0;i<14;i++){s+=`<rect x="${30+rnd(i)*440}" y="${20+rnd(i+20)*250}" width="${26+rnd(i+5)*30}" height="${18+rnd(i+9)*22}" rx="4" fill="#CFE0B8" opacity=".9"/>`}
  s+=`<g transform="translate(246 112)"><path d="M0 0C-30 -44 -30 -74 0 -74C30 -74 30 -44 0 0Z" fill="#2F7D32"/><circle cx="0" cy="-52" r="14" fill="#fff"/><ellipse cx="0" cy="-52" rx="7" ry="5" fill="#2F7D32"/></g>`;
  s+=`<ellipse cx="246" cy="114" rx="18" ry="6" fill="#000" opacity=".15"/>`;
  return s+'</svg>';
}
const DEFS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<radialGradient id="gOliveG" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#D2E88A"/><stop offset=".45" stop-color="#80B03A"/><stop offset="1" stop-color="#3A6B1D"/></radialGradient>
<radialGradient id="gOliveB" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#85707F"/><stop offset=".5" stop-color="#34242F"/><stop offset="1" stop-color="#140C13"/></radialGradient>
<radialGradient id="gOliveP" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#B994A8"/><stop offset=".5" stop-color="#70405C"/><stop offset="1" stop-color="#34182B"/></radialGradient>
<linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE57E"/><stop offset=".5" stop-color="#F4B400"/><stop offset="1" stop-color="#B98200"/></linearGradient>
<linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#DCEBD8" stop-opacity=".22"/><stop offset=".7" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
<linearGradient id="gBrine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6EE9E" stop-opacity=".7"/><stop offset="1" stop-color="#BFD05E" stop-opacity=".85"/></linearGradient>
<linearGradient id="gBottle" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#17381C"/><stop offset=".3" stop-color="#357A3A"/><stop offset=".65" stop-color="#245A2A"/><stop offset="1" stop-color="#112B15"/></linearGradient>
<linearGradient id="gOil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7D24B"/><stop offset="1" stop-color="#8A9A16"/></linearGradient>
<linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#AEB7BD"/><stop offset=".25" stop-color="#F3F5F6"/><stop offset=".6" stop-color="#C3CBD0"/><stop offset="1" stop-color="#8B959C"/></linearGradient>
<linearGradient id="gTinLabel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3C8F40"/><stop offset="1" stop-color="#1B5222"/></linearGradient>
<linearGradient id="gLeaf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6FA83A"/><stop offset="1" stop-color="#3A7527"/></linearGradient>
<linearGradient id="gBowl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF5DA"/><stop offset="1" stop-color="#E6D29C"/></linearGradient>
<filter id="fSoft" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="4"/></filter>
</defs></svg>`;

