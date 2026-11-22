'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const tabs = ['Menú principal', 'Añadir deseo', 'Ver regalos', 'Por persona', 'Gastos'];
const states = ['Deseo sin asignar', 'Asignado', 'Comprado'];
const favoritos = ['Pablo', 'Claudia', 'Rebeca', 'Ivan'];
const compradores = ['Rebeca', 'Ivan', 'Esther', 'David', 'Abuelos Ortega', 'MaryLuz', 'Tios Madrid'];
const atajosComprador = ['Rebeca', 'Esther', 'David', 'Ivan'];
const celebrations = ['Tió', 'Papá Noel', 'Reyes', 'Cumpleaños'];
const empty = { persona:'', regalo:'', enlace:'', precio:'', ocasion:'', estado:states[0], comprador:'', regalador:'', notas:'' };
const money = n => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const round = n => `${Math.round(Number(n)||0).toLocaleString('es-ES')} €`;
const status = s => s === 'Idea' ? states[0] : s === 'Entregado' ? 'Comprado' : states.includes(s) ? s : states[0];
const hasPrice = x => x.precio !== '' && x.precio != null;
const sum = list => list.reduce((s,x)=>s+(Number(x.precio)||0),0);
const palette = ['#FFD66B','#FFB3C1','#B8E6C9','#B9C6FF','#FFCBA4','#C9B8FF','#A8E0F0','#F6C5E8'];
const tint = name => palette[[...String(name||'')].reduce((a,c)=>a+c.charCodeAt(0),0)%palette.length];
const initial = name => (String(name||'').trim()[0]||'?').toUpperCase();

const paths = {
  home:<><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>,
  gift:<><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v8h14v-8"/><path d="M12 8c-2 0-4-1-4-3s3-2 4 3zM12 8c2 0 4-1 4-3s-3-2-4 3z"/></>,
  users:<><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M17.5 14.2c2.5.2 4 2 4 4.8"/></>,
  euro:<><path d="M18 6.5A7 7 0 1 0 18 17.5"/><path d="M4 10h9M4 14h9"/></>,
  plus:<path d="M12 5v14M5 12h14"/>,
  check:<path d="M5 12.5l4.5 4.5L19 7.5"/>,
  search:<><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></>,
  back:<path d="M15 5l-7 7 7 7"/>,
  down:<path d="M6 9l6 6 6-6"/>,
  gear:<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></>
};
const Icon = ({n, s=24, w=2.2}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[n]}</svg>;
const Avatar = ({name, size=34}) => <span className="avatar" style={{width:size,height:size,background:tint(name),fontSize:Math.round(size*.47)}} aria-hidden="true">{initial(name)}</span>;

function Chips({label, values, value, onChange, format, scroll}) {
  return <fieldset className="chips"><legend>{label}</legend><div className={scroll?'pills scroll':'pills'}>{values.map(v=><button type="button" key={v} className={value===v?'pill selected':'pill'} aria-pressed={value===v} onClick={()=>onChange(v)}>{format?format(v):v}</button>)}</div></fieldset>;
}
function Seg({label, items, value, onChange}) {
  return <div className="seg" role="group" aria-label={label}>{items.map(([v,text])=><button type="button" key={v} className={value===v?'selected':''} aria-pressed={value===v} onClick={()=>onChange(v)}>{text}</button>)}</div>;
}

export default function Home() {
 const [tab,setTab]=useState('Menú principal'), [items,setItems]=useState([]), [sheetPeople,setSheetPeople]=useState([]), [form,setForm]=useState(empty), [edit,setEdit]=useState('');
 const [busy,setBusy]=useState(false), [loading,setLoading]=useState(true), [error,setError]=useState(''), [notice,setNotice]=useState('');
 const [recipient,setRecipient]=useState('Todos'), [buyer,setBuyer]=useState('Todos'), [giftStatus,setGiftStatus]=useState('Todos'), [occasion,setOccasion]=useState('Todas'), [person,setPerson]=useState(''), [start,setStart]=useState('Menú principal');
 const [query,setQuery]=useState(''), [sheet,setSheet]=useState(null), [moreOpen,setMoreOpen]=useState(false), [otherOpen,setOtherOpen]=useState(false), [otherBuyerOpen,setOtherBuyerOpen]=useState(false), [otherGiverOpen,setOtherGiverOpen]=useState(false);
 const load=useCallback(async(initialLoad=false)=>{setError('');try{const r=await fetch('/api/regalos',{cache:'no-store'}), d=await r.json();if(!r.ok)throw Error(d.error);setItems(current=>{const updates=new Map(pending.current);if(active.current&&!updates.has(active.current.id))updates.set(active.current.id,active.current);return (d.items||[]).map(item=>updates.get(item.id)||item)});setSheetPeople(d.personas||[]);const initial=tabs.includes(d.config?.inicio)?d.config.inicio:'Menú principal';setStart(initial);if(initialLoad)setTab(initial);}catch(e){setError(e.message||'No se pudieron cargar los regalos');}finally{setLoading(false);}},[]);
 useEffect(()=>{load(true)},[load]);
 const people=useMemo(()=>[...new Set(sheetPeople)].sort((a,b)=>a.localeCompare(b,'es')),[sheetPeople]);
 const pending=useRef(new Map()), timer=useRef(null), flushing=useRef(false), active=useRef(null);
 useEffect(()=>{const warn=e=>{if(pending.current.size||flushing.current){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[]);
 const [syncState,setSyncState]=useState('');
 async function flushChanges(){
  if(flushing.current || !pending.current.size)return;
  flushing.current=true;setSyncState('Guardando cambios…');
  while(pending.current.size){
   const [id,item]=pending.current.entries().next().value; pending.current.delete(id);active.current=item;
   try {const r=await fetch('/api/regalos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save',item})});const d=await r.json();if(!r.ok)throw Error(d.error);}
   catch(e){if(!pending.current.has(id))pending.current.set(id,item);setSyncState('No se pudieron guardar los cambios. Comprueba la conexión y pulsa Reintentar.');active.current=null;flushing.current=false;return;}
   active.current=null;
  }
  flushing.current=false;setSyncState('Cambios guardados');
 }
 function queueChange(item){pending.current.set(item.id,item);setSyncState('Cambios pendientes');clearTimeout(timer.current);timer.current=setTimeout(flushChanges,900);}
 const buyers=useMemo(()=>[...new Set(items.map(x=>x.comprador).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')),[items]);
 const occasions=useMemo(()=>[...new Set([...celebrations,...items.map(x=>x.ocasion).filter(Boolean)])],[items]);
 function navigate(t){clearTimeout(timer.current);flushChanges();setTab(t);setNotice('');setPerson('');setSheet(null);window.scrollTo(0,0)}
 function newGift(persona=''){setEdit('');setForm({...empty,persona});setMoreOpen(false);setOtherOpen(false);setOtherBuyerOpen(false);setOtherGiverOpen(false);navigate('Añadir deseo')}
 async function action(data){setBusy(true);setError('');setNotice('');try{const r=await fetch('/api/regalos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}),d=await r.json();if(!r.ok)throw Error(d.error);return true;}catch(e){setError(e.message||'No se pudo guardar');return false;}finally{setBusy(false)}}
 function pickBuyer(v){setForm(f=>{const comprador=f.comprador===v?'':v;return {...f,comprador,estado:f.estado==='Comprado'?f.estado:(comprador.trim()?'Asignado':states[0])}})}
 function typeBuyer(v){setForm(f=>({...f,comprador:v,estado:f.estado==='Comprado'?f.estado:(v.trim()?'Asignado':states[0])}))}
 async function submit(e){e.preventDefault();if(!form.persona){setError('Elige para quién es el regalo.');window.scrollTo(0,0);return}if(await action({action:'save',item:{...form,id:edit,precio:form.precio===''?'':Number(form.precio)}})){setForm(empty);setEdit('');await load();navigate('Ver regalos');setNotice('Regalo guardado.');}}
 function editing(x){setSheet(null);if(pending.current.has(x.id)||flushing.current){setError('Espera a que se guarden los cambios antes de editar.');flushChanges();return;}setForm({...empty,...x,estado:status(x.estado),precio:x.precio??''});setEdit(x.id);setMoreOpen(true);setOtherOpen(!favoritos.includes(x.persona));setOtherBuyerOpen(false);setOtherGiverOpen(false);navigate('Añadir deseo')}
 async function remove(x){setSheet(null);if(pending.current.has(x.id)||flushing.current){setError('Espera a que se guarden los cambios antes de eliminar.');flushChanges();return;}if(window.confirm(`¿Eliminar «${x.regalo}»?`)&&await action({action:'delete',id:x.id})){await load();setNotice('Regalo eliminado.')}}
 function toggleBought(x){const next=status(x.estado)==='Comprado'?(x.comprador?'Asignado':'Deseo sin asignar'):'Comprado';const updated={...x,estado:next};setItems(current=>current.map(item=>item.id===x.id?updated:item));queueChange(updated);}
 async function saveStart(v){if(await action({action:'config',inicio:v})){setStart(v);setNotice('Pantalla de inicio guardada para todos.')}}

 const isBought = x => status(x.estado)==='Comprado';
 const boughtCount = items.filter(isBought).length;
 const spentAll = sum(items.filter(isBought)), pendingAll = sum(items.filter(x=>!isBought(x)));
 const giftLine = x => [x.regalador&&x.regalador!==x.comprador?`Compra ${x.comprador||'—'} · Regala ${x.regalador}`:(x.comprador||'Sin comprador'),x.ocasion||'Sin celebración'].join(' · ');
 const card = x => {
  const st=status(x.estado), bought=st==='Comprado';
  return <article className={`gift ${bought?'is-bought':''}`} key={x.id}>
   <button className={`check ${bought?'checked':''}`} type="button" aria-label={`${bought?'Desmarcar':'Marcar'} ${x.regalo} como comprado`} aria-pressed={bought} onClick={()=>toggleBought(x)}>{bought&&<Icon n="check" w={3}/>}</button>
   <button type="button" className="gift-main" onClick={()=>setSheet(x)} aria-label={`Abrir ${x.regalo}`}><strong className="gift-name">{x.regalo}</strong><span className="gift-sub">{giftLine(x)}</span></button>
   <div className="gift-side"><strong className={hasPrice(x)?'price':'price none'}>{hasPrice(x)?money(x.precio):'Sin precio'}</strong><span className={`badge ${bought?'bought':st==='Asignado'?'assigned':'free'}`}>{st==='Deseo sin asignar'?'Sin asignar':st}</span></div>
  </article>;
 };
 const q=query.trim().toLowerCase();
 const shown=useMemo(()=>items.filter(x=>(giftStatus==='Todos'||(giftStatus==='Comprados'?status(x.estado)==='Comprado':status(x.estado)!=='Comprado'))&&(occasion==='Todas'||x.ocasion===occasion)&&(!q||[x.regalo,x.persona,x.comprador,x.regalador,x.notas].some(v=>String(v||'').toLowerCase().includes(q)))),[items,giftStatus,occasion,q]);
 const groups=useMemo(()=>{const m=new Map();shown.forEach(x=>{const k=x.persona||'Sin destinatario';if(!m.has(k))m.set(k,[]);m.get(k).push(x)});return [...m.entries()].sort((a,b)=>a[0].localeCompare(b[0],'es'))},[shown]);
 const expenses=items.filter(x=>isBought(x)&&(recipient==='Todos'||x.persona===recipient)&&(buyer==='Todos'||(buyer==='Sin comprador'?!x.comprador:x.comprador===buyer)));
 const pendingList=items.filter(x=>!isBought(x)&&(recipient==='Todos'||x.persona===recipient)&&(buyer==='Todos'||(buyer==='Sin comprador'?!x.comprador:x.comprador===buyer)));
 const buyerTotal = b => sum(items.filter(x=>isBought(x)&&(b==='Todos'||(b==='Sin comprador'?!x.comprador:x.comprador===b))));
 const home = tab==='Menú principal', adding = tab==='Añadir deseo';
 const navItems=[['Menú principal','home','Inicio'],['Ver regalos','gift','Regalos'],null,['Por persona','users','Personas'],['Gastos','euro','Gastos']];
 const tiles=[['Añadir deseo','plus','Una idea nueva'],['Ver regalos','gift',`${items.length-boughtCount} pendientes`],['Por persona','users',`${people.length} personas`],['Gastos','euro',`${money(spentAll)} gastados`]];
 const personGifts = person ? items.filter(x=>x.persona===person) : [];
 const buyerExtra = [...new Set([...compradores.filter(b=>!atajosComprador.includes(b)), form.comprador.trim()].filter(b=>b&&!atajosComprador.includes(b)))];
 const giverExtra = [...new Set([...compradores.filter(b=>!atajosComprador.includes(b)), form.regalador.trim()].filter(b=>b&&!atajosComprador.includes(b)))];
 const showGiverSelect = otherGiverOpen||(form.regalador.trim()&&!atajosComprador.includes(form.regalador.trim()));
 const showBuyerSelect = otherBuyerOpen||(form.comprador.trim()&&!atajosComprador.includes(form.comprador.trim()));
 const buyerFilterValues = [...new Set([...compradores,...buyers])];

 return <main className={home?'is-home':adding?'has-bar':'has-nav'}>
  {home?<header className="home-header"><div><span className="eyebrow">Navidad {new Date().getFullYear()}</span><h1>Regalos familiares</h1></div><button className="round-btn" onClick={()=>navigate('Configuración')} aria-label="Configuración"><Icon n="gear"/></button></header>
  :<header className="screen-header"><button className="round-btn" onClick={()=>person?setPerson(''):navigate('Menú principal')} aria-label="Volver"><Icon n="back" w={2.4}/></button>{person&&<Avatar name={person} size={44}/>}<h1>{person||(adding&&edit?'Editar regalo':tab)}</h1>{tab==='Ver regalos'&&<span className="count">{items.length} en total</span>}{tab==='Por persona'&&!person&&<span className="count">{people.length} personas</span>}</header>}
  {error&&<div role="alert" className="message error">{error} <button className="textbtn" onClick={()=>load()}>Reintentar</button></div>}{notice&&<div role="status" className="message">{notice}</div>}{syncState&&<div role="status" className="sync">{syncState} {syncState.startsWith('No se')&&<button onClick={flushChanges}>Reintentar</button>}</div>}

  {home&&<>
   <section className="summary" aria-label="Resumen"><div className="summary-top"><strong>{boughtCount} de {items.length} comprados</strong><span>{items.length?Math.round(boughtCount/items.length*100):0} %</span></div><div className="bar"><i style={{width:`${items.length?boughtCount/items.length*100:0}%`}}/></div><div className="summary-money"><div><small>Gastado</small><strong>{money(spentAll)}</strong></div><div><small>Pendiente previsto</small><strong>{money(pendingAll)}</strong></div></div></section>
   <nav className="home-menu" aria-label="Menú principal">{tiles.map(([t,icon,sub],i)=><button key={t} className={`tile t${i}`} onClick={()=>t==='Añadir deseo'?newGift():navigate(t)}><span className="tile-icon"><Icon n={icon} s={28} w={2.4}/></span><span className="tile-text"><strong>{t}</strong><small>{sub}</small></span></button>)}</nav>
   <section className="quick" aria-label="Añadir regalo rápidamente"><span>Añadir rápido para…</span><div>{favoritos.map(p=><button type="button" key={p} onClick={()=>newGift(p)}><Avatar name={p}/><b>{p}</b></button>)}</div></section>
  </>}

  {adding&&<form className="form" onSubmit={submit}>
   <fieldset className="field"><legend>¿Para quién? <em>*</em></legend><div className="person-grid">{favoritos.map(p=><button type="button" key={p} className={form.persona===p?'person-btn selected':'person-btn'} aria-pressed={form.persona===p} onClick={()=>setForm({...form,persona:p})}><Avatar name={p}/><span>{p}</span></button>)}<button type="button" className={otherOpen||(form.persona&&!favoritos.includes(form.persona))?'person-btn other selected':'person-btn other'} aria-expanded={otherOpen} onClick={()=>setOtherOpen(!otherOpen)}><span className="avatar plus"><Icon n="plus" s={20} w={2.6}/></span><span>Otra</span></button></div>
    {(otherOpen||(form.persona&&!favoritos.includes(form.persona)))&&<select aria-label="Otra persona" value={form.persona} onChange={e=>setForm({...form,persona:e.target.value})}><option value="">Selecciona una persona</option>{form.persona&&!people.includes(form.persona)&&<option value={form.persona}>{form.persona}</option>}{people.map(p=><option key={p} value={p}>{p}</option>)}</select>}
    {!loading&&!people.length&&<p className="small muted">No se ha podido cargar la lista de personas de la hoja.</p>}</fieldset>
   <label className="field"><span>Regalo <em>*</em></span><input required maxLength="200" value={form.regalo} onChange={e=>setForm({...form,regalo:e.target.value})} placeholder="Ej. Un libro"/></label>
   <Chips label="Celebración (opcional)" values={occasions} value={form.ocasion} onChange={v=>setForm({...form,ocasion:form.ocasion===v?'':v})}/>
   <fieldset className="chips"><legend>¿Quién lo compra? <small>(se puede cambiar)</small></legend><div className="pills"><button type="button" className={!form.comprador.trim()&&!otherBuyerOpen?'pill selected':'pill'} aria-pressed={!form.comprador.trim()} onClick={()=>{typeBuyer('');setOtherBuyerOpen(false)}}>Sin asignar</button>{atajosComprador.map(b=><button type="button" key={b} className={form.comprador===b?'pill selected':'pill'} aria-pressed={form.comprador===b} onClick={()=>{pickBuyer(b);setOtherBuyerOpen(false)}}>{b}</button>)}<button type="button" className={showBuyerSelect?'pill selected':'pill'} aria-expanded={!!showBuyerSelect} onClick={()=>setOtherBuyerOpen(!showBuyerSelect)}>Otro…</button></div>{showBuyerSelect&&<select aria-label="Otro comprador" value={form.comprador} onChange={e=>typeBuyer(e.target.value)}><option value="">Selecciona un comprador</option>{buyerExtra.map(b=><option key={b} value={b}>{b}</option>)}</select>}</fieldset>
   <fieldset className="chips"><legend>¿Quién lo regala? <small>(si es otra persona que quien compra)</small></legend><div className="pills"><button type="button" className={!form.regalador.trim()&&!otherGiverOpen?'pill selected':'pill'} aria-pressed={!form.regalador.trim()} onClick={()=>{setForm({...form,regalador:''});setOtherGiverOpen(false)}}>Quien compra</button>{atajosComprador.map(b=><button type="button" key={b} className={form.regalador===b?'pill selected':'pill'} aria-pressed={form.regalador===b} onClick={()=>{setForm({...form,regalador:form.regalador===b?'':b});setOtherGiverOpen(false)}}>{b}</button>)}<button type="button" className={showGiverSelect?'pill selected':'pill'} aria-expanded={!!showGiverSelect} onClick={()=>setOtherGiverOpen(!showGiverSelect)}>Otro…</button></div>{showGiverSelect&&<select aria-label="Otro quien regala" value={form.regalador} onChange={e=>setForm({...form,regalador:e.target.value})}><option value="">Selecciona quién lo regala</option>{giverExtra.map(b=><option key={b} value={b}>{b}</option>)}</select>}</fieldset>
   <label className="field">Precio previsto (opcional)<span className="money-input"><input type="number" inputMode="decimal" min="0" step="0.01" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})} placeholder="0,00"/><b>€</b></span></label>
   <button type="button" className="more-btn" aria-expanded={moreOpen} onClick={()=>setMoreOpen(!moreOpen)}><span>Más detalles: enlace, notas…</span><Icon n="down" w={2.4}/></button>
   {moreOpen&&<div className="more">
    <label className="field">Otra celebración<input value={form.ocasion} onChange={e=>setForm({...form,ocasion:e.target.value})} placeholder="Opcional"/></label>
    <Chips label="Estado" values={states} value={form.estado} onChange={v=>setForm({...form,estado:v})}/>
    <label className="field">Enlace<input type="url" value={form.enlace} onChange={e=>setForm({...form,enlace:e.target.value})} placeholder="https://..."/></label>
    <label className="field">Notas<textarea rows="3" value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} placeholder="Talla, color, ideas..."/></label>
   </div>}
   <div className="savebar"><button className="primary" disabled={busy}>{busy?'Guardando…':<><Icon n="check" w={3}/>{edit?'Guardar cambios':'Guardar deseo'}</>}</button>{edit?<button type="button" className="secondary" onClick={()=>{setEdit('');setForm(empty);navigate('Ver regalos')}}>Cancelar edición</button>:<span>Estado: {form.estado==='Deseo sin asignar'?'Deseo sin asignar (cambia solo al elegir comprador)':form.estado}</span>}</div>
  </form>}

  {tab==='Ver regalos'&&<>
   <label className="search"><Icon n="search" w={2.2}/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar regalo o persona" aria-label="Buscar regalo o persona"/></label>
   <Seg label="Estado" value={giftStatus} onChange={setGiftStatus} items={[['Todos',`Todos ${items.length}`],['Pendientes',`Pendientes ${items.length-boughtCount}`],['Comprados',`Comprados ${boughtCount}`]]}/>
   <div className="pills scroll" role="group" aria-label="Celebración">{['Todas',...occasions].map(v=><button type="button" key={v} className={occasion===v?'pill selected':'pill'} aria-pressed={occasion===v} onClick={()=>setOccasion(v)}>{v}</button>)}</div>
   {loading?<p className="empty">Cargando…</p>:groups.length?groups.map(([p,list])=><section className="group" key={p}><div className="group-head"><Avatar name={p} size={30}/><strong>{p}</strong><span>{list.filter(isBought).length} de {list.length} comprados</span></div>{list.map(card)}</section>):<p className="empty">No hay regalos con estos filtros.</p>}
  </>}

  {tab==='Por persona'&&(loading?<p className="empty">Cargando…</p>:person?<>
   <section className="stats" aria-label={`Resumen de ${person}`}><div className="stat dark"><small>Comprados</small><strong>{personGifts.filter(isBought).length} de {personGifts.length}</strong></div><div className="stat good"><small>Gastado</small><strong>{money(sum(personGifts.filter(isBought)))}</strong></div><div className="stat warn"><small>Pendiente</small><strong>{money(sum(personGifts.filter(x=>!isBought(x))))}</strong></div></section>
   {personGifts.length?personGifts.map(card):<p className="empty">Todavía no hay regalos para {person}.</p>}
   <button type="button" className="add-for" onClick={()=>newGift(person)}><Icon n="plus" s={22} w={2.8}/>Añadir regalo para {person}</button>
  </>:people.length?<div className="people-grid">{people.map(p=>{const gifts=items.filter(x=>x.persona===p), done=gifts.filter(isBought).length;return <button className="person-card" key={p} onClick={()=>{setPerson(p);window.scrollTo(0,0)}}><span className="person-top"><Avatar name={p} size={44}/><strong>{p}</strong></span><span className="person-bottom"><span className="bar"><i style={{width:`${gifts.length?done/gifts.length*100:0}%`}}/></span><small>{gifts.length?`${done} de ${gifts.length} comprados`:'Sin regalos'}</small></span></button>})}</div>:<p className="empty">Añade un regalo para verlo por persona.</p>)}

  {tab==='Gastos'&&(loading?<p className="empty">Cargando…</p>:<>
   <section className="totals" aria-label="Totales"><div className="stat good"><small>Gastado</small><strong>{money(sum(expenses))}</strong></div><div className="stat warn"><small>Pendiente previsto</small><strong>{money(sum(pendingList))}</strong></div></section>
   <Chips label="COMPRADOR" scroll values={['Todos',...buyerFilterValues,...(items.some(x=>!x.comprador)?['Sin comprador']:[])]} value={buyer} onChange={setBuyer} format={v=>v==='Todos'||buyerTotal(v)>0?`${v} · ${round(buyerTotal(v))}`:v}/>
   <Chips label="DESTINATARIO" scroll values={['Todos',...people]} value={recipient} onChange={setRecipient}/>
   <div className="showing"><span>Mostrando: <b>{buyer} → {recipient}</b></span><small>{expenses.length} {expenses.length===1?'regalo comprado':'regalos comprados'}</small></div>
   {expenses.length>0&&<div className="expenses">{expenses.map(x=><div className="spend" key={x.id}><div><strong>{x.regalo}</strong><small>{x.comprador||'Sin comprador'} → {x.persona}</small></div><b>{hasPrice(x)?money(x.precio):'Sin precio'}</b></div>)}</div>}
   {!expenses.length&&<p className="empty">No hay gastos con estos filtros.</p>}
   <div className="total"><span>Total gastado</span><strong>{money(sum(expenses))}</strong></div><p className="muted small">El total incluye los regalos comprados con precio indicado.</p></>)}

  {tab==='Configuración'&&<div className="settings"><p>Elige la pantalla que se abre al entrar. Se comparte en todos los dispositivos.</p><Chips label="Pantalla de inicio" values={tabs} value={start} onChange={saveStart}/></div>}

  {!home&&!adding&&<nav className="bottom-nav" aria-label="Navegación">{navItems.map(it=>it?<button key={it[0]} className={tab===it[0]?'active':''} aria-current={tab===it[0]?'page':undefined} onClick={()=>navigate(it[0])}><Icon n={it[1]} w={tab===it[0]?2.5:2.2}/>{it[2]}</button>:<button key="add" className="fab" aria-label="Añadir deseo" onClick={()=>newGift()}><Icon n="plus" s={28} w={2.8}/></button>)}</nav>}

  {sheet&&<div className="overlay" onClick={()=>setSheet(null)}><div className="sheet" role="dialog" aria-modal="true" aria-label={sheet.regalo} onClick={e=>e.stopPropagation()}>
   <div className="sheet-head"><Avatar name={sheet.persona} size={44}/><div><strong>{sheet.regalo}</strong><small>Para {sheet.persona} · {sheet.ocasion||'Sin celebración'}</small></div></div>
   <p className="sheet-line">{sheet.comprador?`Lo compra ${sheet.comprador}`:'Sin comprador'} · {sheet.regalador&&sheet.regalador!==sheet.comprador?` · Lo regala ${sheet.regalador}`:''} · {hasPrice(sheet)?money(sheet.precio):'Sin precio'} · {status(sheet.estado)}</p>
   {sheet.notas&&<p className="sheet-notes">{sheet.notas}</p>}
   <div className="sheet-actions">{/^https?:\/\//i.test(sheet.enlace||'')&&<a className="secondary" href={sheet.enlace} target="_blank" rel="noreferrer">Ver enlace ↗</a>}<button className="primary" onClick={()=>editing(sheet)}>Editar</button><button className="danger" disabled={busy} onClick={()=>remove(sheet)}>Eliminar</button><button className="secondary" onClick={()=>setSheet(null)}>Cerrar</button></div>
  </div></div>}
 </main>;
}
