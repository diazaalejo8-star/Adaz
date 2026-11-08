(()=>{'use strict';
const page=document.querySelector('#page-academy');
if(!page||window.__adazAcademyCompact)return;
window.__adazAcademyCompact=true;
const KEY='adaz-learning-flow-v1',LEGACY='adaz-academy-v1';
const $=(s,r=page)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const plusDays=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&typeof v==='object'?v:fallback}catch{return fallback}};
const legacy=read(LEGACY,{});
let store=read(KEY,{track:'icfes',xp:Number(legacy.xp)||0,streak:Number(legacy.streak)||0,last:legacy.last||'',subjects:{},history:[],active:null});
store.track=store.track==='ielts'?'ielts':'icfes';
store.subjects=store.subjects&&typeof store.subjects==='object'?store.subjects:{};
store.history=Array.isArray(store.history)?store.history:[];
store.xp=Number(store.xp)||0;store.streak=Number(store.streak)||0;store.last=store.last||'';
const urls={
 icfesHub:'https://www.icfes.gov.co/caja-de-herramientas-saber-11/practica/',
 icfesGuide:'https://www.icfes.gov.co/evaluaciones-icfes/saber-11/guia-de-orientacion-examen-saber-11/',
 ieltsSamples:'https://www.ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test',
 ieltsListening:'https://demo-ielts.inspera.com/player/?assessmentRunId=131012334&context=exam',
 ieltsReading:'https://demo-ielts.inspera.com/player/?assessmentRunId=131013388&context=exam',
 ieltsWriting:'https://demo-ielts.inspera.com/player/?assessmentRunId=131013741&context=exam'
};
const tracks={
 icfes:[
  {id:'lectura',title:'Lectura crítica',desc:'Interpretar, inferir y evaluar textos.',skill:'Lectura Crítica',url:'https://www.icfes.gov.co/wp-content/uploads/2026/10/09-Sept-cuadernillo-preguntas-lectura-critica-saber-11-2026.pdf',hint:'Cuadernillo ICFES 2026 · respuestas y orientaciones al final.'},
  {id:'matematicas',title:'Matemáticas',desc:'Resolver situaciones con datos, modelos y razonamiento.',skill:'Matemáticas',url:'https://www.icfes.gov.co/wp-content/uploads/2026/04/09-Marzo_Cuadernillo-de-Preguntas-Matematicas-Saber-11-2026.pdf',hint:'Cuadernillo ICFES 2026 · revisa la clave al final.'},
  {id:'sociales',title:'Sociales y ciudadanas',desc:'Contrastar fuentes, perspectivas y problemas sociales.',skill:'Sociales y Ciudadanas',url:'https://icfes.acendra.com.co/wp-content/uploads/2024/12/06_PRACTICA_SOCIALES.pdf',hint:'Material de práctica enlazado desde la Caja de Herramientas ICFES.'},
  {id:'ciencias',title:'Ciencias naturales',desc:'Interpretar fenómenos, variables y evidencia científica.',skill:'Ciencias Naturales',url:'https://www.icfes.gov.co/wp-content/uploads/2026/03/24-feb-cuadernillo-preguntas-ciencias-naturales-saber-11-2026.pdf',hint:'Cuadernillo ICFES 2026 · revisa la clave al final.'},
  {id:'ingles',title:'Inglés',desc:'Comprender textos, situaciones y mensajes en contexto.',skill:'Inglés ICFES',url:'https://www.icfes.gov.co/wp-content/uploads/2025/12/16-octubre-cuadernillo-ingles-saber-11-2024.pdf',hint:'Cuadernillo de práctica publicado por el ICFES.'}
 ],
 ielts:[
  {id:'listening',title:'Listening',desc:'Comprender conversaciones, monólogos y detalles.',skill:'Listening',url:urls.ieltsListening,resource:urls.ieltsSamples,kind:'web',time:'30 min',hint:'Prueba de muestra oficial en formato web. La demo puede no estar cronometrada.'},
  {id:'reading',title:'Academic Reading',desc:'Encontrar evidencia, interpretar ideas y reconocer paráfrasis.',skill:'Reading',url:urls.ieltsReading,resource:urls.ieltsSamples,kind:'web',time:'60 min',hint:'Muestra oficial de Academic Reading. La demo puede no estar cronometrada.'},
  {id:'writing',title:'Academic Writing',desc:'Describir información y desarrollar argumentos con claridad.',skill:'Writing',url:urls.ieltsWriting,resource:urls.ieltsSamples,kind:'web',time:'60 min',hint:'Muestra oficial de Academic Writing con dos tareas.'},
  {id:'speaking',title:'Speaking',desc:'Desarrollar respuestas claras y sostener una conversación.',skill:'Speaking',url:urls.ieltsSamples,resource:urls.ieltsSamples,kind:'guide',time:'11–14 min',hint:'Muestras oficiales y ejemplos para familiarizarte con las tres partes.'}
 ]
};
const css=document.createElement('style');
css.id='adaz-academy-compact-style';
css.textContent=[
'#page-study #studyMaterial{display:none!important}',
'#page-academy{--ac-bg:#0b1220;--ac-card:#121e2e;--ac-soft:#17263a;--ac-border:#2a3d55;--ac-text:#edf3fb;--ac-muted:#a7b5c8;--ac-accent:#b7f36b}',
'#page-academy .ac-wrap{max-width:880px;margin:0 auto}',
'#page-academy .ac-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin:4px 0 15px}',
'#page-academy .ac-kicker{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ac-accent);font-weight:900}',
'#page-academy .ac-head h1{margin:4px 0 2px;font-size:clamp(25px,4vw,33px);letter-spacing:-1px;color:var(--ac-text)}',
'#page-academy .ac-head p{margin:4px 0 0;color:var(--ac-muted);font-size:11px}',
'#page-academy .ac-stats{display:flex;align-items:center;gap:7px;flex-wrap:wrap}',
'#page-academy .ac-stat{border:1px solid var(--ac-border);background:var(--ac-card);padding:7px 10px;border-radius:999px;color:var(--ac-muted);font-size:10px;white-space:nowrap}',
'#page-academy .ac-stat b{color:var(--ac-text)}',
'#page-academy .ac-switch{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;background:#0a1422;border:1px solid var(--ac-border);border-radius:13px;margin:12px 0}',
'#page-academy .ac-switch button{border:0;background:transparent;color:var(--ac-muted);padding:9px;border-radius:9px;font-size:11px;font-weight:850}',
'#page-academy .ac-switch button.active{background:#24364d;color:#fff;box-shadow:0 1px 5px #0004}',
'#page-academy .ac-next{background:linear-gradient(125deg,#17283e,#111d2d);border:1px solid #344a64;border-radius:18px;padding:17px;margin:12px 0}',
'#page-academy .ac-next h2{font-size:18px;margin:5px 0 5px;letter-spacing:-.5px;color:var(--ac-text)}',
'#page-academy .ac-next p{margin:0;color:var(--ac-muted);font-size:11px;line-height:1.55}',
'#page-academy .ac-primary{display:inline-flex;align-items:center;justify-content:center;gap:7px;margin-top:13px;background:var(--ac-accent);color:#101827;border:0;border-radius:11px;padding:11px 15px;font-size:11px;font-weight:900;cursor:pointer}',
'#page-academy .ac-primary:disabled{opacity:.5}',
'#page-academy .ac-sectionline{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:19px 1px 8px}',
'#page-academy .ac-sectionline b{font-size:11px;color:var(--ac-text)}',
'#page-academy .ac-sectionline span{font-size:9px;color:var(--ac-muted)}',
'#page-academy .ac-progress{height:5px;border-radius:99px;background:#26364b;overflow:hidden;margin:10px 0 0}',
'#page-academy .ac-progress i{display:block;height:100%;background:var(--ac-accent);border-radius:99px}',
'#page-academy .ac-list{display:grid;gap:6px}',
'#page-academy .ac-row{display:grid;grid-template-columns:31px minmax(0,1fr) auto;align-items:center;gap:10px;width:100%;text-align:left;background:var(--ac-card);border:1px solid var(--ac-border);border-radius:13px;padding:10px 11px;color:var(--ac-text);cursor:pointer}',
'#page-academy .ac-num{width:29px;height:29px;border-radius:9px;background:var(--ac-soft);display:grid;place-items:center;color:#c5d7ee;font-size:10px;font-weight:900}',
'#page-academy .ac-row.done .ac-num{background:#254331;color:#b7f36b}',
'#page-academy .ac-row h3{font-size:11px;margin:0 0 3px;font-weight:850}',
'#page-academy .ac-row p{font-size:9px;line-height:1.4;color:var(--ac-muted);margin:0}',
'#page-academy .ac-row .ac-state{font-size:9px;color:var(--ac-muted);white-space:nowrap}',
'#page-academy .ac-foot{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 2px}',
'#page-academy .ac-quiet{border:1px solid var(--ac-border);background:transparent;color:#cbd6e5;border-radius:10px;padding:9px 11px;font-size:10px;font-weight:800;cursor:pointer}',
'#page-academy .ac-panel{background:var(--ac-card);border:1px solid var(--ac-border);border-radius:16px;padding:15px;margin:10px 0}',
'#page-academy .ac-panel h2{font-size:19px;margin:4px 0 6px;letter-spacing:-.5px;color:var(--ac-text)}',
'#page-academy .ac-panel h3{font-size:12px;margin:0 0 7px;color:var(--ac-text)}',
'#page-academy .ac-panel p,#page-academy .ac-panel li{font-size:10px;line-height:1.6;color:#bdc9d9}',
'#page-academy .ac-panel ul{margin:6px 0;padding-left:18px}',
'#page-academy .ac-toolbar{display:flex;justify-content:space-between;align-items:center;gap:9px;margin:0 0 12px}',
'#page-academy .ac-back{border:1px solid var(--ac-border);background:var(--ac-card);color:var(--ac-text);border-radius:10px;padding:8px 10px;font-size:10px;font-weight:800;cursor:pointer}',
'#page-academy .ac-note{font-size:9px;line-height:1.55;color:var(--ac-muted);margin:10px 1px}',
'#page-academy .ac-link{display:inline-flex;align-items:center;justify-content:center;background:#1a2b40;border:1px solid #364c65;color:#d9e8fa;border-radius:10px;padding:10px 12px;font-size:10px;font-weight:850;text-decoration:none}',
'#page-academy .ac-link.primary{background:var(--ac-accent);border-color:var(--ac-accent);color:#101827}',
'#page-academy .ac-links{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}',
'#page-academy .ac-field{display:grid;gap:5px;margin:11px 0}',
'#page-academy .ac-field label{font-size:9px;color:var(--ac-muted);font-weight:800}',
'#page-academy .ac-field select,#page-academy .ac-field input,#page-academy .ac-field textarea{width:100%;background:#0d1726;color:var(--ac-text);border:1px solid #354962;border-radius:10px;padding:10px;font:inherit;font-size:11px}',
'#page-academy .ac-examhead{display:flex;justify-content:space-between;align-items:center;gap:10px;position:sticky;top:61px;z-index:8;background:#0b1220f2;border-bottom:1px solid var(--ac-border);padding:9px 0}',
'#page-academy .ac-clock{font-variant-numeric:tabular-nums;font-size:11px;color:var(--ac-accent);font-weight:900}',
'#page-academy .ac-qgrid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:5px;margin:10px 0}',
'#page-academy .ac-qnum{border:1px solid #354a63;background:#101c2b;color:#c4d2e4;border-radius:8px;min-height:32px;font-size:9px;font-weight:850;cursor:pointer}',
'#page-academy .ac-qnum.active{border-color:var(--ac-accent);color:var(--ac-accent)}',
'#page-academy .ac-qnum.answered{background:#233f32;color:#d9f7e3;border-color:#46785a}',
'#page-academy .ac-qnum.flagged:after{content:" •";color:#ffd27d}',
'#page-academy .ac-qtitle{font-size:18px;margin:13px 0 5px;color:var(--ac-text)}',
'#page-academy .ac-options{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:13px 0}',
'#page-academy .ac-option{background:#101c2b;border:1px solid #354a63;border-radius:11px;padding:12px 6px;color:#d8e4f4;font-weight:900;font-size:11px;cursor:pointer}',
'#page-academy .ac-option.selected{background:#2c4735;border-color:var(--ac-accent);color:#e7ffd0}',
'#page-academy .ac-examnav{display:flex;justify-content:space-between;gap:8px;margin:12px 0}',
'#page-academy .ac-examnav button{flex:1}',
'#page-academy .ac-review{border:1px solid #5b4b31;background:#292316;color:#f3d69d;border-radius:10px;padding:9px 11px;font-size:10px;font-weight:800;cursor:pointer}',
'#page-academy .ac-success{background:#122a20;border:1px solid #2f6b50;border-radius:13px;padding:12px;color:#d5f6e3;font-size:10px;line-height:1.5}',
'#page-academy .ac-meter{display:flex;justify-content:space-between;gap:8px;font-size:9px;color:var(--ac-muted)}',
'#page-academy .ac-empty{border:1px dashed var(--ac-border);border-radius:12px;padding:13px;color:var(--ac-muted);font-size:10px}',
'#page-academy .ac-mini{font-size:9px;color:var(--ac-muted);line-height:1.5}',
'#page-academy .ac-resultgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
'@media(max-width:560px){#page-academy .ac-head{flex-direction:column}#page-academy .ac-stats{width:100%}#page-academy .ac-row{grid-template-columns:29px minmax(0,1fr) auto;padding:9px}#page-academy .ac-qgrid{grid-template-columns:repeat(5,minmax(0,1fr))}#page-academy .ac-panel{padding:13px}}'
].join('');
if(!document.getElementById(css.id))document.head.append(css);
function persist(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){console.warn('ADAZ Academy: no se pudo guardar el progreso.',e)}}
function findTopic(track,id){return (tracks[track]||[]).find(x=>x.id===id)}
function keyFor(track,id){return track+':'+id}
function stats(){const count=Object.keys(store.subjects).filter(k=>store.subjects[k]&&store.subjects[k].sessions>0).length;return count}
function dueTopics(){const due=[];Object.keys(store.subjects).forEach(k=>{const v=store.subjects[k];if(v&&v.nextReview&&v.nextReview<=today()){const parts=k.split(':');const t=findTopic(parts[0],parts.slice(1).join(':'));if(t)due.push({track:parts[0],topic:t})}});return due}
function progressFor(track,id){return store.subjects[keyFor(track,id)]||{sessions:0,lastScore:null,nextReview:null}}
function updateStreak(){const t=today();if(store.last!==t){const y=new Date();y.setDate(y.getDate()-1);const yesterday=y.toISOString().slice(0,10);store.streak=store.last===yesterday?store.streak+1:1;store.last=t}}
function titleTrack(t){return t==='icfes'?'Saber 11':'IELTS Academic'}
function home(){
 const track=store.track,items=tracks[track],due=dueTopics(),active=store.active;
 const completed=items.filter(x=>progressFor(track,x.id).sessions>0).length;
 const pct=Math.round(completed/items.length*100);
 const next=due.find(x=>x.track===track)?.topic||items.find(x=>progressFor(track,x.id).sessions===0)||items[0];
 page.innerHTML='<div class="ac-wrap">'+
 '<div class="ac-head"><div><div class="ac-kicker">ADAZ · ACADEMY</div><h1>Tu ruta</h1><p>Una lección breve. Un avance medible.</p></div><div class="ac-stats"><span class="ac-stat">🔥 <b>'+store.streak+'</b> días</span><span class="ac-stat">✦ <b>'+store.xp+'</b> XP</span></div></div>'+
 '<div class="ac-switch"><button data-track="icfes" class="'+(track==='icfes'?'active':'')+'">Saber 11</button><button data-track="ielts" class="'+(track==='ielts'?'active':'')+'">IELTS Academic</button></div>'+
 (active?'<section class="ac-next"><div class="ac-kicker">SESIÓN EN CURSO</div><h2>'+esc((findTopic(active.track,active.topicId)||{}).title||'Práctica')+'</h2><p>Tu sesión quedó guardada en este dispositivo.</p><button class="ac-primary" data-resume>Continuar sesión →</button></section>':'<section class="ac-next"><div class="ac-kicker">'+(due.some(x=>x.track===track)?'REPASO RECOMENDADO':'SIGUIENTE PASO')+'</div><h2>'+(due.find(x=>x.track===track)?'Repasa '+esc(next.title):'Continúa con '+esc(next.title))+'</h2><p>'+esc(next.desc)+' · 15–25 min de práctica orientativa.</p><button class="ac-primary" data-topic="'+track+':'+next.id+'">Continuar →</button></section>')+
 '<div class="ac-sectionline"><b>Tu progreso en '+titleTrack(track)+'</b><span>'+completed+'/'+items.length+' áreas · '+pct+'%</span></div><div class="ac-progress"><i style="width:'+pct+'%"></i></div>'+
 '<div class="ac-list" style="margin-top:9px">'+items.map((x,i)=>{const p=progressFor(track,x.id);return '<button class="ac-row '+(p.sessions?'done':'')+'" data-topic="'+track+':'+x.id+'"><span class="ac-num">'+(p.sessions?'✓':String(i+1).padStart(2,'0'))+'</span><span><h3>'+esc(x.title)+'</h3><p>'+esc(x.desc)+'</p></span><span class="ac-state">'+(p.nextReview&&p.nextReview<=today()?'Repasar':p.sessions?'Repetir':'Empezar')+' ›</span></button>'}).join('')+'</div>'+
 '<div class="ac-foot">'+(due.length?'<button class="ac-quiet" data-review-list>↻ Repasar '+due.length+' pendiente(s)</button>':'<span class="ac-mini">Los repasos aparecerán aquí cuando registres tus resultados.</span>')+'<button class="ac-quiet" data-history>Ver actividad</button></div>'+
 '<p class="ac-note">El material de examen enlaza directamente a fuentes oficiales. ADAZ no inventa preguntas ni presenta ejercicios propios como oficiales.</p></div>';
}
function toolbar(label){return '<div class="ac-toolbar"><button class="ac-back" data-home>← Ruta</button><span class="ac-kicker">'+esc(label)+'</span></div>'}
function topicView(track,id){
 const t=findTopic(track,id);if(!t){home();return}
 const isI=track==='icfes',p=progressFor(track,id);
 const resource=isI?'<a class="ac-link primary" href="'+t.url+'" target="_blank" rel="noopener">Abrir cuadernillo oficial ↗</a><a class="ac-link" href="'+urls.icfesHub+'" target="_blank" rel="noopener">Explicaciones y más preguntas ↗</a><a class="ac-link" href="'+urls.icfesGuide+'" target="_blank" rel="noopener">Guía Saber 11 2026 ↗</a>':'<a class="ac-link primary" href="'+t.url+'" target="_blank" rel="noopener">'+(t.kind==='guide'?'Abrir muestras oficiales ↗':'Abrir prueba de muestra ↗')+'</a><a class="ac-link" href="'+urls.ieltsSamples+'" target="_blank" rel="noopener">Todas las muestras y claves ↗</a>';
 const links=isI?'<div class="ac-note">'+esc(t.hint)+' El cuadernillo se abre en otra pestaña; ADAZ funciona como hoja de respuestas digital.</div>':'<div class="ac-note">'+esc(t.hint)+' El demo oficial sirve para conocer la interfaz y puede tener funciones distintas a la prueba real.</div>';
 page.innerHTML='<div class="ac-wrap">'+toolbar(isI?'SABER 11':'IELTS ACADEMIC')+
 '<section class="ac-panel"><div class="ac-kicker">UNIDAD · '+(isI?'ICFES':'IELTS')+'</div><h2>'+esc(t.title)+'</h2><p>'+esc(t.desc)+'</p><div class="ac-stats"><span class="ac-stat">'+(p.sessions||0)+' sesiones</span><span class="ac-stat">'+(p.lastScore===null||p.lastScore===undefined?'Sin resultado':'Último resultado '+p.lastScore+'%')+'</span></div></section>'+
 '<section class="ac-panel"><h3>Material oficial</h3><div class="ac-links">'+resource+'</div>'+links+'</section>'+
 (isI?'<section class="ac-panel"><h3>Hoja de respuestas ADAZ</h3><p>Abre el cuadernillo oficial y registra aquí las alternativas que elijas. Al terminar, compara con la clave del documento.</p><div class="ac-field"><label for="ac-count">Número de preguntas de este bloque</label><select id="ac-count"><option value="10">10 preguntas · sesión corta</option><option value="20">20 preguntas · sesión media</option><option value="30">30 preguntas · sesión larga</option><option value="40">40 preguntas</option><option value="50">50 preguntas</option></select></div><button class="ac-primary" data-start-icfes="'+id+'">Comenzar práctica →</button></section>':'<section class="ac-panel"><h3>Práctica en formato de examen</h3><p>Elige la muestra oficial. Al terminar, vuelve a ADAZ y registra el resultado para programar el siguiente repaso.</p><div class="ac-links"><button class="ac-primary" data-start-ielts="'+id+'">Comenzar práctica oficial →</button></div></section>')+
 '<section class="ac-panel"><h3>En qué fijarte</h3><ul>'+(isI?['Resuelve primero sin mirar la clave.','Marca cada respuesta en la hoja digital.','Al final, compara tus respuestas con la clave del cuadernillo.','Registra el tipo de error que más se repitió.']:t.id==='writing'?['Responde todos los puntos de la consigna.','Organiza las ideas en párrafos claros.','Revisa coherencia, vocabulario y gramática.']:t.id==='speaking'?['Responde con desarrollo, no con frases memorizadas.','Explica, ejemplifica y conecta tus ideas.','Evalúa fluidez, vocabulario, gramática y pronunciación.']:['Sigue las instrucciones y el límite de palabras.','Responde antes de consultar las claves.','Revisa cada error y localiza la evidencia.']).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section></div>';
}
function openOfficial(url){try{return window.open(url,'_blank','noopener')}catch(e){return null}}
function startIcfes(id){
 const t=findTopic('icfes',id),count=Math.max(1,Math.min(60,Number($('#ac-count')?.value)||10));
 if(!t)return;
 openOfficial(t.url);
 store.active={program:'ICFES',track:'icfes',topicId:id,count:count,answers:{},flagged:[],startedAt:Date.now(),sourceUrl:t.url};
 persist();examView();
}
function startIelts(id){
 const t=findTopic('ielts',id);if(!t)return;
 openOfficial(t.url);
 store.active={program:'IELTS',track:'ielts',topicId:id,count:0,answers:{},flagged:[],startedAt:Date.now(),sourceUrl:t.url};
 persist();ieltsSessionView();
}
let tick=null;
function stopTick(){if(tick){clearInterval(tick);tick=null}}
function elapsed(start){const sec=Math.max(0,Math.floor((Date.now()-Number(start||Date.now()))/1000));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function examView(){
 stopTick();const a=store.active;if(!a){home();return}
 const t=findTopic('icfes',a.topicId);if(!t){store.active=null;persist();home();return}
 const n=Number(a.current||1),answered=Object.keys(a.answers||{}).length,percent=Math.round(answered/a.count*100);
 page.innerHTML='<div class="ac-wrap">'+
 '<div class="ac-examhead"><button class="ac-back" data-home>← Salir</button><div><div class="ac-kicker">SABER 11 · '+esc(t.title.toUpperCase())+'</div><div class="ac-mini">Hoja de respuestas digital</div></div><span class="ac-clock" id="ac-clock">'+elapsed(a.startedAt)+'</span></div>'+
 '<div class="ac-meter"><span>'+answered+' de '+a.count+' respondidas</span><span>'+percent+'%</span></div><div class="ac-progress"><i style="width:'+percent+'%"></i></div>'+
 '<section class="ac-panel"><div class="ac-toolbar"><h3 style="margin:0">Navegación</h3><span class="ac-mini">Toca un número para ir a esa pregunta</span></div><div class="ac-qgrid">'+Array.from({length:a.count},(_,i)=>{const q=i+1,cl=(q===n?'active ':'')+(a.answers[q]?'answered ':'')+((a.flagged||[]).includes(q)?'flagged':'');return '<button class="ac-qnum '+cl+'" data-q="'+q+'">'+q+'</button>'}).join('')+'</div></section>'+
 '<section class="ac-panel"><div class="ac-kicker">PREGUNTA '+n+' / '+a.count+'</div><h2 class="ac-qtitle">Selecciona tu respuesta</h2><p>El enunciado y las opciones están en el cuadernillo oficial que abriste. Marca aquí la alternativa que elegiste.</p><div class="ac-options">'+['A','B','C','D'].map(x=>'<button class="ac-option '+(a.answers[n]===x?'selected':'')+'" data-answer="'+x+'">'+x+'</button>').join('')+'</div><button class="ac-review" data-flag>'+(a.flagged.includes(n)?'★ Marcada para revisar':'☆ Marcar para revisar')+'</button></section>'+
 '<div class="ac-examnav"><button class="ac-quiet" data-prev '+(n<=1?'disabled':'')+'>← Anterior</button><button class="ac-quiet" data-next '+(n>=a.count?'disabled':'')+'>Siguiente →</button></div>'+
 '<div class="ac-foot"><button class="ac-quiet" data-open-source>Volver al cuadernillo ↗</button><button class="ac-primary" data-finish>Entregar práctica</button></div></div>';
 const clock=$('#ac-clock');tick=setInterval(()=>{if(clock)clock.textContent=elapsed(a.startedAt);else stopTick()},1000);
}
function ieltsSessionView(){
 stopTick();const a=store.active;if(!a){home();return}
 const t=findTopic('ielts',a.topicId);if(!t){store.active=null;persist();home();return}
 page.innerHTML='<div class="ac-wrap">'+toolbar('IELTS · SESIÓN EN CURSO')+
 '<section class="ac-panel"><div class="ac-kicker">PRÁCTICA OFICIAL</div><h2>'+esc(t.title)+'</h2><p>La prueba de muestra se abrió en otra pestaña. Cuando termines, vuelve aquí para registrar tu resultado y revisar qué debes mejorar.</p><div class="ac-stats"><span class="ac-stat">Tiempo en sesión <b id="ac-clock">'+elapsed(a.startedAt)+'</b></span><span class="ac-stat">Formato oficial</span></div><div class="ac-links"><a class="ac-link primary" href="'+esc(t.url)+'" target="_blank" rel="noopener">Abrir de nuevo ↗</a><a class="ac-link" href="'+urls.ieltsSamples+'" target="_blank" rel="noopener">Muestras y claves ↗</a></div></section>'+
 '<section class="ac-panel"><h3>Al terminar</h3><ul>'+(t.id==='listening'||t.id==='reading'?['Registra cuántas respuestas acertaste de 40.','No conviertas automáticamente el porcentaje en una banda IELTS: la conversión depende del test.','Anota el tipo de pregunta que más te costó.']:['Compara tu producción con los criterios oficiales.','Anota dos fortalezas y un aspecto concreto por mejorar.','No tomes una autoevaluación como una banda oficial.']).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section><button class="ac-primary" data-finish>Terminar y registrar resultado →</button></div>';
 const clock=$('#ac-clock');tick=setInterval(()=>{if(clock)clock.textContent=elapsed(a.startedAt);else stopTick()},1000);
}
function resultView(){
 stopTick();const a=store.active;if(!a){home();return}
 const t=findTopic(a.track,a.topicId),isI=a.program==='ICFES',answered=Object.keys(a.answers||{}).length;
 const count=isI?a.count:40;
 page.innerHTML='<div class="ac-wrap">'+toolbar('RESULTADO')+
 '<section class="ac-panel"><div class="ac-kicker">PRÁCTICA TERMINADA</div><h2>'+esc(t.title)+'</h2><p>Ahora compara tus respuestas con la clave oficial o revisa los criterios publicados. Registra solo el resultado que verificaste.</p><div class="ac-stats"><span class="ac-stat">Tiempo <b>'+elapsed(a.startedAt)+'</b></span>'+(isI?'<span class="ac-stat">'+answered+'/'+a.count+' marcadas</span>':'')+'</div></section>'+
 '<section class="ac-panel"><h3>Tu resultado</h3>'+(isI?'<div class="ac-field"><label for="ac-correct">Respuestas correctas según la clave oficial</label><input id="ac-correct" type="number" min="0" max="'+a.count+'" placeholder="0 a '+a.count+'" required></div><div class="ac-field"><label for="ac-errors">Qué tipo de error se repitió más</label><select id="ac-errors"><option>Comprensión o interpretación</option><option>Concepto o conocimiento</option><option>Procedimiento o cálculo</option><option>Lectura de gráficas o datos</option><option>Gestión del tiempo</option><option>No hubo un error dominante</option></select></div>':(t.id==='writing'||t.id==='speaking'?'<div class="ac-field"><label for="ac-correct">Autoevaluación breve</label><textarea id="ac-correct" rows="3" placeholder="Anota qué salió bien y qué vas a mejorar. No es una banda oficial."></textarea></div><div class="ac-field"><label for="ac-errors">Qué quieres mejorar</label><select id="ac-errors"><option>Coherencia y organización</option><option>Vocabulario o precisión</option><option>Gramática</option><option>Pronunciación o fluidez</option><option>Responder toda la consigna</option></select></div>':'<div class="ac-field"><label for="ac-correct">Respuestas correctas de 40</label><input id="ac-correct" type="number" min="0" max="40" placeholder="0 a 40"></div><div class="ac-field"><label for="ac-errors">Qué quieres mejorar</label><select id="ac-errors"><option>Comprensión de instrucciones</option><option>Vocabulario o precisión</option><option>Paráfrasis e identificación de evidencia</option><option>Gestión del tiempo</option></select></div>'))+
 '<div class="ac-field"><label for="ac-notes">Nota para tu próximo repaso</label><textarea id="ac-notes" rows="3" placeholder="¿Qué te confundió y qué vas a practicar la próxima vez?"></textarea></div><button class="ac-primary" data-save-result>Guardar resultado y continuar →</button></section></div>';
}
function saveResult(){
 const a=store.active;if(!a)return;
 const t=findTopic(a.track,a.topicId),isI=a.program==='ICFES';
 const tIsProduction=a.program==='IELTS'&&['writing','speaking'].includes(a.topicId);
 const raw=$('#ac-correct')?.value??'',max=isI?a.count:40;
 let score=null,accuracy=null;
 if(!tIsProduction&&raw!==''){score=Math.max(0,Math.min(max,Number(raw)));accuracy=Math.round(score/max*100)}
 const minutes=Math.max(1,Math.round((Date.now()-a.startedAt)/60000));
 const userNote=$('#ac-notes')?.value?.trim()||'';
 const note=(tIsProduction&&raw.trim()?'Autoevaluación: '+raw.trim()+' ':'')+userNote;
 const error=$('#ac-errors')?.value||'';
 const record={id:Date.now().toString(36),track:a.track,topicId:a.topicId,title:t.title,program:a.program,date:today(),minutes,score,max,accuracy,error,note,answers:a.answers||{},flagged:a.flagged||[]};
 store.history.unshift(record);store.history=store.history.slice(0,100);
 const k=keyFor(a.track,a.topicId),p=progressFor(a.track,a.topicId);
 p.sessions=(p.sessions||0)+1;p.lastDate=today();p.lastScore=accuracy;
 if(accuracy!==null)p.nextReview=plusDays(accuracy<60?1:accuracy<80?3:7);
 else p.nextReview=plusDays(2);
 p.lastError=error;store.subjects[k]=p;
 store.xp+=15;updateStreak();store.active=null;
 persist();syncStudyHistory(record);
 page.innerHTML='<div class="ac-wrap">'+toolbar('AVANCE GUARDADO')+'<section class="ac-panel"><div class="ac-kicker">BIEN HECHO</div><h2>Una sesión más completada.</h2><p>Tu avance quedó guardado en este dispositivo. El siguiente repaso se programó según el resultado registrado.</p><div class="ac-stats"><span class="ac-stat">+15 XP</span><span class="ac-stat">'+(accuracy===null?'Sesión registrada':accuracy+'% de precisión')+'</span><span class="ac-stat">Próximo repaso '+esc(store.subjects[k].nextReview)+'</span></div></section><button class="ac-primary" data-home>Volver a mi ruta →</button></div>';
}
function syncStudyHistory(record){
 const form=document.getElementById('studyForm');if(!form)return;
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v};
 set('studyProgram',record.program);set('studySkill',findTopic(record.track,record.topicId)?.skill||'Otra');set('studyDate',record.date);set('studyMinutes',record.minutes);
 set('studyAccuracy',record.accuracy===null?'':record.accuracy);set('studyBand','');set('studyMethod','Práctica guiada');
 set('studyGoal','Práctica oficial: '+record.title);
 set('studyResult','Resultado verificado: '+(record.score===null?'sin puntuación':record.score+'/'+record.max)+'; error principal: '+(record.error||'no especificado')+'. '+(record.note||''));
 form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
}
function historyView(){
 const list=store.history.slice(0,12);
 page.innerHTML='<div class="ac-wrap">'+toolbar('ACTIVIDAD')+'<div class="ac-head"><div><div class="ac-kicker">TU HISTORIAL</div><h1>Avance real</h1><p>Sesiones y resultados guardados en este dispositivo.</p></div></div>'+
 (list.length?'<div class="ac-list">'+list.map(x=>'<div class="ac-row"><span class="ac-num">✓</span><span><h3>'+esc(x.title)+'</h3><p>'+esc(x.date)+' · '+x.minutes+' min · '+(x.accuracy===null?'Sin puntuación':x.accuracy+'%')+'</p></span><span class="ac-state">'+esc(x.error||'Completada')+'</span></div>').join('')+'</div>':'<div class="ac-empty">Todavía no hay sesiones guardadas.</div>')+'</div>';
}
function reviewView(){
 const due=dueTopics();
 page.innerHTML='<div class="ac-wrap">'+toolbar('REPASO ESPACIADO')+'<div class="ac-head"><div><div class="ac-kicker">REVISIÓN</div><h1>Lo que toca reforzar</h1><p>Vuelve a las áreas que ya practicaste. Los intervalos son una guía de ADAZ, no una predicción de puntaje.</p></div></div>'+
 (due.length?'<div class="ac-list">'+due.map(x=>'<button class="ac-row" data-topic="'+x.track+':'+x.topic.id+'"><span class="ac-num">↻</span><span><h3>'+esc(x.topic.title)+'</h3><p>'+esc(titleTrack(x.track))+' · '+esc(x.topic.desc)+'</p></span><span class="ac-state">Repasar ›</span></button>').join('')+'</div>':'<div class="ac-empty">No tienes repasos pendientes. Completa una práctica y ADAZ te recomendará cuándo volver a esa área.</div>')+
 '<p class="ac-note">La práctica de recuperación y el repaso distribuido cuentan con respaldo en investigación educativa. La selección de preguntas y su calidad siguen dependiendo de las fuentes oficiales.</p></div>';
}
function resume(){if(!store.active){home();return}store.active.program==='ICFES'?examView():ieltsSessionView()}
function handleClick(e){
 const track=e.target.closest('[data-track]');if(track){store.track=track.dataset.track;persist();home();return}
 const topic=e.target.closest('[data-topic]');if(topic){const parts=topic.dataset.topic.split(':');topicView(parts[0],parts.slice(1).join(':'));return}
 if(e.target.closest('[data-home]')){stopTick();home();return}
 if(e.target.closest('[data-history]')){historyView();return}
 if(e.target.closest('[data-review-list]')){reviewView();return}
 if(e.target.closest('[data-resume]')){resume();return}
 const startI=e.target.closest('[data-start-icfes]');if(startI){startIcfes(startI.dataset.startIcfes);return}
 const startE=e.target.closest('[data-start-ielts]');if(startE){startIelts(startE.dataset.startIelts);return}
 const ans=e.target.closest('[data-answer]');if(ans&&store.active?.program==='ICFES'){const n=Number(store.active.current||1);store.active.answers[n]=ans.dataset.answer;persist();examView();return}
 const q=e.target.closest('[data-q]');if(q&&store.active?.program==='ICFES'){store.active.current=Number(q.dataset.q);persist();examView();return}
 if(e.target.closest('[data-prev]')&&store.active){store.active.current=Math.max(1,Number(store.active.current||1)-1);persist();examView();return}
 if(e.target.closest('[data-next]')&&store.active){store.active.current=Math.min(store.active.count,Number(store.active.current||1)+1);persist();examView();return}
 if(e.target.closest('[data-flag]')&&store.active){const n=Number(store.active.current||1);store.active.flagged=store.active.flagged||[];store.active.flagged=store.active.flagged.includes(n)?store.active.flagged.filter(x=>x!==n):store.active.flagged.concat(n);persist();examView();return}
 if(e.target.closest('[data-open-source]')&&store.active){openOfficial(store.active.sourceUrl);return}
 if(e.target.closest('[data-finish]')){resultView();return}
 if(e.target.closest('[data-save-result]')){saveResult();return}
}
page.addEventListener('click',handleClick);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&store.active){stopTick();home()}});
function addGymLibrary(){
 const training=document.querySelector('#page-training');
 if(!training||training.querySelector('.gym-guide'))return;
 const box=document.createElement('section');box.className='card gym-guide section-gap';
 box.innerHTML='<h2>Biblioteca de máquinas</h2><p class="smalltext muted">Guía rápida de reconocimiento y ajustes generales. El equipo puede variar entre sedes.</p><div class="note warn">Antes de usar una máquina nueva, pide a un instructor que muestre los ajustes y compruebe la técnica. Empieza con una resistencia que puedas controlar.</div>'+[
 ['Chest press','Pectoral, tríceps y deltoides anterior','Ajusta el asiento; espalda apoyada y empuja sin bloquear los codos.'],
 ['Lat pulldown','Dorsal ancho y flexores del codo','Ajusta el apoyo de muslos y lleva la barra al pecho sin balancear el tronco.'],
 ['Seated row','Dorsales, romboides y trapecio medio','Columna neutra; lleva el agarre al torso sin impulsarte hacia atrás.'],
 ['Leg press','Cuádriceps y glúteos','Pies estables; baja solo mientras mantengas la pelvis apoyada.'],
 ['Leg extension','Cuádriceps','Alinea la rodilla con el eje de la máquina y mueve sin impulso.'],
 ['Seated leg curl','Isquiotibiales','Ajusta el rodillo y flexiona las rodillas con recorrido controlado.'],
 ['Hip abductor','Abductores de cadera','Espalda apoyada; apertura controlada y sin rebotes.'],
 ['Cable station','Depende del accesorio','Verifica el mosquetón y la altura del cable antes de empezar.'],
 ['Shoulder press','Deltoides y tríceps','Ajusta el asiento para empezar cerca de los hombros y evita arquear la espalda.'],
 ['Assisted pull-up / dip','Espalda y bíceps o pecho y tríceps','Ajusta la asistencia con un instructor antes de aumentar dificultad.']
 ].map(m=>'<details><summary>'+esc(m[0])+' · '+esc(m[1])+'</summary><p>'+esc(m[2])+'</p></details>').join('')+'<div class="note green">Biblioteca educativa: no sustituye la inducción presencial ni las indicaciones de tu entrenador.</div>';
 training.append(box);
}
function init(){home();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addGymLibrary,{once:true});else addGymLibrary();}
init();
})();