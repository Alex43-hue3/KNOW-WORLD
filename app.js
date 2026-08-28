const STATE_VERSION = 9;
const MAX_LIVES = 5;
const LIFE_INTERVAL = 30 * 60 * 1000;
const XP_LIFE_WINDOW = 24 * 60 * 60 * 1000;

const DEFAULT_STATE = {
  stateVersion: STATE_VERSION,
  name: "",
  xp: 0,
  coins: 0,
  lives: 5,
  streak: 0,
  bestStreak: 0,
  correctAnswers: 0,
  answeredTotal: 0,
  questionIndex: 0,
  sound: true,
  purchased: [],
  equippedTitle: "",
  equippedItems: {avatar:"",frame:"",background:"",effect:"",badge:""},
  xpLifePurchaseCount: 0,
  xpLifePurchaseWindowStart: Date.now(),
  lastLifeRecovery: Date.now(),
  lastDailyDate: "",
  lastWeeklyKey: "",
  daily: null,
  weekly: null,
  season: 1,
  seasonEndsAt: Date.now() + 7*24*60*60*1000,
  lastQuestionId: null
};

const RANKING_BASE = [
  ["PlayerOne",125230],["Sofia",114980],["Brainiac",104450],["KnowledgePro",90300],["MasterMind",80200],["Cerebro",70400],["Nova",65000],["Genio",59000],["Sabio",54000],["Explorer",50000],["QuizMaster",46000],["Thinker",42000],["Einstein",39000],["Curioso",36000],["Mentor",33000],["Titan",30000],["Omega",27000],["Orion",24000],["Atlas",21000],["Pixel",19000],["BrainStorm",17500],["SaberX",16000],["Atenea",15000],["Cosmos",14000],["Vector",13000],["Newton",12000],["Galileo",11000],["Tesla",10000],["Curiosity",9000],["Quantum",8000],["Logic",7000],["DataMind",6000],["Astro",5000],["Cometa",4500],["Lumen",4000],["Futura",3500],["Zen",3000],["Nexus",2500],["Alpha",2000],["Beta",1500],["Gamma",1000],["Delta",500],["Sigma",250],["Tau",100],["Kappa",50],["Lambda",25]
].map(([name,xp])=>({name,xp}));

const TITLES = [
  {name:"Explorador del Saber",min:500}, {name:"Conocedor",min:5000}, {name:"Experto",min:10000},
  {name:"Maestro",min:20000}, {name:"Sabio",min:35000}, {name:"Leyenda",min:70000}
];
const CATEGORIES = ["Ciencia","Historia","Geografía","Matemáticas","Artistas","Deportes","Literatura","Tecnología","Cultura"];

const SHOP = [
  {name:"Marco Fuego",type:"frame",price:2500,rarity:"ÉPICO",icon:"🔥"},
  {name:"Fondo Galaxia",type:"background",price:4000,rarity:"ÉPICO",icon:"🌌"},
  {name:"Efecto Estrella",type:"effect",price:1500,rarity:"RARO",icon:"✨"},
  {name:"Avatar Guerrero",type:"avatar",price:6000,rarity:"LEGENDARIO",icon:"🧙"},
  {name:"Fondo Atardecer",type:"background",price:4000,rarity:"ÉPICO",icon:"🌅"},
  {name:"Título Sabio",type:"title",price:10000,rarity:"LEGENDARIO",icon:"🏆"},
  {name:"Insignia Ciencia",type:"badge",price:1200,rarity:"RARO",icon:"🔬"},
  {name:"Marco Estelar",type:"frame",price:3000,rarity:"ÉPICO",icon:"🌟"},
  {name:"Título Maestro",type:"title",price:12000,rarity:"LEGENDARIO",icon:"👑"},
  {name:"Avatar Astronauta",type:"avatar",price:4500,rarity:"ÉPICO",icon:"🧑‍🚀"},
  {name:"Efecto Rayo",type:"effect",price:1800,rarity:"RARO",icon:"⚡"},
  {name:"Insignia Historia",type:"badge",price:1200,rarity:"RARO",icon:"🏛️"},
  {name:"Insignia Matemáticas",type:"badge",price:1200,rarity:"RARO",icon:"➗"},
  {name:"Marco Diamante",type:"frame",price:5000,rarity:"LEGENDARIO",icon:"💎"},
  {name:"Fondo Océano",type:"background",price:3500,rarity:"ÉPICO",icon:"🌊"},
  {name:"Fondo Bosque",type:"background",price:3000,rarity:"RARO",icon:"🌲"},
  {name:"Título Genio",type:"title",price:15000,rarity:"LEGENDARIO",icon:"🧠"},
  {name:"Título Explorador",type:"title",price:5000,rarity:"ÉPICO",icon:"🗺️"},
  {name:"Avatar Científico",type:"avatar",price:5000,rarity:"ÉPICO",icon:"👨‍🔬"},
  {name:"Efecto Aurora",type:"effect",price:2200,rarity:"ÉPICO",icon:"🌈"},
  {name:"Insignia Deportes",type:"badge",price:1200,rarity:"RARO",icon:"🏅"},
  {name:"Insignia Geografía",type:"badge",price:1200,rarity:"RARO",icon:"🌍"},
  {name:"Marco Galaxia",type:"frame",price:3500,rarity:"ÉPICO",icon:"🌌"},
  {name:"Efecto Cometa",type:"effect",price:2000,rarity:"ÉPICO",icon:"☄️"}
];

const DAILY_MISSIONS = [
  ["d1","Explorador diario","Responde 5 preguntas correctamente.","correct",5,100,150,"📚"],
  ["d2","Mente activa","Responde 10 preguntas correctamente.","correct",10,200,300,"🧠"],
  ["d3","Gran conocedor","Responde 20 preguntas correctamente.","correct",20,350,500,"🏆"],
  ["d4","Racha inicial","Alcanza una racha de 3.","bestStreak",3,120,100,"🔥"],
  ["d5","Racha de acero","Alcanza una racha de 5.","bestStreak",5,200,200,"⚔️"],
  ["d6","Racha legendaria","Alcanza una racha de 10.","bestStreak",10,400,300,"👑"],
  ["d7","Viajero","Acumula 3 categorías correctas.","categories",3,150,250,"🌎"],
  ["d8","Polímata","Acumula 6 categorías correctas.","categories",6,250,400,"📖"],
  ["d9","Todólogo","Acumula 9 categorías correctas.","categories",9,400,600,"🌐"],
  ["d10","Cazador de EXP","Gana 250 EXP.","xpEarned",250,300,100,"⭐"],
  ["d11","Gran salto","Gana 500 EXP.","xpEarned",500,500,200,"🚀"],
  ["d12","Coleccionista","Consigue 100 monedas.","coinsEarned",100,150,100,"🪙"],
  ["d13","Fortuna","Consigue 250 monedas.","coinsEarned",250,250,250,"💰"],
  ["d14","Constancia","Responde 15 preguntas.","answered",15,250,150,"⏱️"],
  ["d15","Maestría diaria","Responde 25 preguntas.","answered",25,450,400,"🎯"]
];
const WEEKLY_MISSIONS = [
  ["w1","Semana de conocimiento","Responde 30 preguntas correctamente.","correct",30,500,500,"📚"],
  ["w2","Maratón","Responde 60 preguntas correctamente.","correct",60,900,900,"🏃"],
  ["w3","Racha semanal","Alcanza una racha de 10.","bestStreak",10,700,500,"🔥"],
  ["w4","Racha maestra","Alcanza una racha de 20.","bestStreak",20,1500,1000,"👑"],
  ["w5","Mundo entero","Responde correctamente en 5 categorías.","categories",5,600,700,"🌎"],
  ["w6","Enciclopedia","Responde correctamente en 9 categorías.","categories",9,1200,1200,"🌐"],
  ["w7","EXP semanal","Gana 1000 EXP.","xpEarned",1000,1000,500,"⭐"],
  ["w8","EXP gigante","Gana 2000 EXP.","xpEarned",2000,1800,1000,"🚀"],
  ["w9","Bolsa de monedas","Consigue 500 monedas.","coinsEarned",500,700,500,"🪙"],
  ["w10","Fortuna semanal","Consigue 1000 monedas.","coinsEarned",1000,1200,1000,"💰"],
  ["w11","Persistente","Responde 75 preguntas.","answered",75,1000,700,"⏱️"],
  ["w12","Incansable","Responde 120 preguntas.","answered",120,1800,1200,"⚡"],
  ["w13","Precisión","Consigue 50 respuestas correctas.","correct",50,1000,900,"🎯"],
  ["w14","Gran mente","Consigue 100 respuestas correctas.","correct",100,2000,1500,"🧠"],
  ["w15","Campeón semanal","Gana 3000 EXP.","xpEarned",3000,2500,1500,"🏆"]
];

const AUDIO = window.KNOW_WORLD_AUDIO || {};
const ASSET_OVERRIDES = window.KNOW_WORLD_SHOP_ASSETS || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let state = loadState();
let questions=[];
let sessionDeck=[];
let sessionCategory="";
let sessionActive=false;
let timer=null;
let timeLeft=12;
let answeredCurrent=false;
let audioCtx=null;

function freshState(){return {...DEFAULT_STATE,equippedItems:{...DEFAULT_STATE.equippedItems},purchased:[],daily:null,weekly:null,seasonEndsAt:Date.now()+7*24*60*60*1000};}
function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem("knowWorldState"));
    if(!saved || saved.stateVersion!==STATE_VERSION){const f=freshState();localStorage.setItem("knowWorldState",JSON.stringify(f));return f;}
    return {...freshState(),...saved,equippedItems:{...DEFAULT_STATE.equippedItems,...(saved.equippedItems||{})},purchased:Array.isArray(saved.purchased)?saved.purchased:[]};
  }catch{ return freshState(); }
}
function save(){state.stateVersion=STATE_VERSION;localStorage.setItem("knowWorldState",JSON.stringify(state));}
function fmt(n){return Number(n||0).toLocaleString("en-US");}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function escapeAttr(s){return escapeHtml(s);}
function toast(msg){const t=$("#toast");if(!t)return;t.textContent=msg;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2200);}

function dayKey(){return new Date().toISOString().slice(0,10);}
function weekKey(){const d=new Date(); const date=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())); const day=date.getUTCDay()||7; date.setUTCDate(date.getUTCDate()+4-day); const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1)); const week=Math.ceil((((date-yearStart)/86400000)+1)/7); return `${date.getUTCFullYear()}-W${String(week).padStart(2,"0")}`;}
function makeMissionState(list,key){return {key,progress:{},claimed:{}};}
function ensureMissions(){
  const dk=dayKey(), wk=weekKey();
  if(!state.daily || state.daily.key!==dk) state.daily=makeMissionState(DAILY_MISSIONS,dk);
  if(!state.weekly || state.weekly.key!==wk) state.weekly=makeMissionState(WEEKLY_MISSIONS,wk);
  save();
}
function ensureXpLifeDaily(){
  const now=Date.now();
  if(!state.xpLifePurchaseWindowStart || now-state.xpLifePurchaseWindowStart>=XP_LIFE_WINDOW){state.xpLifePurchaseCount=0;state.xpLifePurchaseWindowStart=now;save();}
}
function xpLifeCost(){ensureXpLifeDaily();return 100+state.xpLifePurchaseCount*100;}
function recoverLives(){
  if(state.lives>=MAX_LIVES){state.lastLifeRecovery=Date.now();return false;}
  const elapsed=Date.now()-state.lastLifeRecovery; const gained=Math.floor(elapsed/LIFE_INTERVAL);
  if(gained<=0)return false;
  state.lives=Math.min(MAX_LIVES,state.lives+gained);
  state.lastLifeRecovery += gained*LIFE_INTERVAL;
  if(state.lives>=MAX_LIVES)state.lastLifeRecovery=Date.now();
  save();return true;
}
function recoveryText(){
  if(state.lives>=MAX_LIVES)return "Vidas completas";
  const rem=Math.max(0,LIFE_INTERVAL-(Date.now()-state.lastLifeRecovery));
  return `+1 vida en ${String(Math.floor(rem/60000)).padStart(2,"0")}:${String(Math.floor((rem%60000)/1000)).padStart(2,"0")}`;
}
function ranking(){
  const all=[...RANKING_BASE.filter(p=>p.name!==state.name),{name:state.name||"TÚ",xp:state.xp,isUser:true}].sort((a,b)=>b.xp-a.xp||a.name.localeCompare(b.name));
  return {all,pos:all.findIndex(p=>p.isUser)+1};
}
function levelForXp(xp){return Math.max(1,Math.floor(xp/500)+1);}
function unlockedTitles(){return TITLES.filter(t=>state.xp>=t.min||state.purchased.includes("Título "+t.name));}
function nextTitle(xp){return TITLES.find(t=>t.min>xp)||null;}
function itemByName(name){
  const base=SHOP.find(x=>x.name===name);
  if(!base)return null;
  return {...base,...(ASSET_OVERRIDES[name]||{})};
}
function itemType(name){return itemByName(name)?.type || (name.startsWith("Título ")?"title":"item");}

function sync(){
  ensureMissions();ensureXpLifeDaily();recoverLives();
  const r=ranking(), lvl=levelForXp(state.xp), title=state.equippedTitle||"Sin título";
  const set=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
  set("#topName",state.name||"TU NOMBRE");set("#topTitle",title);set("#topLevel",`Nivel ${lvl}`);
  set("#xp",fmt(state.xp));set("#coins",fmt(state.coins));set("#lives",`${state.lives}/5`);set("#rank",`#${r.pos}`);
  set("#streak",`x${state.streak}`);set("#homeBestStreak",`Mejor racha: ${fmt(state.bestStreak)}`);set("#quickLives",`${state.lives}/5`);set("#quickStreak",`x${state.streak}`);set("#quickRank",`#${r.pos}`);set("#quizStreak",`x${state.streak}`);
  set("#lifeRecoverText",recoveryText());set("#homeLifeRecovery",recoveryText());set("#quizLifeRecovery",recoveryText());set("#profileRecovery",recoveryText());
  set("#homeXpLifeCost",fmt(xpLifeCost()));set("#quizXpLifeCost",fmt(xpLifeCost()));set("#xpLifeCost",fmt(xpLifeCost()));set("#shopCoins",fmt(state.coins));
  $("#homeLifeBuy")?.classList.toggle("hidden",state.lives>0);
  set("#homeTitle",title.toUpperCase());set("#profileName",state.name||"SIN NOMBRE");set("#profileTitle",title);set("#profileLevel",`Nivel ${lvl}`);set("#profileXp",fmt(state.xp));set("#profileHistoricalXp",fmt(state.xp));set("#profileCoins",fmt(state.coins));set("#profileRank",`#${r.pos}`);set("#bestStreak",fmt(state.bestStreak));set("#correctAnswers",fmt(state.correctAnswers));set("#answeredTotal",fmt(state.answeredTotal));set("#profileLives",`${state.lives}/5`);
  set("#profileRankTitle",title.toUpperCase());set("#profileNextTitle",nextTitle(state.xp)?.name||"LEYENDA MÁXIMA");set("#profileTitleXp",nextTitle(state.xp)?`${fmt(state.xp)} / ${fmt(nextTitle(state.xp).min)} EXP`:`${fmt(state.xp)} EXP`);
  const nt=nextTitle(state.xp), prev=TITLES.filter(t=>t.min<=state.xp).slice(-1)[0], pct=nt?Math.min(100,Math.max(0,((state.xp-(prev?.min||0))/(nt.min-(prev?.min||0)))*100)):100;
  ["#titleProgress","#profileTitleProgress"].forEach(id=>{if($(id))$(id).style.width=pct+"%"});
  set("#titleXp",nt?`${fmt(state.xp)} / ${fmt(nt.min)} EXP`:`${fmt(state.xp)} EXP`);
  set("#missionDate",new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"2-digit",year:"numeric"}));
  set("#rewardText",`⭐ ${fmt(state.xp%1000)} / 1,000 EXP`);if($("#rewardProgress"))$("#rewardProgress").style.width=(state.xp%1000)/10+"%";
  renderRanking(r.all);renderOwned();updateShopButtons();updateTitleSelect();applyEquippedItems();renderMissions();
  set("#soundBtn",state.sound?"🔊":"🔇");
  const remain=Math.max(0,state.seasonEndsAt-Date.now()), d=Math.floor(remain/86400000), h=Math.floor(remain%86400000/3600000), m=Math.floor(remain%3600000/60000), s=Math.floor(remain%60000/1000);set("#seasonCountdown",`Termina en: ${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`);
}

function renderRanking(all){const box=$("#rankingRows");if(!box)return;const up=all.findIndex(p=>p.isUser),start=Math.max(0,up-3),rows=all.slice(start,start+9);box.innerHTML=rows.map((p,i)=>{const pos=start+i+1;return `<div class="rank-row ${p.isUser?'me':''}"><b>${pos<=3?["🥇","🥈","🥉"][pos-1]:pos}</b><span>${escapeHtml(p.name)}${p.isUser?' — TÚ':''}</span><strong>${fmt(p.xp)} EXP ${pos<=3?'🏆':''}</strong></div>`}).join("");}

function renderOwned(){
  const box=$("#ownedItems"),count=$("#collectionCount");if(!box)return;
  if(count)count.textContent=`${state.purchased.length} / ${SHOP.length}`;
  if(!state.purchased.length){box.innerHTML="<span class='empty-owned'>Todavía no has comprado artículos.</span>";return;}
  box.innerHTML=state.purchased.map(name=>{const item=itemByName(name);const type=item?.type;const active=type==="title"?state.equippedTitle===name.replace(/^Título /,""):state.equippedItems[type]===name;return `<div class="owned-item-row"><span class="owned-item">${item?.icon||'🎁'} ${escapeHtml(name)}</span><div class="owned-actions"><button class="use-item ${active?'active':''}" data-use-item="${escapeAttr(name)}">${active?'✓ USANDO':'USAR'}</button>${active?`<button class="remove-item" data-remove-item="${escapeAttr(name)}">QUITAR</button>`:''}</div></div>`}).join("");
  $$('[data-use-item]').forEach(b=>b.onclick=()=>equipItem(b.dataset.useItem));$$('[data-remove-item]').forEach(b=>b.onclick=()=>unequipItem(b.dataset.removeItem));
}
function equipItem(name){const item=itemByName(name);if(!item||!state.purchased.includes(name))return;if(item.type==="title")state.equippedTitle=name.replace(/^Título /,"");else state.equippedItems[item.type]=name;save();sync();playSound("equip");toast(`✓ ${name} equipado. ¡Ahora puedes verlo en el juego!`);}
function unequipItem(name){const item=itemByName(name);if(!item)return;if(item.type==="title")state.equippedTitle="";else state.equippedItems[item.type]="";save();sync();toast(`✓ ${name} retirado.`);}
function applyEquippedItems(){
  const root=document.body;
  root.dataset.frame=state.equippedItems.frame||"";
  root.dataset.background=state.equippedItems.background||"";
  root.dataset.effect=state.equippedItems.effect||"";
  root.dataset.badge=state.equippedItems.badge||"";

  const avatarMap={"Avatar Guerrero":"🧙","Avatar Astronauta":"🧑‍🚀","Avatar Científico":"👨‍🔬"};
  const avatarItem=itemByName(state.equippedItems.avatar);
  const av=avatarMap[state.equippedItems.avatar]||((state.name||"A").charAt(0).toUpperCase());
  $$('.avatar').forEach(a=>{
    a.textContent=av;
    a.style.backgroundImage='';
    a.querySelectorAll('.custom-avatar-img,.custom-frame-img,.custom-badge-img,.custom-effect-img').forEach(x=>x.remove());
    if(avatarItem?.image){
      a.textContent='';
      a.style.backgroundImage=`url("${avatarItem.image}")`;
      a.style.backgroundSize='cover';
      a.style.backgroundPosition='center';
    }
    const frame=itemByName(state.equippedItems.frame);
    if(frame?.image){const img=document.createElement('img');img.className='custom-frame-img';img.src=frame.image;img.alt='';a.appendChild(img);}
    const badge=itemByName(state.equippedItems.badge);
    if(badge?.image){const img=document.createElement('img');img.className='custom-badge-img';img.src=badge.image;img.alt='';a.appendChild(img);}
  });
  const bg=itemByName(state.equippedItems.background);
  if(bg?.image){root.style.backgroundImage=`linear-gradient(rgba(2,8,23,.25),rgba(2,8,23,.35)),url("${bg.image}")`;root.style.backgroundSize='cover';root.style.backgroundAttachment='fixed';}
  else {root.style.backgroundImage='';root.style.backgroundSize='';root.style.backgroundAttachment='';}
  const effect=itemByName(state.equippedItems.effect);
  root.style.setProperty('--custom-effect-image', effect?.image ? `url("${effect.image}")` : 'none');
  root.classList.toggle('has-custom-effect',!!effect?.image);
  if($('#topAvatar'))$('#topAvatar').setAttribute('title',state.equippedItems.avatar||'Avatar predeterminado');
}
function updateAvatars(){applyEquippedItems();}
function updateShopButtons(){
  $$('[data-buy]').forEach(btn=>{const owned=state.purchased.includes(btn.dataset.name);btn.disabled=owned;btn.classList.toggle('owned',owned);btn.textContent=owned?'✓ ADQUIRIDO':'COMPRAR';});
}
function updateTitleSelect(){
  const select=$("#titleSelect");if(!select)return;const av=unlockedTitles();select.innerHTML='<option value="">Sin título</option>'+av.map(t=>`<option value="${escapeAttr(t.name)}">${escapeHtml(t.name)}${state.purchased.includes('Título '+t.name)?' · TIENDA':''}</option>`).join('');select.value=state.equippedTitle||"";$("#previewName").textContent=state.name||"TU NOMBRE";$("#previewTitle").textContent=state.equippedTitle||"Sin título";
}

function missionProgress(type){
  if(type==="correct")return state.dailyStats.correct||0;
  if(type==="bestStreak")return state.dailyStats.bestStreak||0;
  if(type==="categories")return (state.dailyStats.categories||[]).length;
  if(type==="xpEarned")return state.dailyStats.xpEarned||0;
  if(type==="coinsEarned")return state.dailyStats.coinsEarned||0;
  if(type==="answered")return state.dailyStats.answered||0;
  return 0;
}
function initStatsIfNeeded(){
  if(!state.dailyStats||state.dailyStats.key!==dayKey())state.dailyStats={key:dayKey(),correct:0,answered:0,bestStreak:0,categories:[],xpEarned:0,coinsEarned:0};
  if(!state.weeklyStats||state.weeklyStats.key!==weekKey())state.weeklyStats={key:weekKey(),correct:0,answered:0,bestStreak:0,categories:[],xpEarned:0,coinsEarned:0};
}
function updateStats(correct,q,xpGain,coinGain){
  initStatsIfNeeded();for(const s of [state.dailyStats,state.weeklyStats]){s.answered++;if(correct){s.correct++;s.categories=[...new Set([...s.categories,q.category])];s.bestStreak=Math.max(s.bestStreak,state.streak);}s.xpEarned+=xpGain;s.coinsEarned+=coinGain;}
}
function renderMissions(){
  initStatsIfNeeded();
  const render=(list,containerId,scope)=>{const box=$(containerId);if(!box)return;box.innerHTML=list.map(m=>{const [id,title,desc,type,target,xp,coins,icon]=m;const stats=scope==='daily'?state.dailyStats:state.weeklyStats;const p=stats[type]==null?(type==='categories'?stats.categories.length:0):(type==='categories'?stats.categories.length:stats[type]);const done=p>=target, claimed=scope==='daily'?state.daily.claimed[id]:state.weekly.claimed[id];return `<article class="mission-large panel ${claimed?'claimed':''}"><div>${icon}</div><div><h2>${title}</h2><p>${desc}</p><div class="progress"><i style="width:${Math.min(100,p/target*100)}%"></i></div><span>${fmt(Math.min(p,target))} / ${fmt(target)}</span></div><strong>${xp?`+${fmt(xp)} EXP`:''}${coins?`<br>🪙 ${fmt(coins)}`:''}</strong><button class="claim-btn ${claimed?'done':''}" data-claim="${scope}:${id}" ${!done||claimed?'disabled':''}>${claimed?'✓ RECLAMADA':done?'RECLAMAR':'EN PROGRESO'}</button></article>`}).join('');
  };
  render(DAILY_MISSIONS,'#dailyMissionsPanel','daily');render(WEEKLY_MISSIONS,'#weeklyMissionsPanel','weekly');
  $$('[data-claim]').forEach(b=>b.onclick=()=>{const [scope,id]=b.dataset.claim.split(':');claimMission(scope,id);});
  const dDone=DAILY_MISSIONS.filter(m=>state.daily.claimed[m[0]]).length,wDone=WEEKLY_MISSIONS.filter(m=>state.weekly.claimed[m[0]]).length;$("#dailyMissionSummary")?.replaceChildren(document.createTextNode(`${dDone}/15 reclamadas`));$("#weeklyMissionSummary")?.replaceChildren(document.createTextNode(`${wDone}/15 reclamadas`));
}
function claimMission(scope,id){const list=scope==='daily'?DAILY_MISSIONS:WEEKLY_MISSIONS, ms=list.find(m=>m[0]===id), holder=scope==='daily'?state.daily:state.weekly, stats=scope==='daily'?state.dailyStats:state.weeklyStats;if(!ms||holder.claimed[id])return;const [,, ,type,target,xp,coins]=ms;const p=type==='categories'?stats.categories.length:stats[type]||0;if(p<target)return;holder.claimed[id]=true;state.xp+=xp;state.coins+=coins;save();sync();playSound('reward');toast(`🎉 ${ms[1]} completada · +${fmt(xp)} EXP · +${fmt(coins)} monedas`);}

async function loadQuestions(){
  // questions-data.js es la fuente inmediata; el JSON queda como archivo editable.
  if(Array.isArray(window.QUESTION_BANK) && window.QUESTION_BANK.length){questions=window.QUESTION_BANK;return;}
  try{
    const r=await fetch('questions.json',{cache:'force-cache'});
    if(!r.ok)throw new Error('No se pudo cargar questions.json');
    const data=await r.json();
    if(!Array.isArray(data)||!data.length)throw new Error('Banco vacío');
    questions=data;
  }catch(err){
    console.error('Banco de preguntas:',err);
    questions=[];
  }
}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function startQuizSession(category){
  if(!category || !CATEGORIES.includes(category)){openCategoryModal();return;}
  sessionCategory=category;
  const pool=questions.filter(q=>q.category===category);
  if(!pool.length){sessionDeck=[];sessionActive=false;showNoQuestions(category);return;}
  sessionDeck=shuffle(pool);
  if(state.lastQuestionId&&sessionDeck.length>1&&sessionDeck[0].id===state.lastQuestionId)[sessionDeck[0],sessionDeck[1]]=[sessionDeck[1],sessionDeck[0]];
  sessionActive=true;loadQuestion();
}
function startUniversalSession(){
  sessionCategory='UNIVERSAL';
  const pool=[...questions];
  if(!pool.length){sessionDeck=[];sessionActive=false;showNoQuestions('Desafío Universal');return;}
  sessionDeck=shuffle(pool);
  if(state.lastQuestionId&&sessionDeck.length>1&&sessionDeck[0].id===state.lastQuestionId)[sessionDeck[0],sessionDeck[1]]=[sessionDeck[1],sessionDeck[0]];
  sessionActive=true;loadQuestion();
}
function loadQuestion(){
  clearInterval(timer);answeredCurrent=false;
  recoverLives();sync();
  if(state.lives<=0){showNoLives();return;}
  if(!sessionDeck.length){sessionActive=false;showNoQuestions(sessionCategory);return;}
  const q=sessionDeck.shift();state.lastQuestionId=q.id;state.questionIndex++;save();
  $("#noLivesQuiz")?.classList.add('hidden');$("#feedback")?.classList.add('hidden');$("#nextBtn")?.classList.add('hidden');$("#options").innerHTML='';$("#questionCategory").textContent=q.category.toUpperCase();$("#questionText").textContent=q.question;
  q.options.forEach((opt,i)=>{const b=document.createElement('button');b.className='option';b.dataset.index=i;b.innerHTML=`<span class="letter">${String.fromCharCode(65+i)}</span>${escapeHtml(opt)}`;b.onclick=()=>answer(i,b,q,false);$("#options").appendChild(b);});
  timeLeft=12;$("#timer").textContent=timeLeft;timer=setInterval(()=>{timeLeft--;$("#timer").textContent=timeLeft;if(timeLeft<=0){clearInterval(timer);if(!answeredCurrent)answer(-1,null,q,true);}},1000);
}
function showNoQuestions(category){clearInterval(timer);$('#options').innerHTML='';$('#questionCategory').textContent='SIN PREGUNTAS';$('#questionText').textContent=`No hay preguntas disponibles en ${category}.`;$('#feedback').className='feedback hidden';$('#nextBtn').classList.add('hidden');$('#noLivesQuiz').classList.add('hidden');$('#timer').textContent='--';}
function showNoLives(){clearInterval(timer);$("#options").innerHTML='';$("#questionText").textContent='No puedes continuar sin vidas';$("#questionCategory").textContent='VIDAS AGOTADAS';$("#feedback").className='feedback hidden';$("#nextBtn").classList.add('hidden');$("#noLivesQuiz").classList.remove('hidden');$("#timer").textContent='--';}
function answer(index,button,q,timeout){
  if(answeredCurrent||state.lives<=0)return;answeredCurrent=true;clearInterval(timer);$$('.option').forEach(b=>b.disabled=true);const correct=index===q.answer;$(`.option[data-index="${q.answer}"]`)?.classList.add('correct');if(!correct)button?.classList.add('wrong');
  let xpGain=0,coinGain=0;
  if(correct){xpGain=50;coinGain=10;state.xp+=xpGain;state.coins+=coinGain;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);state.correctAnswers++;playSound('correct');$("#feedback").className='feedback ok';$("#feedback").innerHTML=`✓ ¡CORRECTO! +50 EXP　🪙 +10　🔥 Racha x${state.streak}<br><small>${escapeHtml(q.explanation)}</small>`;toast(`+50 EXP · Racha x${state.streak}`);}
  else{state.streak=0;state.lives=Math.max(0,state.lives-1);state.answeredTotal++;if(state.lives===4)state.lastLifeRecovery=Date.now();playSound('wrong');$("#feedback").className='feedback no';$("#feedback").innerHTML=`✕ ${timeout?'¡Se acabó el tiempo!':'Respuesta incorrecta'} · ❤️ -1 vida<br><small>${escapeHtml(q.explanation)}</small>`;if(state.lives===0)toast('❤️ Te quedaste sin vidas. No habrá más preguntas hasta recuperar o comprar una.');}
  if(correct)state.answeredTotal++;updateStats(correct,q,xpGain,coinGain);save();sync();
  if(state.lives>0)$("#nextBtn").classList.remove('hidden');else showNoLives();
}

function buyLifeWithCoins(){if(state.lives>=5)return toast('Ya tienes 5 vidas.');if(state.coins<500)return toast('Necesitas 500 monedas.');state.coins-=500;state.lives++;if(state.lives>=5)state.lastLifeRecovery=Date.now();save();sync();playSound('coin');if(!$("#quizView").classList.contains('hidden'))loadQuestion();toast('❤️ Vida comprada por 500 monedas.');}
function buyLifeWithXp(){if(state.lives>=5)return toast('Ya tienes 5 vidas.');const cost=xpLifeCost();if(state.xp<cost)return toast(`Necesitas ${fmt(cost)} EXP.`);state.xp-=cost;state.lives++;state.xpLifePurchaseCount++;if(state.lives>=5)state.lastLifeRecovery=Date.now();save();sync();if(!$("#quizView").classList.contains('hidden'))loadQuestion();toast(`❤️ Vida comprada por ${fmt(cost)} EXP. Precio se reinicia a 100 cada 24 h.`);}

function go(view){if(view!=='quiz'){clearInterval(timer);timer=null;sessionActive=false;answeredCurrent=true;}$$('.view').forEach(v=>v.classList.add('hidden'));$("#"+view+"View")?.classList.remove('hidden');$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));if(view==='quiz' && !sessionActive){startUniversalSession();}sync();}
function openCategoryModal(){$("#categoryModal")?.classList.remove('hidden');}
function closeCategoryModal(){$("#categoryModal")?.classList.add('hidden');}

const audioPlayers={};
function playAudioUrl(kind){
  const url=AUDIO[kind];
  if(!url)return false;
  try{const a=audioPlayers[kind]||(audioPlayers[kind]=new Audio());a.src=url;a.currentTime=0;a.volume=Number(AUDIO.volume||0.55);a.play().catch(()=>{});return true;}catch{return false;}
}
let musicStarted=false;
function startBackgroundMusic(){
  if(musicStarted||!state.sound||!AUDIO.music)return;
  try{const a=audioPlayers.music||(audioPlayers.music=new Audio(AUDIO.music));a.loop=true;a.volume=Number(AUDIO.musicVolume||0.18);a.play().then(()=>{musicStarted=true}).catch(()=>{});}catch{}
}
function playSound(kind){
  if(!state.sound)return;
  startBackgroundMusic();
  if(playAudioUrl(kind))return;
  try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();const now=audioCtx.currentTime;const map={click:[520,.06],correct:[760,.16],wrong:[180,.18],coin:[900,.09],reward:[1100,.2],equip:[620,.12]};const [freq,dur]=map[kind]||map.click;osc.frequency.value=freq;osc.type=kind==='wrong'?'sawtooth':'sine';gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.07,now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+dur);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+dur+.02);}catch{}
}

// Buttons / events
$("#nextBtn").onclick=()=>{if(state.lives>0)loadQuestion();};
["#buyLifeCoins","#homeBuyLifeCoins","#quizBuyLifeCoins"].forEach(id=>$(id)?.addEventListener('click',buyLifeWithCoins));
["#buyLifeXp","#homeBuyLifeXp","#quizBuyLifeXp"].forEach(id=>$(id)?.addEventListener('click',buyLifeWithXp));
$("#quizBackHome")?.addEventListener('click',()=>go('home'));
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{startBackgroundMusic();go(b.dataset.view)}));
$$('[data-action="universal"]').forEach(b=>b.addEventListener('click',()=>{startUniversalSession();go('quiz');playSound('click');}));
$$('[data-action="choose-category"]').forEach(b=>b.addEventListener('click',()=>{openCategoryModal();playSound('click');}));
$("#soundBtn")?.addEventListener('click',()=>{state.sound=!state.sound;save();sync();if(state.sound)playSound('click');});
$("#timeHelp")?.addEventListener('click',()=>{if(state.coins<100)return toast('No tienes suficientes monedas.');if(answeredCurrent)return toast('La pregunta ya terminó.');state.coins-=100;timeLeft+=5;$("#timer").textContent=timeLeft;save();sync();playSound('click');toast('⏱ +5 segundos');});
$("#removeHelp")?.addEventListener('click',()=>{if(state.coins<150)return toast('No tienes suficientes monedas.');if(answeredCurrent)return toast('La pregunta ya terminó.');const q=JSON.parse(JSON.stringify(state.lastQuestionId?questions.find(x=>x.id===state.lastQuestionId):null));if(!q)return;state.coins-=150;$$('.option').filter(b=>Number(b.dataset.index)!==q.answer).slice(0,2).forEach(b=>{b.style.opacity='.2';b.disabled=true;});save();sync();playSound('click');toast('🎯 Se eliminaron 2 opciones.');});

$$('[data-buy]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.name,price=Number(btn.dataset.price);if(state.purchased.includes(name))return toast('Ya tienes este artículo.');if(state.coins<price)return toast(`Necesitas ${fmt(price)} monedas.`);state.coins-=price;state.purchased.push(name);save();sync();playSound('coin');toast(`🎁 ${name} adquirido. Ve a Perfil para USARLO.`);}));

$("#editProfileBtn")?.addEventListener('click',()=>{$("#editName").value=state.name||'';updateTitleSelect();$("#profileModal").classList.remove('hidden');});
$$('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>b.closest('.modal-overlay')?.classList.add('hidden')));
$("#saveProfile")?.addEventListener('click',()=>{const name=$("#editName").value.trim().replace(/\s+/g,' ');if(name.length<2)return toast('El nombre debe tener al menos 2 caracteres.');state.name=name;state.equippedTitle=$("#titleSelect").value||'';save();sync();$("#profileModal").classList.add('hidden');toast('✓ Perfil actualizado.');});
$("#titleSelect")?.addEventListener('change',()=>$("#previewTitle").textContent=$("#titleSelect").value||'Sin título');
$("#editName")?.addEventListener('input',()=>$("#previewName").textContent=$("#editName").value||'TU NOMBRE');

function startGameWithName(){const input=$("#firstName");if(!input)return;const name=input.value.trim().replace(/\s+/g,' ');if(name.length<2){toast('Escribe un nombre válido.');input.focus();return;}state.name=name;save();$("#nameModal")?.classList.add('hidden');sync();toast(`¡Bienvenido, ${name}!`);playSound('reward');}
$("#saveFirstName")?.addEventListener('click',startGameWithName);$("#firstName")?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();startGameWithName();}});

// Category selector
$("#categoryOpen")?.addEventListener('click',()=>{$("#categoryModal")?.classList.remove('hidden');});
$("#categoryClose")?.addEventListener('click',closeCategoryModal);
$("#categoryChoices")?.addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;sessionCategory=b.dataset.category;closeCategoryModal();startQuizSession(sessionCategory);go('quiz');playSound('click');});

// Shop filters
const typeByTab={"DESTACADOS":"all","AVATARES":"avatar","MARCOS":"frame","FONDOS":"background","EFECTOS":"effect","TÍTULOS":"title","INSIGNIAS":"badge"};
$$('.shop-tabs button').forEach(b=>b.addEventListener('click',()=>{const type=typeByTab[b.textContent.trim()]||'all';$$('.shop-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.item').forEach(card=>card.style.display=type==='all'||itemByName(card.dataset.item)?.type===type?'':'none');}));

// Collection shortcut cards
$$('.collection-grid button').forEach(b=>b.addEventListener('click',()=>{const label=b.querySelector('small')?.textContent.trim();go('shop');const target=label==='AVATARES'?'AVATARES':label==='MARCOS'?'MARCOS':label==='FONDOS'?'FONDOS':label==='EFECTOS'?'EFECTOS':label==='TÍTULOS'?'TÍTULOS':label==='INSIGNIAS'?'INSIGNIAS':'DESTACADOS';setTimeout(()=>$$('.shop-tabs button').find(x=>x.textContent.trim()===target)?.click(),0);}));

// Populate category selector with all available themes.
function renderCategoryChoices(){
  const box=$("#categoryChoices"); if(!box)return;
  box.innerHTML=CATEGORIES.map(c=>`<button class="category-choice" data-category="${escapeAttr(c)}"><span>${({Ciencia:'🔬',Historia:'🏛️','Geografía':'🌎','Matemáticas':'➗',Artistas:'🎨',Deportes:'⚽',Literatura:'📚',Tecnología:'💻',Cultura:'🎭'})[c]||'⭐'}</span><b>${escapeHtml(c)}</b></button>`).join('');
}
renderCategoryChoices();

$$('[data-mission-tab]').forEach(b=>b.addEventListener('click',()=>{
  $$('[data-mission-tab]').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  const daily=b.dataset.missionTab==='daily';
  $("#dailyMissionsPanel")?.classList.toggle('hidden',!daily);
  $("#weeklyMissionsPanel")?.classList.toggle('hidden',daily);
}));

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCategoryModal();$("#profileModal")?.classList.add('hidden');}if(['1','2','3','4'].includes(e.key)&&!$("#quizView").classList.contains('hidden'))$('.option[data-index="'+(Number(e.key)-1)+'"]')?.click();});

setInterval(()=>{const before=state.lives;ensureMissions();ensureXpLifeDaily();const recovered=recoverLives();sync();if(recovered&&before===0&&!$("#quizView").classList.contains('hidden'))loadQuestion();},1000);

(async function init(){initStatsIfNeeded();ensureMissions();await loadQuestions();renderCategoryChoices();sync();if(!state.name){$("#nameModal")?.classList.remove('hidden');setTimeout(()=>$("#firstName")?.focus(),120);}else $("#nameModal")?.classList.add('hidden');})();
