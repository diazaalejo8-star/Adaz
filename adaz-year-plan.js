(()=>{'use strict';
const page=document.querySelector('#page-academy');
if(!page||window.__adazYearPlanV1)return;
window.__adazYearPlanV1=true;
const KEY='adaz-year-plan-v1',START='2026-11-11',END='2027-12-31';
const ICFES='https://www.icfes.gov.co/caja-de-herramientas-saber-11/practica/';
const ICFES_CAL='https://www.icfes.gov.co/evaluaciones-icfes/cronograma-de-evaluaciones/cronograma-examen-saber-11/';
const IELTS='https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const dt=s=>new Date(s+'T12:00:00');
const fmt=s=>dt(s).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const monthName=s=>dt(s+'-01').toLocaleDateString('es-CO',{month:'long',year:'numeric'});
const today=()=>iso(new Date());
let state={};try{state=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{}
state.done=state.done&&typeof state.done==='object'?state.done:{};state.results=state.results&&typeof state.results==='object'?state.results:{};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
const phases=[
['2026-11-11','2026-11-30','Cierre académico y diagnóstico','Del 11 al 13 de noviembre se cierra el periodo escolar. Desde el 14 comienzan las vacaciones: diagnóstico inicial, organización de materiales y ritmo sostenible.'],
['2026-12-01','2027-01-17','Vacaciones · construir bases','Sesiones de estudio de 45–75 minutos, cuatro días de gimnasio y dos sesiones técnicas de natación. Del 21 de diciembre al 3 de enero baja la carga y prioriza descanso.'],
['2027-01-18','2027-02-28','Fundamentos y recuperación activa','Consolidar las cinco áreas ICFES, las cuatro habilidades IELTS, bases de Medicina y aplicación de finanzas al negocio. Ajusta horarios al calendario escolar 2027 confirmado por el colegio.'],
['2027-03-01','2027-03-31','Simulacro diagnóstico ICFES de marzo','Simulacro largo en dos sábados: sesión 1 y sesión 2. Es una práctica diagnóstica, no una aplicación oficial.'],
['2027-04-01','2027-05-31','Cerrar brechas y elevar precisión','Un simulacro ICFES largo al mes y un IELTS Academic completo al mes, con corrección detallada.'],
['2027-06-01','2027-07-31','Preparación intensiva Saber 11','Fase de PreICFES / preparación intensiva si finalmente te matriculas. Simulacros de dos sesiones, revisión de errores y mantenimiento IELTS.'],
['2027-08-01','2027-08-31','Ventana objetivo ICFES','Agosto es la ventana objetivo que planteaste. La fecha exacta queda pendiente del cronograma oficial ICFES 2027; ADAZ no la inventará.'],
['2027-09-01','2027-10-31','IELTS Academic · consolidación Band 8','Después de Saber 11, el foco principal pasa a IELTS: un simulacro completo cada dos semanas, feedback de Writing y Speaking y corrección de patrones.'],
['2027-11-01','2027-11-30','Ventana objetivo IELTS','Ventana tentativa para IELTS Academic. Reserva cuando los simulacros completos y la revisión externa indiquen preparación estable; no hay fecha reservada.'],
['2027-12-01','2027-12-31','Cierre y evaluación 2027','Revisar resultados, consolidar Medicina, evaluar Oro Laminado y definir el siguiente ciclo académico.']
];
const milestones={
'2026-11-14':['Inicio de vacaciones y configuración','Organiza materiales oficiales, fija el lugar de estudio y registra una línea base del tiempo disponible.'],
'2026-11-21':['ICFES · diagnóstico integrado ADAZ (60 preguntas)','12 preguntas por cada área: Matemáticas, Lectura Crítica, Sociales, Ciencias Naturales e Inglés. Aproximadamente 2 horas. Práctica original ADAZ; no es puntaje oficial.'],
'2026-11-28':['IELTS Academic · práctica extensa ADAZ','Dentro de ADAZ: 20 preguntas Listening con voz sintetizada, 20 Reading, dos tareas Writing y tres prompts Speaking. Reserva hasta 2 h 45 min y usa la rúbrica oficial como referencia.'],
'2026-12-05':['ICFES · simulacro extenso ADAZ (60 preguntas)','12 preguntas por área. Aproximadamente 2 horas más 45 minutos de corrección. El banco es original y se realiza dentro de la APK.'],
'2026-12-12':['IELTS · Listening + Reading integrado ADAZ','20 preguntas Listening con voz sintetizada y 20 Reading dentro de ADAZ. Después, 45–60 min para corregir y registrar errores.'],
'2026-12-19':['ICFES · simulacro extenso ADAZ (60 preguntas)','12 preguntas por área. Aproximadamente 2 horas. Cierra con matriz de fortalezas, errores conceptuales, lectura apresurada y manejo del tiempo.'],
'2027-01-09':['ICFES · simulacro extenso ADAZ (60 preguntas)','12 preguntas por área, cronómetro personal y hoja de respuestas. Aproximadamente 2 horas; corrección en bloque separado.'],
'2027-01-16':['IELTS Academic · práctica extensa ADAZ','Listening 40, Reading 40, Writing 2 tareas y Speaking 11–14 min. 2 h 45 min aprox. Guarda Writing y Speaking para recibir feedback.'],
'2027-01-30':['ICFES · simulacro extenso ADAZ (60 preguntas)','12 preguntas por área. Aproximadamente 2 horas. Analiza desempeño por competencia, no solo porcentaje total.'],
'2027-02-13':['IELTS Academic · práctica extensa ADAZ','20 Listening, 20 Reading, dos tareas Writing y tres prompts Speaking. Compara con el diagnóstico anterior.'],
'2027-02-27':['ICFES · simulacro extenso ADAZ (60 preguntas)','12 preguntas por área. Aproximadamente 2 horas. Comprueba si mejoró el área más débil.'],
'2027-03-06':['ICFES · simulacro ADAZ de marzo · bloque 1','60 preguntas originales ADAZ: 12 por área. Tiempo orientativo 2 horas. La estructura oficial se consulta aparte y se actualizará cuando se publique la guía 2027.'],
'2027-03-13':['ICFES · simulacro ADAZ de marzo · bloque 2','Segundo intento de 60 preguntas originales ADAZ, con revisión de áreas débiles. No equivale a una sesión oficial ICFES.'],
'2027-03-20':['Corrección del simulacro de marzo','Dedica 2–3 horas a revisar cada error: competencia, causa, solución correcta y fecha de repetición. No repitas sin corregir.'],
'2027-04-10':['ICFES · simulacro extenso ADAZ (60 preguntas)','12 preguntas por área. Aproximadamente 2 horas. Compara con marzo y prioriza dos brechas.'],
'2027-04-24':['IELTS Academic · práctica extensa ADAZ','20 Listening con voz sintetizada, 20 Reading, dos tareas Writing y tres prompts Speaking. Usa los tiempos y descriptores oficiales como referencia.'],
'2027-05-08':['ICFES · simulacro extenso ADAZ (60 preguntas)','12 preguntas por área. Aproximadamente 2 horas. Revisión de evidencia y manejo del tiempo.'],
'2027-05-22':['IELTS Academic · práctica extensa ADAZ','20 Listening con voz sintetizada, 20 Reading, dos tareas Writing y tres prompts Speaking. No asigna banda certificada.'],
'2027-06-05':['ICFES · simulacro ADAZ intensivo · bloque 1','60 preguntas originales ADAZ, 12 por área. Aproximadamente 2 horas. No reproduce el número de preguntas del examen oficial.'],
'2027-06-12':['ICFES · simulacro ADAZ intensivo · bloque 2','Segundo intento de 60 preguntas originales ADAZ y análisis de errores. No reproduce el número de preguntas del examen oficial.'],
'2027-06-19':['Corrección ICFES y plan de brechas','Revisión completa de ambas sesiones. Crea 10 competencias prioritarias y distribúyelas en las siguientes cuatro semanas.'],
'2027-06-26':['IELTS Academic · práctica extensa ADAZ','20 Listening, 20 Reading, dos tareas Writing y tres prompts Speaking. Revisa especialmente Writing Task 2 y Speaking Part 3.'],
'2027-07-03':['ICFES · simulacro extenso ADAZ (60 preguntas)','12 preguntas por área, aproximadamente 2 horas. Enfócate en precisión y justificación.'],
'2027-07-17':['ICFES · práctica acumulativa ADAZ','Realiza el banco integrado de 60 preguntas y revisa los dos bloques. Si PreICFES ofrece un simulacro autorizado, úsalo como evaluación complementaria.'],
'2027-07-24':['IELTS Academic · práctica extensa ADAZ','Cuatro habilidades, tiempo oficial y evaluación de Writing/Speaking. Decide si te acercas a la banda objetivo.'],
'2027-08-01':['Verificar cronograma oficial ICFES 2027','Consultar publicación oficial, inscripción, citación y aplicación. Agosto es ventana objetivo, no fecha confirmada.'],
'2027-08-07':['Repaso final Saber 11','Errores recurrentes, instrucciones, manejo del tiempo, materiales y logística. Ajustar al día oficial cuando se publique.'],
'2027-09-11':['ICFES · cierre de resultados y brechas','Si ya presentaste Saber 11, registra experiencia y resultados cuando estén disponibles. Si no, convierte este bloque en simulacro final.'],
'2027-09-25':['IELTS Academic · práctica extensa ADAZ','20 Listening con voz sintetizada, 20 Reading, dos tareas Writing y tres prompts Speaking. Compara tu progreso con la meta Band 8.'],
'2027-10-09':['IELTS Academic · práctica extensa ADAZ','20 Listening, 20 Reading, dos tareas Writing y tres prompts Speaking. Feedback y corrección de errores repetidos.'],
'2027-10-23':['IELTS Academic · simulacro completo','Práctica extensa de las cuatro habilidades y revisión de estabilidad antes de reservar o confirmar fecha.'],
'2027-11-01':['Revisar disponibilidad y fecha IELTS','Si el desempeño es estable y se acerca a Band 8 en las cuatro habilidades, elegir fecha disponible con acompañamiento familiar. No está reservada.'],

'2027-12-04':['Evaluación final de 2027','Revisar metas ICFES e IELTS, progreso de Medicina y resultados de Oro Laminado. Definir prioridades 2028.']
};
function phase(s){return phases.find(p=>s>=p[0]&&s<=p[1])||phases[0]}
function tasks(s){
 if(s<START||s>END)return [];
 const d=dt(s),w=d.getDay(),week=Math.floor((d-new Date('2026-11-09T12:00:00'))/604800000),vac=s>='2026-11-14'&&s<='2027-01-17',out=[];
 const add=(id,title,desc,kind,duration)=>out.push({id,title,desc,kind,duration:duration||''});
 if(w===1){add('math','ICFES · Matemáticas','50–60 min: gráficas, álgebra, estadística y resolución de problemas. Termina con 10–15 preguntas y explica errores.','study');add('gym-a','Gimnasio · Día A','Sesión 1 de 4. Sigue tu rutina ADAZ Health y la técnica indicada por tu entrenador. No añadas volumen para compensar.','gym','Según rutina Health')}
 if(w===2){add('listen','IELTS · Listening','40–50 min: una parte completa o 20–25 preguntas; analiza distractores, números, cambios y acentos.','study');add('vocab','IELTS · Vocabulario académico','15 min: recuperar 10–15 expresiones en contexto y escribir frases propias.','study');add('gym-b','Gimnasio · Día B','Sesión 2 de 4. Sigue la rutina ADAZ Health con técnica y recuperación suficientes.','gym','Según rutina Health')}
 if(w===3){add('medicine','Medicina · Bases científicas','40–45 min: biología celular, anatomía, fisiología, bioquímica o método científico. Explica oralmente sin mirar apuntes.','study');add('swim-wed','Natación · Técnica','Sesión técnica según el plan de natación y la orientación del entrenador. Prioriza técnica.','swim','Según entrenador')}
 if(w===4){const t=['Lectura Crítica + Sociales','Ciencias Naturales','Matemáticas aplicada + Lectura Crítica','Sociales + Ciencias Naturales'];add('icfes-rotation','ICFES · '+t[((week%4)+4)%4],'60 min: estímulos, análisis de evidencia y 20–25 preguntas del tema. Registra competencia y causa del error.','study');add('gym-c','Gimnasio · Día C','Sesión 3 de 4. Sigue la rutina ADAZ Health y respeta los descansos.','gym','Según rutina Health')}
 if(w===5){add('writing','IELTS · Writing / Speaking','60 min: alterna Writing Task 1 (20 min) + Task 2 (40 min), o Speaking completo (11–14 min) y revisión de criterios.','study');add('gym-d','Gimnasio · Día D','Sesión 4 de 4. Sigue la rutina ADAZ Health; ajusta con tu entrenador si hay fatiga acumulada.','gym','Según rutina Health');if(d.getDate()<=7||d.getDate()>=22)add('business','Oro Laminado · Gestión','30–40 min: inventario, costos reales, ventas, caja, pedidos y una decisión comercial basada en números.','business')}
 if(w===6){if(week%2===0)add('long-test','Evaluación larga de sábado','90–150 min: test programado. Si no hay hito, 40–60 preguntas mixtas o un bloque IELTS completo, más corrección.','test');else add('error-review','Corrección y repaso espaciado','60–90 min: corregir preguntas previas, rehacer las falladas sin mirar y recuperar conceptos de semanas anteriores.','review');add('business-week','Oro Laminado · Revisión','20–30 min: conciliar compras, inventario, ventas, margen y pedidos.','business');if(!milestones[s])add('swim-sat','Natación · Técnica suave','Según entrenador. Si hay simulacro largo, omite esta sesión y prioriza recuperación.','swim')}
 if(w===0){add('rest','Descanso físico','Sin gimnasio. Recuperación, sueño, actividades personales y tiempo libre.','rest');add('weekly-review','Revisión semanal ADAZ','15–20 min: revisar tests, errores pendientes, estudio, negocio y entrenamientos; planear tres prioridades realistas.','review')}
 if(vac&&w!==0)add('vacation','Bloque de vacaciones','Horario flexible: un bloque principal de estudio y una pausa real. No conviertas las vacaciones en jornadas escolares completas.','note');
 if(milestones[s])out.unshift({id:'milestone',title:milestones[s][0],desc:milestones[s][1],kind:'milestone',duration:'Evaluación programada'});
 return out;
}
function done(s,id){return !!state.done[s+'|'+id]}
function toggle(s,id){const k=s+'|'+id;if(state.done[k])delete state.done[k];else state.done[k]=true;save();render()}
function render(){
 let month=state.month||today().slice(0,7);if(month<'2026-11')month='2026-11';if(month>'2027-12')month='2027-12';state.month=month;
 const first=dt(month+'-01'),days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate(),offset=(first.getDay()+6)%7;
 const max=month+'-'+String(days).padStart(2,'0'),sel=state.selected&&state.selected>=month+'-01'&&state.selected<=max?state.selected:month+'-01';state.selected=sel;
 const cells=[];const start=new Date(first);start.setDate(start.getDate()-offset);
 for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const s=iso(d),inside=d.getMonth()===first.getMonth(),list=tasks(s),n=list.filter(x=>done(s,x.id)).length;cells.push('<button class="yp-day '+(inside?'':'outside')+' '+(s===sel?'selected ':'')+(s===today()?'today':'')+'" data-yp-day="'+s+'" '+(s<START||s>END?'disabled':'')+'><span>'+d.getDate()+'</span>'+(milestones[s]?'<i class="yp-dot milestone"></i>':list.length?'<i class="yp-dot"></i>':'')+(list.length?'<small>'+n+'/'+list.length+'</small>':'')+'</button>')}
 const list=tasks(sel),n=list.filter(x=>done(sel,x.id)).length;
 const rows=list.map(x=>'<label class="yp-task '+(done(sel,x.id)?'done':'')+'"><input type="checkbox" data-yp-done="'+esc(x.id)+'" '+(done(sel,x.id)?'checked':'')+'><span class="yp-task-main"><b>'+esc(x.title)+'</b><small>'+esc(x.duration)+(x.duration?' · ':'')+esc(x.desc)+'</small></span><em>'+esc(x.kind==='gym'?'GYM':x.kind==='swim'?'NATACIÓN':x.kind==='test'?'TEST':x.kind==='milestone'?'HITO':x.kind==='business'?'NEGOCIO':x.kind==='review'?'REVISIÓN':x.kind==='rest'?'DESCANSO':x.kind==='note'?'VACACIONES':'ESTUDIO')+'</em></label>').join('');
 const p=phase(sel),mil=Object.keys(milestones).filter(s=>s.slice(0,7)===month).map(s=>'<button class="yp-milestone" data-yp-day="'+s+'"><time>'+dt(s).toLocaleDateString('es-CO',{day:'2-digit',month:'short'})+'</time><span><b>'+esc(milestones[s][0])+'</b><small>'+esc(milestones[s][1])+'</small></span><i>›</i></button>').join('');
 const saved=state.results[sel]||{};const resultPanel=milestones[sel]?'<section class="yp-section yp-result-card"><div class="yp-kicker">REGISTRO DE RESULTADOS</div><h2>Guarda cómo te fue</h2><label>Resultado / puntaje / bandas<input data-yp-result-score value="'+esc(saved.score||'')+'" placeholder="Ej. ICFES: aciertos por área · IELTS: L 7.5 / R 8.0 / W 7.0 / S 7.5"></label><label>Errores y temas que debes reforzar<textarea data-yp-result-notes rows="3" placeholder="Anota los temas, tipos de pregunta y causas de error">'+esc(saved.notes||'')+'</textarea></label><button class="yp-save-result" data-yp-result-save>Guardar resultado</button><p>El registro se guarda en este dispositivo y no cambia los datos de tus otros módulos.</p></section>':'';
 page.innerHTML='<div class="yp-wrap"><header class="yp-header"><div><div class="yp-kicker">ADAZ ACADEMY · PLAN PERSONAL</div><h1>Calendario 2026–2027</h1><p>Una ruta diaria hasta Saber 11 e IELTS, con estudio, negocio, Medicina, gimnasio y natación.</p></div><button class="yp-back" data-yp-back>← Volver a Academy</button></header>'+
 '<section class="yp-phase"><div class="yp-kicker">ETAPA ACTUAL</div><h2>'+esc(p[2])+'</h2><p>'+esc(p[3])+'</p></section>'+
 '<section class="yp-grid-layout"><div class="yp-calendar-card"><div class="yp-month-head"><button data-yp-month="-1" '+(month==='2026-11'?'disabled':'')+'>‹</button><h2>'+esc(monthName(month))+'</h2><button data-yp-month="1" '+(month==='2027-12'?'disabled':'')+'>›</button></div><div class="yp-weekdays"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div class="yp-days">'+cells.join('')+'</div><div class="yp-legend"><span><i class="yp-dot milestone"></i> Simulacro / hito</span><span><i class="yp-dot"></i> Plan diario</span></div></div>'+
 '<div class="yp-day-card"><div class="yp-kicker">PLAN DEL DÍA</div><h2>'+esc(fmt(sel))+'</h2><div class="yp-progress"><span style="width:'+(list.length?Math.round(n/list.length*100):0)+'%"></span></div><p class="yp-count">'+n+' de '+list.length+' actividades completadas</p><div class="yp-task-list">'+(rows||'<p>No hay actividades para esta fecha.</p>')+'</div></div></section>'+resultPanel+
 '<section class="yp-section"><div class="yp-kicker">HITOS DEL PROCESO</div><h2>Qué vas a preparar y cuándo</h2><div class="yp-milestone-list">'+(mil||'<p class="yp-muted">Continúa la rutina semanal y las evaluaciones largas de los sábados.</p>')+'</div></section>'+
 '<section class="yp-section"><div class="yp-kicker">RUTINA SEMANAL</div><h2>Distribución fija</h2><div class="yp-week-plan"><article><b>Lunes</b><span>ICFES Matemáticas + Gimnasio A</span></article><article><b>Martes</b><span>IELTS Listening + vocabulario + Gimnasio B</span></article><article><b>Miércoles</b><span>Medicina + natación técnica</span></article><article><b>Jueves</b><span>ICFES rotativo + Gimnasio C</span></article><article><b>Viernes</b><span>IELTS Writing/Speaking + Gimnasio D</span></article><article><b>Sábado</b><span>Test largo + Oro Laminado; natación solo si no hay simulacro largo</span></article><article><b>Domingo</b><span>Descanso físico + revisión breve. Sin gimnasio.</span></article></div></section>'+
 '<section class="yp-section"><div class="yp-kicker">ESTRUCTURA DE LOS EXÁMENES</div><h2>Simulacros completos, no cuestionarios cortos</h2><div class="yp-exams"><article><h3>ICFES Saber 11</h3><p>Matemáticas, Lectura Crítica, Sociales y Ciudadanas, Ciencias Naturales e Inglés. Referencia oficial 2026 para cuadernillo estándar: 143 preguntas / 4 h 30 min en sesión 1 y 159 / 4 h 30 min en sesión 2. Se actualizará con la guía 2027.</p><a href="'+ICFES+'" target="_blank" rel="noopener">Material oficial ICFES ↗</a> · <a href="'+ICFES_CAL+'" target="_blank" rel="noopener">Cronograma oficial ↗</a></article><article><h3>IELTS Academic</h3><p>Listening: 40 preguntas, aprox. 30 min. Reading: 40 preguntas, 60 min. Writing: Task 1 y Task 2, 60 min. Speaking: 11–14 min. Duración total aprox. 2 h 45 min. Meta: Band 8.0 en cada habilidad.</p><a href="'+IELTS+'" target="_blank" rel="noopener">Muestras oficiales IELTS ↗</a></article></div><p class="yp-note">Las preguntas originales de ADAZ se identifican como práctica propia; no se presentan como oficiales. Los cuadernillos institucionales se consultan en sus fuentes y se respetan sus condiciones de uso.</p></section>'+
 '<section class="yp-section yp-endnotes"><b>Fechas pendientes de confirmación</b><p>ICFES 2027: cronograma oficial pendiente. Agosto queda como ventana objetivo, no como fecha confirmada. IELTS: noviembre es ventana tentativa; no hay reserva hecha.</p></section></div>';
 page.querySelectorAll('[data-yp-day]').forEach(b=>b.addEventListener('click',()=>{state.selected=b.dataset.ypDay;state.month=state.selected.slice(0,7);save();render()}));
 page.querySelectorAll('[data-yp-month]').forEach(b=>b.addEventListener('click',()=>{const d=dt(state.month+'-01');d.setMonth(d.getMonth()+Number(b.dataset.ypMonth));state.month=iso(d).slice(0,7);state.selected=state.month+'-01';save();render()}));
 page.querySelectorAll('[data-yp-done]').forEach(b=>b.addEventListener('change',()=>toggle(sel,b.dataset.ypDone)));
 page.querySelector('[data-yp-result-save]')?.addEventListener('click',()=>{state.results[sel]={score:page.querySelector('[data-yp-result-score]')?.value||'',notes:page.querySelector('[data-yp-result-notes]')?.value||''};save();render()});
 page.querySelector('[data-yp-back]')?.addEventListener('click',()=>{planMode=false;if(homeSnapshot)page.innerHTML=homeSnapshot;ensureButton()});
}
let planMode=false,homeSnapshot='';
function ensureButton(){if(planMode)return;const h=page.querySelector('.s2-head');if(!h||h.querySelector('[data-yp-open]'))return;homeSnapshot=page.innerHTML;const b=document.createElement('button');b.type='button';b.className='yp-open';b.dataset.ypOpen='1';b.textContent='Calendario 2026–2027 →';h.appendChild(b);} 
page.addEventListener('click',e=>{const b=e.target.closest('[data-yp-open]');if(!b||planMode)return;homeSnapshot=page.innerHTML;planMode=true;let t=today();if(t<START)t=START;if(t>END)t=END;state.month=t.slice(0,7);state.selected=t;save();render()})
window.__adazCalendarRender=render;
new MutationObserver(()=>{if(!planMode)ensureButton()}).observe(page,{childList:true,subtree:true});
ensureButton();
})();