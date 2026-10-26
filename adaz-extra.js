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
      if (parsed && typeof parsed === 'object') return {reminders:Array.isArray(parsed.reminders)?parsed.reminders:[], leisureDone:Array.isArray(parsed.leisureDone)?parsed.leisureDone:[]};
    } catch {}
    return {reminders:[], leisureDone:[]};
  };
  let preferences = readStore();
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(preferences)); }
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
  });
  function initial() {
    if ($('#routineHeading')) currentSchedule();
    if ($('#reminderList')) { $('#reminderDate').value=today(); renderReminders(); }
    if ($('#leisureFeature')) renderLeisure();
    checkDueReminders();
    window.setInterval(checkDueReminders,15000);
    document.addEventListener('visibilitychange',()=>{ if (!document.hidden) { checkDueReminders(); if ($('#reminderList')) renderReminders(); }});
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', initial);
  else initial();
})();