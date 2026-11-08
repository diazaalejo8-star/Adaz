(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const KEY = 'adaz-routine-v1';
  const STORE = 'adaz-data-v1';
  const today = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  };
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const readStore = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (parsed && typeof parsed === 'object') return {reminders:Array.isArray(parsed.reminders)?parsed.reminders:[], leisureDone:Array.isArray(parsed.leisureDone)?parsed.leisureDone:[], roadmapDone:Array.isArray(parsed.roadmapDone)?parsed.roadmapDone:[]};
    } catch {}
    return {reminders:[], leisureDone:[], roadmapDone:[]};
  };
  let preferences = readStore();
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(preferences)); window.dispatchEvent(new CustomEvent('adaz-data-updated')); }
    catch { notify('No se pudieron guardar los cambios. Exporta un respaldo y libera espacio.'); }
  };
  let notifyTimer=null;
  const notify = message => {
    const toast = $('#toast');
    if (toast) { toast.textContent = message; toast.classList.add('show'); clearTimeout(notifyTimer); notifyTimer=setTimeout(()=>toast.classList.remove('show'),3200); }
    else window.alert(message);
  };
  const week = {
    0: [
      ['Mañana flexible','Descanso y vida personal','Duerme lo necesario y reserva tiempo libre sin convertirlo en otra obligación.'],
      ['10–20 min','Revisión semanal','Mira lo que sí hiciste, elige de una a tres prioridades y ajusta lo que no sea realista.'],
      ['Bloque corto','Preparar la semana','Deja lista la mochila/materiales y define la primera tarea de lunes.'],
      ['Noche','Cierre tranquilo','Evita llenar el domingo de trabajo pendiente; procura acostarte a una hora razonable.']
    ],
    1: [
      ['06:30–13:45*','Colegio','Horario de referencia registrado en tu plan; comprueba si sigue vigente.'],
      ['Después de clases','Comer y recuperar energía','Haz una pausa antes del siguiente bloque exigente.'],
      ['35 min','IELTS · Listening','Haz una práctica oficial breve y revisa cada error, distractor y paráfrasis.'],
      ['Según calendario real','Fuerza / gimnasio','Usa tu rutina vigente y solo si toca esa sesión; no añadas volumen por compensar.'],
      ['10–15 min','Aestel Lux · control diario','Revisa pedidos, anticipos y mensajes importantes con un objetivo definido.'],
      ['Noche','Preparar mañana','Deja anotada la prioridad del martes y haz un cierre breve.']
    ],
    2: [
      ['06:30–13:45*','Colegio','Bloque escolar de referencia; ajústalo si cambió tu horario.'],
      ['30 min','ICFES · área prioritaria','Resuelve preguntas y escribe por qué descartaste las opciones incorrectas.'],
      ['Según entrenador','Natación / deporte planificado','Registra duración, distancia si aplica y cómo te sentiste. La indicación del entrenador tiene prioridad.'],
      ['10 min','Repaso espaciado','Intenta recordar cinco conceptos antes de volver a mirar los apuntes.'],
      ['Noche','Desconexión','Tiempo personal, alimentación y sueño; evita duplicar tareas si el día fue pesado.']
    ],
    3: [
      ['06:30–16:30*','Colegio · jornada larga','Miércoles figura como la jornada más larga en el horario provisional. Verifica si sigue vigente.'],
      ['15 min','Mínimo académico viable','Repasa tres errores o cinco ideas de memoria; no fuerces una sesión extensa.'],
      ['Según calendario real','Entrenamiento o recuperación','Sigue el plan del entrenador y cómo te encuentras ese día.'],
      ['Noche','Dejar listo mañana','Materiales preparados y cierre temprano para proteger el descanso.']
    ],
    4: [
      ['06:30–13:45*','Colegio','Bloque escolar de referencia; ajusta si ya cambió.'],
      ['35 min','IELTS · Reading o Writing','Alterna habilidades por semana. Resuelve con tiempo y evalúa la calidad, no solo la cantidad.'],
      ['Según calendario real','Entrenamiento planificado','Fuerza, natación o recuperación según tu plan vigente.'],
      ['10 min','Repaso de finanzas','Actualiza caja, costos, encargos o pagos pendientes; no tomes decisiones con cifras estimadas.'],
      ['Noche','Tiempo libre sin culpa','El ocio también tiene lugar en una semana equilibrada.']
    ],
    5: [
      ['06:30–13:45*','Colegio','Horario escolar de referencia.'],
      ['30 min','ICFES o IELTS Speaking','Practica un área prioritaria y apunta un ajuste concreto para la próxima vez.'],
      ['15 min','Cierre Aestel Lux','Revisa entregas, cobros y una publicación o idea de contenido medible.'],
      ['Según entrenador','Natación / deporte planificado','No compenses sesiones perdidas con trabajo extra automático.'],
      ['Noche','Recuperación y relaciones','Reserva tiempo para descansar y estar con tu gente.']
    ],
    6: [
      ['30 min','Estudio a elección','Escoge la habilidad más débil según tus registros; puedes alternar IELTS e ICFES.'],
      ['40 min','Bloque de negocio','Catálogo, costos, contenido, servicio al cliente o revisión de proveedores; una tarea por bloque.'],
      ['Según calendario real','Entrenamiento','Mantén el calendario real y la recuperación; no agregues dobles sesiones por defecto.'],
      ['Después','Actividad elegida','Algo creativo, social, cultural o simplemente entretenido.']
    ]
  };
  const dayNames = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  function currentSchedule() {
    const d = new Date();
    const num = d.getDay();
    const plan = week[num] || [];
    const saved = (() => { try { return JSON.parse(localStorage.getItem(STORE)||'{}'); } catch { return {}; }})();
    const tasks = Array.isArray(saved.tasks?.[today()]) ? saved.tasks[today()] : [];
    const heading = $('#routineHeading');
    const dateNode = $('#routineDate');
    const note = $('#routineDateNote');
    if (heading) heading.textContent = 'Tu plan de ' + dayNames[num];
    if (dateNode) dateNode.textContent = d.toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    if (note) note.textContent = today() <= '2026-11-13'
      ? '* Las horas escolares son una referencia provisional guardada previamente y solo aplican si siguen vigentes. El resto son bloques flexibles, no citas con hora fija.'
      : 'El horario escolar provisional de octubre–noviembre ya expiró. Confirma tu horario actual antes de convertirlo en horas fijas. Los demás bloques son orientativos.';
    const timeline = $('#routineTimeline');
    if (timeline) timeline.innerHTML = plan.map(item => '<article class="routine-item"><div class="routine-time">' + escapeHTML(item[0]) + '</div><div class="routine-body"><h3>' + escapeHTML(item[1]) + '</h3><p>' + escapeHTML(item[2]) + '</p></div></article>').join('');
    const taskList = $('#routineTaskList');
    if (taskList) taskList.innerHTML = tasks.length
      ? tasks.map(t => '<div class="list-item"><span class="bullet">' + (t.done?'✓':'○') + '</span><div style="flex:1"><b class="smalltext">' + escapeHTML(t.title) + '</b><div class="muted smalltext">' + escapeHTML(t.desc||'') + '</div><div class="muted smalltext">' + escapeHTML(t.category||'General') + ' · ' + (Number(t.minutes)||0) + ' min</div></div></div>').join('')
      : '<div class="empty">Las tareas de hoy todavía no se han creado. Entra al Panel del día para generarlas y editarlas.</div>';
    const count = tasks.filter(t=>t.done).length;
    const summary = $('#routineTaskSummary');
    if (summary) summary.textContent = tasks.length ? count + ' de ' + tasks.length + ' tareas completadas en el Panel del día.' : 'Aún no hay tareas registradas para hoy.';
  }
  function renderReminders() {
    const root = $('#reminderList');
    const status = $('#notificationStatus');
    if (!root) return;
    if (!preferences.reminders.length) root.innerHTML = '<div class="empty">Todavía no has guardado recordatorios. Añade una hora para estudiar, revisar pedidos o cerrar el día.</div>';
    else root.innerHTML = preferences.reminders.slice().sort((a,b)=>(a.time||'').localeCompare(b.time||'')).map(r => {
      const repeat = ({once:'Una vez',daily:'Todos los días',weekdays:'Lunes a viernes',weekly:'Cada semana'})[r.repeat] || 'Una vez';
      const dateText = r.repeat==='once' ? ' · ' + escapeHTML(r.date||today()) : '';
      return '<div class="list-item"><span class="bullet">⏰</span><div style="flex:1;min-width:0"><b class="smalltext">' + escapeHTML(r.title) + '</b><div class="muted smalltext">' + escapeHTML(r.time) + ' · ' + repeat + dateText + '</div>' + (r.note?'<div class="muted smalltext">'+escapeHTML(r.note)+'</div>':'') + '</div><button class="btn small danger" type="button" data-delete-reminder="' + escapeHTML(r.id) + '">Eliminar</button></div>';
    }).join('');
    if (status) {
      if (!('Notification' in window)) status.textContent = 'Este navegador no ofrece notificaciones web. Usa el calendario del teléfono para avisos.';
      else if (Notification.permission==='granted') status.textContent = 'Notificaciones permitidas. Los avisos de ADAZ se comprueban mientras la aplicación permanece abierta.';
      else if (Notification.permission==='denied') status.textContent = 'El permiso está bloqueado por el navegador. Usa el calendario del teléfono para avisos fiables.';
      else status.textContent = 'Activa el permiso para ver avisos de ADAZ mientras la aplicación esté abierta.';
    }
  }
  async function enableNotifications() {
    if (!('Notification' in window)) { notify('Este navegador no admite notificaciones. Exporta el calendario para configurar alarmas en el teléfono.'); return; }
    try {
      const result = await Notification.requestPermission();
      renderReminders();
      notify(result==='granted' ? 'Permiso concedido. ADAZ comprobará los recordatorios mientras esté abierta.' : 'No se activó el permiso. Puedes importar el calendario para recibir alarmas.');
    } catch {
      notify('No fue posible activar las notificaciones. Usa el calendario del teléfono.');
    }
  }
  const weekdayCode = dateStr => ['SU','MO','TU','WE','TH','FR','SA'][new Date((dateStr||today())+'T12:00:00').getDay()];
  const icsEscape = s => String(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');
  function exportReminderCalendar() {
    const reminders = preferences.reminders;
    const events = [];
    const dtstamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const toDateTime = (date,time) => String(date||today()).replace(/-/g,'') + 'T' + String(time||'20:30').replace(':','') + '00';
    const makeEvent = (id,title,desc,date,time,repeat) => {
      const start = toDateTime(date,time);
      const parts = String(time||'20:30').split(':').map(Number);
      const endDate = new Date((date||today())+'T'+String(parts[0]).padStart(2,'0')+':'+String(parts[1]).padStart(2,'0')+':00');
      endDate.setMinutes(endDate.getMinutes()+15);
      const end = String(endDate.getFullYear())+String(endDate.getMonth()+1).padStart(2,'0')+String(endDate.getDate()).padStart(2,'0')+'T'+String(endDate.getHours()).padStart(2,'0')+String(endDate.getMinutes()).padStart(2,'0')+'00';
      const lines = ['BEGIN:VEVENT','UID:'+id+'@adaz.local','DTSTAMP:'+dtstamp,'SUMMARY:'+icsEscape(title),'DESCRIPTION:'+icsEscape(desc||'Recordatorio creado en ADAZ.'),'DTSTART:'+start,'DTEND:'+end];
      if (repeat==='daily') lines.push('RRULE:FREQ=DAILY');
      if (repeat==='weekdays') lines.push('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
      if (repeat==='weekly') lines.push('RRULE:FREQ=WEEKLY;BYDAY='+weekdayCode(date));
      lines.push('BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:'+icsEscape(title),'END:VALARM','END:VEVENT');
      return lines;
    };
    reminders.forEach(r => events.push(...makeEvent(r.id,r.title,r.note,r.date||today(),r.time,r.repeat)));
    if (!events.length) {
      events.push(...makeEvent('adaz-revision-semanal','ADAZ — Revisión semanal','Revisa estudio, negocio, entrenamiento, descanso y prioridades.',today(),'18:00','weekly'));
      events.push(...makeEvent('adaz-cierre-diario','ADAZ — Cierre del día','Registra lo ocurrido y deja preparado el primer paso de mañana.',today(),'20:30','daily'));
    }
    const content = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ADAZ//Personal Progress//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH',...events.flat(),'END:VCALENDAR'].join('\r\n')+'\r\n';
    const blob = new Blob([content],{type:'text/calendar;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='ADAZ-recordatorios.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
    notify(reminders.length ? 'Calendario exportado. Impórtalo en Google Calendar o en el calendario del teléfono y verifica que tenga notificaciones activas.' : 'Calendario básico exportado con revisión semanal y cierre diario. Impórtalo en el calendario del teléfono.');
  }
  async function checkDueReminders() {
    if (!('Notification' in window) || Notification.permission!=='granted') return;
    const now = new Date();
    const currentTime = String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    const dateKey = today();
    let changed=false;
    for (const r of preferences.reminders) {
      if (r.time!==currentTime) continue;
      const repeat = r.repeat || 'once';
      let applies = false;
      if (repeat==='daily') applies=true;
      else if (repeat==='weekdays') applies=now.getDay()>=1 && now.getDay()<=5;
      else if (repeat==='weekly') applies=weekdayCode(r.date||dateKey)===weekdayCode(dateKey);
      else applies=(r.date||dateKey)===dateKey;
      if (!applies || r.lastFired===dateKey) continue;
      try {
        const options={body:r.note||'Es hora del bloque que programaste.',icon:'./icon-192.png',tag:'adaz-'+r.id};
        if ('serviceWorker' in navigator) {
          const registration=await navigator.serviceWorker.ready;
          if (registration && typeof registration.showNotification==='function') await registration.showNotification('ADAZ · '+r.title,options);
          else new Notification('ADAZ · '+r.title,options);
        } else new Notification('ADAZ · '+r.title,options);
        r.lastFired=dateKey; changed=true;
      } catch {}
    }
    if (changed) save();
  }
  function renderLeisure() {
    const suggestions = [
      {title:'Microclase de inglés',type:'10–15 min',text:'Escucha un clip corto en inglés, apunta cinco expresiones y crea una frase propia con cada una.',action:'Aprendizaje',link:'https://learnenglish.britishcouncil.org/skills/listening'},
      {title:'Curiosidad del día',type:'10–20 min',text:'Elige una charla o explicación sobre ciencia, tecnología, historia o creatividad. Al terminar, escribe una idea nueva y una pregunta.',action:'Curiosidad',link:'https://www.ted.com/topics/education'},
      {title:'Reto de lógica',type:'5–10 min',text:'Sin calculadora: una camiseta cuesta $40.000 después de un descuento del 20%. ¿Cuál era el precio antes del descuento? Explica el cálculo.',action:'Pensamiento',link:''},
      {title:'Crear algo pequeño',type:'15–30 min',text:'Haz un boceto de una joya, una portada, un diseño, una foto con intención o una página de tu álbum creativo. La meta es terminar una versión simple.',action:'Creatividad',link:''},
      {title:'Movimiento para despejarte',type:'10–20 min',text:'Haz una caminata segura, estiramientos suaves o movilidad, si te apetece y tu entrenamiento lo permite. No tiene que convertirse en otra sesión intensa.',action:'Bienestar',link:''},
      {title:'Plan social sin pantallas',type:'20–60 min',text:'Propón un juego de mesa, cocinar algo sencillo con tu familia, conversar o salir a un lugar público seguro acompañado cuando corresponda.',action:'Vida personal',link:''},
      {title:'Descanso de verdad',type:'15–40 min',text:'Escoge música, lectura, una serie o una afición porque te gusta. No necesitas justificar todo el tiempo libre con productividad.',action:'Descanso',link:''},
      {title:'Mini laboratorio Aestel Lux',type:'15–25 min',text:'Esboza una publicación sobre cuidado de joyería, materiales o proceso de diseño. No compres inventario ni gastes en anuncios por impulso.',action:'Negocio creativo',link:''}
    ];
    const index = Math.floor(Date.now()/86400000) % suggestions.length;
    const item = suggestions[index];
    const root = $('#leisureFeature');
    if (root) root.innerHTML = '<div class="eyebrow">'+escapeHTML(item.action)+' · '+escapeHTML(item.type)+'</div><h2>'+escapeHTML(item.title)+'</h2><p>'+escapeHTML(item.text)+'</p>'+(item.link?'<a class="btn" href="'+escapeHTML(item.link)+'" target="_blank" rel="noopener noreferrer">Abrir recurso gratuito ↗</a>':'')+'<button class="btn primary" type="button" data-leisure-next>Otra idea</button><button class="btn" type="button" data-leisure-done="'+escapeHTML(item.title)+'">Marcar como hecha</button>';
    const history = $('#leisureHistory');
    if (history) history.innerHTML = preferences.leisureDone.slice(-8).reverse().map(x => '<div class="list-item"><span class="bullet">✓</span><div><b class="smalltext">'+escapeHTML(x.title)+'</b><div class="muted smalltext">'+escapeHTML(x.date)+'</div></div></div>').join('') || '<div class="empty">Tus actividades completadas aparecerán aquí.</div>';
  }

  const roadmapPhases = [
    {id:'baseline',period:'Ahora · octubre–noviembre de 2026',title:'Establecer la línea base',tasks:['Actualizar el horario de colegio y entrenamiento que realmente estás usando.','Hacer una práctica diagnóstica de IELTS y registrar qué habilidad necesita más trabajo.','Resolver una muestra por cada área de Saber 11 y guardar los errores frecuentes.','Conciliar capital, costos, pedidos, inventario y dinero pendiente de Aestel Lux.','Registrar durante dos semanas sueño, energía y carga deportiva para entender la rutina real.']},
    {id:'close2026',period:'Diciembre de 2026',title:'Cerrar el año con datos',tasks:['Revisar qué métodos de estudio sí mejoraron los resultados.','Calcular ventas, costos y margen real sin sumar anticipos pendientes como caja.','Revisar qué productos y contenidos merecen continuar o pausar.','Definir tres prioridades realistas para el primer trimestre de 2027.']},
    {id:'q1',period:'Primer trimestre de 2027',title:'Construir consistencia',tasks:['Sostener bloques semanales de IELTS y rotar las cuatro habilidades.','Practicar Saber 11 por área; mantener un registro de errores recurrentes.','Mejorar catálogo y presentación de Aestel Lux usando pedidos y consultas reales.','Mantener el plan de entrenamiento con seguimiento de recuperación y descanso.']},
    {id:'q2',period:'Segundo trimestre de 2027',title:'Medir y corregir',tasks:['Hacer bloques cronometrados y revisar los errores con evidencia.','Ajustar el estudio hacia las áreas más débiles, no solo hacia las más cómodas.','Comparar margen por producto y la conversión de consultas a pedidos.','Revisar carga, sueño y vida personal para que el plan siga siendo sostenible.']},
    {id:'exam',period:'Antes de Saber 11',title:'Preparación según calendario oficial',tasks:['Confirmar fechas, inscripción y requisitos exclusivamente en el ICFES.','Organizar simulacros graduales y repaso espaciado según los resultados.','Preparar logística de examen con anticipación, sin depender de una fecha supuesta.']},
    {id:'q4',period:'Segundo semestre de 2027',title:'Evaluar y rediseñar',tasks:['Revisar resultados académicos y decidir el siguiente objetivo de formación.','Hacer balance de Aestel Lux: caja, pedidos, rentabilidad, garantía y canales.','Evaluar aprendizajes, salud, descanso, relaciones y prioridades del siguiente año.']}
  ];
  function renderRoadmap() {
    const root=$('#roadmapList');
    if (!root) return;
    const done=preferences.roadmapDone||[];
    root.innerHTML=roadmapPhases.map(p=>{
      const complete=done.includes(p.id);
      return '<article class="skill" style="margin-bottom:10px;border-color:'+(complete?'#397b62':'var(--line)')+';background:'+(complete?'#10271f':'#0d1523')+'"><div class="row-between"><span class="tag '+(complete?'green':'blue')+'">'+(complete?'COMPLETADO':'EN PROCESO')+'</span><span class="muted smalltext">'+escapeHTML(p.period)+'</span></div><h3 style="font-size:14px;margin:10px 0 6px">'+escapeHTML(p.title)+'</h3><ul style="padding-left:20px;margin:7px 0;color:var(--muted);font-size:11px">'+p.tasks.map(t=>'<li style="margin:5px 0">'+escapeHTML(t)+'</li>').join('')+'</ul><button class="btn small '+(complete?'':'primary')+'" type="button" data-roadmap-toggle="'+escapeHTML(p.id)+'">'+(complete?'Marcar de nuevo en proceso':'Marcar fase como completada')+'</button></article>';
    }).join('');
    const status=$('#roadmapStatus');
    if (status) status.textContent=done.length+' de '+roadmapPhases.length+' fases marcadas como completadas. Revisa la ruta cada domingo.';
  }

    let leisureIndex = null;
  function showNextLeisure() {
    const cards = $$('#leisureCatalog .leisure-choice');
    if (!cards.length) return;
    leisureIndex = leisureIndex===null ? Math.floor(Math.random()*cards.length) : (leisureIndex+1)%cards.length;
    cards.forEach((c,i)=>c.classList.toggle('active',i===leisureIndex));
    const selected = cards[leisureIndex];
    const feature = $('#leisureFeature');
    if (feature) feature.innerHTML = '<div class="eyebrow">'+escapeHTML(selected.dataset.type||'Actividad')+' · '+escapeHTML(selected.dataset.duration||'Flexible')+'</div><h2>'+escapeHTML(selected.dataset.title||'Idea')+'</h2><p>'+escapeHTML(selected.dataset.description||'')+'</p>'+(selected.dataset.url?'<a class="btn" href="'+escapeHTML(selected.dataset.url)+'" target="_blank" rel="noopener noreferrer">Abrir recurso ↗</a>':'')+'<button class="btn primary" type="button" data-leisure-next>Otra idea</button><button class="btn" type="button" data-leisure-done="'+escapeHTML(selected.dataset.title||'Actividad')+'">Marcar como hecha</button>';
  }
  document.addEventListener('submit', e => {
    if (e.target.id!=='reminderForm') return;
    e.preventDefault();
    const title=$('#reminderTitle').value.trim();
    const time=$('#reminderTime').value;
    const repeat=$('#reminderRepeat').value;
    const date=$('#reminderDate').value||today();
    const note=$('#reminderNote').value.trim();
    if (!title || !time) { notify('Escribe el nombre y la hora del recordatorio.'); return; }
    const id='r-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
    preferences.reminders.push({id,title,time,repeat,date,note,lastFired:null});
    save(); renderReminders(); e.target.reset(); $('#reminderDate').value=today();
    notify('Recordatorio guardado. Para recibir la alarma aunque ADAZ esté cerrada, expórtalo al calendario del teléfono.');
  });
  document.addEventListener('click', e => {
    const remove=e.target.closest('[data-delete-reminder]');
    if (remove) {
      preferences.reminders=preferences.reminders.filter(r=>r.id!==remove.dataset.deleteReminder);
      save(); renderReminders(); notify('Recordatorio eliminado.'); return;
    }
    if (e.target.closest('[data-action="enableNotifications"]')) { enableNotifications(); return; }
    if (e.target.closest('[data-action="exportReminderCalendar"]')) { exportReminderCalendar(); return; }
    if (e.target.closest('[data-leisure-next]')) { showNextLeisure(); return; }
    const done=e.target.closest('[data-leisure-done]');
    if (done) {
      preferences.leisureDone.push({title:done.dataset.leisureDone,date:today()});
      preferences.leisureDone=preferences.leisureDone.slice(-40);
      save(); renderLeisure(); notify('Actividad registrada. ¡Bien hecho!'); return;
    }
    const load=e.target.closest('[data-material-fill]');
    if (load) {
      const [program,skill,minutes,goal,method]=load.dataset.materialFill.split('|');
      const nav=$('[data-page="study"]');
      if (nav) nav.click();
      setTimeout(()=>{
        const set=(id,val)=>{const field=$('#'+id); if(field) field.value=val;};
        set('studyProgram',program); set('studySkill',skill); set('studyMinutes',minutes);
        set('studyGoal',goal); set('studyMethod',method||'Práctica guiada');
        const date=$('#studyDate'); if(date && !date.value) date.value=today();
        const form=$('#studyForm');
        if(form) form.scrollIntoView({behavior:'smooth',block:'center'});
        notify('Sesión preparada. Completa el ejercicio del material y guarda el resultado al terminar.');
      },60);
    }
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-page="routine"]')) setTimeout(currentSchedule,40);
    if (e.target.closest('[data-page="leisure"]')) setTimeout(renderLeisure,40);
    if (e.target.closest('[data-page="plan"]')) setTimeout(renderRoadmap,40);
    const roadmapButton=e.target.closest('[data-roadmap-toggle]');
    if (roadmapButton) {
      const id=roadmapButton.dataset.roadmapToggle;
      preferences.roadmapDone=preferences.roadmapDone||[];
      preferences.roadmapDone=preferences.roadmapDone.includes(id)?preferences.roadmapDone.filter(x=>x!==id):preferences.roadmapDone.concat(id);
      save(); renderRoadmap(); return;
    }
  });
  function initial() {
    if ($('#routineHeading')) currentSchedule();
    if ($('#reminderList')) { $('#reminderDate').value=today(); renderReminders(); }
    if ($('#leisureFeature')) renderLeisure();
    if ($('#roadmapList')) renderRoadmap();
    window.addEventListener('adaz-extras-imported',()=>{preferences=readStore();renderReminders();renderLeisure();renderRoadmap();});
    checkDueReminders();
    window.setInterval(checkDueReminders,15000);
    document.addEventListener('visibilitychange',()=>{ if (!document.hidden) { checkDueReminders(); if ($('#reminderList')) renderReminders(); }});
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', initial);
  else initial();
})();

/* ADAZ guided session flow: one clear route from goal to source, practice and review. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],KEY='adaz-guided-sessions-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return Array.isArray(x.items)?x:{items:[]}}catch{return{items:[]}}};let db=read(),session=null,step=0;
const src={IELTS:['IELTS.org · muestra oficial Academic','https://www.ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test'],ICFES:['ICFES · preguntas reales de aplicaciones anteriores','https://www.icfes.gov.co/caja-de-herramientas-saber-11/practica/'],guide:['ICFES · guía de orientación Saber 11','https://www.icfes.gov.co/evaluaciones-icfes/saber-11/guia-de-orientacion-examen-saber-11/'],money:['Banco de la República · guías económicas para jóvenes','https://www.banrep.gov.co/es/educa/material-de-ensenanza-jovenes']};
const skills={IELTS:['Listening','Reading','Writing','Speaking'],ICFES:['Lectura Crítica','Matemáticas','Sociales y Ciudadanas','Ciencias Naturales','Inglés']};
function style(){if($('#ag-style'))return;const s=document.createElement('style');s.id='ag-style';s.textContent=`
#sideNav [data-page="routine"],#sideNav [data-page="academy"],#sideNav [data-page="review"]{display:none!important}
.sidebar nav.nav-list:not(#sideNav) .nav-btn[data-page="library"],.sidebar nav.nav-list:not(#sideNav) .nav-btn[data-page="leisure"],.sidebar nav.nav-list:not(#sideNav) .nav-btn[data-page="plan"],.sidebar nav.nav-list:not(#sideNav) .nav-btn[data-page="integrations"]{display:none!important}
#ag-launch{margin:14px 0;background:linear-gradient(125deg,#1b3048,#101a2a);border:1px solid #344a66;border-radius:18px;padding:16px;color:#eef4fc;display:flex;justify-content:space-between;gap:12px;align-items:center}
#ag-launch h2{font-size:19px;margin:4px 0}#ag-launch p{font-size:11px;color:#bac8d9;margin:0}.ag-k{font-size:9px;letter-spacing:1.3px;text-transform:uppercase;color:#b7f36b;font-weight:900}.ag-btn{border:0;border-radius:11px;background:#b7f36b;color:#111827;padding:11px 14px;font-weight:900;font-size:11px}
#ag-overlay{position:fixed;inset:0;z-index:10000;background:#050b13e8;display:none;align-items:center;justify-content:center;padding:12px}#ag-overlay.open{display:flex}.ag-modal{width:min(690px,100%);max-height:91vh;overflow:auto;background:#0e1928;color:#edf3fc;border:1px solid #30445e;border-radius:20px;padding:18px;box-shadow:0 24px 90px #0009}
.ag-head{display:flex;justify-content:space-between;align-items:center}.ag-head small{font-size:9px;color:#b7f36b;font-weight:900;letter-spacing:1px}.ag-close,.ag-back{border:1px solid #3a4d65;background:#172538;color:#eaf1fb;border-radius:10px;padding:8px 11px}
.ag-title{font-size:22px;line-height:1.15;margin:9px 0}.ag-sub{font-size:12px;color:#b8c6d8;line-height:1.5}.ag-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:14px 0}
.ag-card{border:1px solid #2b4059;background:#142338;color:#eef4fc;border-radius:15px;padding:14px;text-align:left;min-height:100px;display:flex;flex-direction:column;justify-content:space-between;gap:8px}.ag-card:active{transform:scale(.98);border-color:#b7f36b}.ag-card span{font-size:21px}.ag-card b{font-size:13px}.ag-card small{font-size:10px;color:#b4c3d6;line-height:1.4}
.ag-row{display:flex;gap:9px;margin:13px 0;flex-wrap:wrap}.ag-field{flex:1;min-width:170px}.ag-label{display:block;font-size:10px;color:#b8c6d8;margin:0 0 6px}.ag-select,.ag-text{width:100%;background:#111f30;border:1px solid #344a63;color:#eef4fc;border-radius:11px;padding:11px;font:inherit;font-size:12px}
.ag-step,.ag-result{background:#142338;border:1px solid #2c425d;border-radius:14px;padding:14px;margin:12px 0}.ag-step h3{font-size:14px;margin:0 0 7px}.ag-step p,.ag-step li{font-size:12px;color:#c5d2e1;line-height:1.6}.ag-source{display:flex;justify-content:space-between;gap:10px;background:#0a1421;border:1px solid #2a3c53;padding:12px;border-radius:12px;margin:10px 0}.ag-source b{font-size:11px}.ag-source a{color:#b7f36b;font-size:11px;font-weight:850;text-decoration:none}.ag-muted{font-size:10px;color:#9eb0c5;line-height:1.5}.ag-progress{height:6px;background:#26374c;border-radius:20px;overflow:hidden;margin:13px 0}.ag-progress i{display:block;height:100%;background:#b7f36b}.ag-actions{display:flex;justify-content:space-between;gap:8px;margin-top:15px}.ag-back{font-size:11px}.ag-chip{display:inline-block;border-radius:99px;background:#20344b;color:#cbd8e8;padding:5px 9px;font-size:9px;margin:3px}
@media(max-width:560px){#ag-launch{align-items:flex-start;flex-direction:column}#ag-launch .ag-btn{width:100%}.ag-modal{padding:14px}.ag-title{font-size:20px}}
`;document.head.append(s)}
function inject(){if(!$('#ag-overlay')){const o=document.createElement('div');o.id='ag-overlay';o.innerHTML='<div class="ag-modal" role="dialog" aria-modal="true"><div id="ag-content"></div></div>';document.body.append(o);o.addEventListener('click',e=>{if(e.target===o)close()})}
const hero=$('#page-dashboard .hero');if(hero&&!$('#ag-launch')){const n=document.createElement('section');n.id='ag-launch';n.innerHTML='<div><div class="ag-k">Tu siguiente paso</div><h2>Una sesión concreta. Un avance real.</h2><p>Elige qué mejorar y ADAZ te lleva al material y a la actividad.</p></div><button class="ag-btn" data-ag-open>▶ Empezar sesión</button>';hero.after(n)}
const h=$('#page-study .page-heading');if(h&&!$('#ag-study-launch')){const n=document.createElement('div');n.id='ag-study-launch';n.className='ag-result';n.innerHTML='<b>Sesión guiada de estudio</b><p class="ag-muted">Elige IELTS o ICFES; ADAZ abre el material oficial y te guía.</p><button class="ag-btn" data-ag-open="study">Empezar sesión</button>';h.after(n)}
const finance=$('.sidebar nav.nav-list:not(#sideNav) [data-page="finance"]');if(finance&&!$('#sideNav [data-page="finance"]'))$('#sideNav').append(finance);
const timer=$('#timerStart')?.closest('.card');if(timer)timer.style.display='none';const hist=$('#focusHistory')?.closest('.card');if(hist)hist.style.display='none';const old=$('#studyMaterial');if(old)old.style.display='none';
const nav=$('#sideNav');if(nav){const names={dashboard:'Hoy',study:'Aprender',business:'Negocio',training:'Health',finance:'Metas'},icons={dashboard:'◫',study:'▤',business:'↗',training:'⌁',finance:'◎'};$$('[data-page]',nav).forEach(b=>{if(names[b.dataset.page])b.innerHTML='<span class="nav-icon">'+icons[b.dataset.page]+'</span>'+names[b.dataset.page]})}}
function open(){ $('#ag-overlay')?.classList.add('open');chooser() }function close(){$('#ag-overlay')?.classList.remove('open');session=null;step=0}
function chooser(){$('#ag-content').innerHTML='<div class="ag-head"><small>ADAZ · SESIÓN GUIADA</small><button class="ag-close" data-ag-close>✕</button></div><h2 class="ag-title">¿En qué quieres avanzar?</h2><p class="ag-sub">Elige una sola área. Te mostramos material, actividad y siguiente paso.</p><div class="ag-grid"><button class="ag-card" data-area="study"><span>📚</span><b>Aprender</b><small>IELTS e ICFES con fuentes oficiales.</small></button><button class="ag-card" data-area="business"><span>↗</span><b>Negocio</b><small>Costos, catálogo, contenido y pedidos.</small></button><button class="ag-card" data-area="health"><span>🏊</span><b>Health</b><small>Gimnasio y natación guiados.</small></button><button class="ag-card" data-area="finance"><span>🎯</span><b>Metas y dinero</b><small>Compras y ahorro personal.</small></button><button class="ag-card" data-area="personal"><span>🧭</span><b>Vida personal</b><small>Objetivos y hábitos.</small></button></div><p class="ag-muted">Sesiones guardadas: '+db.items.length+'. Tus registros personales no se mezclan con el capital del negocio.</p>'}
function studySetup(){$('#ag-content').innerHTML='<div class="ag-head"><small>APRENDIZAJE</small><button class="ag-close" data-ag-close>✕</button></div><h2 class="ag-title">¿Qué vas a practicar?</h2><div class="ag-row"><label class="ag-field"><span class="ag-label">Examen</span><select class="ag-select" id="ag-program"><option>IELTS</option><option>ICFES</option></select></label><label class="ag-field"><span class="ag-label">Competencia</span><select class="ag-select" id="ag-skill"></select></label></div><div class="ag-result"><b>Método de la sesión</b><p class="ag-muted">Recuperación activa, práctica auténtica, corrección de errores y repaso espaciado. ADAZ no presentará ejercicios propios como preguntas oficiales.</p></div><div class="ag-actions"><button class="ag-back" data-ag-back>Volver</button><button class="ag-btn" data-study-begin>Crear sesión →</button></div>';const p=$('#ag-program'),s=$('#ag-skill'),fill=()=>s.innerHTML=skills[p.value].map(x=>'<option>'+x+'</option>').join('');p.addEventListener('change',fill);fill()}
function businessSetup(){$('#ag-content').innerHTML='<div class="ag-head"><small>AESTEL LUX · NEGOCIO</small><button class="ag-close" data-ag-close>✕</button></div><h2 class="ag-title">¿Qué necesita avanzar?</h2><div class="ag-grid"><button class="ag-card" data-biz="cost"><span>🧮</span><b>Costos y margen</b><small>Calcular costo real de una pieza.</small></button><button class="ag-card" data-biz="catalog"><span>💎</span><b>Catálogo</b><small>Mejorar una ficha de producto.</small></button><button class="ag-card" data-biz="content"><span>📱</span><b>Contenido</b><small>Preparar una publicación útil.</small></button><button class="ag-card" data-biz="orders"><span>📦</span><b>Pedidos</b><small>Revisar estados y próximos pasos.</small></button></div><button class="ag-back" data-ag-back>Volver</button>'}
function healthSetup(){$('#ag-content').innerHTML='<div class="ag-head"><small>ADAZ HEALTH</small><button class="ag-close" data-ag-close>✕</button></div><h2 class="ag-title">¿Qué sesión tienes hoy?</h2><div class="ag-grid"><button class="ag-card" data-health="gym"><span>🏋️</span><b>Gimnasio</b><small>Rutina y ejercicios en orden.</small></button><button class="ag-card" data-health="swim"><span>🏊</span><b>Natación</b><small>Trabajo coordinado con tu entrenador.</small></button></div><p class="ag-muted">Técnica y recuperación tienen prioridad; los ajustes de carga se revisan con tu entrenador.</p><button class="ag-back" data-ag-back>Volver</button>'}
function create(area,sub={}){let p={area:'',title:'',minutes:20,material:'',task:'',recall:'',next:''};
if(area==='study'){const ic=sub.program==='ICFES';p={area:'Aprender',title:sub.program+' · '+sub.skill,minutes:35,source:ic?src.ICFES:src.IELTS,guide:ic?src.guide:null,material:ic?'Practica '+sub.skill+' con preguntas de aplicaciones anteriores y revisa las explicaciones oficiales.':'Practica '+sub.skill+' con una tarea de muestra oficial y revisa modelos o criterios publicados.',task:ic?'Abre la Caja de Herramientas, selecciona '+sub.skill+', resuelve un bloque de preguntas sin mirar respuestas y luego revisa la explicación.':'Abre la muestra oficial IELTS Academic, selecciona '+sub.skill+' y completa una tarea siguiendo el formato y las instrucciones del examen.',recall:'Sin mirar el material, explica qué estrategia usaste, qué evidencia respalda tu respuesta y cuál fue tu error principal.',next:'Anota el error y prográmalo para un repaso breve mañana.'}}
if(area==='business'){const x={cost:['Costos y margen','Suma precio de proveedor, envío proporcional, empaque y otros costos directos. Compara costo total y precio de venta.','¿Cuál es el costo total? ¿Qué margen estimado deja? ¿Qué dato falta confirmar?'],catalog:['Ficha de catálogo','Prepara una ficha con nombre, material y medidas confirmadas, fotos propias, precio y plazo de entrega. No afirmes características no verificadas.','¿La ficha explica qué es, de qué material está hecha, cuánto cuesta y cómo se entrega?'],content:['Planear contenido','Elige una pieza. Define la duda del cliente, un beneficio verificable, una demostración visual y una llamada a consultar.','¿Qué duda resuelve la publicación y qué resultado vas a medir?'],orders:['Revisar pedidos','Revisa pedidos abiertos, anticipos, fechas prometidas y estado del proveedor. Actualiza solo datos confirmados.','¿Qué pedido requiere atención primero y cuál es la siguiente acción?']}[sub.task];p={area:'Negocio',title:x[0],minutes:25,material:'Actividad aplicada a Aestel Lux. Mantén separados el dinero personal y el capital del negocio.',task:x[1],recall:x[2],next:'Registra el resultado en el panel de Negocio y define la siguiente acción.'}}
if(area==='health'){const swim=sub.task==='swim';p={area:'Health',title:swim?'Sesión de natación':'Sesión de fuerza',minutes:35,material:'Sigue el plan de ADAZ Health y las indicaciones de tu entrenador. No aumentes cargas ni volumen por tu cuenta.',task:swim?'Abre la pestaña Natación, revisa el objetivo y confirma con tu entrenador el contenido, intensidad y descansos. Registra la sesión al terminar.':'Abre Gimnasio, selecciona el día que corresponde y sigue los ejercicios en orden, con técnica controlada y descansos previstos.',recall:'Al terminar, registra cómo te sentiste y si mantuviste técnica cómoda. Detén la actividad y avisa a tu entrenador si aparece dolor o malestar.',next:'Guarda la sesión en Mi progreso y respeta el descanso.'}}
if(area==='finance')p={area:'Metas y dinero',title:'Planificar una compra',minutes:15,source:src.money,material:'Define un objetivo de ahorro concreto. Separa el dinero personal del capital del negocio.',task:'En Metas, crea una compra con precio aproximado, prioridad y fecha deseada. Elige un aporte que no comprometa tus necesidades ni obligaciones.',recall:'¿Cuánto cuesta? ¿Cuánto llevas? ¿Cuánto falta? ¿Qué aporte puedes separar de forma realista?',next:'Revisa la meta una vez por semana y actualiza el precio si cambia.'}
if(area==='personal')p={area:'Vida personal',title:'Convertir una meta en un paso de hoy',minutes:15,material:'Elige una meta con resultado observable, fecha de revisión y una acción que quepa en tu día real.',task:'Escribe qué quieres conseguir, cómo medirás el avance y cuál es la acción más pequeña que puedes completar hoy. Considera colegio, descanso y responsabilidades.',recall:'¿Qué resultado espero? ¿Cuál es el primer paso? ¿Qué podría impedirlo y cuál sería mi alternativa?',next:'Añade el paso a tu día y revísalo en tu revisión semanal.'};
session={...p,started:new Date().toISOString(),sub};step=0;render()}
function render(){const p=session,labels=['PREPARA','HAZ','RECUERDA'];let b='';
if(step===0)b='<div class="ag-step"><h3>Objetivo</h3><p>'+esc(p.material)+'</p><span class="ag-chip">⏱ '+p.minutes+' min orientativos</span></div>'+(p.source?'<div class="ag-source"><b>'+esc(p.source[0])+'</b><a href="'+p.source[1]+'" target="_blank" rel="noopener">Abrir material ↗</a></div>':'')+(p.guide?'<div class="ag-source"><b>'+esc(p.guide[0])+'</b><a href="'+p.guide[1]+'" target="_blank" rel="noopener">Abrir guía ↗</a></div>':'')+'<div class="ag-step"><h3>Actividad</h3><p>'+esc(p.task)+'</p></div>';
if(step===1)b='<div class="ag-step"><h3>Realiza la actividad</h3><p>'+esc(p.task)+'</p><ul><li>Trabaja en una sola tarea.</li><li>Intenta resolver antes de consultar respuestas.</li><li>Identifica y explica tus errores.</li></ul></div><label class="ag-label" for="ag-notes">Notas de trabajo</label><textarea id="ag-notes" class="ag-text" rows="4" placeholder="Respuestas, cálculos o decisiones...">'+esc(p.notes||'')+'</textarea>';
if(step===2)b='<div class="ag-step"><h3>Recuperación activa</h3><p>'+esc(p.recall)+'</p></div><label class="ag-label" for="ag-answer">Tu resultado y reflexión</label><textarea id="ag-answer" class="ag-text" rows="4" placeholder="¿Qué aprendiste? ¿Qué necesitas mejorar?"></textarea><div class="ag-result"><b>Próximo paso</b><p class="ag-muted">'+esc(p.next)+'</p></div>';
$('#ag-content').innerHTML='<div class="ag-head"><small>ADAZ · '+esc(p.area)+'</small><button class="ag-close" data-ag-close>✕</button></div><h2 class="ag-title">'+esc(p.title)+'</h2><p class="ag-sub">Sigue los pasos en orden. Una actividad a la vez.</p><div class="ag-progress"><i style="width:'+((step+1)*33.33)+'%"></i></div><div class="ag-muted">PASO '+(step+1)+' DE 3 · '+labels[step]+'</div>'+b+'<div class="ag-actions"><button class="ag-back" data-ag-back>← '+(step?'Anterior':'Cambiar área')+'</button><button class="ag-btn" data-ag-next>'+(step===2?'Guardar sesión ✓':'Siguiente →')+'</button></div>'}
function finish(){const r={id:Date.now().toString(36),area:session.area,title:session.title,completed:new Date().toISOString(),minutes:session.minutes,notes:session.notes||$('#ag-notes')?.value||'',answer:$('#ag-answer')?.value||''};db.items.unshift(r);db.items=db.items.slice(0,250);try{localStorage.setItem(KEY,JSON.stringify(db))}catch{}$('#ag-content').innerHTML='<div class="ag-head"><small>SESIÓN GUARDADA</small><button class="ag-close" data-ag-close>✕</button></div><h2 class="ag-title">Avance registrado.</h2><div class="ag-result"><b>'+esc(r.title)+'</b><p class="ag-muted">'+esc(r.area)+' · '+r.minutes+' min orientativos</p><p class="ag-muted">Tu reflexión quedó guardada en este dispositivo.</p></div><p class="ag-sub">Siguiente paso: '+esc(session.next)+'</p><div class="ag-actions"><button class="ag-back" data-ag-close>Cerrar</button><button class="ag-btn" data-ag-open>Otra sesión</button></div>'}
function routeHealth(task){$('[data-page="training"]')?.click();const root=$('#adaz-strength-plan'),tab=task==='swim'?'swim':'gym';root?.querySelector('[data-health-tab="'+tab+'"]')?.click();root?.querySelector('[data-health-panel="'+tab+'"]')?.scrollIntoView({behavior:'smooth',block:'start'});if(tab==='gym'){const d=root?.querySelector('.routine-day');if(d)d.open=true}}
document.addEventListener('click',e=>{if(e.target.closest('[data-ag-open]')){e.preventDefault();open();return}if(e.target.closest('[data-ag-close]')){close();return}
const a=e.target.closest('[data-area]');if(a){const v=a.dataset.area;({study:studySetup,business:businessSetup,health:healthSetup,finance:()=>create('finance'),personal:()=>create('personal')})[v]();return}
if(e.target.closest('[data-ag-back]')){if(session&&step){step--;render()}else chooser();return}
if(e.target.closest('[data-study-begin]')){create('study',{program:$('#ag-program').value,skill:$('#ag-skill').value});return}
const bz=e.target.closest('[data-biz]');if(bz){create('business',{task:bz.dataset.biz});return}
const he=e.target.closest('[data-health]');if(he){routeHealth(he.dataset.health);create('health',{task:he.dataset.health});return}
if(e.target.closest('[data-ag-next]')){if(step===1)session.notes=$('#ag-notes')?.value||'';if(step<2){step++;render()}else finish();return}
const f=e.target.closest('[data-action="focus"]');if(f){e.preventDefault();e.stopImmediatePropagation();open()}
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
function init(){style();inject();new MutationObserver(inject).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();