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
  let spotifySession = readJSON(SPOTIFY_SESSION_KEY, null);
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
    return {
      exportedAt:new Date().toISOString(),
      app:'ADAZ',
      progress:readJSON('adaz-data-v1',{}),
      routineAndReminders:readJSON('adaz-routine-v1',{})
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
      role.textContent=item.role==='user'?'Tu consulta':'ADAZ Copiloto';
      const body=document.createElement('div');
      body.textContent=item.content;
      bubble.append(role,body);
      root.appendChild(bubble);
    });
    root.scrollTop=root.scrollHeight;
  }
  function renderSpotifyConfig() {
    const playlist=$('#spotifyPlaylistUrl');
    const client=$('#spotifyClientId');
    const redirect=$('#spotifyRedirectUri');
    if (playlist) playlist.value=spotifyConfig.playlistUrl||'https://open.spotify.com/search/workout%20music';
    if (client) client.value=spotifyConfig.clientId||'';
    if (redirect) {
      redirect.value=spotifyConfig.redirectUri||appBaseUri();
      redirect.title='Registra esta URI exactamente en Spotify Developer Dashboard';
    }
    renderSpotifyStatus();
  }
  function renderSpotifyStatus(message) {
    const status=$('#spotifyStatus');
    if (!status) return;
    if (message) { status.textContent=message; return; }
    const playlist=spotifyConfig.playlistUrl?'Lista configurada.':'No hay lista guardada.';
    const auth=spotifySession&&spotifySession.access_token?'Control API conectado en este dispositivo.':'Control API no conectado. Puedes abrir Spotify sin conectar la API.';
    status.textContent=playlist+' '+auth;
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
      if (cloudConfig.plannerUrl) aiStatus.textContent='Función de IA configurada. Inicia sesión y marca el consentimiento de análisis para habilitar consultas.';
      else aiStatus.textContent='Falta configurar una función segura de IA. Consulta INTEGRATIONS.md en el repositorio.';
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
    renderCloudStatus('Copia restaurada. Recargando ADAZ…');
    location.reload();
  }

  async function askCopilot(event) {
    event.preventDefault();
    const question=($('#aiQuestion')?.value||'').trim();
    if (!question) return;
    if (!cloudConfig.aiConsent) {setStatus('aiStatus','Primero acepta explícitamente el envío del resumen a la IA mediante la casilla de consentimiento.');return;}
    if (!cloudConfig.plannerUrl) {setStatus('aiStatus','Configura la URL de la función segura adaz-planner. La clave OpenAI nunca va aquí; debe estar en el servidor.');return;}
    try {
      setStatus('aiStatus','Preparando tus datos y consultando al copiloto…');
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
        body:JSON.stringify({question,snapshot:currentLocalData(),history})
      });
      const result=await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(result.error||result.message||('El servidor respondió con HTTP '+response.status));
      const answer=String(result.answer||result.output_text||'La función respondió, pero no devolvió texto.');
      const next=history.concat([{role:'user',content:question},{role:'assistant',content:answer}]).slice(-12);
      saveLocal(AI_HISTORY_KEY,next);
      renderAIHistory();
      $('#aiQuestion').value='';
      setStatus('aiStatus','Respuesta recibida · '+new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})+'. La conversación queda guardada localmente.');
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
      title:'ADAZ — resumen de contexto para revisar con ChatGPT',
      createdAt:new Date().toISOString(),
      instruction:'Usa este resumen para analizar mis objetivos y sugerir ajustes. Distingue datos registrados de metas estimadas; identifica incertidumbres y pide confirmación cuando falte información.',
      snapshot
    };
    downloadJSON(packageForChatGPT,'ADAZ-resumen-para-ChatGPT.json');
    setStatus('aiStatus','Archivo de contexto creado. Adjunta ese JSON manualmente en tu conversación de ChatGPT; la app no puede leer ni escribir el historial de tu cuenta ChatGPT automáticamente.');
  }
  function spotifyBase64URL(buffer) {
    const bytes=new Uint8Array(buffer);
    let binary='';
    bytes.forEach(b=>binary+=String.fromCharCode(b));
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function spotifyRedirect() { return spotifyConfig.redirectUri||appBaseUri(); }
  function readSpotifyForm() {
    spotifyConfig.playlistUrl=($('#spotifyPlaylistUrl')?.value||'').trim()||'https://open.spotify.com/search/workout%20music';
    spotifyConfig.clientId=($('#spotifyClientId')?.value||'').trim();
    spotifyConfig.redirectUri=($('#spotifyRedirectUri')?.value||appBaseUri()).trim();
    saveLocal(SPOTIFY_KEY,spotifyConfig);
  }
  async function connectSpotify() {
    readSpotifyForm();
    if (!spotifyConfig.clientId) throw new Error('Para conectar el control avanzado, crea una app en Spotify Developer Dashboard y pega aquí su Client ID. Para abrir música no necesitas ese paso.');
    if (!/^https:\/\//i.test(spotifyRedirect())) throw new Error('La Redirect URI debe usar HTTPS.');
    if (!crypto?.subtle) throw new Error('Este navegador no admite el cálculo seguro PKCE; abre ADAZ desde GitHub Pages por HTTPS.');
    const bytes=crypto.getRandomValues(new Uint8Array(64));
    const verifier=Array.from(bytes,b=>('0'+b.toString(16)).slice(-2)).join('');
    const state=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>('0'+b.toString(16)).slice(-2)).join('');
    const challenge=spotifyBase64URL(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));
    saveLocal(SPOTIFY_PKCE_KEY,{verifier,state});
    const params=new URLSearchParams({
      client_id:spotifyConfig.clientId,
      response_type:'code',
      redirect_uri:spotifyRedirect(),
      code_challenge_method:'S256',
      code_challenge:challenge,
      state,
      scope:'user-read-playback-state user-modify-playback-state user-read-currently-playing'
    });
    location.assign('https://accounts.spotify.com/authorize?'+params.toString());
  }
  async function spotifyTokenRequest(params) {
    const response=await fetch('https://accounts.spotify.com/api/token',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams(params)
    });
    const payload=await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(payload.error_description||payload.error||('Spotify token error '+response.status));
    return payload;
  }
  async function handleSpotifyCallback() {
    const url=new URL(location.href);
    const code=url.searchParams.get('code');
    const returnedState=url.searchParams.get('state');
    const error=url.searchParams.get('error');
    if (!code&&!error) return;
    if (error) {
      history.replaceState(null,'',appBaseUri());
      renderSpotifyStatus('Spotify canceló la autorización: '+error+'. Puedes abrir las listas sin conectar la API.');
      return;
    }
    const pkce=readJSON(SPOTIFY_PKCE_KEY,null);
    if (!pkce?.verifier||!pkce?.state||pkce.state!==returnedState) {
      history.replaceState(null,'',appBaseUri());
      renderSpotifyStatus('No coincide la verificación de seguridad de Spotify. Vuelve a iniciar la conexión desde ADAZ.');
      return;
    }
    try {
      const payload=await spotifyTokenRequest({
        client_id:spotifyConfig.clientId,
        grant_type:'authorization_code',
        code,
        redirect_uri:spotifyRedirect(),
        code_verifier:pkce.verifier
      });
      spotifySession={
        access_token:payload.access_token,
        refresh_token:payload.refresh_token||'',
        expires_at:Date.now()+Number(payload.expires_in||3600)*1000,
        scope:payload.scope||''
      };
      saveLocal(SPOTIFY_SESSION_KEY,spotifySession);
      localStorage.removeItem(SPOTIFY_PKCE_KEY);
      history.replaceState(null,'',appBaseUri());
      renderSpotifyStatus('Spotify conectado. Pulsa “Actualizar dispositivo / canción” para revisar el dispositivo activo.');
    } catch(e) {
      history.replaceState(null,'',appBaseUri());
      renderSpotifyStatus('No se pudo completar el acceso Spotify: '+e.message+'. Comprueba el Client ID y que la Redirect URI registrada sea idéntica.');
    }
  }
  async function refreshSpotifySession(force) {
    spotifySession=readJSON(SPOTIFY_SESSION_KEY,null);
    if (spotifySession?.access_token&&!force&&spotifySession.expires_at>Date.now()+60000) return spotifySession.access_token;
    if (!spotifySession?.refresh_token) throw new Error('Conecta de nuevo Spotify: no hay un token de refresco disponible.');
    if (!spotifyConfig.clientId) throw new Error('Falta el Client ID público de Spotify.');
    const payload=await spotifyTokenRequest({
      client_id:spotifyConfig.clientId,
      grant_type:'refresh_token',
      refresh_token:spotifySession.refresh_token
    });
    spotifySession={
      access_token:payload.access_token,
      refresh_token:payload.refresh_token||spotifySession.refresh_token,
      expires_at:Date.now()+Number(payload.expires_in||3600)*1000,
      scope:payload.scope||spotifySession.scope||''
    };
    saveLocal(SPOTIFY_SESSION_KEY,spotifySession);
    return spotifySession.access_token;
  }
  async function spotifyRequest(path,method,body,retried) {
    const accessToken=await refreshSpotifySession(false);
    const response=await fetch('https://api.spotify.com/v1'+path,{
      method:method||'GET',
      headers:{'Authorization':'Bearer '+accessToken,'Content-Type':'application/json'},
      body:body===undefined?undefined:JSON.stringify(body)
    });
    if (response.status===401&&!retried) {
      await refreshSpotifySession(true);
      return spotifyRequest(path,method,body,true);
    }
    return response;
  }
  function parseSpotifyContext(url) {
    const value=String(url||'').trim();
    const uri=value.match(/^spotify:(playlist|album|artist):([A-Za-z0-9]+)$/);
    if (uri) return 'spotify:'+uri[1]+':'+uri[2];
    const match=value.match(/open\.spotify\.com\/(playlist|album|artist)\/([A-Za-z0-9]+)/i);
    return match?'spotify:'+match[1]+':'+match[2]:null;
  }
  async function openSpotify() {
    readSpotifyForm();
    let url=spotifyConfig.playlistUrl;
    if (!/^https:\/\/open\.spotify\.com\//i.test(url)&&!/^spotify:/i.test(url)) url='https://open.spotify.com/search/workout%20music';
    if (/^spotify:/i.test(url)) {
      const parsed=url.match(/^spotify:(playlist|album|artist):([A-Za-z0-9]+)$/);
      if (parsed) url='https://open.spotify.com/'+parsed[1]+'/'+parsed[2];
      else throw new Error('Ese URI no parece una lista, álbum o artista de Spotify.');
    }
    renderSpotifyStatus('Abriendo Spotify. En Android, el sistema puede abrir la app instalada o la página web.');
    location.assign(url);
  }
  async function refreshSpotifyPlayback() {
    if (!spotifySession?.access_token) throw new Error('Conecta primero el control avanzado de Spotify.');
    const devicesResponse=await spotifyRequest('/me/player/devices','GET');
    const devicesJson=devicesResponse.status===204?{}:await devicesResponse.json().catch(()=>({}));
    if (!devicesResponse.ok) throw new Error(devicesJson.error?.message||'No se pudieron leer los dispositivos. Comprueba Premium, permisos y la configuración de Spotify.');
    const select=$('#spotifyDeviceSelect');
    const devices=Array.isArray(devicesJson.devices)?devicesJson.devices:[];
    if (select) {
      select.innerHTML='<option value="">Seleccionar dispositivo</option>'+devices.map(d=>'<option value="'+escapeHTML(d.id)+'">'+escapeHTML(d.name)+(d.is_active?' · activo':'')+'</option>').join('');
      const active=devices.find(d=>d.is_active);
      if (active) select.value=active.id;
    }
    let currently='';
    const nowResponse=await spotifyRequest('/me/player','GET');
    if (nowResponse.status===204) currently='No se detecta reproducción activa en este momento.';
    else if (nowResponse.ok) {
      const now=await nowResponse.json().catch(()=>({}));
      const item=now.item;
      currently=item?('Sonando: '+item.name+' — '+(item.artists||[]).map(a=>a.name).join(', ')):'Spotify está conectado, pero no hay información de canción disponible.';
    } else currently='No se pudo consultar la reproducción actual.';
    renderSpotifyStatus('Control Spotify conectado. Dispositivos encontrados: '+devices.length+'. '+currently+(devices.length?'':' Abre Spotify en el teléfono y reproduce algo una vez, luego actualiza.'));
  }
  async function playSpotifyContext() {
    if (!spotifySession?.access_token) throw new Error('Conecta primero el control avanzado de Spotify.');
    readSpotifyForm();
    const context=parseSpotifyContext(spotifyConfig.playlistUrl);
    if (!context) throw new Error('Para iniciar una lista desde ADAZ, pega un enlace de una playlist, álbum o artista. Un enlace de búsqueda solo sirve para abrir Spotify.');
    let deviceId=$('#spotifyDeviceSelect')?.value||'';
    const devRes=await spotifyRequest('/me/player/devices','GET');
    const devJson=devRes.status===204?{}:await devRes.json().catch(()=>({}));
    if (!devRes.ok) throw new Error(devJson.error?.message||'No se pudieron consultar dispositivos. Comprueba Spotify Premium.');
    const devices=devJson.devices||[];
    if (!devices.length) throw new Error('No hay un dispositivo Spotify Connect disponible. Abre Spotify en tu móvil o computador e inicia la reproducción una vez; después vuelve a intentar.');
    if (!deviceId) deviceId=(devices.find(d=>d.is_active)||devices[0]).id;
    const response=await spotifyRequest('/me/player/play?device_id='+encodeURIComponent(deviceId),'PUT',{context_uri:context});
    if (response.status===204||response.ok) {
      renderSpotifyStatus('Solicitud enviada a Spotify. La música se reproducirá en el dispositivo seleccionado si está disponible.');
      notify('Solicitud de reproducción enviada a Spotify.');
    } else {
      const err=await response.json().catch(()=>({}));
      throw new Error(err.error?.message||'Spotify no pudo iniciar la reproducción. Confirma que la cuenta sea Premium y que el dispositivo esté activo.');
    }
  }
  function disconnectSpotify() {
    localStorage.removeItem(SPOTIFY_SESSION_KEY);
    localStorage.removeItem(SPOTIFY_PKCE_KEY);
    spotifySession=null;
    const select=$('#spotifyDeviceSelect');
    if(select) select.innerHTML='<option value="">Conecta Spotify y actualiza dispositivos</option>';
    renderSpotifyStatus('Se borró la sesión local de Spotify. Para revocar el acceso del lado de Spotify, revisa también la página de apps conectadas de tu cuenta.');
    notify('Sesión local de Spotify borrada.');
  }
  document.addEventListener('submit',event=>{
    if(event.target.id==='spotifySettingsForm') {
      event.preventDefault();
      readSpotifyForm();
      renderSpotifyStatus('Configuración Spotify guardada en este dispositivo. Redirect URI: '+spotifyRedirect());
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
      else if(action==='connectSpotify') await connectSpotify();
      else if(action==='refreshSpotify') await refreshSpotifyPlayback();
      else if(action==='playSpotify') await playSpotifyContext();
      else if(action==='disconnectSpotify') disconnectSpotify();
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
      if(['openSpotify','connectSpotify','refreshSpotify','playSpotify','disconnectSpotify'].includes(action)) renderSpotifyStatus('No se pudo completar la acción: '+error.message);
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
    await handleSpotifyCallback();
    spotifySession=readJSON(SPOTIFY_SESSION_KEY,null);
    if(cloudConfig.supabaseUrl&&cloudConfig.supabaseKey) {
      try { await ensureSupabaseClient(); }
      catch(error) {renderCloudStatus('No se pudo iniciar Supabase ahora: '+error.message);}
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initial);
  else initial();
})();