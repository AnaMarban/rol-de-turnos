"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const P=window.ROL_DATA; // viene de js/datos.js
const AREAS=[...new Set(P.map(p=>p.area))];
const ROT_AREAS=["ENVASE","PALETIZADORA","GRANEL"];
const MSUN={ENVASE:2,PALETIZADORA:2,GRANEL:0};
const MINS={ENVASE:{T1:3,T2:2,T3:2},PALETIZADORA:{T1:1,T2:1,T3:2},GRANEL:{T1:1,T2:1,T3:1}};
const DN=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const KINFO={T1:"Turno 1",T2:"Turno 2",T3:"Turno 3",D:"Descanso",V:"Vacaciones",INC:"Incapacidad",PER:"Permiso",CAP:"Capacitación",A:"Agregado",F:"Falta",ASU:"Asueto",SUS:"Suspensión",X:"Otro",N:"Sin dato"};
const SHORT={T1:"1",T2:"2",T3:"3",D:"D",V:"V",INC:"INC",PER:"PER",CAP:"CAP",A:"A",F:"F",ASU:"ASU",SUS:"SUS",X:"·",N:"—"};
function d2s(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function addD(s,n){const d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return d2s(d)}
function fDs(s){return +s.slice(8,10)+" "+MES[+s.slice(5,7)-1]}
const S={week:"2026-11-09",min:"2026-10-26",max:"2027-01-04",area:"",edits:{},apr:{},tab:"rol",memo:new Map()};

/* turno fijo: las últimas 4 semanas con turno en el Excel, todas iguales */
P.forEach(p=>{const wk=new Map();Object.entries(p.days).forEach(([d,c])=>{if(!/^T/.test(c[0]))return;const dt=new Date(d+"T12:00:00"),dw=(dt.getDay()+6)%7;if(dw===6)return;const m=addD(d,-dw);(wk.get(m)||wk.set(m,[]).get(m)).push(+c[0][1])});
  const ws=[...wk.keys()].sort().slice(-6).map(k=>maj(wk.get(k)));p.fixed=ws.length>=6&&ws.every(t=>t===ws[0])?ws[0]:null});
function maj(a){const c={};a.forEach(x=>c[x]=(c[x]||0)+1);let b=null;for(const k in c)if(b===null||c[k]>c[b])b=k;return b===null?null:+b}

const ROT3={3:2,2:1,1:3},ROT4={3:2,2:1,1:4,4:3},R4_AREAS=["ENVASE","MANTENIMIENTO"];
function rot(p,t){return (R4_AREAS.includes(p.area)?ROT4:ROT3)[t]||t}
const num=c=>c==="A"?4:/^T[123]$/.test(c)?+c[1]:0;
function weekTurn(p,W,depth){const ts=[];for(let i=0;i<6;i++){const v=num(cell(p,W,i,depth).c);if(v)ts.push(v)}return maj(ts)}
function weekAll(p,W,code,depth){for(let i=0;i<6;i++)if(cell(p,W,i,depth).c!==code)return false;return true}
function propTurn(p,W,depth){depth=depth||0;if(depth>25)return null;const W1=addD(W,-7);
  if(!p.fixed&&cell(p,W1,6,depth+1).c==="T3"&&weekTurn(p,W1,depth+1)!==3)return 3;
  for(let k=1;k<=12;k++){const t=weekTurn(p,addD(W,-7*k),depth+k);if(t){if(p.fixed)return p.fixed;let x=t;for(let j=0;j<k;j++)x=rot(p,x);return x}}return null}
function cell(p,W,i,depth){
  const key=p.id+"|"+W+"|"+i;if(S.memo.has(key))return S.memo.get(key);
  const day=addD(W,i);let r;
  const e=(S.edits[W]||{})[p.id];
  if(e&&e[i])r={c:e[i].c,n:e[i].n||"",src:"e"};
  else if(p.days[day])r={c:p.days[day][0],n:p.days[day][1]||"",src:"x"};
  else if(W<"2026-08-03"||(depth||0)>25)r={c:"N",n:"",src:"n"};
  else if(weekAll(p,addD(W,-7),"INC",(depth||0)+1))r={c:"INC",n:"",src:"p"};
  else{const t=propTurn(p,W,depth);if(!t)r={c:"N",n:"",src:"n"};else{const sun=isSun(p,W,t,depth);let rest=-1;
    if(sun){const peers=P.filter(q=>q.area===p.area&&!captured(q,W)&&!weekAll(q,addD(W,-7),"INC",(depth||0)+1)).filter(q=>{const tq=q===p?t:propTurn(q,W,depth);return tq&&isSun(q,W,tq,depth)});rest=peers.indexOf(p)%2===1?4:5}
    const code=t===4?"A":"T"+t;r={c:i===6?(sun?"T3":"D"):(i===rest?"D":code),n:"",src:"p"}}}
  S.memo.set(key,r);return r}
const SUN_AREAS=["ENVASE","PALETIZADORA","MANTENIMIENTO"];
function captured(p,W){for(let i=0;i<7;i++)if(p.days[addD(W,i)])return true;return false}
function isSun(p,W,t,depth){if(!SUN_AREAS.includes(p.area)||t===3||p.fixed)return false;let tn=rot(p,t);const cap=capturedTurn(p,addD(W,7));if(cap)tn=cap;return tn===3}
function capturedTurn(p,W){const e=(S.edits[W]||{})[p.id]||{},ts=[];for(let i=0;i<6;i++){const c=e[i]?e[i].c:(p.days[addD(W,i)]||[])[0];const v=c?num(c):0;if(v)ts.push(v)}return maj(ts)}
function weekCells(p,W){return DN.map((_,i)=>cell(p,W,i,0))}
function people(){return P.filter(p=>!S.area||p.area===S.area)}

/* ---------- alertas ---------- */
const H={T1:[7,15],T2:[15,23],T3:[23,31]};
function alerts(W){const out=[];
  ROT_AREAS.forEach(a=>{const ps=P.filter(p=>p.area===a);for(let i=0;i<6;i++)["T1","T2","T3"].forEach(t=>{const n=ps.filter(p=>cell(p,W,i,0).c===t).length,m=MINS[a][t],an=a[0]+a.slice(1).toLowerCase();if(!n)out.push({lvl:"bad",t:`${an}: nadie en ${KINFO[t].toLowerCase()} el ${DN[i].toLowerCase()} ${fDs(addD(W,i))}.`,a,i,turn:t});else if(n<m)out.push({lvl:"w",t:`${an}: ${n} en ${KINFO[t].toLowerCase()} el ${DN[i].toLowerCase()} ${fDs(addD(W,i))} (lo normal es ${m}).`,a,i,turn:t})});
    const ns=ps.filter(p=>cell(p,W,6,0).c==="T3").length,ms=MSUN[a],an=a[0]+a.slice(1).toLowerCase();if(ns<ms)out.push({lvl:ns?"w":"bad",t:`${an}: ${ns} para el tercer turno del domingo ${fDs(addD(W,6))} (lo normal es ${ms}).`,a,i:6,turn:"T3"})});
  P.forEach(p=>{const cs=weekCells(p,W);if(cs.every(c=>c.c==="N"))return;
    if(!cs.some(c=>/^(D|V|INC|PER|ASU|SUS)$/.test(c.c)))out.push({lvl:"bad",t:`${p.nombre}: sin día de descanso esta semana.`,p:p.id});
    const prevSun=cell(p,addD(W,-7),6,0);const seq=[prevSun,...cs];
    for(let i=1;i<seq.length;i++){const a=seq[i-1].c,b=seq[i].c;if(H[a]&&H[b]){const gap=(H[b][0]+24)-H[a][1];if(gap<=8)out.push({lvl:"w",t:`${p.nombre}: ${KINFO[a]} → ${KINFO[b]} el ${DN[i-1].toLowerCase()}, solo ${gap} h de descanso entre jornadas.`,p:p.id,i:i-1})}}});
  return out}

/* ---------- render ---------- */
function render(){S.memo.clear();
  const W=S.week,apr=!!S.apr[W];
  $("#wLbl").textContent=`${fDs(W)} – ${fDs(addD(W,6))} ${addD(W,6).slice(0,4)}`;
  $("#wPrev").disabled=W<=S.min;$("#wNext").disabled=W>=S.max;
  $("#stPill").className="state "+(apr?"apr":"prop");$("#stPill").textContent=apr?"Aprobado":"Propuesta";
  $("#bApr").hidden=apr;$("#bReopen").hidden=!apr;$("#bUp").hidden=!apr;$("#bUp2").disabled=!apr;
  const nEd=Object.values(S.edits[W]||{}).reduce((s,o)=>s+Object.keys(o).length,0);
  $$("#steps .step").forEach(s=>{const n=+s.dataset.s;s.className="step"+(apr?" done":n===1&&!nEd?" on":n===2&&nEd?" on":"")});
  const A=alerts(W);const nb=A.filter(a=>a.lvl==="bad").length;
  $("#aCnt").textContent=A.length;$("#aCnt").className="cnt"+(nb?" bad":"");
  $$("#tabs [role=tab]").forEach(b=>b.setAttribute("aria-selected",b.dataset.t===S.tab));
  $$("[data-view]").forEach(v=>v.hidden=v.id!=="v-"+S.tab);
  $("#areaChips").innerHTML=[["","Todas"],...AREAS.map(a=>[a,a[0]+a.slice(1).toLowerCase()])].map(([k,l])=>`<button type="button" class="chip" data-a="${esc(k)}" aria-pressed="${S.area===k}">${esc(l)}</button>`).join("");
  $$("#areaChips [data-a]").forEach(b=>b.onclick=()=>{S.area=b.dataset.a;render()});
  $("#legend").innerHTML=["T1","T2","T3","D","V","INC","PER","CAP","A"].map(k=>`<span><span class="sw k-${k}">${SHORT[k]}</span>${KINFO[k]}</span>`).join("");
  $("#rolBanner").innerHTML=apr?`<div class="banner ok"><b>Rol aprobado.</b> Ya se puede enviar a TimeBlock. Para cambiar algo, toca "Hacer cambios".</div>`:nb?`<div class="banner warn"><b>${nb} ${nb===1?"alerta":"alertas"} de cobertura o descanso.</b> Revísalas en "Cobertura y alertas" antes de aprobar.</div>`:"";
  const warnSet=new Set(A.filter(a=>a.p&&a.i!=null).map(a=>a.p+"|"+a.i));
  let h=`<thead><tr><th class="nm">Colaborador</th><th>Sem. ant.</th>${DN.map((d,i)=>`<th>${d}<br><span class="mono" style="font-weight:400">${fDs(addD(W,i))}</span></th>`).join("")}</tr></thead><tbody>`;
  const ps=people();let last=null;
  ps.forEach(p=>{if(p.area!==last){last=p.area;h+=`<tr class="ar"><td class="nm">${esc(p.area)}</td><td colspan="8"></td></tr>`}
    const pt=weekTurn(p,addD(W,-7),0);let pc="—";if(pt)pc="T"+pt;else{const cnt={};weekCells(p,addD(W,-7)).slice(0,6).forEach(c=>{if(c.c!=="N")cnt[c.c]=(cnt[c.c]||0)+1});const k=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];if(k)pc=SHORT[k]}
    h+=`<tr><td class="nm"><button type="button" class="who" data-p="${p.id}"><b>${esc(p.nombre)}${p.tb?'<span class="tbb y">TB</span>':'<span class="tbb n">sin TB</span>'}</b><small>${p.nom||"sin nómina"}${p.fixed?" · fijo T"+p.fixed:""}</small></button></td><td class="prev">${pc}</td>`+
      weekCells(p,W).map((c,i)=>`<td class="${warnSet.has(p.id+"|"+i)?"warnc":""}"><button type="button" class="c k-${c.c} ${c.src==="p"?"p":""} ${c.src==="e"?"e":""}" data-p="${p.id}" data-i="${i}" title="${esc(KINFO[c.c]+(c.n?" · "+c.n:""))}">${SHORT[c.c]}${c.n?`<small>${esc(c.n)}</small>`:""}</button></td>`).join("")+`</tr>`});
  $("#grid").innerHTML=h+"</tbody>";
  $$("#grid .c").forEach(b=>b.onclick=e=>openPop(b,b.dataset.p,+b.dataset.i));
  $$("#grid .who").forEach(b=>b.onclick=e=>openPop(b,b.dataset.p,null));
  renderCob(W,A);renderTB(W,apr);
  $("#fixedList").textContent="Turno fijo detectado: "+(P.filter(p=>p.fixed).map(p=>p.nombre+" (T"+p.fixed+")").join(", ")||"nadie")+".";
}
function renderCob(W,A){
  let h=`<table class="cov"><thead><tr><th style="text-align:left">Área · turno</th>${DN.map((d,i)=>`<th>${d} ${fDs(addD(W,i))}</th>`).join("")}</tr></thead><tbody>`;
  ROT_AREAS.forEach(a=>{const ps=P.filter(p=>p.area===a);["T1","T2","T3"].forEach(t=>{h+=`<tr><td class="l">${a[0]+a.slice(1).toLowerCase()} · ${t} <span class="hint">(${MINS[a][t]})</span></td>`+[0,1,2,3,4,5,6].map(i=>{const n=ps.filter(p=>cell(p,W,i,0).c===t).length;if(i===6){const m=t==="T3"?MSUN[a]:0;if(!m&&!n)return `<td class="hint">—</td>`;return `<td class="${n<m?(n?"lo":"z"):""}">${n}</td>`}return `<td class="${!n?"z":n<MINS[a][t]?"lo":""}">${n}</td>`}).join("")+"</tr>"})});
  $("#cov").innerHTML=h+"</tbody></table>";
  $("#alerts").innerHTML=A.length?A.map(a=>`<li class="${a.lvl==="w"?"w":""}"><i>${a.lvl==="w"?"!":"×"}</i><span>${esc(a.t)}</span></li>`).join(""):`<li><i style="background:var(--ok-soft);color:var(--ok)">✓</i><span>Sin alertas esta semana.</span></li>`;
}
const TBT={T1:"T01 EO 07:00-15:00",T2:"T02 EO 15:00-23:00",T3:"T03 EO 23:00-07:00",A:"T01 EO 07:00-15:00"};
const JUS={V:{m:"[VAC] Vacaciones",auto:true},INC:{m:"[ENF] Enfermedad general",auto:false,why:"pide serie y folio de la incapacidad del IMSS"},PER:{m:"[PGS] Permiso con goce de sueldo",auto:false,why:"el coordinador decide si es con goce (PGS), sin goce (PSG) o por defunción (PDE)"},CAP:{m:"[TCA] Tiempo de capacitación",auto:false,why:"pide hora de inicio y duración"},F:{m:"Falta",auto:false,why:"si fue disciplinaria va [FDI]; si no, no se pone justificante"},ASU:{m:"Asueto",auto:false,why:"revisar cómo lo maneja RH"},SUS:{m:"Suspensión",auto:false,why:"revisar con RH"},X:{m:"Otro",auto:false,why:"revisar"}};
function rng(W,a,b){return `${DN[a].toLowerCase()} ${fDs(addD(W,a))}${b>a?" – "+DN[b].toLowerCase()+" "+fDs(addD(W,b)):""}`}
function tbActions(p,W){const cs=weekCells(p,W),out=[];let i=0;
  const tc={};cs.forEach(c=>{if(TBT[c.c])tc[c.c]=(tc[c.c]||0)+1});const base=Object.keys(tc).sort((a,b)=>tc[b]-tc[a])[0]||"T1";
  while(i<7){let j=i;while(j+1<7&&cs[j+1].c===cs[i].c)j++;const c=cs[i].c,r=rng(W,i,j),del=addD(W,i),al=addD(W,j);
    if(TBT[c])out.push({auto:true,tipo:"redefinicion",del,al,turno:TBT[c],txt:`${c==="A"?"Agregado":"Redefinición"} ${r} · copiar de ${TBT[c]}`});
    else if(c==="D"){const near=(i>0&&TBT[cs[i-1].c])?cs[i-1].c:(j<6&&TBT[cs[j+1].c])?cs[j+1].c:base;out.push({auto:true,tipo:"redefinicion",del,al,turno:TBT[near]+" Desc",txt:`Descanso ${r} · copiar de ${TBT[near]} Desc`})}
    else if(JUS[c]){const J=JUS[c];out.push({auto:J.auto,tipo:J.auto?"justificante":"manual",del,al,motivo:J.m,txt:`${J.m} ${r}`+(J.auto?"":" · a mano: "+J.why)})}
    i=j+1}
  return out}
function renderTB(W,apr){
  const tb=P.filter(p=>p.tb);let nA=0,nM=0;
  $("#tbBody").innerHTML=tb.map(p=>{const R=tbActions(p,W);R.forEach(r=>r.auto?nA++:nM++);
    return `<tr><td><b>${esc(p.tb)}</b></td><td>${esc(p.area[0]+p.area.slice(1).toLowerCase())}</td><td><div class="ops">${R.map(r=>`<span class="op ${r.auto?"":"j"}">${esc(r.txt)}</span>`).join("")||'<span class="hint">sin datos</span>'}</div></td></tr>`}).join("");
  $("#tbSum").innerHTML=`<b>${tb.length}</b> colaboradores · <b>${nA}</b> movimientos que hace el bot · <b>${nM}</b> que se hacen a mano (en amarillo).`;
  $("#tbBanner").innerHTML=apr?`<div class="banner ok"><b>Listo para subir.</b> Toca "Subir a TimeBlock" y luego el favorito Bot TimeBlock dentro de TimeBlock.</div>`:`<div class="banner warn"><b>Falta aprobar el rol.</b> Esta es la vista previa de lo que se mandaría; "Subir a TimeBlock" se activa al aprobar.</div>`;
  $("#bBot").disabled=!apr;
  const no=P.filter(p=>!p.tb);
  $("#noTb").innerHTML=`<h2>No están en TimeBlock</h2><p class="sub" style="margin:0">Aparecen en el Excel del rol pero no en la lista de TimeBlock de este usuario, así que no se mandan: ${no.map(p=>esc(p.nombre)+" ("+esc(p.area.toLowerCase())+")").join(", ")}.</p>`;
}

/* ---------- edición ---------- */
const OPTS=["T1","T2","T3","D","V","INC","PER","CAP","A","F"];
let popCtx=null;
function openPop(anchor,pid,i){
  if(S.apr[S.week])return toast("El rol está aprobado. Toca \"Hacer cambios\" para editar.");
  const p=P.find(x=>x.id===pid);popCtx={pid,i};const pop=$("#pop");
  const whole=i===null;
  pop.innerHTML=`<h3 id="popT">${esc(p.nombre)}<div class="sub" style="font-family:var(--font-b);font-weight:400">${whole?"Toda la semana":DN[i]+" "+fDs(addD(S.week,i))}</div></h3>
    <div class="opts">${OPTS.map(k=>`<button type="button" class="k-${k}" data-k="${k}">${KINFO[k]}</button>`).join("")}</div>
    <label><input type="checkbox" id="popAll" ${whole?"checked":""}> Aplicar de lunes a sábado</label>
    <div class="row"><button type="button" id="popReset">Volver a la propuesta</button><button type="button" id="popX">Cerrar</button></div>`;
  pop.hidden=false;
  const r=anchor.getBoundingClientRect(),pw=pop.offsetWidth,ph=pop.offsetHeight;
  let x=Math.min(Math.max(12,r.left),window.innerWidth-pw-12),y=r.bottom+6;if(y+ph>window.innerHeight-12)y=Math.max(12,r.top-ph-6);
  pop.style.left=x+"px";pop.style.top=y+"px";
  $$("#pop [data-k]").forEach(b=>b.onclick=()=>{setCode(pid,$("#popAll").checked?[0,1,2,3,4,5]:[i],b.dataset.k);closePop()});
  $("#popReset").onclick=()=>{const e=(S.edits[S.week]||{})[pid];if(e){if(whole||$("#popAll").checked)delete S.edits[S.week][pid];else delete e[i]}closePop();render()};
  $("#popX").onclick=closePop;$("#pop [data-k]").focus();
}
function closePop(){$("#pop").hidden=true;popCtx=null}
function setCode(pid,idx,k){const W=S.week;S.edits[W]=S.edits[W]||{};const e=S.edits[W][pid]=S.edits[W][pid]||{};idx.forEach(i=>{if(i!==null&&i!==undefined)e[i]={c:k}});render();toast("Cambio marcado.")}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#pop").hidden)closePop()});
document.addEventListener("click",e=>{if(!$("#pop").hidden&&!e.target.closest("#pop")&&!e.target.closest(".c")&&!e.target.closest(".who"))closePop()});

/* ---------- acciones ---------- */
$("#wPrev").onclick=()=>{S.week=addD(S.week,-7);closePop();render()};
$("#wNext").onclick=()=>{S.week=addD(S.week,7);closePop();render()};
$$("#tabs [role=tab]").forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;closePop();render()});
$("#bApr").onclick=()=>{const nb=alerts(S.week).filter(a=>a.lvl==="bad").length;
  if(nb&&!S.confirm){S.confirm=true;toast(`Hay ${nb} alertas. Toca "Aprobar rol" otra vez para aprobar de todos modos.`);setTimeout(()=>S.confirm=false,6000);return}
  S.confirm=false;S.apr[S.week]={ts:Date.now()};closePop();render();toast("Rol aprobado.")};
$("#bReopen").onclick=()=>{delete S.apr[S.week];render()};
let DL=null;
async function saveFile(name,buf,type){
  if(DL){try{const r=await DL.save({filename:name,data:buf});if(r&&r.status==="saved")toast("Archivo descargado.");return}catch(e){if(e&&e.code!=="unavailable"){toast("No se descargó el archivo.");return}}}
  try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([buf],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}catch(e){toast("La descarga no está disponible en esta vista.")}}
$("#bXls").onclick=()=>{if(typeof XLSX==="undefined")return toast("No se pudo cargar la librería de Excel.");
  const W=S.week,head=["Área","# Nómina","Nombre del Técnico",...DN.map((d,i)=>d+" "+fDs(addD(W,i)))];
  const rows=[head];let last=null;P.forEach(p=>{rows.push([p.area!==last?p.area:"",p.nom||"",p.nombre,...weekCells(p,W).map(c=>/^T/.test(c.c)?c.c[1]+(c.n?" "+c.n:""):c.c==="N"?"":c.c==="X"?c.n:c.c)]);last=p.area});
  const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet(rows);ws["!cols"]=[{wch:14},{wch:10},{wch:34},...DN.map(()=>({wch:11}))];
  XLSX.utils.book_append_sheet(wb,ws,"Rol "+W);saveFile(`Rol_turnos_${W}.xlsx`,XLSX.write(wb,{bookType:"xlsx",type:"array"}),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")};
function botPlan(){const W=S.week;return {tipo:"rol-timeblock",version:1,semana:W,aprobado:S.apr[W]?new Date(S.apr[W].ts).toISOString():null,
    colaboradores:P.filter(p=>p.tb).map(p=>({timeblock:p.tb,nomina:p.nom,area:p.area,acciones:tbActions(p,W),dias:weekCells(p,W).map((c,i)=>({fecha:addD(W,i),codigo:c.c,nota:c.n||""}))}))}}
async function copyText(s){try{await navigator.clipboard.writeText(s);return true}catch(e){return false}}
async function upload(){if(!S.apr[S.week])return toast("Primero aprueba el rol.");const ok=await copyText(JSON.stringify(botPlan()));
  if(ok)toast("Rol copiado. Ahora cambia a la pestaña de TimeBlock y toca ahí el favorito Bot TimeBlock (no en esta página).");else{toast("No se pudo copiar solo: se descargará el archivo.");$("#bBot").click()}}
$("#bUp").onclick=upload;$("#bUp2").onclick=upload;
const BOT="javascript:"+encodeURIComponent("("+window.BOT_TIMEBLOCK.toString()+")()"); // viene de js/bot.js
$("#botLink").href=BOT;$("#botLink").onclick=e=>{e.preventDefault();toast("Arrástralo a la barra de favoritos; desde aquí no se ejecuta.")};
$("#bBotCopy").onclick=async()=>{toast(await copyText(BOT)?"Código copiado. Crea un favorito y pégalo en la dirección.":"No se pudo copiar.")};
$("#bBot").onclick=()=>{const W=S.week;
  const out={tipo:"rol-timeblock",version:1,semana:W,aprobado:S.apr[W]?new Date(S.apr[W].ts).toISOString():null,
    colaboradores:P.filter(p=>p.tb).map(p=>({timeblock:p.tb,nomina:p.nom,area:p.area,dias:weekCells(p,W).map((c,i)=>({fecha:addD(W,i),codigo:c.c,nota:c.n||""}))}))};
  saveFile(`TimeBlock_rol_${W}.json`,new TextEncoder().encode(JSON.stringify(out,null,1)),"application/json")};
function toast(t){const el=$("#toast");el.textContent=t;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,4000)}

render();
(async function(){const use=n=>window.claude&&window.claude.use?window.claude.use(n).catch(()=>null):Promise.resolve(null);DL=await use("downloads")})();
