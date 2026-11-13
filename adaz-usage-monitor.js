(() => {
'use strict';
const native=window.ADAZNative;
if(!native || typeof native.getUsageSnapshot!=='function') return;
const h=window.setInterval;
const fmt=n=>{n=Math.max(0,Number(n)||0);return Math.floor(n/60)+' h '+(n%60)+' min';};
const safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let client=null,session=null,links=[],timer=null,lastSnapshot=null;
function read(k,d){try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}}
function ensureClient(){const cfg=read('adaz-cloud-config',{});if(!cfg.supabaseUrl||!cfg.supabaseKey||!window.supabase?.createClient)throw new Error('Configura primero Supabase en ADAZ.');if(!client)client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client;}
function mount(){
 if(document.getElementById('adaz-trust-usage'))return;
 const root=document.createElement('section');root.id='adaz-trust-usage';root.style.cssText='margin:18px auto;padding:18px;max-width:1100px;border:1px solid #334155;border-radius:18px;background:#111827;color:#f8fafc;font:14px/1.5 system-ui';
 root.innerHTML='<div style="font-size:10px;letter-spacing:2px;color:#9fc5ff;font-weight:800">ADAZ TRUST · USO DE APLICACIONES</div><h2 style="margin:6px 0 4px;font-size:20px">Actividad del dispositivo</h2><p style="color:#aab7c8;font-size:12px;margin:0 0 14px">Detecta la aplicación en primer plano y el tiempo diario. Android requiere que habilites manualmente el acceso especial. El servicio activo muestra una notificación permanente.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="adaz-usage-permission" style="padding:10px 13px;border-radius:10px;border:1px solid #51647c;background:#1e293b;color:white">Autorizar estadísticas de uso</button><button id="adaz-usage-start" style="padding:10px 13px;border-radius:10px;border:0;background:#9fc5ff;color:#0c1726;font-weight:800">Iniciar supervisión visible</button><button id="adaz-usage-stop" style="padding:10px 13px;border-radius:10px;border:1px solid #51647c;background:#1e293b;color:white">Detener</button></div><div id="adaz-usage-state" style="margin:12px 0;color:#aab7c8;font-size:12px">Comprobando permisos…</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px"><div style="padding:12px;background:#0b1220;border-radius:12px"><small style="color:#9aa9bd">Aplicación actual</small><div id="adaz-usage-active" style="font-size:18px;font-weight:800">—</div><small id="adaz-usage-since" style="color:#9aa9bd">—</small></div><div style="padding:12px;background:#0b1220;border-radius:12px"><small style="color:#9aa9bd">Uso registrado hoy</small><div id="adaz-usage-total" style="font-size:18px;font-weight:800">—</div><small style="color:#9aa9bd">Suma del tiempo en aplicaciones</small></div></div><div id="adaz-usage-apps" style="margin-top:10px"></div><label style="display:flex;gap:8px;align-items:flex-start;margin-top:14px;font-size:12px;color:#d5deea"><input id="adaz-usage-share" type="checkbox" style="margin-top:3px"> Compartir aplicación activa y estadísticas con el adulto vinculado en ADAZ Family. Se puede desactivar desde aquí o revocar en ADAZ Family.</label><div id="adaz-usage-sync" style="margin-top:8px;font-size:11px;color:#9aa9bd"></div>';
 const anchor=document.querySelector('main')||document.body;anchor.appendChild(root);
 root.querySelector('#adaz-usage-share').checked=localStorage.getItem('adaz-usage-share-enabled')==='true';
 root.querySelector('#adaz-usage-permission').onclick=()=>native.openUsageAccessSettings();
 root.querySelector('#adaz-usage-start').onclick=()=>{if(!native.isUsageAccessGranted()){setState('Primero activa “Permitir acceso de uso” en los ajustes de Android.');native.openUsageAccessSettings();return;}const ok=native.startUsageMonitor();setState(ok?'Supervisión visible iniciada. La notificación de ADAZ TRUST debe permanecer activa.':'No se pudo iniciar el servicio.');refresh();};
 root.querySelector('#adaz-usage-stop').onclick=()=>{native.stopUsageMonitor();setState('Supervisión detenida.');};
 root.querySelector('#adaz-usage-share').onchange=toggleShare;
}
function setState(s){const e=document.getElementById('adaz-usage-state');if(e)e.textContent=s;}
async function toggleShare(){
 const enabled=document.getElementById('adaz-usage-share').checked;
 try{const c=ensureClient();const {data,error}=await c.auth.getSession();if(error)throw error;session=data.session;if(!session)throw new Error('Inicia sesión en ADAZ para configurar la sincronización.');
 const {data:rows,error:e}=await c.from('adaz_family_links').select('id,permissions').eq('child_id',session.user.id).eq('status','active');if(e)throw e;
 if(!rows?.length)throw new Error('Primero vincula una cuenta adulta desde ADAZ Family.');
 const p={...(rows[0].permissions||{}),usage:enabled};const {error:u}=await c.from('adaz_family_links').update({permissions:p}).eq('id',rows[0].id).eq('child_id',session.user.id);if(u)throw u;
 if(enabled){localStorage.setItem('adaz-usage-share-enabled','true');await syncSnapshot();setState('Compartición activada. El adulto vinculado puede consultar estos datos.');}else{localStorage.setItem('adaz-usage-share-enabled','false');native.clearUsageSyncCredentials?.();setState('Compartición desactivada. La detección local puede continuar si el servicio sigue activo.');}
 }catch(e){document.getElementById('adaz-usage-share').checked=!enabled;setState(e.message);}
}
async function syncSnapshot(){
 if(!document.getElementById('adaz-usage-share')?.checked)return;
 const c=ensureClient();const {data,error}=await c.auth.getSession();if(error)throw error;session=data.session;if(!session)return;
 const {data:rows,error:e}=await c.from('adaz_family_links').select('id,permissions').eq('child_id',session.user.id).eq('status','active');if(e)throw e;
 if(!rows?.some(x=>x.permissions?.usage===true))return;
 const cloud=read('adaz-cloud-config',{});native.setUsageSyncCredentials(cloud.supabaseUrl||'',cloud.supabaseKey||'',session.access_token||'',session.refresh_token||'',session.user.id);
 const snap=JSON.parse(native.getUsageSnapshot()||'{}');
 const daily=(snap.apps||[]).map(x=>({app:x.app,minutes:x.minutes}));
 const payload={child_id:session.user.id,active_package:snap.foregroundPackage||'',active_app:snap.foregroundApp||'',active_since:null,daily_usage:daily,captured_at:new Date().toISOString(),device_status:native.isUsageMonitorRunning()?'active':'stopped'};
 const {error:u}=await c.from('adaz_usage_snapshots').upsert(payload,{onConflict:'child_id'});if(u)throw u;
 const el=document.getElementById('adaz-usage-sync');if(el)el.textContent='Última sincronización: '+new Date(payload.captured_at).toLocaleTimeString('es-CO');
}
function refresh(){
 const granted=native.isUsageAccessGranted();const running=native.isUsageMonitorRunning();
 if(!granted){setState('Falta autorizar el acceso especial a estadísticas de uso de Android.');return;}
 const snap=JSON.parse(native.getUsageSnapshot()||'{}');lastSnapshot=snap;
 const active=document.getElementById('adaz-usage-active');if(active)active.textContent=snap.foregroundApp||'Pantalla de inicio / no detectada';
 const since=document.getElementById('adaz-usage-since');if(since)since.textContent='Actualizado '+new Date(snap.updatedAt||Date.now()).toLocaleTimeString('es-CO');
 const total=document.getElementById('adaz-usage-total');if(total)total.textContent=fmt(snap.totalMinutes||0);
 const apps=document.getElementById('adaz-usage-apps');if(apps)apps.innerHTML='<div style="font-weight:800;margin:8px 0">Aplicaciones de hoy</div>'+((snap.apps||[]).slice(0,12).map(x=>'<div style="display:flex;justify-content:space-between;padding:7px 2px;border-bottom:1px solid #263244"><span>'+safe(x.app)+'</span><b>'+fmt(x.minutes)+'</b></div>').join('')||'<small style="color:#9aa9bd">Aún no hay datos suficientes.</small>');
 if(running)setState('Supervisión activa · servicio visible con notificación permanente.');
 else setState('Permiso concedido. Pulsa “Iniciar supervisión visible” para comenzar.');
 syncSnapshot().catch(e=>{const el=document.getElementById('adaz-usage-sync');if(el)el.textContent='Sin sincronizar: '+e.message;});
}
function startLoop(){if(timer)clearInterval(timer);timer=setInterval(refresh,30000);refresh();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();startLoop();},{once:true});else{mount();startLoop();}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
