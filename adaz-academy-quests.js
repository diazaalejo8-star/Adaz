(()=>{'use strict';
const page=document.querySelector('#page-academy');if(!page||window.__adazAcademyQuestsV1)return;window.__adazAcademyQuestsV1=true;
const KEY='adaz-academy-quests-v1',date=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return {}}};
let state=read();state.xp=Number(state.xp)||0;state.usedWords=Array.isArray(state.usedWords)?state.usedWords:[];state.lastWords=Array.isArray(state.lastWords)?state.lastWords:[];state.recentMissions=Array.isArray(state.recentMissions)?state.recentMissions:[];state.daily=state.daily&&typeof state.daily==='object'?state.daily:{};
const words=[
['learn','To gain knowledge or a new skill'],['brain','The organ used for thinking and memory'],['logic','Reasoning based on clear principles'],['focus','To give attention to one thing'],['skill','An ability developed through practice'],['plant','A living organism that grows in soil'],['water','A liquid essential for life'],['earth','The planet on which we live'],['light','The opposite of darkness'],['sound','Something that can be heard'],['heart','An organ that pumps blood'],['cells','The basic units of living organisms'],['teach','To help someone learn'],['write','To produce words on a page'],['speak','To communicate using your voice'],['world','The earth and its people'],['solve','To find an answer to a problem'],['cause','A reason why something happens'],['proof','Evidence that supports a claim'],['claim','A statement that needs evidence'],['trend','A general direction of change'],['value','The worth or importance of something'],['waste','Material that is no longer needed'],['river','A natural flow of water'],['green','A colour associated with plants'],['urban','Connected with a town or city'],['price','The amount of money something costs'],['stock','Goods kept for sale'],['sales','The activity of selling goods'],['brand','A name or identity of a product']
];
const missions=[
['precision','Detecta una idea principal','Responde una pregunta nueva y explica qué evidencia sostiene tu elección.'],
['vocabulary','Activa vocabulario','Resuelve Word Quest y aprende una palabra académica.'],
['recall','Recuerda sin apuntes','Explica un concepto de la última clase antes de volver a leerlo.'],
['reasoning','Entrena el razonamiento','Resuelve un reto y descarta al menos dos distractores.'],
['application','Lleva la teoría a la práctica','Aplica una idea de Medicina o de Oro Lámina a un caso nuevo.'],
['listening','Afina el oído','Completa una pregunta de Listening y localiza la información decisiva.'],
['reading','Lee con evidencia','Responde una pregunta de Reading sin añadir supuestos externos.'],
['analysis','Analiza una decisión','Identifica datos, límites y una conclusión justificable.']
];
const shuffle=a=>{const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function wordPick(){let pool=words.filter(x=>!state.usedWords.includes(x[0])&&!state.lastWords.includes(x[0]));if(!pool.length){state.usedWords=[];pool=words.filter(x=>!state.lastWords.includes(x[0]))}if(!pool.length)pool=words.slice();const w=shuffle(pool)[0];state.usedWords.push(w[0]);state.lastWords=[...state.lastWords,w[0]].slice(-8);state.word={answer:w[0],clue:w[1],guesses:[],done:false,won:false,input:''};save()}
function ensureDaily(){const today=date();if(state.daily.date!==today){const options=missions.filter(m=>!state.recentMissions.includes(m[0]));const chosen=shuffle(options.length>=3?options:missions).slice(0,3);state.daily={date:today,missions:chosen.map(m=>({id:m[0],title:m[1],desc:m[2],done:false})),question:null,questionAnswer:null,recall:''};state.recentMissions=[...state.recentMissions,...chosen.map(m=>m[0])].slice(-6);save()}}
ensureDaily();
let question=null,questionAnswer=null;
function startQuestion(){const types=[['icfes',['Matemáticas','Lectura Crítica','Sociales','Ciencias','Inglés'][Math.floor(Math.random()*5)]],['ielts',['Listening','Reading'][Math.floor(Math.random()*2)]],['medicine','Ciencias'],['business','Negocio']];const [kind,filter]=types[Math.floor(Math.random()*types.length)];question=window.ADAZExamBank?.next?.(kind,filter)||null;questionAnswer=null;render()}
function wordMarks(guess,answer){const marks=Array(5).fill('absent'),left={};for(let i=0;i<5;i++){if(guess[i]===answer[i])marks[i]='correct';else left[answer[i]]=(left[answer[i]]||0)+1}for(let i=0;i<5;i++)if(marks[i]!=='correct'&&(left[guess[i]]||0)>0){marks[i]='present';left[guess[i]]--}return marks}
function wordHTML(){const w=state.word;if(!w)return '<button class="aq-btn" data-aq-word-new>Empezar Word Quest →</button>';const rows=Array.from({length:6},(_,i)=>{const g=w.guesses[i];const marks=g?wordMarks(g,w.answer):[];return '<div class="aq-row">'+Array.from({length:5},(_,j)=>'<span class="aq-tile '+(g?marks[j]:'')+'">'+(g?g[j].toUpperCase():'')+'</span>').join('')+'</div>'}).join('');return '<div class="aq-board">'+rows+'</div><p class="aq-clue">Pista: '+esc(w.clue)+'</p>'+(w.done?'<div class="aq-feedback">'+(w.won?'¡Palabra descubierta! +20 XP':'Se acabaron los intentos. La palabra era '+w.answer.toUpperCase())+'</div><button class="aq-btn" data-aq-word-new>Jugar con otra palabra →</button>':'<form data-aq-word-form class="aq-word-form"><input id="aq-word-input" maxlength="5" minlength="5" pattern="[A-Za-z]{5}" autocomplete="off" autocapitalize="none" placeholder="Escribe 5 letras" value="'+esc(w.input||'')+'" required><button class="aq-btn" type="submit">Probar palabra</button></form><p class="aq-hint">Verde: letra y posición correctas · Dorado: letra en otra posición · Gris: no aparece. Tienes seis intentos.</p>') }
function questionHTML(){if(!question)return '<div class="aq-question-empty"><p>Elige una pregunta nueva del banco de práctica. Las preguntas se rotan para evitar repetirlas hasta recorrer el banco.</p><button class="aq-btn" data-aq-question-new>Generar reto →</button></div>';return '<div class="aq-question"><div class="aq-kicker">'+esc(question.area)+' · '+esc(question.tag)+'</div><h3>'+esc(question.text)+'</h3><div class="aq-options">'+question.opts.map((o,i)=>'<button data-aq-answer="'+i+'" '+(questionAnswer!==null?'disabled':'')+' class="'+(questionAnswer===i?'chosen':'')+'">'+String.fromCharCode(65+i)+'. '+esc(o)+'</button>').join('')+'</div>'+(questionAnswer!==null?'<div class="aq-feedback"><b>'+(questionAnswer===question.a?'Correcto · +10 XP':'Revisa la explicación')+'</b><p>'+esc(question.why)+'</p><button class="aq-btn" data-aq-question-new>Otra pregunta nueva →</button></div>':'')+'</div>'}
function render(){
 ensureDaily();if(!root.isConnected){const cur=page.querySelector('#adaz-curriculum');if(cur)cur.insertAdjacentElement('afterend',root);else page.append(root)}
 const daily=state.daily.missions||[];
 root.innerHTML='<div class="aq-head"><div><div class="aq-kicker">ADAZ · MISIONES Y JUEGOS</div><h2>Aprende jugando, no solo leyendo</h2><p>Rondas nuevas, pistas, feedback inmediato y progreso guardado.</p></div><div class="aq-xp">'+state.xp+' XP</div></div><div class="aq-missions">'+daily.map((m,i)=>'<article class="aq-mission '+(m.done?'done':'')+'"><small>MISIÓN '+(i+1)+'</small><b>'+esc(m.title)+'</b><p>'+esc(m.desc)+'</p><span>'+(m.done?'Completada ✓':'En curso')+'</span></article>').join('')+'</div><div class="aq-game-grid"><section class="aq-panel"><div class="aq-kicker">01 · RETO DE PRECISIÓN</div><h3>Pregunta relámpago</h3>'+questionHTML()+'</section><section class="aq-panel"><div class="aq-kicker">02 · VOCABULARIO IELTS</div><h3>Word Quest</h3>'+wordHTML()+'</section></div><section class="aq-panel aq-recall"><div class="aq-kicker">03 · RECUPERACIÓN ACTIVA</div><h3>Explica sin mirar</h3><p>Escribe una idea que recuerdes de tu última clase y un ejemplo que la demuestre.</p><textarea id="aq-recall" rows="3" placeholder="Lo que recuerdo...">'+esc(state.daily.recall||'')+'</textarea><button class="aq-btn" data-aq-recall-save>Guardar recuperación</button><span class="aq-hint" aria-live="polite"></span></section>';
}
const root=document.createElement('section');root.id='adaz-academy-quests';
const style=document.createElement('style');style.textContent=`
#adaz-academy-quests{margin:18px 0;padding:17px;background:#101722;border:1px solid #2b394b;border-radius:20px;color:#edf3fa}
#adaz-academy-quests .aq-head{display:flex;justify-content:space-between;gap:12px;align-items:center}
#adaz-academy-quests h2{font-size:19px;margin:5px 0}
#adaz-academy-quests h3{font-size:14px;margin:7px 0 12px}
#adaz-academy-quests p{font-size:11px;line-height:1.55;color:#aebdd0}
#adaz-academy-quests .aq-kicker{font-size:9px;letter-spacing:1.2px;color:#9fc5ff;font-weight:900}
#adaz-academy-quests .aq-xp{padding:8px 11px;border:1px solid #465a75;border-radius:99px;background:#19283b;font-size:11px;font-weight:900;white-space:nowrap}
#adaz-academy-quests .aq-missions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:13px 0}
#adaz-academy-quests .aq-mission{padding:10px;border:1px solid #2c4057;border-radius:12px;background:#151f2d}
#adaz-academy-quests .aq-mission small{display:block;color:#9fc5ff;font-size:9px;font-weight:900}
#adaz-academy-quests .aq-mission b{display:block;font-size:11px;margin:5px 0}
#adaz-academy-quests .aq-mission p{margin:0 0 6px}
#adaz-academy-quests .aq-mission span{font-size:9px;color:#b5c3d5}
#adaz-academy-quests .aq-mission.done{border-color:#3f795e}
#adaz-academy-quests .aq-game-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#adaz-academy-quests .aq-panel{padding:13px;border:1px solid #2c4057;border-radius:14px;background:#131e2c;min-width:0}
#adaz-academy-quests .aq-btn{border:1px solid #9fc5ff;background:#9fc5ff;color:#0c1727;border-radius:9px;padding:9px 12px;font-size:10px;font-weight:900;cursor:pointer}
#adaz-academy-quests .aq-options{display:grid;gap:7px}
#adaz-academy-quests .aq-options button{padding:9px;text-align:left;border:1px solid #35475d;background:#182536;color:#edf3fa;border-radius:9px;cursor:pointer;font-size:10px}
#adaz-academy-quests .aq-options button.chosen{border-color:#9fc5ff;background:#243a54}
#adaz-academy-quests .aq-options button:disabled{opacity:.8}
#adaz-academy-quests .aq-question h3{font-size:12px;line-height:1.55}
#adaz-academy-quests .aq-feedback{margin-top:9px;padding:10px;border:1px solid #3d765b;border-radius:10px;background:#142a23}
#adaz-academy-quests .aq-feedback p{margin:5px 0}
#adaz-academy-quests .aq-board{display:grid;gap:5px;margin:12px auto;max-width:250px}
#adaz-academy-quests .aq-row{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
#adaz-academy-quests .aq-tile{display:grid;place-items:center;aspect-ratio:1;border:1px solid #44546a;border-radius:6px;font-weight:900;font-size:15px;background:#182536}
#adaz-academy-quests .aq-tile.correct{background:#236b50;border-color:#328b69}
#adaz-academy-quests .aq-tile.present{background:#92712b;border-color:#b48b35}
#adaz-academy-quests .aq-tile.absent{background:#343c49;border-color:#485365}
#adaz-academy-quests .aq-clue{margin:6px 0}
#adaz-academy-quests .aq-word-form{display:flex;gap:7px;flex-wrap:wrap}
#adaz-academy-quests .aq-word-form input{flex:1;min-width:110px;border:1px solid #40546d;border-radius:9px;background:#0b1420;color:#fff;padding:9px;font-size:13px;letter-spacing:2px;text-transform:uppercase}
#adaz-academy-quests .aq-hint{display:block;font-size:9px;color:#9eafc4;margin-top:8px}
#adaz-academy-quests .aq-recall{margin-top:10px}
#adaz-academy-quests textarea{display:block;width:100%;margin:8px 0;padding:10px;border:1px solid #394d64;border-radius:10px;background:#0b1420;color:#edf3fa;font:inherit;font-size:11px}
@media(max-width:650px){#adaz-academy-quests{padding:13px}#adaz-academy-quests .aq-missions{grid-template-columns:1fr}#adaz-academy-quests .aq-game-grid{grid-template-columns:1fr}}
`;document.head.append(style);
function ensureRoot(){if(!root.isConnected){const cur=page.querySelector('#adaz-curriculum');if(cur)cur.insertAdjacentElement('afterend',root);else page.append(root)}render()}
root.addEventListener('click',e=>{
 if(e.target.closest('[data-aq-question-new]')){startQuestion();return}
 const answer=e.target.closest('[data-aq-answer]');if(answer&&question&&questionAnswer===null){questionAnswer=Number(answer.dataset.aqAnswer);if(questionAnswer===question.a){state.xp+=10;state.daily.missions[0].done=true;save()}render();return}
 if(e.target.closest('[data-aq-word-new]')){wordPick();render();return}
 if(e.target.closest('[data-aq-recall-save]')){state.daily.recall=root.querySelector('#aq-recall')?.value||'';state.daily.missions[2].done=!!state.daily.recall.trim();if(state.daily.missions[2].done){state.xp+=5;state.daily.missions[2].done=true}save();render();root.querySelector('.aq-recall .aq-hint').textContent='Recuperación guardada.';return}
});
root.addEventListener('submit',e=>{if(!e.target.matches('[data-aq-word-form]'))return;e.preventDefault();const input=root.querySelector('#aq-word-input'),guess=String(input?.value||'').toLowerCase().replace(/[^a-z]/g,'');if(guess.length!==5)return;const w=state.word;if(!w||w.done)return;w.guesses.push(guess);w.input='';if(guess===w.answer){w.done=true;w.won=true;state.xp+=20;state.daily.missions[1].done=true}else if(w.guesses.length>=6)w.done=true;save();render()});
root.addEventListener('input',e=>{if(e.target.id==='aq-word-input'&&state.word)state.word.input=e.target.value.replace(/[^a-z]/gi,'').slice(0,5);if(e.target.id==='aq-recall'&&state.daily)state.daily.recall=e.target.value});
function mount(){if(!root.isConnected)ensureRoot()}
new MutationObserver(()=>{if(!root.isConnected)mount()}).observe(page,{childList:true,subtree:true});
if(!state.word)wordPick();else save();mount();
})();