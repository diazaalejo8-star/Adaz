(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const CLOUD_KEY = 'adaz-cloud-config';
  const SPOTIFY_KEY = 'adaz-spotify-config';
  const SPOTIFY_SESSION_KEY = 'adaz-spotify-session';
  const SPOTIFY_PKCE_KEY = 'adaz-spotify-pkce';
  const AI_HISTORY_KEY = 'adaz-ai-history';
  let cloudConfig = readJSON(CLOUD_KEY, {supabaseUrl:'',supabaseKey:'',plannerUrl:'',autoSync:false,aiConsent:false});
  let spotifyConfig = readJSON(SPOTIFY_KEY, {clientId:'',playlistUrl:'https://open.spotify.com/search/workout%20music',redirectUri:''});
  let spotifySession = null; // Tokens kept only in memory; reconnect after a full reload.
  let supabaseClient = null;
  let cloudSession = null;
  let cloudDebounce = null;
  let lastAuthConfig = '';
  let spotifyBusy = false;

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value === null ? fallback : value;
    } catch { return fallback; }
  }
  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function notify(message) {
    const toast=$('#toast');
    if (toast) {
      toast.textContent=message;
      toast.classList.add('show');
      clearTimeout(notify.timer);
      notify.timer=setTimeout(()=>toast.classList.remove('show'),4200);
    } else window.alert(message);
  }
  function setStatus(id, message) {
    const el=$('#'+id);
    if (el) el.textContent=message;
  }
  function saveLocal(key, value) {
    localStorage.setItem(key,JSON.stringify(value));
  }
  function appBaseUri() {
    return location.origin + location.pathname.replace(/index\.html$/i,'').replace(/\/?$/,'/');
  }
  function currentLocalData() {
    const rawProgress=readJSON('adaz-data-v1',{});
    // Keep personal Health details on-device: do not send workouts, sleep or nutrition logs to JACOB.
    const progress={};
    for (const key of ['tasks','study','focusSessions','business','orders','content','capital','prefs']) {
      if (rawProgress[key]!==undefined) progress[key]=rawProgress[key];
    }
    return {
      exportedAt:new Date().toISOString(),
      app:'ADAZ',
      progress,
      routineAndReminders:readJSON('adaz-routine-v1',{}),
      aestelBusiness:readJSON('adaz-aestel-v1',{}),
      academy:readJSON('adaz-academy-v1',{}),
      agenda:readJSON('adaz-agenda-v1',{})
    };
  }
  function aiHistory() { return readJSON(AI_HISTORY_KEY,[]).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').slice(-12); }
  function renderAIHistory() {
    const root=$('#aiTranscript');
    if (!root) return;
    root.replaceChildren();
    const history=aiHistory();
    if (!history.length) {
      root.innerHTML='<div class="empty">Cuando consultes al copiloto, la conversación aparecerá aquí. Se guarda localmente en este dispositivo.</div>';
      return;
    }
    history.forEach(item=>{
      const bubble=document.createElement('div');
      bubble.className='ai-msg '+item.role;
      const role=document.createElement('div');
      role.className='ai-role';
      role.textContent=item.role==='user'?'Tu consulta':'JACOB';
      const body=document.createElement('div');
      body.textContent=item.content;
      bubble.append(role,body);
      root.appendChild(bubble);
    });
    root.scrollTop=root.scrollHeight;
  }
  function renderSpotifyConfig() {
    const playlist=$('#spotifyPlaylistUrl');
    if (playlist) playlist.value=spotifyConfig.playlistUrl||'https://open.spotify.com/search/focus%20music';
    renderSpotifyStatus();
  }
  function renderSpotifyStatus(message) {
    const status=$('#spotifyStatus');
    if (!status) return;
    status.textContent=message||'ADAZ abre Spotify por separado. Tu cuenta, listas y reproducción se administran directamente en Spotify.';
  }
  function renderCloudConfig() {
    const values={
      supabaseProjectUrl:cloudConfig.supabaseUrl||'',
      supabasePublishableKey:cloudConfig.supabaseKey||'',
      plannerFunctionUrl:cloudConfig.plannerUrl||''
    };
    Object.entries(values).forEach(([id,value])=>{const el=$('#'+id);if(el)el.value=value;});
    const auto=$('#cloudAutoSync');
    const ai=$('#aiDataConsent');
    if(auto)auto.checked=!!cloudConfig.autoSync;
    if(ai)ai.checked=!!cloudConfig.aiConsent;
    renderCloudStatus();
  }
  function renderCloudStatus(message) {
    const status=$('#cloudStatus');
    if (!status) return;
    if (message) {status.textContent=message;return;}
    if (!cloudConfig.supabaseUrl||!cloudConfig.supabaseKey) {
      status.textContent='Sin proyecto Supabase configurado. Los datos siguen guardados localmente; no se está subiendo nada.';
      return;
    }
    if (!supabaseClient) {
      status.textContent='Proyecto guardado. Pulsa “Probar configuración” para cargar el cliente y verificar la sesión.';
      return;
    }
    if (cloudSession&&cloudSession.user) {
      status.textContent='Sesión activa: '+(cloudSession.user.email||'usuario autenticado')+'. Copia automática '+(cloudConfig.autoSync?'ACTIVADA':'desactivada')+'.';
      return;
    }
    status.textContent='Proyecto configurado, pero sin sesión. Entra con tu correo para sincronizar o llamar al copiloto.';
  }
  function renderIntegrationPage() {
    renderSpotifyConfig();
    renderCloudConfig();
    renderAIHistory();
    const aiStatus=$('#aiStatus');
    if (aiStatus) {
      if (cloudConfig.plannerUrl) aiStatus.textContent='JACOB está configurado en el servidor. Inicia sesión y acepta expresamente el envío de datos para conversar.';
      else aiStatus.textContent='JACOB aún necesita una función segura de Supabase y una clave API guardada como secreto del servidor.';
    }
  }
  function loadScript(src) {
    return new Promise((resolve,reject)=>{
      const prior=document.querySelector('script[data-adaz-sdk="supabase"]');
      if (window.supabase&&typeof window.supabase.createClient==='function') {resolve();return;}
      if (prior) {
        prior.addEventListener('load',resolve,{once:true});
        prior.addEventListener('error',()=>reject(new Error('No se pudo cargar Supabase SDK.')), {once:true});
        return;
      }
      const script=document.createElement('script');
      script.src=src;
      script.async=true;
      script.dataset.adazSdk='supabase';
      script.onload=resolve;
      script.onerror=()=>reject(new Error('No se pudo descargar la biblioteca de Supabase. Revisa la conexión a internet.'));
      document.head.appendChild(script);
    });
  }
  async function ensureSupabaseClient() {
    if (!cloudConfig.supabaseUrl||!cloudConfig.supabaseKey) throw new Error('Primero introduce el Project URL y la publishable/anon key de tu proyecto Supabase.');
    const authFingerprint=cloudConfig.supabaseUrl+'|'+cloudConfig.supabaseKey;
    if (supabaseClient&&lastAuthConfig===authFingerprint) return supabaseClient;
    await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    if (!window.supabase||typeof window.supabase.createClient!=='function') throw new Error('El SDK de Supabase no está disponible en esta sesión.');
    supabaseClient=window.supabase.createClient(cloudConfig.supabaseUrl,cloudConfig.supabaseKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    lastAuthConfig=authFingerprint;
    const result=await supabaseClient.auth.getSession();
    cloudSession=result.data?.session||null;
    supabaseClient.auth.onAuthStateChange((event,session)=>{
      cloudSession=session||null;
      renderCloudStatus();
      if (event==='SIGNED_IN') renderCloudStatus('Sesión iniciada. Antes de subir, puedes restaurar una copia existente o subir este dispositivo.');
    });
    renderCloudStatus();
    return supabaseClient;
  }
  async function saveCloudSettings() {
    cloudConfig.supabaseUrl=($('#supabaseProjectUrl')?.value||'').trim().replace(/\/+$/,'');
    cloudConfig.supabaseKey=($('#supabasePublishableKey')?.value||'').trim();
    cloudConfig.plannerUrl=($('#plannerFunctionUrl')?.value||'').trim();
    if (!cloudConfig.plannerUrl&&cloudConfig.supabaseUrl) cloudConfig.plannerUrl=cloudConfig.supabaseUrl+'/functions/v1/adaz-planner';
    cloudConfig.autoSync=!!$('#cloudAutoSync')?.checked;
    cloudConfig.aiConsent=!!$('#aiDataConsent')?.checked;
    saveLocal(CLOUD_KEY,cloudConfig);
    supabaseClient=null;
    lastAuthConfig='';
    cloudSession=null;
    if ($('#plannerFunctionUrl')) $('#plannerFunctionUrl').value=cloudConfig.plannerUrl;
    if (cloudConfig.autoSync) renderCloudStatus('Conexión guardada. La copia automática está activada; la primera subida ocurre después de un cambio o cuando pulses Subir copia ahora. Si ya existía una copia de otro dispositivo, restáurala primero para no reemplazarla con datos locales antiguos.');
    else renderCloudStatus('Conexión guardada. No se subirán datos automáticamente hasta que actives esa opción.');
    notify('Configuración de nube guardada en este dispositivo.');
  }
  async function sendMagicLink(event) {
    event.preventDefault();
    const email=($('#cloudEmail')?.value||'').trim();
    if (!email) {notify('Escribe el correo que usarás para iniciar sesión.');return;}
    try {
      setStatus('cloudStatus','Preparando acceso seguro…');
      const client=await ensureSupabaseClient();
      const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:appBaseUri()}});
      if (error) throw error;
      setStatus('cloudStatus','Revisa tu correo y abre el enlace de acceso desde este mismo dispositivo. Si no llega, revisa spam y las URL permitidas del proyecto Supabase.');
      notify('Solicitud de acceso enviada.');
    } catch(error) {renderCloudStatus('No se pudo solicitar el acceso: '+error.message);}
  }
  async function testCloud() {
    try {
      const client=await ensureSupabaseClient();
      const {data,error}=await client.auth.getSession();
      if (error) throw error;
      cloudSession=data.session||null;
      renderCloudStatus(cloudSession?'Conexión correcta. Sesión activa para '+(cloudSession.user.email||'tu usuario')+'.':'Supabase se inicializa correctamente; todavía falta iniciar sesión con el correo.');
      notify('Supabase respondió correctamente.');
    } catch(error) {renderCloudStatus('No se pudo verificar Supabase: '+error.message);}
  }
  async function signOutCloud() {
    try {
      if (!supabaseClient) await ensureSupabaseClient();
      const {error}=await supabaseClient.auth.signOut();
      if (error) throw error;
      cloudSession=null;
      renderCloudStatus('Sesión cerrada. Tus datos locales siguen en este dispositivo y la sincronización deja de ejecutarse.');
      notify('Sesión de nube cerrada.');
    } catch(error) {renderCloudStatus('No se pudo cerrar la sesión: '+error.message);}
  }
  async function syncSnapshot(silent) {
    const client=await ensureSupabaseClient();
    const {data,error:sessionError}=await client.auth.getSession();
    if (sessionError) throw sessionError;
    const session=data.session;
    cloudSession=session;
    if (!session?.user) throw new Error('Inicia sesión antes de subir una copia.');
    const snapshot=currentLocalData();
    const result=await client.from('adaz_snapshots').upsert({
      user_id:session.user.id,
      payload:snapshot,
      updated_at:new Date().toISOString()
    },{onConflict:'user_id'});
    if (result.error) throw result.error;
    renderCloudStatus('Copia subida correctamente · '+new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})+'. Tus registros permanecen también en este dispositivo.');
    if (!silent) notify('Copia de progreso subida a Supabase.');
  }
  function scheduleAutoSync() {
    clearTimeout(cloudDebounce);
    if (!cloudConfig.autoSync) return;
    cloudDebounce=setTimeout(async()=>{
      try {await syncSnapshot(true);}
      catch(error) {renderCloudStatus('Sincronización pendiente: '+error.message);}
    },1200);
  }

  async function restoreCloudSnapshot() {
    const client=await ensureSupabaseClient();
    const {data:authData,error:authError}=await client.auth.getSession();
    if(authError) throw authError;
    const session=authData.session;
    if(!session?.user) throw new Error('Inicia sesión antes de restaurar una copia.');
    const {data,error}=await client.from('adaz_snapshots').select('payload,updated_at').eq('user_id',session.user.id).maybeSingle();
    if(error) throw error;
    if(!data?.payload) {
      renderCloudStatus('No hay una copia en la nube para esta cuenta todavía. Sube una copia desde este dispositivo primero.');
      return;
    }
    const when=data.updated_at?new Date(data.updated_at).toLocaleString('es-CO'):'fecha desconocida';
    if(!confirm('Se encontró una copia del '+when+'. Restaurarla reemplazará los registros locales de ADAZ y los recordatorios/ruta local. Exporta un respaldo antes si necesitas conservar lo que tienes en este dispositivo. ¿Continuar?')) return;
    const payload=data.payload||{};
    localStorage.setItem('adaz-data-v1',JSON.stringify(payload.progress||{}));
    localStorage.setItem('adaz-routine-v1',JSON.stringify(payload.routineAndReminders||{}));
    localStorage.setItem('adaz-aestel-v1',JSON.stringify(payload.aestelBusiness||{}));
    localStorage.setItem('adaz-health-v1',JSON.stringify(payload.health||{}));
    localStorage.setItem('adaz-academy-v1',JSON.stringify(payload.academy||{}));
    localStorage.setItem('adaz-agenda-v1',JSON.stringify(payload.agenda||{}));
    renderCloudStatus('Copia restaurada. Recargando ADAZ…');
    location.reload();
  }

  async function askCopilot(event) {
    event.preventDefault();
    const question=($('#aiQuestion')?.value||'').trim();
    if (!question) return;
    if (!cloudConfig.aiConsent) {setStatus('aiStatus','Primero acepta explícitamente el envío del resumen de ADAZ a JACOB mediante la casilla de consentimiento.');return;}
    if (!cloudConfig.plannerUrl) {setStatus('aiStatus','Configura la URL de la función segura adaz-planner. La clave OpenAI nunca va aquí; debe estar en el servidor.');return;}
    try {
      setStatus('aiStatus','JACOB está analizando el contexto que autorizaste…');
      const client=await ensureSupabaseClient();
      const {data,error}=await client.auth.getSession();
      if (error) throw error;
      cloudSession=data.session||null;
      if (!cloudSession?.access_token) throw new Error('Inicia sesión con el correo antes de consultar al copiloto.');
      const history=aiHistory().slice(-8);
      const response=await fetch(cloudConfig.plannerUrl,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer '+cloudSession.access_token,
          'apikey':cloudConfig.supabaseKey
        },
        body:JSON.stringify({agent:'JACOB',question,snapshot:currentLocalData(),history})
      });
      const result=await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(result.error||result.message||('El servidor respondió con HTTP '+response.status));
      const answer=String(result.answer||result.output_text||'La función respondió, pero no devolvió texto.');
      const next=history.concat([{role:'user',content:question},{role:'assistant',content:answer}]).slice(-12);
      saveLocal(AI_HISTORY_KEY,next);
      renderAIHistory();
      $('#aiQuestion').value='';
      setStatus('aiStatus','JACOB respondió · '+new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})+'. Conversación guardada localmente.');
    } catch(error) {
      setStatus('aiStatus','No se pudo consultar al copiloto: '+error.message);
    }
  }
  function downloadJSON(data,name) {
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function exportChatGPTSummary() {
    const snapshot=currentLocalData();
    const packageForChatGPT={
      title:'ADAZ — resumen de contexto para JACOB / revisión manual',
      createdAt:new Date().toISOString(),
      instruction:'Usa este resumen para analizar mis objetivos y sugerir ajustes. Distingue datos registrados de metas estimadas; identifica incertidumbres y pide confirmación cuando falte información.',
      snapshot
    };
    downloadJSON(packageForChatGPT,'ADAZ-resumen-para-ChatGPT.json');
    setStatus('aiStatus','Archivo de contexto creado. Adjunta ese JSON manualmente en tu conversación de ChatGPT; la app no puede leer ni escribir el historial de tu cuenta ChatGPT automáticamente.');
  }
  function readSpotifyForm() {
    spotifyConfig.playlistUrl=($('#spotifyPlaylistUrl')?.value||'').trim()||'https://open.spotify.com/search/focus%20music';
    saveLocal(SPOTIFY_KEY,spotifyConfig);
  }
  function openSpotify() {
    readSpotifyForm();
    let url=spotifyConfig.playlistUrl;
    if (/^spotify:(playlist|album|artist):[A-Za-z0-9]+$/i.test(url)) {
      const parts=url.split(':');url='https://open.spotify.com/'+parts[1]+'/'+parts[2];
    }
    if (!/^https:\/\/open\.spotify\.com\//i.test(url)) url='https://open.spotify.com/search/focus%20music';
    renderSpotifyStatus('Abriendo Spotify. La música seguirá bajo el control de la aplicación Spotify.');
    location.assign(url);
  }
  document.addEventListener('submit',event=>{
    if(event.target.id==='spotifySettingsForm') {
      event.preventDefault();
      readSpotifyForm();
      renderSpotifyStatus('Tu lista quedó guardada en este dispositivo. Cuando quieras, abre Spotify desde ADAZ.');
      notify('Configuración Spotify guardada.');
      return;
    }
    if(event.target.id==='cloudSettingsForm') {
      event.preventDefault();
      saveCloudSettings();
      return;
    }
    if(event.target.id==='cloudLoginForm') {
      sendMagicLink(event);
      return;
    }
    if(event.target.id==='aiPromptForm') {
      askCopilot(event);
    }
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='cloudAutoSync') {
      if(event.target.checked&&!confirm('¿Confirmas que deseas subir automáticamente a tu base privada todos los registros de ADAZ, incluidos estudio, negocio/finanzas, entrenamiento, bienestar y revisiones? La subida puede reemplazar la única copia en la nube con los datos de este dispositivo. Si necesitas conservar una copia de otro dispositivo, cancela y restáurala primero.')) {
        event.target.checked=false;
      }
      cloudConfig.autoSync=event.target.checked;
      saveLocal(CLOUD_KEY,cloudConfig);
      renderCloudStatus();
      if(cloudConfig.autoSync) scheduleAutoSync();
      notify(cloudConfig.autoSync?'Sincronización automática activada.':'Sincronización automática desactivada.');
    }
    if(event.target.id==='aiDataConsent') {
      cloudConfig.aiConsent=event.target.checked;
      saveLocal(CLOUD_KEY,cloudConfig);
      notify(cloudConfig.aiConsent?'El copiloto puede enviar el resumen cuando lo consultes.':'Se desactivó el envío del resumen a la IA.');
    }
  });
  document.addEventListener('click',async event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    try {
      if(action==='openSpotify') await openSpotify();
      else if(action==='testCloud') await testCloud();
      else if(action==='cloudSignOut') await signOutCloud();
      else if(action==='syncNow') await syncSnapshot(false);
      else if(action==='restoreCloud') await restoreCloudSnapshot();
      else if(action==='clearCloudConfig') {
        if(!confirm('¿Borrar la configuración de nube y desactivar la sincronización en este dispositivo? Los datos ya subidos a Supabase no se eliminan.')) return;
        cloudConfig={supabaseUrl:'',supabaseKey:'',plannerUrl:'',autoSync:false,aiConsent:false};
        saveLocal(CLOUD_KEY,cloudConfig);supabaseClient=null;cloudSession=null;lastAuthConfig='';
        renderCloudConfig();
        notify('Configuración local de nube borrada. Si quieres borrar los datos remotos, hazlo en el panel de Supabase.');
      } else if(action==='clearAiHistory') {
        if(!confirm('¿Borrar la conversación local del copiloto en este dispositivo?')) return;
        localStorage.removeItem(AI_HISTORY_KEY);renderAIHistory();notify('Conversación local eliminada.');
      } else if(action==='exportAiSummary') exportChatGPTSummary();
    } catch(error) {
      if(action==='openSpotify') renderSpotifyStatus('No se pudo abrir Spotify: '+error.message);
      else renderCloudStatus('Error: '+error.message);
    }
  });
  window.addEventListener('adaz-data-updated',()=>{
    if(cloudConfig.autoSync) scheduleAutoSync();
  });
  window.addEventListener('adaz-extras-imported',()=>{
    renderIntegrationPage();
    if(cloudConfig.autoSync) scheduleAutoSync();
  });
  window.addEventListener('storage',event=>{
    if(event.key===CLOUD_KEY) {cloudConfig=readJSON(CLOUD_KEY,cloudConfig);renderCloudConfig();}
    if(event.key===SPOTIFY_KEY) {spotifyConfig=readJSON(SPOTIFY_KEY,spotifyConfig);renderSpotifyConfig();}
  });
  async function initial() {
    if(!$('#page-integrations')) return;
    renderIntegrationPage();
    if(cloudConfig.supabaseUrl&&cloudConfig.supabaseKey) {
      try { await ensureSupabaseClient(); }
      catch(error) {renderCloudStatus('No se pudo iniciar Supabase ahora: '+error.message);}
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initial);
  else initial();
})();