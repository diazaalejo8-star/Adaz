(() => {
  'use strict';
  if (window.__adazOperatingSystemV1) return;
  window.__adazOperatingSystemV1 = true;

  const KEY = 'adaz-operating-system-v1';
  const $ = (selector, root=document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const iso = date => [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
  const today = () => iso(new Date());
  const parseDay = value => new Date(value + 'T12:00:00');
  const mondayOf = value => {
    const date = parseDay(value);
    date.setDate(date.getDate() - ((date.getDay()+6)%7));
    return iso(date);
  };
  const weekIndex = value => Math.max(0, Math.floor((parseDay(mondayOf(value)) - parseDay('2026-11-16')) / 604800000));
  const readJSON = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value === 'object' ? value : fallback;
    } catch (_) { return fallback; }
  };
  let state = readJSON(KEY, {version:1, done:{}, reviews:{}});
  state.done = state.done && typeof state.done === 'object' ? state.done : {};
  state.reviews = state.reviews && typeof state.reviews === 'object' ? state.reviews : {};

  const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const icfesAreas = ['Matemáticas','Lectura Crítica','Ciencias Naturales','Sociales y Ciudadanas','Inglés'];
  const medicineTopics = ['Biología celular','Anatomía general','Fisiología básica','Bioquímica','Genética','Método científico'];
  const fridayCycle = ['Writing · Task 1','Writing · Task 2','Speaking · Part 2','Speaking · Part 3'];

  function mainData() {
    const data = readJSON('adaz-data-v1', {});
    return data && typeof data === 'object' ? data : {};
  }
  function weakestIcfes(data, week) {
    const cutoff = iso(new Date(parseDay(today()).getTime() - 56*86400000));
    const rows = (Array.isArray(data.study) ? data.study : []).filter(item =>
      item.program === 'ICFES' && item.skill && item.accuracy !== '' &&
      item.accuracy !== null && item.accuracy !== undefined &&
      Number.isFinite(Number(item.accuracy)) && item.date >= cutoff
    );
    const groups = {};
    rows.forEach(item => {
      const key = String(item.skill);
      groups[key] = groups[key] || {sum:0, count:0};
      groups[key].sum += Number(item.accuracy);
      groups[key].count += 1;
    });
    const ranked = Object.keys(groups).map(key => ({
      name:key, score:groups[key].sum/groups[key].count, count:groups[key].count
    })).sort((a,b) => a.score-b.score || b.count-a.count);
    if (ranked.length) return {name:ranked[0].name, score:Math.round(ranked[0].score), evidence:ranked[0].count};
    return {name:icfesAreas[week%icfesAreas.length], score:null, evidence:0};
  }
  function nextIeltsSkill(data, week) {
    const rows = (Array.isArray(data.study) ? data.study : []).filter(item =>
      item.program === 'IELTS' && item.band !== '' && item.band !== null &&
      item.band !== undefined && Number.isFinite(Number(item.band)) &&
      ['Listening','Reading','Writing','Speaking'].includes(item.skill)
    );
    const latest = {};
    rows.sort((a,b) => String(b.date||'').localeCompare(String(a.date||''))).forEach(item => {
      if (latest[item.skill] === undefined) latest[item.skill] = Number(item.band);
    });
    const ranked = Object.entries(latest).sort((a,b) => a[1]-b[1]);
    if (ranked.length) return {name:ranked[0][0], band:ranked[0][1], evidence:true};
    return {name:week%2===0?'Listening':'Reading', band:null, evidence:false};
  }

  function buildDay(dateValue) {
    const date = parseDay(dateValue);
    const day = date.getDay();
    const week = weekIndex(dateValue);
    const data = mainData();
    const icfes = weakestIcfes(data, week);
    const ielts = nextIeltsSkill(data, week);
    const study = (id, title, detail, minutes, page='academy') =>
      ({id, title, detail, minutes, page, type:'study'});
    const gym = (id, title, detail) =>
      ({id, title, detail, minutes:'Según rutina', page:'training', type:'health'});
    const swim = (id, title, detail) =>
      ({id, title, detail, minutes:'Según entrenador', page:'training', type:'health', optional:true});
    const business = (id, title, detail) =>
      ({id, title, detail, minutes:'15–25 min', page:'business', type:'business', optional:true});
    const review = (id, title, detail) =>
      ({id, title, detail, minutes:'15–20 min', page:'review', type:'review'});
    const dayPlan = {
      1: [
        study('icfes-math','ICFES · Matemáticas','Trabaja resolución de problemas, interpretación de gráficas y razonamiento. Cierra con preguntas y registra por qué fallaste.', '45–60 min'),
        gym('gym-full-a','Gimnasio · Día 1 Full Body A','Sigue el orden de ADAZ Health y la indicación del entrenador. Calidad técnica antes que carga.')
      ],
      2: [
        study('ielts-cycle','IELTS · '+ielts.name,'Práctica dirigida de '+ielts.name+'. Revisa errores y guarda evidencia; si aún no tienes banda registrada, alterna Listening y Reading.', '40–50 min'),
        gym('gym-upper','Gimnasio · Día 2 Upper','Sesión de tren superior según la rutina vigente y la técnica supervisada.')
      ],
      3: [
        study('medicine-foundations','Medicina · '+medicineTopics[week%medicineTopics.length],'Estudia un fundamento y explícalo con tus propias palabras. Es formación introductoria, no práctica clínica.', '35–45 min'),
        swim('swim-technical','Natación · técnica','Realiza la sesión que corresponda al plan real del entrenador. Si hoy no hay piscina, deja el espacio para recuperación.')
      ],
      4: [
        study('icfes-gap','ICFES · '+icfes.name,'Prioriza la competencia con menor precisión registrada en las últimas ocho semanas. '+(icfes.score===null?'Aún no hay suficientes resultados: se usa una rotación equilibrada.':'Promedio reciente registrado: '+icfes.score+'% en '+icfes.evidence+' registro(s).'), '45–60 min'),
        gym('gym-full-b','Gimnasio · Día 3 Full Body B','Sigue la segunda sesión Full Body, sin acumular trabajo de días anteriores.')
      ],
      5: [
        study('ielts-production','IELTS · '+fridayCycle[week%fridayCycle.length],'Alterna producción escrita y oral. Usa los criterios públicos de IELTS para revisar claridad, desarrollo, coherencia y precisión.', '40–60 min'),
        swim('swim-efficiency','Natación · sesión del entrenador','Coordina la carga con la sesión de piscina. Si no está programada, prioriza recuperación y movilidad cómoda.')
      ],
      6: [
        gym('gym-lower','Gimnasio · Día 4 Lower','Completa la sesión Lower del plan. Si haces una evaluación larga, evita añadir trabajo extra y ajusta el día con tu entrenador.'),
        study('weekend-assessment',week%2===0?'Evaluación ICFES · bloque cronometrado':'IELTS · práctica cronometrada','Cada dos semanas alterna una evaluación dirigida. Reserva 60–90 minutos como máximo para el bloque; divide las pruebas extensas en sesiones separadas y corrige después.', '60–90 min'),
        business('business-review','Oro Laminado · control operativo','Revisa caja, compras, inventario, pedidos y margen. Es opcional cuando no haya operaciones pendientes.')
      ],
      0: [
        review('weekly-review','Revisión semanal ADAZ','Mira resultados reales, identifica el obstáculo principal y define tres resultados concretos para la semana siguiente.')
      ]
    };
    return {date:dateValue, day, week, blocks:dayPlan[day] || []};
  }

  function doneFor(dateValue) {
    return Array.isArray(state.done[dateValue]) ? state.done[dateValue] : [];
  }
  function save() {
    try {
      state.version = 1;
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      const toast = $('#toast');
      if (toast) {
        toast.textContent = 'No se pudo guardar el plan. Exporta un respaldo y libera espacio antes de continuar.';
        toast.classList.add('show');
      }
      return false;
    }
  }
  function dateLabel(value) {
    return parseDay(value).toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }
  function phaseNote(value) {
    if (value >= '2026-11-14' && value <= '2027-01-17') {
      return 'Periodo de vacaciones: usa bloques flexibles de 45–75 minutos. No hay horas fijas; deja espacio para descanso y actividades personales.';
    }
    if (value >= '2027-01-18') {
      return 'Periodo escolar: el horario 2027 aún no está configurado. Coloca los bloques después de clases y adapta su duración a tus tiempos reales; ADAZ no inventa horas.';
    }
    return 'Los bloques son orientativos. Ajusta las horas al colegio, al entrenador, a la familia y a tu energía real.';
  }
  function blockHTML(block, dateValue, completed) {
    const done = completed.includes(block.id);
    return '<article class="os-block '+(done?'is-done':'')+' '+(block.optional?'is-optional':'')+'">' +
      '<div class="os-block-copy"><div class="os-block-tag">'+esc(block.type==='study'?'APRENDIZAJE':block.type==='health'?'SALUD':block.type==='business'?'NEGOCIO':'REVISIÓN')+(block.optional?' · OPCIONAL':'')+'</div>' +
      '<h3>'+esc(block.title)+'</h3><p>'+esc(block.detail)+'</p><small>'+esc(block.minutes)+'</small></div>' +
      '<div class="os-block-actions">'+(block.page?'<button class="os-open" type="button" data-page="'+esc(block.page)+'">Abrir</button>':'')+
      '<button class="os-toggle" type="button" data-os-toggle="'+esc(block.id)+'" aria-pressed="'+(done?'true':'false')+'">'+(done?'Hecho ✓':'Marcar hecho')+'</button></div></article>';
  }
  function renderDashboard() {
    const page = $('#page-dashboard');
    if (!page) return;
    let root = $('#adaz-operating-system-dashboard', page);
    if (!root) {
      root = document.createElement('section');
      root.id = 'adaz-operating-system-dashboard';
      root.className = 'os-dashboard';
      root.setAttribute('aria-label','Programación principal de ADAZ');
      const anchor = $('#dashboardStats', page);
      if (anchor) anchor.insertAdjacentElement('afterend', root);
      else page.append(root);
    }
    const value = today();
    const plan = buildDay(value);
    const completed = doneFor(value);
    const required = plan.blocks.filter(item=>!item.optional);
    const completeRequired = required.filter(item=>completed.includes(item.id)).length;
    const next = plan.blocks.find(item=>!completed.includes(item.id) && !item.optional) || plan.blocks.find(item=>!completed.includes(item.id));
    const week = weekIndex(value)+1;
    const progress = required.length ? Math.round(completeRequired/required.length*100) : 0;
    root.innerHTML = '<div class="os-dashboard-head"><div><div class="os-kicker">ADAZ · SISTEMA OPERATIVO</div><h2>Tu programación de hoy</h2><p>'+esc(dateLabel(value))+' · una prioridad principal y compromisos bien distribuidos.</p></div><span class="os-week">SEMANA '+week+'</span></div>' +
      (next?'<div class="os-next"><div><span class="os-kicker">SIGUIENTE ACCIÓN</span><h3>'+esc(next.title)+'</h3><p>'+esc(next.detail)+'</p></div><button type="button" class="os-next-button" data-page="'+esc(next.page||'dashboard')+'">Abrir paso →</button></div>':'<div class="os-next"><div><span class="os-kicker">DÍA COMPLETADO</span><h3>Ya cerraste lo esencial.</h3><p>No añadas tareas por llenar el día. Descanso y vida personal también forman parte del plan.</p></div></div>') +
      '<div class="os-progress-row"><div class="os-progress"><span style="width:'+progress+'%"></span></div><b>'+completeRequired+'/'+required.length+' esenciales</b></div>' +
      '<div class="os-block-list">'+plan.blocks.map(block=>blockHTML(block,value,completed)).join('')+'</div>' +
      '<div class="os-foot"><span>'+esc(phaseNote(value))+'</span><span>Lo que no se hizo no se acumula automáticamente.</span></div>';
    const experience = $('#ae-dashboard', page);
    if (experience) experience.hidden = true;
  }

  const weeklyOverview = [
    ['Lunes','ICFES Matemáticas','Día 1 · Full Body A'],
    ['Martes','IELTS Listening / Reading','Día 2 · Upper'],
    ['Miércoles','Medicina · fundamentos','Natación técnica según entrenador'],
    ['Jueves','ICFES · área más débil','Día 3 · Full Body B'],
    ['Viernes','IELTS Writing / Speaking','Natación o recuperación'],
    ['Sábado','Evaluación alternada + Oro Laminado','Día 4 · Lower'],
    ['Domingo','Revisión de 15–20 min','Descanso físico']
  ];
  function renderPlan() {
    const page = $('#page-plan');
    if (!page) return;
    let root = $('#adaz-operating-system-plan', page);
    if (!root) {
      root = document.createElement('section');
      root.id = 'adaz-operating-system-plan';
      root.className = 'os-plan';
      const heading = page.querySelector('.page-heading');
      if (heading) heading.insertAdjacentElement('afterend', root);
      else page.prepend(root);
    }
    const weekStart = mondayOf(today());
    const review = state.reviews[weekStart] || {};
    const priorities = Array.isArray(review.priorities) ? review.priorities : [];
    const savedLine = review.savedAt ? 'Última revisión guardada: '+new Date(review.savedAt).toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'}) : 'Aún no has guardado la revisión de esta semana.';
    root.innerHTML = '<section class="os-panel"><div class="os-kicker">01 · CADENCIA SEMANAL</div><h2>Una semana con intención</h2><p>La programación distribuye tus cinco frentes sin pedirte que avances en todos todos los días. Los bloques se pueden mover; no se deben acumular.</p><div class="os-week-grid">'+weeklyOverview.map((row,i)=>'<article class="os-week-card"><span>'+esc(row[0])+'</span><b>'+esc(row[1])+'</b><small>'+esc(row[2])+'</small></article>').join('')+'</div><div class="os-principles"><div><b>Estudio</b><span>2 bloques ICFES · 2 bloques IELTS · 1 bloque de Medicina.</span></div><div><b>Salud</b><span>4 sesiones de gimnasio del split actual y natación según el entrenador; domingo sin gimnasio.</span></div><div><b>Negocio</b><span>Un control semanal de caja, compras, inventario, pedidos y margen; sin publicar por obligación.</span></div></div></section>' +
      '<section class="os-panel"><div class="os-kicker">02 · MÉTODO DE EJECUCIÓN</div><h2>Cómo funciona ADAZ</h2><div class="os-method-grid"><article><b>Definir</b><p>Una meta anual se convierte en resultados trimestrales y tres prioridades semanales.</p></article><article><b>Ejecutar</b><p>Cada día muestra la siguiente acción concreta. Empieza por el bloque principal y registra el resultado en su módulo.</p></article><article><b>Medir</b><p>Los porcentajes, bandas, ventas y sesiones se basan en tus registros; un dato que no existe no se inventa.</p></article><article><b>Ajustar</b><p>La siguiente semana prioriza las brechas observadas. Las tareas omitidas no se trasladan en cadena.</p></article></div><p class="os-note">'+esc(phaseNote(today()))+' Máximo recomendado: dos bloques de concentración exigentes al día; el resto debe respetar estudio, entrenamiento, descanso y compromisos reales.</p></section>' +
      '<section class="os-panel os-review-panel"><div class="os-kicker">03 · REVISIÓN SEMANAL</div><h2>Decide qué cambia la próxima semana</h2><p>Completa esta revisión al final de la semana. Guarda hechos y decisiones, no una lista de propósitos vagos.</p><div class="os-saved">'+esc(savedLine)+'</div><form id="os-weekly-review" class="os-review-form"><label>Prioridad 1 · resultado concreto<input name="p1" maxlength="120" value="'+esc(priorities[0]||'')+'" placeholder="Ej. Mejorar precisión en Matemáticas"></label><label>Prioridad 2<input name="p2" maxlength="120" value="'+esc(priorities[1]||'')+'" placeholder="Ej. Completar dos prácticas IELTS"></label><label>Prioridad 3<input name="p3" maxlength="120" value="'+esc(priorities[2]||'')+'" placeholder="Ej. Conciliar inventario y caja"></label><label>Qué sí avanzó<textarea name="win" rows="2" maxlength="500" placeholder="Anota un resultado observable.">'+esc(review.win||'')+'</textarea></label><label>Qué obstáculo se repitió<textarea name="obstacle" rows="2" maxlength="500" placeholder="Ej. Horarios cambiantes, exceso de tareas o falta de material.">'+esc(review.obstacle||'')+'</textarea></label><label>Qué ajuste harás la próxima semana<textarea name="adjustment" rows="2" maxlength="500" placeholder="Un cambio concreto y realista.">'+esc(review.adjustment||'')+'</textarea></label><div class="os-review-actions"><button type="submit" class="os-next-button">Guardar revisión semanal</button><span>Semana desde '+esc(weekStart)+'</span></div></form></section>';
  }

  function toggleBlock(id) {
    const date = today();
    const list = doneFor(date).slice();
    const index = list.indexOf(id);
    if (index >= 0) list.splice(index,1);
    else list.push(id);
    state.done[date] = list;
    save();
    renderDashboard();
  }
  document.addEventListener('click', event => {
    const toggle = event.target.closest('[data-os-toggle]');
    if (toggle) {
      toggleBlock(toggle.dataset.osToggle);
      return;
    }
  });
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!form || form.id !== 'os-weekly-review') return;
    event.preventDefault();
    const values = new FormData(form);
    const week = mondayOf(today());
    state.reviews[week] = {
      priorities:[values.get('p1'),values.get('p2'),values.get('p3')].map(value=>String(value||'').trim()).filter(Boolean).slice(0,3),
      win:String(values.get('win')||'').trim(),
      obstacle:String(values.get('obstacle')||'').trim(),
      adjustment:String(values.get('adjustment')||'').trim(),
      savedAt:new Date().toISOString()
    };
    if (save()) renderPlan();
    const toast = $('#toast');
    if (toast) {
      toast.textContent = 'Revisión guardada. La próxima semana conserva estas prioridades como referencia.';
      toast.classList.add('show');
    }
  });
  window.addEventListener('adaz-data-updated', () => {
    renderDashboard();
    renderPlan();
  });
  window.addEventListener('storage', event => {
    if (event.key === KEY || event.key === 'adaz-data-v1') {
      state = readJSON(KEY, {version:1,done:{},reviews:{}});
      state.done = state.done && typeof state.done === 'object' ? state.done : {};
      state.reviews = state.reviews && typeof state.reviews === 'object' ? state.reviews : {};
      renderDashboard();
      renderPlan();
    }
  });
  renderDashboard();
  renderPlan();
})();