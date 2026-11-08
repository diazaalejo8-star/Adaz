(()=>{'use strict';
if(window.__adazExperience360)return;
window.__adazExperience360=true;
const KEY='adaz-experience-v1';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateKey=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&typeof x==='object'?x:{points:0,streak:0,lastActive:'',daily:{}}}catch{return {points:0,streak:0,lastActive:'',daily:{}}}};
let state=read();state.points=Number(state.points)||0;state.streak=Number(state.streak)||0;state.daily=state.daily&&typeof state.daily==='object'?state.daily:{};
const pages={
 dashboard:{title:'Tu día avanza con pasos pequeños',desc:'No necesitas hacerlo todo. Elige una acción, complétala y sigue con tu día.',cards:[
  ['priority','Empieza por lo importante','Revisa tus tareas y escoge una prioridad realista.','Ver mis tareas','anchor|#todayTasks'],
  ['focus','Un bloque sin distracciones','Trabaja en una sola cosa durante un tiempo definido.','Empezar enfoque','action|focus'],
  ['close','Cierra el día a tu manera','Registra qué salió bien y qué quieres ajustar mañana.','Hacer mi cierre','action|checkin']
 ]},
 routine:{title:'Tu día, paso a paso',desc:'Consulta el horario, prepara lo necesario y deja los recordatorios listos.',cards:[
  ['schedule','Mira qué sigue','Consulta los bloques de hoy y adapta el plan a tu horario real.','Ver mi horario','anchor|#routineTimeline'],
  ['reminder','Prepara un recordatorio','Deja anotada la actividad que no quieres olvidar.','Crear recordatorio','anchor|#reminderForm'],
  ['tasks','Ajusta tus tareas','Añade o cambia lo que realmente necesitas hacer hoy.','Editar mis tareas','page|dashboard']
 ]},
 business:{title:'Haz crecer Aestel con decisiones claras',desc:'Primero entiende tus números. Después elige qué acción mueve el negocio.',cards:[
  ['sale','Registra una venta o un costo','Anota solo valores reales para conocer el resultado de cada pedido.','Registrar movimiento','anchor|#businessForm'],
  ['order','Revisa tus pedidos','Comprueba anticipos, saldos y fechas de entrega.','Ver pedidos','anchor|#orderForm'],
  ['content','Prepara contenido con intención','Elige qué comunicar y qué acción esperas de quien lo vea.','Crear contenido','anchor|#contentForm']
 ]},
 training:{title:'Entrena con intención y recupérate',desc:'La técnica, la calidad de cada sesión y el descanso importan más que completar una lista.',cards:[
  ['plan','Consulta tu rutina','Abre el día correspondiente y sigue los ejercicios en el orden indicado.','Ver rutina','anchor|#adaz-strength-plan'],
  ['log','Registra tu entrenamiento','Anota lo que hiciste para reconocer patrones con el tiempo.','Registrar sesión','action|trainingLog'],
  ['wellness','Revisa cómo te encuentras','Anota sueño y energía sin convertirlo en una calificación personal.','Registrar bienestar','anchor|#wellnessForm']
 ]},
 review:{title:'Aprende de tu semana, sin juzgarte',desc:'Una revisión útil termina con un ajuste concreto, no con una lista imposible.',cards:[
  ['look','Mira lo que sí ocurrió','Revisa tus registros antes de decidir qué cambiar.','Ver mis registros','anchor|#reviewHistory'],
  ['win','Reconoce un avance','Anota algo que salió bien, aunque haya sido pequeño.','Hacer revisión','anchor|#reviewForm'],
  ['adjust','Elige un cambio posible','Ajusta horarios o carga para que la próxima semana sea más llevadera.','Ver mi ruta','page|plan']
 ]},
 library:{title:'Encuentra una guía cuando la necesites',desc:'Usa la biblioteca como apoyo. No necesitas leerlo todo para avanzar.',cards:[
  ['source','Consulta una fuente fiable','Abre el material original y guarda la referencia que te sirva.','Ver fuentes','anchor|#page-library .source-row'],
  ['study','Lleva lo aprendido a la práctica','Elige una habilidad y conviértela en una sesión concreta.','Ir a Estudio','page|academy'],
  ['plan','Hazlo sencillo','Elige solo una idea para probar esta semana.','Ver mi revisión','page|review']
 ]},
 leisure:{title:'También hay espacio para disfrutar',desc:'El descanso y la curiosidad forman parte de una vida equilibrada.',cards:[
  ['idea','Encuentra una idea','Explora una actividad creativa o algo nuevo por aprender.','Ver ideas','anchor|#leisureCatalog'],
  ['next','Cambia de plan','Pide otra sugerencia cuando la primera no te convenza.','Otra idea','action|leisureNext'],
  ['rest','Date permiso para descansar','Elige algo que disfrutes, sin convertirlo en otra obligación.','Ver la sugerencia','anchor|#leisureFeature']
 ]},
 plan:{title:'Convierte tus metas en siguientes pasos',desc:'Una meta grande se vuelve manejable cuando sabes qué hacer esta semana.',cards:[
  ['milestone','Revisa tus etapas','Mira qué hitos siguen pendientes y cuáles ya completaste.','Ver mis etapas','anchor|#roadmapList'],
  ['week','Ajusta el plan','Usa la revisión semanal para elegir prioridades realistas.','Revisar mi semana','page|review'],
  ['today','Vuelve al día de hoy','Elige una acción pequeña para empezar.','Ir a Hoy','page|dashboard']
 ]},
 integrations:{title:'Tus herramientas, conectadas con cuidado',desc:'Activa solo las conexiones que realmente necesites. Tus datos y permisos siguen bajo tu control.',cards:[
  ['jacob','Habla con JACOB','Escribe una pregunta concreta para recibir ayuda cuando la conexión esté configurada.','Preguntar a JACOB','anchor|#aiQuestion'],
  ['music','Abre tu música','Usa tu lista de Spotify sin necesidad de activar el control avanzado.','Ver Spotify','anchor|#spotifyPlaylistUrl'],
  ['privacy','Revisa tus permisos','Comprueba qué datos compartirías antes de conectar un servicio.','Ver privacidad','anchor|#aiDataConsent']
 ]},
 finance:{title:'Ten claro qué entra y qué sale',desc:'Registra movimientos reales y crea metas de ahorro sencillas.',cards:[
  ['movement','Apunta un movimiento','Registra un ingreso o un gasto para mantener tus cuentas claras.','Añadir movimiento','anchor|#pfTransactionForm'],
  ['goal','Crea una meta','Define qué quieres comprar y cuánto cuesta.','Crear una meta','anchor|#pfGoalForm'],
  ['review','Revisa tu resumen','Comprueba el disponible estimado y los movimientos anotados.','Ver mis números','anchor|#pfTransactions']
 ]}
};
const style=document.createElement('style');style.id='adaz-experience-360-style';style.textContent=`
.adaz-hub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:18px}
.adaz-hub-card{min-height:145px;text-align:left;display:flex;flex-direction:column;align-items:flex-start;gap:8px;background:linear-gradient(145deg,#182438,#101722);border:1px solid #2b3b52;border-radius:18px;padding:16px;color:#eef4fb;cursor:pointer;transition:transform .18s,border-color .18s,background .18s}
.adaz-hub-card:hover{transform:translateY(-2px);border-color:#6482ac;background:linear-gradient(145deg,#20334d,#121b29)}
.adaz-hub-card>span{width:34px;height:34px;display:grid;place-items:center;border-radius:11px;background:#263a55;color:#b9d4fb;font-size:18px}
.adaz-hub-card b{font-size:13px}.adaz-hub-card small{color:#9eacc0;font-size:11px;line-height:1.45}
.adaz-journey{--ae-accent:#9fc5ff;position:relative;margin:14px 0 18px;padding:16px;border:1px solid rgba(159,197,255,.17);border-radius:20px;background:linear-gradient(130deg,rgba(25,39,59,.96),rgba(13,19,29,.98));color:#edf3fb;overflow:hidden}
.adaz-journey:before{content:"";position:absolute;width:190px;height:190px;right:-90px;top:-120px;border-radius:50%;border:1px solid #ffffff12;box-shadow:0 0 0 26px #ffffff06,0 0 0 52px #ffffff04;pointer-events:none}
.adaz-journey-head{position:relative;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px}
.adaz-journey-kicker{font-size:9px;letter-spacing:1.5px;color:#a8caff;font-weight:900;text-transform:uppercase}
.adaz-journey h2{font-size:17px;margin:4px 0 3px;letter-spacing:-.5px;color:#f4f7fc}
.adaz-journey p{font-size:11px;line-height:1.5;color:#b5c2d3;margin:0;max-width:620px}
.adaz-journey-score{flex:0 0 auto;border:1px solid #3a4e68;background:#111d2d;border-radius:999px;padding:7px 9px;font-size:10px;color:#d8e7fb;white-space:nowrap}
.adaz-journey-score b{color:#b9d4fb}
.adaz-journey-track{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(220px,1fr);gap:9px;overflow-x:auto;padding:2px 1px 8px;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
.adaz-journey-card{scroll-snap-align:start;min-width:0;background:rgba(7,13,22,.55);border:1px solid #2d3c52;border-radius:15px;padding:12px;display:flex;flex-direction:column;gap:7px;transition:border-color .18s,background .18s}
.adaz-journey-card.is-done{border-color:#3f795e;background:rgba(24,56,44,.54)}
.adaz-journey-step{font-size:9px;letter-spacing:1px;color:#9eacc0;text-transform:uppercase;font-weight:800}
.adaz-journey-card h3{font-size:12px;margin:0;color:#f0f4fa}
.adaz-journey-card p{font-size:10px;line-height:1.45;color:#aebbd0;flex:1}
.adaz-journey-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.adaz-journey-go,.adaz-journey-done{border-radius:9px;padding:8px 10px;font-size:10px;font-weight:850;cursor:pointer}
.adaz-journey-go{background:#9fc5ff;color:#0c1727;border:1px solid #9fc5ff}
.adaz-journey-done{background:#17263a;color:#c8d6e9;border:1px solid #34465e}
.adaz-journey-done[disabled]{background:#173c2c;border-color:#356b50;color:#b4ebce;cursor:default}
.adaz-journey-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:3px}
.adaz-journey-progress{height:5px;flex:1;background:#26354a;border-radius:99px;overflow:hidden}
.adaz-journey-progress i{height:100%;display:block;background:linear-gradient(90deg,#7daeff,#c2dcff);border-radius:99px;transition:width .25s}
.adaz-journey-foot small{font-size:9px;color:#9eacc0;white-space:nowrap}
.adaz-journey button:focus-visible,.adaz-hub-card:focus-visible{outline:3px solid #c1dcff;outline-offset:3px}
@media(min-width:1000px){.adaz-journey-track{grid-auto-columns:minmax(0,1fr);overflow:visible}}
@media(max-width:820px){.adaz-hub-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.adaz-journey{padding:13px}.adaz-journey-track{grid-auto-columns:minmax(245px,82vw)}.adaz-journey-head{align-items:flex-start}}
@media(max-width:430px){.adaz-hub-card{min-height:132px;padding:13px}.adaz-journey-score{font-size:9px;padding:6px 8px}.adaz-journey h2{font-size:16px}}
`;
document.head.append(style);
function save(){try{const keys=Object.keys(state.daily).sort().slice(-45);state.daily=Object.fromEntries(keys.map(k=>[k,state.daily[k]]));localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn('ADAZ: no se pudo guardar la puntuación de actividades.',e)}}
function doneIds(page){const d=state.daily[dateKey()]||{};return Array.isArray(d[page])?d[page]:[]}
function touchStreak(){const now=dateKey();if(state.lastActive!==now){const y=new Date();y.setDate(y.getDate()-1);const yesterday=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');state.streak=state.lastActive===yesterday?state.streak+1:1;state.lastActive=now}}
function complete(page,id){const list=doneIds(page);if(list.includes(id))return;const today=state.daily[dateKey()]||(state.daily[dateKey()]={});today[page]=list.concat(id);state.points+=5;touchStreak();save();render(page);const toast=$('#toast');if(toast){toast.textContent='¡Paso completado! +5 puntos ADAZ';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}}
function cardMarkup(page,cards,completed){return cards.map((c,i)=>{const done=completed.includes(c[0]);return '<article class="adaz-journey-card '+(done?'is-done':'')+'"><div class="adaz-journey-step">PASO '+(i+1)+' · '+(done?'COMPLETADO':'A TU RITMO')+'</div><h3>'+esc(c[1])+'</h3><p>'+esc(c[2])+'</p><div class="adaz-journey-actions"><button class="adaz-journey-go" data-ae-go="'+esc(c[4])+'">'+esc(c[3])+'</button><button class="adaz-journey-done" data-ae-done="'+esc(page+'|'+c[0])+'" '+(done?'disabled':'')+'>'+(done?'✓ Hecho':'Marcar como hecho')+'</button></div></article>'}).join('')}
function render(pageId){const el=$('#ae-'+pageId);const cfg=pages[pageId];if(!el||!cfg)return;const completed=doneIds(pageId),total=cfg.cards.length;el.innerHTML='<div class="adaz-journey-head"><div><div class="adaz-journey-kicker">ADAZ · PASOS GUIADOS</div><h2>'+esc(cfg.title)+'</h2><p>'+esc(cfg.desc)+'</p></div><div class="adaz-journey-score">✦ <b>'+state.points+'</b> puntos · 🔥 '+state.streak+'</div></div><div class="adaz-journey-track">'+cardMarkup(pageId,cfg.cards,completed)+'</div><div class="adaz-journey-foot"><div class="adaz-journey-progress"><i style="width:'+(completed.length/total*100)+'%"></i></div><small>'+completed.length+' de '+total+' pasos de hoy</small></div>'}
function mount(pageId){const cfg=pages[pageId],page=$('#page-'+pageId);if(!cfg||!page||page.querySelector('.adaz-journey'))return;const section=document.createElement('section');section.className='adaz-journey';section.id='ae-'+pageId;section.setAttribute('aria-label','Pasos guiados de '+pageId);const heading=page.querySelector('.page-heading');const anchor=pageId==='dashboard'?(page.querySelector('.hero')||heading):pageId==='routine'?(page.querySelector('.routine-hero')||heading):heading;if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(section,anchor.nextSibling);else page.prepend(section);render(pageId)}
function mountAll(){Object.keys(pages).forEach(mount)}
function go(spec){const [type,target]=String(spec||'').split('|');if(type==='action'){if(target==='leisureNext'){const b=$('[data-leisure-next]');if(b)b.click();return}const b=$('[data-action="'+target+'"]');if(b)b.click();return}if(type==='page'){const b=$('[data-page="'+target+'"]');if(b)b.click();return}if(type==='anchor'){const el=$(target);if(!el)return; if(el.matches('details'))el.open=true;el.scrollIntoView({behavior:'smooth',block:'center'});const focusable=el.matches('input,select,textarea,button')?el:el.querySelector('input:not([type=hidden]),select,textarea,button');if(focusable&&typeof focusable.focus==='function')setTimeout(()=>focusable.focus({preventScroll:true}),350)}}
document.addEventListener('click',e=>{const done=e.target.closest('[data-ae-done]');if(done){const [p,id]=done.dataset.aeDone.split('|');complete(p,id);return}const g=e.target.closest('[data-ae-go]');if(g){go(g.dataset.aeGo);return}const nav=e.target.closest('[data-page]');if(nav)setTimeout(mountAll,80)});
const observer=new MutationObserver(()=>{if(!document.hidden)mountAll()});if(document.body)observer.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountAll,{once:true});else mountAll();
window.addEventListener('adaz-experience-refresh',mountAll);
})();