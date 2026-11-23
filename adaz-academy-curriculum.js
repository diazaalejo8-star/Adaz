(()=>{'use strict';
const page=document.querySelector('#page-academy');if(!page||window.__adazCurriculumV1)return;window.__adazCurriculumV1=true;
const KEY='adaz-academy-curriculum-progress-v1';
const tracks=[
{id:'icfes',name:'ICFES · Saber 11',tag:'Cinco pruebas oficiales',desc:'Preparación por competencias, afirmaciones y evidencias. La práctica de examen se realiza con cuadernillos oficiales y sus claves; no se presentan preguntas inventadas como ICFES.',source:[['Guía de orientación Saber 11 · ICFES','https://www.icfes.gov.co/evaluaciones-icfes/saber-11/guia-de-orientacion-examen-saber-11/'],['Caja de herramientas oficial ICFES','https://www.icfes.gov.co/caja-de-herramientas-saber-11/'],['Grupo500 · programa Año 500','https://ano500.grupo500educacion.co/'],['Grupo500 · metodología pública','https://grupo500educacion.com/pages/quienes-somos']],modules:[
['Matemáticas','Pensamiento numérico y variacional','Fracciones, razones, proporciones, porcentajes, tasas, potencias, notación científica, patrones, expresiones algebraicas, ecuaciones e inecuaciones.','Modela situaciones reales y justifica cada operación; identifica unidades y supuestos.'],
['Matemáticas','Funciones y modelación','Relaciones lineales, cuadráticas y exponenciales; tablas, gráficas, pendiente, interceptos, sistemas de ecuaciones y lectura de parámetros.','Pasa entre descripción verbal, tabla, expresión y gráfica; explica qué representa cada parámetro.'],
['Matemáticas','Geometría y medición','Perímetro, área, volumen, semejanza, escala, transformaciones, coordenadas, teorema de Pitágoras y relaciones métricas.','Dibuja el contexto, identifica datos, unidades y restricciones antes de calcular.'],
['Matemáticas','Estadística y probabilidad','Tablas, diagramas, media, mediana, moda, rango, dispersión, muestreo, eventos, probabilidad y lectura crítica de correlaciones.','Interpreta qué permite concluir una muestra y qué no; distingue asociación de causalidad.'],
['Lectura Crítica','Comprensión literal e inferencial','Información explícita, referentes, vocabulario en contexto, inferencias locales y globales, presupuestos y conclusiones.','Marca evidencia textual para cada inferencia y evita añadir información que el texto no respalda.'],
['Lectura Crítica','Estructura y argumentación','Tesis, razones, evidencias, contraargumentos, conectores, propósito, tono, organización y relación entre párrafos.','Reconstruye el argumento en una frase y evalúa si la evidencia realmente sostiene la tesis.'],
['Lectura Crítica','Perspectiva y evaluación de fuentes','Voces, intención comunicativa, sesgos, confiabilidad, contexto, textos discontinuos, imágenes, tablas y comparación de perspectivas.','Contrasta autor, fecha, propósito y evidencia; explica límites de cada fuente.'],
['Sociales y Ciudadanas','Estado, Constitución y ciudadanía','Estado social de derecho, ramas del poder, instituciones, participación, mecanismos ciudadanos, derechos y deberes.','Analiza actores, intereses, derechos en tensión y mecanismos institucionales pertinentes.'],
['Sociales y Ciudadanas','Historia y cambio social','Procesos históricos de Colombia y del mundo, continuidades, rupturas, causalidad, temporalidad y construcción de memoria.','Compara fuentes y explica causas múltiples sin reducir procesos complejos a una sola razón.'],
['Sociales y Ciudadanas','Economía, territorio y ambiente','Oferta y demanda, inflación, empleo, desigualdad, globalización, territorio, migración, sostenibilidad y conflictos socioambientales.','Relaciona escalas local, nacional y global; identifica quién gana, quién pierde y con qué evidencia.'],
['Ciencias Naturales','Biología y sistemas vivos','Célula, metabolismo, genética, herencia, evolución, biodiversidad, ecología y relaciones entre sistemas del cuerpo humano.','Conecta estructura y función; interpreta modelos, ciclos y datos biológicos.'],
['Ciencias Naturales','Química y materia','Estructura atómica, tabla periódica, enlaces, propiedades, reacciones, conservación de masa, proporciones, soluciones, concentración y pH.','Balancea relaciones de materia de forma conceptual y verifica unidades y conservación.'],
['Ciencias Naturales','Física y energía','Movimiento, velocidad, aceleración, fuerzas, leyes de Newton, trabajo, energía, ondas, sonido, luz, electricidad y circuitos básicos.','Identifica variables, unidades y diagramas; explica cómo cambia el sistema cuando varía un factor.'],
['Ciencias Naturales','Indagación científica','Pregunta investigable, hipótesis, variables, control, diseño experimental, tablas, gráficas, incertidumbre, evidencia y conclusión.','Distingue variable independiente, dependiente y controlada; evalúa si los datos respaldan la conclusión.'],
['Inglés','Comprensión y uso del idioma','Vocabulario por contexto, conectores, tiempos verbales, modales, pronombres, referencias, intención, avisos, diálogos y textos breves.','Lee primero el contexto y la función comunicativa; no traduzcas palabra por palabra.']
]},
{id:'ielts',name:'IELTS Academic',tag:'Listening · Reading · Writing · Speaking',desc:'Practica el formato oficial, analiza tus errores y compara Writing/Speaking con descriptores publicados. ADAZ no certifica bandas.',source:[['IELTS · formato y muestras oficiales','https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test'],['Cambridge English · preparación IELTS','https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/'],['Richmond · Practice Tests for IELTS','https://richmondelt.com/elt-catalog/exams/richmond-practice-tests-for-ielts/'],['Richmond Learning Platform','https://richmondelt.com/richmond-digital/'],['Oxford Learner’s Dictionaries · vocabulario y uso','https://www.oxfordlearnersdictionaries.com/'],['Oxford English Hub · entorno de aprendizaje','https://englishhub.oup.com/'],['IELTS · criterios de evaluación','https://ielts.org/for-test-takers/how-ielts-is-scored']],modules:[
['Listening','Secciones y tipos de tarea','Cuatro partes, conversación y monólogos; selección múltiple, matching, mapas, formularios, notas, tablas y completamiento.','Anticipa el tipo de respuesta, detecta paráfrasis y registra distractores; escucha una sola vez al simular.'],
['Listening','Precisión auditiva','Números, fechas, nombres, plurales, límites de palabras, cambios de opinión y autocorrección del hablante.','Después de revisar la clave oficial, escucha de nuevo y localiza la frase exacta que confirma la respuesta.'],
['Reading','Lectura académica y gestión del tiempo','Tres textos, 40 preguntas; idea principal, detalle, inferencia, actitud del autor y vocabulario contextual.','Distribuye el tiempo; identifica palabras clave y busca equivalencias semánticas, no coincidencias literales.'],
['Reading','Formatos de preguntas','True/False/Not Given, Yes/No/Not Given, headings, matching information, features, sentence completion y multiple choice.','Distingue contradicción de ausencia de información; no completes con conocimiento externo.'],
['Writing','Task 1 · datos y procesos','Gráficos, tablas, diagramas, mapas y procesos; overview, selección de rasgos principales, comparaciones y precisión numérica.','Escribe una visión general clara, agrupa datos y evita enumerar cada cifra.'],
['Writing','Task 2 · ensayo argumentativo','Respuesta a postura, discusión de dos opiniones, ventajas/desventajas, problemas/soluciones y preguntas dobles.','Planifica tesis y párrafos; desarrolla razones con ejemplos pertinentes y revisa cohesión y precisión.'],
['Writing','Rúbrica y edición','Task Achievement/Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy.','Usa descriptores oficiales; corrige primero errores que afectan claridad y desarrollo, no solo vocabulario sofisticado.'],
['Speaking','Part 1 · entrevista','Preguntas familiares sobre rutinas, estudio, intereses, lugares y experiencias.','Responde directamente y añade una razón o ejemplo natural sin memorizar guiones.'],
['Speaking','Part 2 · long turn','Preparación breve, exposición individual y desarrollo de una experiencia o tema con secuencia clara.','Organiza en contexto, dos detalles, reflexión y cierre; mantén continuidad.'],
['Speaking','Part 3 · discusión','Preguntas abstractas, comparación, causas, consecuencias, predicciones y evaluación de ideas.','Explica, matiza y ejemplifica; practica reformular cuando no encuentres una palabra.']
]},
{id:'medicine',name:'Medicina · bases científicas',tag:'Fundamentos preuniversitarios',desc:'Ruta introductoria para desarrollar alfabetización científica y comprender cómo se estudia el cuerpo humano. No sustituye formación clínica ni habilita diagnósticos.',source:[['OpenStax Biology 2e','https://openstax.org/books/biology-2e/pages/preface'],['OpenStax Anatomy & Physiology 2e','https://openstax.org/books/anatomy-and-physiology-2e/pages/preface'],['OpenStax · libros de ciencias gratuitos','https://openstax.org/new-subjects/science-books']],modules:[
['Biología celular','Organización de la vida','Átomos, moléculas, organelos, membrana, transporte, metabolismo, ATP, división celular y comunicación celular.','Construye mapas de estructura-función y explica procesos con diagramas propios.'],
['Genética y biología molecular','Información hereditaria','ADN, ARN, expresión génica, síntesis de proteínas, herencia, variación, mutación y regulación.','Distingue genotipo y fenotipo; interpreta esquemas sin asumir que un gen determina por sí solo un rasgo complejo.'],
['Anatomía y fisiología','Homeostasis y sistemas','Niveles de organización; sistemas nervioso, endocrino, cardiovascular, respiratorio, digestivo, renal, inmune, músculo-esquelético y reproductor.','Para cada sistema estudia órganos, función, regulación e interacción con otros sistemas.'],
['Microbiología e inmunología','Interacción huésped-microorganismo','Tipos generales de microorganismos, barreras, inmunidad innata/adaptativa, anticuerpos, vacunas y resistencia antimicrobiana.','Comprende prevención y salud pública; estudia mecanismos a nivel conceptual, sin prácticas de laboratorio riesgosas.'],
['Epidemiología y salud pública','Poblaciones y prevención','Incidencia, prevalencia, factores de riesgo, determinantes sociales, prevención primaria/secundaria/terciaria y lectura de estudios.','Interpreta tasas y poblaciones; diferencia riesgo individual de patrones poblacionales.'],
['Investigación y ética médica','Evidencia, consentimiento y comunicación','Pregunta PICO introductoria, diseños de estudio, sesgo, variables, consentimiento informado, confidencialidad, autonomía y comunicación respetuosa.','Evalúa calidad de evidencia y explica por qué correlación no demuestra causalidad.']
]},
{id:'oro',name:'Oro Lámina · negocio',tag:'Producto · operaciones · finanzas · marketing',desc:'Aprendizaje aplicado al negocio. Los datos reales de clientes, proveedores y ventas se mantienen en el módulo privado de negocio, no en el panel familiar.',source:[['SIC · calidad y garantías','https://sedeelectronica.sic.gov.co/index.php/temas/proteccion-al-consumidor/derechos-y-deberes/fallas-en-un-producto'],['SIC · información veraz y suficiente','https://sedeelectronica.sic.gov.co/index.php/temas/proteccion-al-consumidor/derechos-y-deberes/Informacion-enganosa'],['OpenStax · libros de negocios gratuitos','https://openstax.org/new-subjects/business']],modules:[
['Producto y proveedor','Especificaciones y control de calidad','Diferencia entre oro laminado, baño y otros materiales; composición declarada, capas, espesor si está documentado, herrajes, acabados y límites de garantía.','No afirmes quilataje, número de capas ni duración sin ficha técnica y soporte verificable del proveedor.'],
['Producto y proveedor','Compras y evaluación','Costo total de adquisición, mínimos, tiempos, envío asegurado, trazabilidad, políticas de devolución, consistencia de lotes y documentación.','Compara proveedores con criterios ponderados y conserva facturas, fichas y comunicaciones.'],
['Operaciones','Inventario y SKU','Código de producto, variante, unidades disponibles, costo unitario, ubicación, estado, reserva, pedido por encargo y conciliación.','Registra cada entrada y salida en el momento; separa inventario disponible de unidades comprometidas.'],
['Finanzas','Costo, precio y margen','Costo de producto, envío, empaque, comisiones, descuentos, devoluciones, precio de venta, margen bruto y contribución.','No confundas ingresos, utilidad y caja; calcula el costo completo antes de fijar precio.'],
['Finanzas','Flujo de caja y capital de trabajo','Dinero invertido, anticipos, saldos por cobrar, obligaciones, reposición, caja disponible y escenarios de liquidez.','Separa dinero del negocio y personal; no comprometas capital que ya tiene destino.'],
['Ventas y servicio','Proceso comercial y experiencia','Catálogo claro, respuesta a consultas, confirmación de pedido, pagos, entrega, posventa, reclamos y registro de satisfacción.','Documenta condiciones antes de cobrar y conserva una trazabilidad sencilla del pedido.'],
['Marketing','Marca y contenido','Posicionamiento, cliente objetivo, propuesta de valor, fotografía, video corto, calendario editorial, métricas y pruebas de contenido.','Haz afirmaciones verificables; no fabriques reseñas, escasez, resultados ni características del material.'],
['Consumidor y garantía','Información y cumplimiento','Calidad, idoneidad, seguridad, información esencial, garantía legal y suplementaria, condiciones escritas y atención de reclamaciones.','Una garantía comercial adicional no elimina obligaciones legales. Revisa las reglas vigentes con un adulto responsable antes de ofrecer condiciones.']
]}
];
let progress={};try{progress=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{};const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const done=new Set(Array.isArray(progress.done)?progress.done:[]);
const style=document.createElement('style');style.textContent=`
#adaz-curriculum{margin:18px 0;padding:18px;background:#101722;border:1px solid #2b394b;border-radius:20px}
#adaz-curriculum .track-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}
#adaz-curriculum .track{background:#151f2d;border:1px solid #304158;border-radius:14px;padding:13px;text-align:left;color:#edf3fa;cursor:pointer}
#adaz-curriculum .track.active{border-color:#9fc5ff;background:#1b2a3d}
#adaz-curriculum .track b{display:block;font-size:13px}
#adaz-curriculum .track small{display:block;color:#9eafc4;font-size:10px;margin-top:3px}
#adaz-curriculum .module{border-top:1px solid #2a3748;padding:12px 0}
#adaz-curriculum .module summary{cursor:pointer;font-weight:800;font-size:12px;color:#e7eef8}
#adaz-curriculum .module p{font-size:11px;color:#b7c4d5;line-height:1.55}
#adaz-curriculum .module label{display:flex;gap:8px;align-items:flex-start;font-size:11px;color:#c6d3e3}
#adaz-curriculum .module input{accent-color:#9fc5ff;margin-top:2px}
#adaz-curriculum .source-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
#adaz-curriculum a{font-size:11px;color:#9fc5ff}
#adaz-curriculum .bar{height:7px;background:#2a394c;border-radius:9px;overflow:hidden;margin:9px 0}
#adaz-curriculum .bar span{display:block;height:100%;background:#9fc5ff}
@media(max-width:600px){#adaz-curriculum .track-grid{grid-template-columns:1fr}}
`;document.head.append(style);
const heading=page.querySelector('.page-heading');const root=document.createElement('section');root.id='adaz-curriculum';if(heading)heading.insertAdjacentElement('afterend',root);else page.prepend(root);

let current='icfes',activeModule=null,activeQuestion=null,activeAnswer=null;
function save(){progress.done=[...done];try{localStorage.setItem(KEY,JSON.stringify(progress))}catch{}}
function kindFor(id){return id==='icfes'?'icfes':id==='ielts'?'ielts':id==='medicine'?'medicine':'business'}
function filterFor(track,module){
 if(track==='icfes')return ({'Sociales y Ciudadanas':'Sociales','Ciencias Naturales':'Ciencias'})[module[0]]||module[0];
 if(track==='ielts')return ['Listening','Reading'].includes(module[0])?module[0]:null;
 return track==='medicine'?'Ciencias':'Negocio';
}
function promptFor(track,module,index){
 if(track==='ielts'&&module[0]==='Writing')return module[1].includes('Task 1')?'Task 1: The table shows the share of students travelling to college by bus (48% to 35%), walking (22% to 30%), cycling (10% to 25%) and car (20% to 10%) between 2015 and 2025. Summarise the main features in at least 150 words.':'Task 2: Some people believe schools should teach practical financial and digital skills alongside academic subjects. To what extent do you agree? Write at least 250 words.';
 if(track==='ielts'&&module[0]==='Speaking')return module[1].includes('Part 1')?'Part 1: How do you organise your study time? What helps you concentrate? Give a direct answer and one relevant detail.':module[1].includes('Part 2')?'Part 2: Describe a skill you learned that has been useful in daily life. Explain how you learned it and why it matters.':'Part 3: How should schools prepare students for changes in the workplace? Compare at least two perspectives and justify your view.';
 if(track==='medicine')return 'Caso académico: explica cómo se relaciona el tema “'+module[1]+'” con la estructura y función de un sistema biológico. No uses este ejercicio para autodiagnóstico.';
 if(track==='oro')return 'Caso de negocio: aplica “'+module[1]+'” a una decisión realista de Oro Lámina. Indica qué dato necesitas, qué compararías y qué decisión tomarías sin inventar información del proveedor.';
 return 'Reto Saber 11: resuelve una pregunta relacionada con “'+module[1]+'”. Identifica la competencia evaluada, la evidencia disponible y por qué descartas los distractores.';
}
function methodText(id){
 if(id==='icfes')return 'Ruta inspirada en la estructura pública de Grupo500: preparación organizada por las cinco áreas Saber 11, explicación de conceptos, práctica progresiva, simulacros y retroalimentación por competencia. ADAZ crea sus propias clases y ejercicios; no es la plataforma de Grupo500 ni incluye sus clases privadas, grabaciones o materiales licenciados.';
 if(id==='ielts')return 'Ruta de cuatro habilidades con tareas originales y referencias editoriales. Cambridge aporta orientación y muestras de preparación; Richmond publica Practice Tests for IELTS con componentes interactivos licenciados; Oxford se utiliza como apoyo complementario de vocabulario, gramática y aprendizaje autónomo. Oxford no se presenta como un examen IELTS oficial.';
 if(id==='medicine')return 'Ruta introductoria basada en textos abiertos de biología y anatomía-fisiología. Las clases son educativas, no sustituyen formación universitaria ni permiten diagnosticar o tratar enfermedades.';
 return 'Ruta aplicada a producto, compras, inventario, costos, flujo de caja, ventas y marketing. Los ejemplos son simulados; los datos reales se registran únicamente en el módulo privado de Business.';
}
function openModule(i){
 const t=tracks.find(x=>x.id===current);activeModule=i;activeAnswer=null;
 const m=t.modules[i],filter=filterFor(current,m);
 activeQuestion=(current==='ielts'&&['Writing','Speaking'].includes(m[0]))?null:(window.ADAZExamBank?.next?.(kindFor(current),filter)||null);
 render();
}
function questionHTML(t,m){
 if(activeQuestion){
  const x=activeQuestion;
  return '<div class="lesson-quiz"><div class="lesson-kicker">COMPRUEBA LO APRENDIDO · PREGUNTA NUEVA</div><h4>'+esc(x.text)+'</h4><div class="lesson-options">'+x.opts.map((o,i)=>'<button data-curr-answer="'+i+'" '+(activeAnswer!==null?'disabled':'')+' class="'+(activeAnswer===i?'chosen':'')+'">'+String.fromCharCode(65+i)+'. '+esc(o)+'</button>').join('')+'</div>'+(activeAnswer!==null?'<div class="lesson-feedback"><b>'+(activeAnswer===x.a?'Correcto':'Revisa el razonamiento')+'</b><p>'+esc(x.why)+'</p><button class="curr-btn" data-curr-next-question>Otra pregunta nueva →</button></div>':'<p class="lesson-hint">Elige una respuesta. La explicación aparecerá al instante y la pregunta no volverá a salir hasta recorrer el banco disponible.</p>')+'</div>';
 }
 const prompt=promptFor(current,m,activeModule);
 return '<div class="lesson-quiz"><div class="lesson-kicker">ACTIVIDAD APLICADA · RESPUESTA ABIERTA</div><h4>'+esc(prompt)+'</h4><textarea data-curr-response rows="5" placeholder="Desarrolla tu respuesta, argumentos o esquema aquí...">'+esc(progress.notes?.[current+':'+activeModule]||'')+'</textarea><div class="lesson-hint">Al guardar, conserva tu respuesta para retomarla. En IELTS Writing/Speaking puedes contrastar tu trabajo con los descriptores oficiales enlazados arriba.</div><button class="curr-btn" data-curr-save-response>Guardar mi trabajo</button><span class="lesson-saved" aria-live="polite"></span></div>';
}
function render(){
 if(!root.isConnected){const heading=page.querySelector('.page-heading');if(heading)heading.insertAdjacentElement('afterend',root);else page.append(root)}
 const t=tracks.find(x=>x.id===current)||tracks[0],all=t.modules.length,finished=t.modules.filter((m,i)=>done.has(t.id+':'+i)).length;
 const head='<div class="eyebrow">ADAZ ACADEMY · CLASES INTERACTIVAS</div><h2 style="font-size:20px;margin:6px 0">Aprende, practica y comprueba</h2><p class="curr-desc">'+esc(t.desc)+'</p><div class="track-grid">'+tracks.map(x=>'<button class="track '+(x.id===current?'active':'')+'" data-track="'+x.id+'"><b>'+esc(x.name)+'</b><small>'+esc(x.tag)+'</small></button>').join('')+'</div><div class="curr-method"><b>Cómo está construido este programa</b><p>'+esc(methodText(current))+'</p></div>';
 const progressBar='<div class="row-between" style="font-size:11px;margin-top:14px"><b>'+esc(t.name)+'</b><span>'+finished+'/'+all+' clases completadas</span></div><div class="bar"><span style="width:'+(all?finished/all*100:0)+'%"></span></div>';
 if(activeModule===null){
  root.innerHTML=head+progressBar+'<div class="curr-module-list">'+t.modules.map((m,i)=>'<article class="curr-module '+(done.has(t.id+':'+i)?'is-done':'')+'"><div><small>'+esc(m[0])+' · CLASE '+String(i+1).padStart(2,'0')+'</small><b>'+esc(m[1])+'</b><p>'+esc(m[2])+'</p></div><button class="curr-btn" data-open-module="'+i+'">'+(done.has(t.id+':'+i)?'Repasar clase':'Abrir clase')+' →</button></article>').join('')+'</div><div class="source-links"><b>Fuentes y materiales de referencia</b>'+t.source.map(s=>'<a href="'+esc(s[1])+'" target="_blank" rel="noopener noreferrer">'+esc(s[0])+' ↗</a>').join('')+'</div><div class="notice" style="margin-top:13px">Método de sesión: 5 min de recuperación activa → 20 min de clase → 15–25 min de práctica guiada → 5 min de corrección. El avance se guarda en este dispositivo.</div>';
 }else{
  const m=t.modules[activeModule],key=current+':'+activeModule;
  root.innerHTML=head+progressBar+'<button class="curr-back" data-curr-back>← Volver al temario</button><article class="curr-lesson"><div class="lesson-kicker">'+esc(m[0])+' · CLASE '+String(activeModule+1).padStart(2,'0')+'</div><h3>'+esc(m[1])+'</h3><section><h4>1. Material de estudio</h4><p>'+esc(m[2])+'</p><p><b>Cómo dominarlo:</b> '+esc(m[3])+'</p></section><section><h4>2. Aplica lo aprendido</h4><p>Resuelve el reto sin consultar primero la respuesta. Después revisa la explicación o la pauta de evaluación.</p>'+questionHTML(t,m)+'</section><section><h4>3. Explica con tus palabras</h4><textarea data-curr-note rows="4" placeholder="Resume la idea, escribe un ejemplo o registra tus dudas...">'+esc(progress.notes?.[key]||'')+'</textarea><button class="curr-btn" data-curr-save-note>Guardar apuntes</button><span class="lesson-saved" aria-live="polite"></span></section><button class="curr-btn curr-done" data-curr-done>'+ (done.has(key)?'Clase completada ✓':'Marcar clase completada')+'</button></article><div class="source-links"><b>Consulta la fuente del tema</b>'+t.source.map(s=>'<a href="'+esc(s[1])+'" target="_blank" rel="noopener noreferrer">'+esc(s[0])+' ↗</a>').join('')+'</div>';
 }
}
root.addEventListener('click',e=>{
 const track=e.target.closest('[data-track]');if(track){current=track.dataset.track;activeModule=null;activeQuestion=null;activeAnswer=null;render();return}
 const open=e.target.closest('[data-open-module]');if(open){openModule(Number(open.dataset.openModule));return}
 if(e.target.closest('[data-curr-back]')){activeModule=null;activeQuestion=null;activeAnswer=null;render();return}
 const answer=e.target.closest('[data-curr-answer]');if(answer&&activeQuestion){activeAnswer=Number(answer.dataset.currAnswer);render();return}
 if(e.target.closest('[data-curr-next-question]')&&activeModule!==null){openModule(activeModule);return}
 if(e.target.closest('[data-curr-save-note]')&&activeModule!==null){const value=root.querySelector('[data-curr-note]')?.value||'';progress.notes??={};progress.notes[current+':'+activeModule]=value;save();root.querySelectorAll('.lesson-saved').forEach(x=>x.textContent='Apuntes guardados.');return}
 if(e.target.closest('[data-curr-save-response]')&&activeModule!==null){const value=root.querySelector('[data-curr-response]')?.value||'';progress.notes??={};progress.notes[current+':'+activeModule]=value;save();root.querySelectorAll('.lesson-saved').forEach(x=>x.textContent='Respuesta guardada.');return}
 if(e.target.closest('[data-curr-done]')&&activeModule!==null){done.add(current+':'+activeModule);save();activeModule=null;activeQuestion=null;activeAnswer=null;render();return}
});
const interactiveStyle=document.createElement('style');interactiveStyle.textContent=`
#adaz-curriculum{margin:18px 0;padding:18px;background:#101722;border:1px solid #2b394b;border-radius:20px;color:#edf3fa}
#adaz-curriculum .track-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}
#adaz-curriculum .track{background:#151f2d;border:1px solid #304158;border-radius:14px;padding:13px;text-align:left;color:#edf3fa;cursor:pointer}
#adaz-curriculum .track.active{border-color:#9fc5ff;background:#1b2a3d}
#adaz-curriculum .track b{display:block;font-size:13px}
#adaz-curriculum .track small{display:block;color:#9eafc4;font-size:10px;margin-top:3px}
#adaz-curriculum .curr-desc,#adaz-curriculum p{font-size:12px;line-height:1.65;color:#b7c4d5}
#adaz-curriculum .curr-method{padding:12px 14px;border:1px solid #33475e;background:#142131;border-radius:13px;margin:12px 0}
#adaz-curriculum .curr-method b{font-size:12px;color:#e7eef8}
#adaz-curriculum .curr-module-list{display:grid;gap:9px;margin-top:14px}
#adaz-curriculum .curr-module{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px;border:1px solid #2b3c50;background:#131d2a;border-radius:14px}
#adaz-curriculum .curr-module.is-done{border-color:#3e765b}
#adaz-curriculum .curr-module small,.lesson-kicker{display:block;font-size:9px;letter-spacing:1px;color:#9fc5ff;font-weight:850}
#adaz-curriculum .curr-module b{display:block;font-size:12px;margin:5px 0}
#adaz-curriculum .curr-module p{font-size:10px;margin:0;max-width:680px}
#adaz-curriculum .curr-btn,.curr-back{border:1px solid #9fc5ff;background:#9fc5ff;color:#0c1727;border-radius:10px;padding:9px 12px;font-size:11px;font-weight:850;cursor:pointer;white-space:nowrap}
#adaz-curriculum .curr-back{background:#17263a;color:#d6e6f8;border-color:#344b67;margin:12px 0}
#adaz-curriculum .curr-lesson{margin-top:12px;padding:17px;border:1px solid #34465d;background:#121c29;border-radius:16px}
#adaz-curriculum .curr-lesson h3{font-size:18px;margin:7px 0 14px}
#adaz-curriculum .curr-lesson section{padding:13px 0;border-top:1px solid #2a3b50}
#adaz-curriculum .curr-lesson h4{font-size:13px;margin:0 0 8px;color:#e8eef8}
#adaz-curriculum textarea{display:block;width:100%;margin:9px 0;padding:11px;border:1px solid #394d64;border-radius:10px;background:#0b1420;color:#edf3fa;font:inherit;font-size:12px;resize:vertical}
#adaz-curriculum .lesson-quiz{margin:10px 0;padding:13px;border:1px solid #34465d;border-radius:13px;background:#0e1723}
#adaz-curriculum .lesson-quiz h4{font-size:13px;line-height:1.55;margin:8px 0}
#adaz-curriculum .lesson-options{display:grid;gap:7px}
#adaz-curriculum .lesson-options button{padding:10px;text-align:left;border:1px solid #35475d;background:#182536;color:#edf3fa;border-radius:10px;cursor:pointer;font-size:11px}
#adaz-curriculum .lesson-options button.chosen{border-color:#9fc5ff;background:#243a54}
#adaz-curriculum .lesson-options button:disabled{opacity:.85}
#adaz-curriculum .lesson-feedback{margin-top:10px;padding:11px;border:1px solid #3d765b;border-radius:10px;background:#142a23}
#adaz-curriculum .lesson-feedback p{margin:5px 0}
#adaz-curriculum .lesson-hint,.lesson-saved{font-size:10px;color:#9eafc4}
#adaz-curriculum .curr-done{margin-top:10px}
#adaz-curriculum .source-links{display:flex;gap:9px;flex-wrap:wrap;margin-top:13px;padding-top:12px;border-top:1px solid #2a394c}
#adaz-curriculum .source-links b{flex-basis:100%;font-size:11px}
#adaz-curriculum a{font-size:10px;color:#9fc5ff}
#adaz-curriculum .bar{height:7px;background:#2a394c;border-radius:9px;overflow:hidden;margin:9px 0}
#adaz-curriculum .bar span{display:block;height:100%;background:#9fc5ff}
@media(max-width:600px){#adaz-curriculum{padding:13px}#adaz-curriculum .track-grid{grid-template-columns:1fr}#adaz-curriculum .curr-module{align-items:flex-start;flex-direction:column}#adaz-curriculum .curr-btn{white-space:normal}}
`;document.head.append(interactiveStyle);

function ensureRoot(){if(root.isConnected)return;const heading=page.querySelector('.page-heading');if(heading)heading.insertAdjacentElement('afterend',root);else page.append(root);render()}
ensureRoot();
new MutationObserver(()=>{if(!root.isConnected)ensureRoot()}).observe(page,{childList:true,subtree:true});
window.addEventListener('adaz-experience-refresh',()=>{if(!root.isConnected)ensureRoot()});
})();