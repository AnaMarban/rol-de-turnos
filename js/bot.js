/* Bot TimeBlock: se ejecuta como favorito dentro de TimeBlock.
   Si lo cambias, vuelve a instalar el favorito desde la pestaña "Enviar a TimeBlock". */
window.BOT_TIMEBLOCK=function(){
var old=document.getElementById("rolbot");if(old){old.remove();return}
var MES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
var DNS=["dom","lun","mar","mié","jue","vie","sáb"];
function css(e,s){String(s||"").split(";").forEach(function(q){var i=q.indexOf(":");if(i>0)e.style.setProperty(q.slice(0,i).trim(),q.slice(i+1).trim(),"important")})}
function el(t,s,x){var e=document.createElement(t);if(s)css(e,s);if(x!=null)e.textContent=x;return e}
function txt(e){return e?(e.textContent||"").replace(/[\uE000-\uF8FF]/g,"").replace(/\s+/g," ").trim():""}
function blab(b){var l=b.querySelector(".ms-Button-label");return txt(l||b)}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
async function waitFor(fn,ms){var t=Date.now();while(Date.now()-t<(ms||6000)){var v=fn();if(v)return v;await sleep(150)}return null}
function vis(e){return !!(e&&e.getClientRects().length)}
function press(e){try{e.scrollIntoView({block:"center"})}catch(_){}["pointerdown","mousedown","pointerup","mouseup","click"].forEach(function(t){e.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window}))})}
function d(iso){var p=iso.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function largo(iso){var x=d(iso);return x.getDate()+" de "+MES[x.getMonth()]+" de "+x.getFullYear()}
function corto(iso){var x=d(iso);return DNS[x.getDay()]+" "+x.getDate()+" "+MES[x.getMonth()].slice(0,3)}

/* ---------- panel del bot ---------- */
var B=el("div","position:fixed;top:12px;left:12px;right:auto;width:420px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;z-index:2147483647;background:#fff;color:#121c2b;border:1px solid #b6c2cf;border-top:4px solid #0a3a8c;border-radius:10px;box-shadow:0 14px 40px rgba(10,30,60,.25);font:14px Segoe UI,system-ui,sans-serif;padding:14px;display:grid;gap:10px");
B.id="rolbot";
var h=el("div","display:flex;justify-content:space-between;align-items:center;gap:8px");h.appendChild(el("b","font-size:16px","Bot TimeBlock · versión 7"));
var hb=el("div","display:flex;gap:6px");var sw=el("button","border:1px solid #b6c2cf;background:#fff;border-radius:6px;padding:4px 10px;cursor:pointer","Mover ⇄");var izq=true;sw.onclick=function(){izq=!izq;css(B,izq?"left:12px;right:auto":"right:12px;left:auto")};hb.appendChild(sw);
var x=el("button","border:1px solid #b6c2cf;background:#fff;border-radius:6px;padding:4px 10px;cursor:pointer","Cerrar");x.onclick=function(){STOP=true;B.remove()};hb.appendChild(x);h.appendChild(hb);B.appendChild(h);
var ta=el("textarea","width:100%;height:54px;border:1px solid #b6c2cf;border-radius:6px;padding:6px;font:12px Consolas,monospace");ta.placeholder="Pega aquí el rol aprobado (Ctrl+V)";B.appendChild(ta);
var out=el("div","display:grid;gap:8px");B.appendChild(out);
var BTN="border:1px solid #b6c2cf;background:#fff;border-radius:6px;padding:7px 12px;cursor:pointer;font:inherit";
var PRI="border:0;background:#0a3a8c;color:#fff;border-radius:6px;padding:7px 12px;cursor:pointer;font:inherit;font-weight:600";
var STOP=false,STEPS=[],cur=0,logBox,stepBox,manual=true;

function log(m,c){if(!logBox)return;var r=el("div","font-size:12px;color:"+(c||"#475769"),m);logBox.insertBefore(r,logBox.firstChild)}

/* ---------- TimeBlock: lista de colaboradores ---------- */
function items(){return [].slice.call(document.querySelectorAll("ul.results li")).filter(function(li){return li.querySelector(".itemText")&&!B.contains(li)})}
function findLi(nom){return items().find(function(li){return txt(li.querySelector(".itemText")).indexOf("["+nom+"]")>=0})}
function nSel(){var m=[].slice.call(document.querySelectorAll(".matches div")).map(txt).join(" ").match(/(\d+)\s+seleccionad/);return m?+m[1]:items().filter(function(li){return li.classList.contains("selected")}).length}
function tipBtn(label){var hs=[].slice.call(document.querySelectorAll(".ms-TooltipHost"));for(var i=0;i<hs.length;i++){if(txt(hs[i]).indexOf(label)>=0&&!B.contains(hs[i])){var b=hs[i].querySelector("button");if(b)return b}}return null}
async function select(noms){
  var des=tipBtn("Deseleccionar todos");if(des){press(des);await sleep(400)}
  for(var i=0;i<noms.length;i++){var li=findLi(noms[i]);if(!li)return "No encontré a ["+noms[i]+"] en la lista de la izquierda.";
    var before=nSel();press(li.querySelector(".itemCheckbox")||li.querySelector(".itemText"));await sleep(300);
    if(nSel()<=before&&i>0){var t=li.querySelector(".itemText");t.dispatchEvent(new MouseEvent("click",{bubbles:true,ctrlKey:true}));await sleep(300)}}
  var n=nSel();if(n!==noms.length)return "Quedaron "+n+" seleccionados y esperaba "+noms.length+".";
  return null}

/* ---------- TimeBlock: panel de Redefinición / Justificantes ---------- */
function multiBtn(tag){var t=[].slice.call(document.querySelectorAll(".multi_tag")).find(function(e){return txt(e)===tag});if(!t)return null;
  var bs=[].slice.call(t.parentElement.querySelectorAll("button"));return bs.find(function(b){return blab(b)==="+"})||bs[0]||null}
function openPanel(re){return [].slice.call(document.querySelectorAll(".ms-Panel.is-open")).find(function(p){return re.test(txt(p.querySelector(".ms-Panel-headerText")))})}
function byLabel(panel,lab){var ls=[].slice.call(panel.querySelectorAll("label"));var l=ls.find(function(e){return txt(e)===lab});if(!l)return null;
  var n=l.nextElementSibling;while(n&&n.tagName==="LABEL")n=n.nextElementSibling;return n||l.parentElement}
function setVal(inp,v){var s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;s.call(inp,v);inp.dispatchEvent(new Event("input",{bubbles:true}));inp.dispatchEvent(new Event("change",{bubbles:true}))}
async function pick(panel,inp,want,exact){
  if(!inp)return "No encontré el campo para elegir "+want+".";
  inp.focus();press(inp);setVal(inp,want);await sleep(500);
  var opt=await waitFor(function(){var c=[].slice.call(document.querySelectorAll("li,button,div,span")).filter(function(e){return vis(e)&&!B.contains(e)&&e!==inp&&e.children.length<=2&&(exact?txt(e)===want:txt(e).indexOf(want)===0)});
    return c.length?c[c.length-1]:null},4000);
  if(!opt)return "No apareció la opción "+want+" en la lista.";
  press(opt);await sleep(500);
  if(inp.value===want||txt(panel).indexOf(want)>=0)return null;
  return "Elegí "+want+" pero no se ve reflejado en el panel."}
async function rango(panel){var s=[].slice.call(panel.querySelectorAll(".segment")).find(function(e){return txt(e)==="Por rango"});
  if(!s)return "No encontré la opción Por rango.";if(!s.classList.contains("segment_selected")){press(s);await sleep(400)}
  return s.classList.contains("segment_selected")?null:"No se pudo marcar Por rango."}
async function fecha(panel,lab,iso){
  var box=byLabel(panel,lab),f=box&&box.querySelector("[role=combobox]");if(!f)return "No encontré la fecha "+lab+".";
  var want=largo(iso);if(txt(f).indexOf(want)>=0)return null;
  press(f);await sleep(500);var x=d(iso),mes=MES[x.getMonth()],an=String(x.getFullYear()),dia=x.getDate();
  for(var k=0;k<8;k++){
    var cal=[].slice.call(document.querySelectorAll(".ms-Callout,.ms-DatePicker-callout")).filter(vis).pop();if(!cal)return "No se abrió el calendario de "+lab+".";
    var btn=[].slice.call(cal.querySelectorAll("button")).find(function(b){var a=(b.getAttribute("aria-label")||"").toLowerCase();return a.indexOf(mes)>=0&&a.indexOf(an)>=0&&new RegExp("(^|\\D)"+dia+"(\\D|$)").test(a.replace(an,""))});
    if(btn){press(btn);await sleep(500);break}
    var head=txt(cal).toLowerCase();var fwd=head.indexOf(mes)<0;
    var nav=[].slice.call(cal.querySelectorAll("button")).find(function(b){var a=(b.getAttribute("aria-label")||"").toLowerCase(),i=b.querySelector("i");var ic=i?i.getAttribute("data-icon-name"):"";
      return fwd?(/siguiente|next|posterior/.test(a)||ic==="Down"):(/anterior|previous|prev/.test(a)||ic==="Up")});
    if(!nav)break;press(nav);await sleep(400)}
  await sleep(200);return txt(f).indexOf(want)>=0?null:"No pude poner la fecha "+lab+" ("+want+")."}
/* Por día: tira de días con flechas; cada día se toca para marcarlo */
var WD=["do","lu","ma","mi","ju","vi","sá"],RD=/^(do|lu|ma|mi|ju|vi|sá|sa)\s*(\d{1,2})$/;
function isoOf(x){return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")}
function cells(panel){return [].slice.call(panel.querySelectorAll("*")).filter(function(e){return vis(e)&&RD.test(txt(e))&&![].slice.call(e.children).some(function(c){return RD.test(txt(c))})})}
function cellFor(panel,iso){var x=d(iso),w=WD[x.getDay()],n=x.getDate();return cells(panel).find(function(e){var m=txt(e).match(RD);return m&&(m[1]===w||(w==="sá"&&m[1]==="sa"))&&+m[2]===n})}
function arrowIn(panel,fwd){var cs=cells(panel);if(!cs.length)return null;var box=cs[0];
  var re=fwd?/Forward|ChevronRight|Right|siguiente|next/i:/Back|ChevronLeft|Left|anterior|prev/i;
  for(var k=0;k<6&&box;k++){box=box.parentElement;if(!box)break;
    var c=[].slice.call(box.querySelectorAll("i[data-icon-name],button,[role=button]")).filter(vis).find(function(e){var i=e.matches("i[data-icon-name]")?e:e.querySelector("i[data-icon-name]");return re.test(((i&&i.getAttribute("data-icon-name"))||"")+" "+(e.getAttribute("aria-label")||"")+" "+(e.getAttribute("title")||""))});
    if(c)return c}
  return null}
var MA=MES.map(function(m){return m.slice(0,3)});
var RS=/^[a-z]{3}\.?\s*\d{1,2}(\s*-\s*[a-z]{3}\.?\s*\d{1,2})?(\s*,\s*[a-z]{3}\.?\s*\d{1,2}(\s*-\s*[a-z]{3}\.?\s*\d{1,2})?)*$/i;
function resumen(panel){var best="";[].slice.call(panel.querySelectorAll("*")).forEach(function(e){if(!vis(e))return;var t=txt(e);if(RS.test(t)&&t.length>best.length)best=t});return best}
function fechaDe(mes,dia,ref){var x=new Date(ref.getFullYear(),MA.indexOf(mes.toLowerCase().replace(".","")),+dia);if(x-ref>15552e6)x.setFullYear(x.getFullYear()-1);else if(ref-x>15552e6)x.setFullYear(x.getFullYear()+1);return x}
function marcados(panel,ref){var out={},s=resumen(panel);if(!s)return out;
  s.split(",").forEach(function(part){var m=part.trim().match(/^([a-z]{3}\.?)\s*(\d{1,2})(?:\s*-\s*([a-z]{3}\.?)\s*(\d{1,2}))?$/i);if(!m)return;
    var a=fechaDe(m[1],m[2],ref),b=m[3]?fechaDe(m[3],m[4],ref):new Date(a);for(var t=new Date(a);t<=b;t.setDate(t.getDate()+1))out[isoOf(t)]=1});
  return out}
async function tocarDia(panel,iso){var c=cellFor(panel,iso),k=0;
  while(!c&&k<6){var f=arrowIn(panel,true);if(!f)break;press(f);await sleep(350);c=cellFor(panel,iso);k++}
  k=0;while(!c&&k<14){var r=arrowIn(panel,false);if(!r)break;press(r);await sleep(350);c=cellFor(panel,iso);k++}
  if(!c)return "No encontré el "+corto(iso)+" en la tira de días.";
  press(c);await sleep(300);return null}
async function dias(panel,del,al){
  var seg=[].slice.call(panel.querySelectorAll(".segment")).find(function(e){return txt(e)==="Por día"});
  if(seg&&!seg.classList.contains("segment_selected")){press(seg);await sleep(400)}
  var ref=d(del),want={},e;for(var t=d(del);t<=d(al);t.setDate(t.getDate()+1))want[isoOf(t)]=1;
  var have=marcados(panel,ref);
  for(var x in have)if(!want[x]){e=await tocarDia(panel,x);if(e)return e}
  for(var y in want)if(!have[y]){e=await tocarDia(panel,y);if(e)return e}
  await sleep(300);var got=marcados(panel,ref),ok=Object.keys(got).sort().join()===Object.keys(want).sort().join();
  if(ok)return null;
  var a=d(del),b=d(al),exp=MA[a.getMonth()]+" "+a.getDate()+(al!==del?"-"+MA[b.getMonth()]+" "+b.getDate():"");
  return "Las fechas quedaron como \""+(resumen(panel)||"ninguna")+"\" y esperaba \""+exp+"\". Corrígelas en el panel."}
async function closed(panel,ms){return await waitFor(function(){return !document.body.contains(panel)||!panel.classList.contains("is-open")},ms||8000)}

async function run(st){
  var e=await select(st.noms);if(e)return e;
  var tag=st.tipo==="redefinicion"?"Redefiniciones":"Justificantes";
  var b=multiBtn(tag);if(!b)return "No encontré el botón + de "+tag+" abajo a la izquierda.";
  press(b);var re=st.tipo==="redefinicion"?/Redefinici/:/Justificante/;
  var panel=await waitFor(function(){return openPanel(re)},6000);if(!panel)return "No se abrió el panel de "+tag+".";
  await sleep(400);
  if(st.tipo==="justificante"){var inp=panel.querySelector(".search_picker input");e=await pick(panel,inp,st.motivo,false);if(e)return e}
  e=await dias(panel,st.del,st.al);if(e)return e;
  if(st.tipo==="redefinicion"){var box=byLabel(panel,"Copiar de");var inp2=box&&box.querySelector("input");e=await pick(panel,inp2,st.turno,true);if(e)return e}
  var add=[].slice.call(panel.querySelectorAll("button")).find(function(b){return blab(b)==="Agregar"});if(!add)return "No encontré el botón Agregar.";
  if(manual){add.style.outline="4px solid #d81e27";add.style.outlineOffset="2px";log("Revisa el panel y toca Agregar tú.","#0a3a8c");
    if(!await closed(panel,600000))return "No se cerró el panel.";return null}
  press(add);if(!await closed(panel,8000))return "Toqué Agregar pero el panel no se cerró; revisa si TimeBlock mostró un mensaje.";
  return null}

/* ---------- pasos ---------- */
function build(j){var g={},ord=[],man=[];
  j.colaboradores.forEach(function(c){(c.acciones||[]).forEach(function(a){
    if(!a.auto){man.push(c.timeblock+": "+a.txt);return}
    var k=[a.tipo,a.turno||a.motivo,a.del,a.al].join("|");if(!g[k]){g[k]={tipo:a.tipo,turno:a.turno,motivo:a.motivo,del:a.del,al:a.al,noms:[],names:[]};ord.push(k)}
    g[k].noms.push(String(c.nomina));g[k].names.push(c.timeblock.replace(/\s*\[\d+\]$/,""))})});
  var st=ord.map(function(k){return g[k]}).sort(function(a,b){return (a.tipo===b.tipo?0:a.tipo==="redefinicion"?-1:1)||a.del.localeCompare(b.del)});
  return {st:st,man:man}}
function stepTxt(s){return (s.tipo==="redefinicion"?"Redefinición · "+s.turno:"Justificante · "+s.motivo)+" · "+corto(s.del)+(s.al!==s.del?" – "+corto(s.al):"")+" · "+s.noms.length+(s.noms.length===1?" persona":" personas")}
function render(){stepBox.textContent="";STEPS.forEach(function(s,i){var r=el("div","border-top:1px solid #d8dfe7;padding:6px 0;font-size:13px;"+(i===cur?"background:#e5ecf8;":""));
  r.appendChild(el("div","font-weight:600;color:"+(s.ok?"#2f7d4f":s.err?"#c62f2f":"#121c2b"),(s.ok?"✓ ":s.err?"✗ ":(i+1)+". ")+stepTxt(s)));
  r.appendChild(el("div","font-size:12px;color:#6b7a8b",s.names.join(", ")));if(s.err)r.appendChild(el("div","font-size:12px;color:#c62f2f",s.err));stepBox.appendChild(r)})}
async function doStep(){if(cur>=STEPS.length){log("Terminé todos los pasos.","#2f7d4f");return false}
  var s=STEPS[cur];log("Paso "+(cur+1)+": "+stepTxt(s));var e;try{e=await run(s)}catch(er){e="Error inesperado: "+(er&&er.message)}
  if(e){s.err=e;render();log("Me detuve: "+e+" Hazlo a mano y toca Saltar, o corrígelo y toca Reintentar.","#c62f2f");return false}
  s.ok=true;s.err=null;cur++;render();return true}

function load(t){out.textContent="";var j;try{j=JSON.parse(t)}catch(e){out.appendChild(el("div","color:#c62f2f","No reconozco ese texto. Copia otra vez el rol desde la página Rol de Turnos."));return}
  if(!j||j.tipo!=="rol-timeblock"){out.appendChild(el("div","color:#c62f2f","Ese texto no es un rol de turnos."));return}
  if(!j.aprobado){out.appendChild(el("div","color:#c62f2f","Este rol no está aprobado. Apruébalo primero en la página."));return}
  var miss=j.colaboradores.filter(function(c){return !findLi(c.nomina)});
  var b=build(j);STEPS=b.st;cur=0;
  out.appendChild(el("div","font-weight:600","Semana del "+corto(j.semana)+" · "+STEPS.length+" pasos para "+j.colaboradores.length+" colaboradores"));
  out.appendChild(el("div","background:"+(miss.length?"#fcefd6":"#e1f1e6")+";border-radius:6px;padding:8px;font-size:13px",miss.length?miss.length+" no aparecen en la lista de la izquierda: "+miss.map(function(c){return c.timeblock}).join(", "):"Todos los colaboradores aparecen en TimeBlock."));
  var ml=el("label","display:flex;gap:6px;align-items:center;font-size:13px");var cb=el("input");cb.type="checkbox";cb.checked=true;cb.onchange=function(){manual=cb.checked};ml.appendChild(cb);ml.appendChild(document.createTextNode("Modo prueba: el bot llena cada panel y tú tocas Agregar"));out.appendChild(ml);
  var bar=el("div","display:flex;gap:6px;flex-wrap:wrap");
  var b1=el("button",PRI,"Hacer siguiente paso"),b2=el("button",BTN,"Hacer todos"),b3=el("button",BTN,"Saltar"),b4=el("button",BTN,"Reintentar");
  var busy=false;function lock(v){busy=v;[b1,b2,b3,b4].forEach(function(z){z.disabled=v;z.style.opacity=v?.5:1})}
  b1.onclick=async function(){if(busy)return;lock(true);await doStep();lock(false)};
  b2.onclick=async function(){if(busy)return;lock(true);STOP=false;while(!STOP&&await doStep()){await sleep(600)}lock(false)};
  b3.onclick=function(){if(busy||cur>=STEPS.length)return;STEPS[cur].err="Saltado: hacerlo a mano.";cur++;render()};
  b4.onclick=b1.onclick;
  [b1,b2,b3,b4].forEach(function(z){bar.appendChild(z)});out.appendChild(bar);
  stepBox=el("div","display:grid");out.appendChild(stepBox);render();
  if(b.man.length){var m=el("div","background:#fcefd6;border-radius:6px;padding:8px;font-size:12px;display:grid;gap:3px");m.appendChild(el("b",null,"A mano ("+b.man.length+")"));b.man.forEach(function(s){m.appendChild(el("div",null,"✋ "+s))});out.appendChild(m)}
  out.appendChild(el("b","font-size:13px","Bitácora"));logBox=el("div","display:grid;gap:2px;max-height:160px;overflow:auto");out.appendChild(logBox);
}
var enTB=!!document.querySelector("ul.results .itemText")||/tb7\.azurewebsites\.net/i.test(location.hostname);
if(!enTB){ta.remove();out.appendChild(el("div","background:#fbe4e2;color:#121c2b;border-radius:6px;padding:10px;font-size:14px;line-height:1.4","Estás en otra página. El bot solo funciona dentro de TimeBlock: cambia a la pestaña de TimeBlock (cemexcementos-tb7.azurewebsites.net), con tu sesión abierta, y toca ahí el favorito Bot TimeBlock."));document.body.appendChild(B);return}
ta.addEventListener("paste",function(){setTimeout(function(){load(ta.value)},0)});
document.body.appendChild(B);ta.focus();
try{navigator.clipboard.readText().then(function(t){if(t&&t.indexOf("rol-timeblock")>=0){ta.value=t;load(t)}}).catch(function(){})}catch(e){}
};
