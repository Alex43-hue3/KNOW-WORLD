const DEFAULT_STATE = {
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
  equippedItems: {},
  xpLifePurchaseCount: 0,
  xpLifePurchaseWindowStart: 0,
  lastLifeRecovery: Date.now(),
  lastDailyDate: "",
  missions: {correct:0, maxStreak:0, categories:[], claimed:{m1:false,m2:false,m3:false}},
  seasonEndsAt: Date.now() + 1000*60*60*24*7
};

const RANKING_BASE = [
  {name:"PlayerOne",xp:125230},
  {name:"Sofia",xp:114980},
  {name:"Brainiac",xp:104450},
  {name:"KnowledgePro",xp:90300},
  {name:"MasterMind",xp:80200},
  {name:"Cerebro",xp:70400},
  {name:"Nova",xp:65000},
  {name:"Genio",xp:59000},
  {name:"Sabio",xp:54000},
  {name:"Explorer",xp:50000},
  {name:"QuizMaster",xp:46000},
  {name:"Thinker",xp:42000},
  {name:"Einstein",xp:39000},
  {name:"Curioso",xp:36000},
  {name:"Mentor",xp:33000},
  {name:"Titan",xp:30000},
  {name:"Omega",xp:27000},
  {name:"Orion",xp:24000},
  {name:"Atlas",xp:21000},
  {name:"Pixel",xp:19000},
  {name:"BrainStorm",xp:17500},
  {name:"SaberX",xp:16000},
  {name:"Atenea",xp:15000},
  {name:"Cosmos",xp:14000},
  {name:"Vector",xp:13000},
  {name:"Newton",xp:12000},
  {name:"Galileo",xp:11000},
  {name:"Tesla",xp:10000},
  {name:"Curiosity",xp:9000},
  {name:"Quantum",xp:8000},
  {name:"Logic",xp:7000},
  {name:"DataMind",xp:6000},
  {name:"Astro",xp:5000},
  {name:"Cometa",xp:4500},
  {name:"Lumen",xp:4000},
  {name:"Futura",xp:3500},
  {name:"Zen",xp:3000},
  {name:"Nexus",xp:2500},
  {name:"Alpha",xp:2000},
  {name:"Beta",xp:1500},
  {name:"Gamma",xp:1000},
  {name:"Delta",xp:500},
  {name:"Sigma",xp:250},
  {name:"Tau",xp:100},
  {name:"Kappa",xp:50},
  {name:"Lambda",xp:25}
];

const TITLES = [
  {name:"Explorador del Saber", min:0},
  {name:"Conocedor", min:5000},
  {name:"Experto", min:10000},
  {name:"Maestro", min:20000},
  {name:"Sabio", min:35000},
  {name:"Leyenda", min:70000}
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let state = loadState();
let questions = [];
let timer = null;
let timeLeft = 12;
let answeredCurrent = false;
const STATE_VERSION = 4;

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem("knowWorldState"));
    // v3 starts every new game clean. Older demo data is intentionally not carried over.
    if(!saved || saved.stateVersion !== STATE_VERSION){
      const fresh={...DEFAULT_STATE,stateVersion:STATE_VERSION,seasonEndsAt:Date.now()+1000*60*60*24*7};
      localStorage.setItem("knowWorldState",JSON.stringify(fresh));
      return fresh;
    }
    return {...DEFAULT_STATE,...saved,missions:{...DEFAULT_STATE.missions,...(saved?.missions||{}),claimed:{...DEFAULT_STATE.missions.claimed,...(saved?.missions?.claimed||{})}},equippedItems:{...DEFAULT_STATE.equippedItems,...(saved?.equippedItems||{})}};
  }catch{return {...DEFAULT_STATE,stateVersion:STATE_VERSION,missions:{...DEFAULT_STATE.missions,claimed:{...DEFAULT_STATE.missions.claimed}},equippedItems:{}};}
}

function save(){ state.stateVersion=STATE_VERSION; localStorage.setItem("knowWorldState", JSON.stringify(state)); }

function ensureXpLifeDaily(){
  const now=Date.now();
  if(!state.xpLifePurchaseWindowStart || now-state.xpLifePurchaseWindowStart>=24*60*60*1000){
    state.xpLifePurchaseCount=0;
    state.xpLifePurchaseWindowStart=now;
    save();
  }
}

function xpLifeCost(){ ensureXpLifeDaily(); return 100 + state.xpLifePurchaseCount*100; }

function fmt(n){return Number(n).toLocaleString("en-US");}
function titleForXp(xp){
  let result=TITLES[0];
  for(const t of TITLES) if(xp>=t.min) result=t;
  return result;
}
function nextTitle(xp){
  return TITLES.find(t=>t.min>xp) || null;
}
function levelForXp(xp){ return Math.max(1,Math.floor(xp/500)+1); }

function ensureDaily(){
  const today=new Date().toISOString().slice(0,10);
  if(state.lastDailyDate!==today){
    state.lastDailyDate=today;
    state.missions={correct:0,maxStreak:0,categories:[],claimed:{m1:false,m2:false,m3:false}};
    save();
  }
}

function recoverLives(){
  if(state.lives>=5){state.lastLifeRecovery=Date.now();return;}
  const interval=30*60*1000;
  const elapsed=Date.now()-state.lastLifeRecovery;
  const gained=Math.floor(elapsed/interval);
  if(gained>0){
    state.lives=Math.min(5,state.lives+gained);
    state.lastLifeRecovery += gained*interval;
    if(state.lives>=5) state.lastLifeRecovery=Date.now();
    save();
  }
}

function recoveryText(){
  if(state.lives>=5)return "Vidas completas";
  const remaining=Math.max(0,30*60*1000-(Date.now()-state.lastLifeRecovery));
  const mm=Math.floor(remaining/60000).toString().padStart(2,"0");
  const ss=Math.floor((remaining%60000)/1000).toString().padStart(2,"0");
  return `+1 vida en ${mm}:${ss}`;
}

function ranking(){
  const all=[...RANKING_BASE.filter(p=>p.name!==state.name),{name:state.name||"TÚ",xp:state.xp,isUser:true}];
  all.sort((a,b)=>b.xp-a.xp);
  return {all,pos:Math.max(1,all.findIndex(p=>p.isUser)+1)};
}

function sync(){
  ensureDaily();
  ensureXpLifeDaily();
  recoverLives();

  const r=ranking(), title=state.equippedTitle || "Sin título", lvl=levelForXp(state.xp);
  $("#topName").textContent=state.name||"TU NOMBRE";
  $("#topTitle").textContent=title;
  $("#topLevel").textContent=`Nivel ${lvl}`;
  $("#xp").textContent=fmt(state.xp);
  $("#coins").textContent=fmt(state.coins);
  $("#lives").textContent=`${state.lives}/5`;
  $("#rank").textContent=`#${r.pos}`;
  $("#streak").textContent=`x${state.streak}`;
  $("#quickLives").textContent=`${state.lives}/5`;
  $("#quickStreak").textContent=`x${state.streak}`;
  $("#quickRank").textContent=`#${r.pos}`;
  $("#quizStreak").textContent=`x${state.streak}`;
  $("#lifeRecoverText").textContent=recoveryText();
  $("#homeLifeRecovery").textContent=recoveryText();
  $("#homeXpLifeCost").textContent=fmt(xpLifeCost());
  $("#quizLifeRecovery").textContent=recoveryText();
  $("#quizXpLifeCost").textContent=fmt(xpLifeCost());
  $("#homeLifeBuy").classList.toggle("hidden", state.lives > 0);

  $("#homeTitle").textContent=title.toUpperCase();
  $("#titleStatus").textContent=title==="Sin título"?"Aún no tienes un título":(state.purchased.includes("Título "+title)?"Comprado y equipado":"Desbloqueado");
  const nt=nextTitle(state.xp);
  $("#nextTitle").textContent=nt?nt.name:"LEYENDA MÁXIMA";
  const prev=titleForXp(state.xp);
  const pct=nt?Math.min(100,((state.xp-prev.min)/(nt.min-prev.min))*100):100;
  $("#titleProgress").style.width=pct+"%";
  $("#titleXp").textContent=nt?`${fmt(state.xp)} / ${fmt(nt.min)} EXP`:`${fmt(state.xp)} EXP`;

  $("#profileName").textContent=state.name||"SIN NOMBRE";
  $("#profileTitle").textContent=title;
  $("#profileLevel").textContent=`Nivel ${lvl}`;
  $("#profileXp").textContent=fmt(state.xp);
  $("#profileCoins").textContent=fmt(state.coins);
  $("#profileRank").textContent=`#${r.pos}`;
  $("#bestStreak").textContent=state.bestStreak;
  $("#profileHistoricalXp").textContent=fmt(0);
  $("#correctAnswers").textContent=fmt(state.correctAnswers);
  $("#answeredTotal").textContent=fmt(state.answeredTotal);
  $("#profileLives").textContent=`${state.lives}/5`;
  $("#profileRecovery").textContent=recoveryText();
  $("#xpLifeCost").textContent=fmt(xpLifeCost());
  $("#shopCoins").textContent=fmt(state.coins);

  const p2=nextTitle(state.xp);
  $("#profileRankTitle").innerHTML=title==="Sin título"?"SIN TÍTULO":title.replace(" ","<br>");
  $("#profileNextTitle").textContent=p2?p2.name:"LEYENDA MÁXIMA";
  $("#profileTitleProgress").style.width=pct+"%";
  $("#profileTitleXp").textContent=p2?`${fmt(state.xp)} / ${fmt(p2.min)} EXP`:`${fmt(state.xp)} EXP`;

  const missionCount=Math.min(10,state.missions.correct);
  $("#missionText").textContent=`${missionCount} / 10`;
  $("#missionProgress").style.width=(missionCount*10)+"%";
  $("#rewardProgress").style.width=Math.min(100,(state.xp%1000)/10)+"%";
  $("#rewardText").textContent=`⭐ ${state.xp%1000} / 1,000 EXP`;

  $("#m1Text").textContent=`${missionCount} / 10`; $("#m1Bar").style.width=(missionCount*10)+"%";
  const ms=Math.min(10,state.missions.maxStreak);
  $("#m2Text").textContent=`${ms} / 10`; $("#m2Bar").style.width=(ms*10)+"%";
  const cats=Math.min(3,state.missions.categories.length);
  $("#m3Text").textContent=`${cats} / 3`; $("#m3Bar").style.width=(cats/3*100)+"%";
  updateClaimButton("m1",state.missions.correct>=10);
  updateClaimButton("m2",state.missions.maxStreak>=10);
  updateClaimButton("m3",state.missions.categories.length>=3);

  $("#missionDate").textContent=new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"2-digit",year:"numeric"});
  renderRanking(r.all);
  renderOwned();
  updateShopButtons();
  updateTitleSelect();
  updateAvatars();
  applyEquippedItems();
}

function updateClaimButton(id,complete){
  const b=$("#claim"+id.toUpperCase());
  if(!b)return;
  if(state.missions.claimed[id]){b.textContent="✓ RECLAMADA";b.classList.add("done");b.disabled=true}
  else{b.textContent=complete?"RECLAMAR":"EN PROGRESO";b.disabled=!complete;b.classList.toggle("done",false)}
}

function renderRanking(all){
  const box=$("#rankingRows"); if(!box)return;
  const userPos=all.findIndex(p=>p.isUser);
  const start=Math.max(0,userPos-3), end=Math.min(all.length,start+9);
  box.innerHTML=all.slice(start,end).map((p,i)=>{
    const pos=start+i+1;
    return `<div class="rank-row ${p.isUser?"me":""}"><b>${pos<=3?["🥇","🥈","🥉"][pos-1]:pos}</b><span>${escapeHtml(p.name)}${p.isUser?" — TÚ":""}</span><strong>${fmt(p.xp)} EXP ${pos<=3?"🏆":""}</strong></div>`;
  }).join("");
}

function itemType(name){
  if(name.startsWith("Avatar")) return "avatar";
  if(name.startsWith("Marco")) return "frame";
  if(name.startsWith("Fondo")) return "background";
  if(name.startsWith("Efecto")) return "effect";
  if(name.startsWith("Título") ) return "title";
  if(name.startsWith("Insignia")) return "badge";
  return "item";
}

function renderOwned(){
  const box=$("#ownedItems");
  const count=$("#collectionCount");
  count.textContent=`${state.purchased.length} / 24`;
  if(!state.purchased.length){box.textContent="Todavía no has comprado artículos.";return;}
  box.innerHTML=state.purchased.map(x=>{
    const type=itemType(x), active=state.equippedItems[type]===x || (type==="title"&&state.equippedTitle===x);
    return `<div class="owned-item-row"><span class="owned-item">✓ ${escapeHtml(x)}</span><button class="use-item ${active?"active":""}" data-use-item="${escapeAttr(x)}">${active?"✓ USANDO":"USAR"}</button></div>`;
  }).join("");
  $$("[data-use-item]").forEach(b=>b.addEventListener("click",()=>equipItem(b.dataset.useItem)));
}

function equipItem(name){
  const type=itemType(name);
  if(!state.purchased.includes(name)) return;
  if(type==="title") state.equippedTitle=name.replace(/^Título /,"");
  else state.equippedItems[type]=name;
  save();sync();
  toast(`✓ ${name} equipado.`);
}

function applyEquippedItems(){
  const root=document.body;
  root.dataset.frame=state.equippedItems.frame||"";
  root.dataset.background=state.equippedItems.background||"";
  root.dataset.effect=state.equippedItems.effect||"";
  root.dataset.badge=state.equippedItems.badge||"";
  const avatar=state.equippedItems.avatar||"";
  const avatarIcons={"Avatar Guerrero":"🧙"};
  $$(".avatar").forEach(a=>{
    if(avatarIcons[avatar]) a.textContent=avatarIcons[avatar];
    else a.textContent=(state.name||"A").charAt(0).toUpperCase();
  });
}
function updateShopButtons(){
  $$("[data-buy]").forEach(btn=>{
    const owned=state.purchased.includes(btn.dataset.name);
    btn.disabled=owned;btn.classList.toggle("owned",owned);btn.textContent=owned?"✓ ADQUIRIDO":"COMPRAR";
  });
}

function updateAvatars(){
  const letter=(state.name||"A").charAt(0).toUpperCase();
  $$(".avatar").forEach(a=>a.textContent=letter);
}

function updateTitleSelect(){
  const select=$("#titleSelect"); if(!select)return;
  const available=TITLES.filter(t=>state.xp>=t.min || state.purchased.includes("Título "+t.name));
  select.innerHTML=`<option value="">Sin título</option>`+available.filter(t=>t.name!=="Explorador del Saber").map(t=>`<option value="${escapeAttr(t.name)}">${escapeHtml(t.name)}</option>`).join("");
  select.value=state.equippedTitle||"";
  $("#previewName").textContent=state.name||"TU NOMBRE";
  $("#previewTitle").textContent=state.equippedTitle||"Sin título";
}

function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}
function escapeAttr(s){return escapeHtml(s);}

function toast(msg){
  const t=$("#toast");t.textContent=msg;t.classList.add("show");
  clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2300);
}

function go(view){
  $$(".view").forEach(v=>v.classList.add("hidden"));
  $("#"+view+"View")?.classList.remove("hidden");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  if(view==="quiz")loadQuestion();
  sync();
}

async function loadQuestions(){
  try{
    const res=await fetch("questions.json");
    if(!res.ok)throw new Error();
    questions=await res.json();
  }catch{
    questions=[{id:1,category:"Ciencia",question:"¿Cuál es el elemento químico más abundante en el universo?",options:["Helio","Hidrógeno","Oxígeno","Carbono"],answer:1,explanation:"El hidrógeno es el elemento más abundante del universo."}];
  }
}

function loadQuestion(){
  clearInterval(timer);
  answeredCurrent=false;
  if(!questions.length)return;

  // Sin vidas no se puede iniciar ni continuar otra pregunta.
  if(state.lives<=0){
    $("#options").innerHTML="";
    $("#questionText").textContent="No puedes continuar sin vidas";
    $("#questionCategory").textContent="VIDAS AGOTADAS";
    $("#feedback").className="feedback hidden";
    $("#nextBtn").classList.add("hidden");
    $("#noLivesQuiz").classList.remove("hidden");
    $("#timer").textContent="--";
    return;
  }

  $("#noLivesQuiz").classList.add("hidden");
  answeredCurrent=false;
  const q=questions[state.questionIndex%questions.length];
  $("#questionCategory").textContent=q.category.toUpperCase();
  $("#questionText").textContent=q.question;
  $("#feedback").className="feedback hidden";
  $("#nextBtn").classList.add("hidden");
  const box=$("#options");box.innerHTML="";
  q.options.forEach((opt,i)=>{
    const b=document.createElement("button");b.className="option";b.dataset.index=i;
    b.innerHTML=`<span class="letter">${String.fromCharCode(65+i)}</span>${escapeHtml(opt)}`;
    b.addEventListener("click",()=>answer(i,b,q,false));box.appendChild(b);
  });
  timeLeft=12;$("#timer").textContent=timeLeft;
  timer=setInterval(()=>{timeLeft--;$("#timer").textContent=timeLeft;if(timeLeft<=0){clearInterval(timer);if(!answeredCurrent)answer(-1,null,q,true)}},1000);
}

function answer(index,button,q,timeout){
  if(answeredCurrent)return;
  if(state.lives<=0){ loadQuestion(); return; }
  answeredCurrent=true;clearInterval(timer);
  $$(".option").forEach(b=>b.disabled=true);
  const correct=index===q.answer;
  $(`.option[data-index="${q.answer}"]`)?.classList.add("correct");
  if(!correct)button?.classList.add("wrong");
  const f=$("#feedback");f.classList.remove("hidden");
  if(correct){
    state.xp+=50;state.coins+=10;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);
    state.correctAnswers++;state.answeredTotal++;
    state.missions.correct++;
    state.missions.maxStreak=Math.max(state.missions.maxStreak,state.streak);
    if(!state.missions.categories.includes(q.category))state.missions.categories.push(q.category);
    f.className="feedback ok";
    f.innerHTML=`✓ ¡CORRECTO! +50 EXP　⭐ +10　🔥 Racha x${state.streak}<br><small>${escapeHtml(q.explanation)}</small>`;
    toast(`+50 EXP · Tu posición ahora es #${ranking().pos}`);
  }else{
    state.streak=0;state.answeredTotal++;
    if(state.lives>0){state.lives--; if(state.lives===4)state.lastLifeRecovery=Date.now();}
    f.className="feedback no";
    f.innerHTML=`✕ ${timeout?"¡Se acabó el tiempo!":"Respuesta incorrecta"}<br><small>${escapeHtml(q.explanation)}</small>`;
    if(state.lives===0)toast("❤️ Te quedaste sin vidas. Puedes comprar una.");
  }
  save();sync();
  if(state.lives>0) $("#nextBtn").classList.remove("hidden");
  else {
    $("#nextBtn").classList.add("hidden");
    $("#noLivesQuiz").classList.remove("hidden");
    $("#options").innerHTML="";
  }
}

$("#nextBtn").addEventListener("click",()=>{
  if(state.lives<=0){loadQuestion();return;}
  state.questionIndex=(state.questionIndex+1)%questions.length;
  save();
  loadQuestion();
});

function buyLifeWithCoins(){
  if(state.lives>=5){toast("Ya tienes 5 vidas.");return}
  if(state.coins<500){toast("Necesitas 500 monedas.");return}
  state.coins-=500;state.lives++;
  if(state.lives>=5)state.lastLifeRecovery=Date.now();
  save();sync();
  if(state.lives>0 && !$("#quizView").classList.contains("hidden")) loadQuestion();
  toast("❤️ Vida comprada por 500 monedas.");
}

function buyLifeWithXp(){
  if(state.lives>=5){toast("Ya tienes 5 vidas.");return}
  const cost=xpLifeCost();
  if(state.xp<cost){toast(`Necesitas ${fmt(cost)} EXP.`);return}
  state.xp-=cost;state.lives++;state.xpLifePurchaseCount++;
  if(state.lives>=5)state.lastLifeRecovery=Date.now();
  save();sync();
  if(state.lives>0 && !$("#quizView").classList.contains("hidden")) loadQuestion();
  toast(`❤️ Vida comprada por ${fmt(cost)} EXP. Próximo costo: ${fmt(cost+100)} EXP.`);
}

$("#buyLifeCoins").addEventListener("click",buyLifeWithCoins);
$("#buyLifeXp").addEventListener("click",buyLifeWithXp);
$("#homeBuyLifeCoins").addEventListener("click",buyLifeWithCoins);
$("#homeBuyLifeXp").addEventListener("click",buyLifeWithXp);
$("#quizBuyLifeCoins").addEventListener("click",buyLifeWithCoins);
$("#quizBuyLifeXp").addEventListener("click",buyLifeWithXp);
$("#quizBackHome").addEventListener("click",()=>go("home"));

$$("[data-view]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));

$("#timeHelp").addEventListener("click",()=>{
  if(state.coins<100){toast("No tienes suficientes monedas.");return}
  if(answeredCurrent){toast("La pregunta ya terminó.");return}
  state.coins-=100;timeLeft+=5;$("#timer").textContent=timeLeft;save();sync();toast("⏱ +5 segundos");
});
$("#removeHelp").addEventListener("click",()=>{
  if(state.coins<150){toast("No tienes suficientes monedas.");return}
  if(answeredCurrent){toast("La pregunta ya terminó.");return}
  const q=questions[state.questionIndex%questions.length];state.coins-=150;
  $$(".option").filter(b=>Number(b.dataset.index)!==q.answer).slice(0,2).forEach(b=>{b.style.opacity=".22";b.disabled=true});
  save();sync();toast("🎯 Se eliminaron 2 opciones.");
});

$$("[data-buy]").forEach(btn=>btn.addEventListener("click",()=>{
  const name=btn.dataset.name,price=Number(btn.dataset.price);
  if(state.purchased.includes(name)){toast("Ya tienes este artículo.");return}
  if(state.coins<price){toast(`Necesitas ${fmt(price)} monedas.`);return}
  state.coins-=price;state.purchased.push(name);save();sync();toast(`🎁 ${name} adquirido.`);
  sync();
}));

$("#editProfileBtn").addEventListener("click",()=>{
  $("#editName").value=state.name||"";
  updateTitleSelect();$("#profileModal").classList.remove("hidden");
});
$$("[data-close-modal]").forEach(b=>b.addEventListener("click",()=>$("#profileModal").classList.add("hidden")));
$("#saveProfile").addEventListener("click",()=>{
  const name=$("#editName").value.trim();
  if(name.length<2){toast("El nombre debe tener al menos 2 caracteres.");return}
  state.name=name;
  state.equippedTitle=$("#titleSelect").value||"";
  save();sync();$("#profileModal").classList.add("hidden");toast("✓ Perfil actualizado.");
});
$("#titleSelect").addEventListener("change",()=>$("#previewTitle").textContent=$("#titleSelect").value);
$("#editName").addEventListener("input",()=>$("#previewName").textContent=$("#editName").value||"ALEX");

function startGameWithName(){
  const input=$("#firstName");
  if(!input)return;
  const name=input.value.trim().replace(/\s+/g," ");
  if(name.length<2){
    toast("Escribe un nombre válido.");
    input.focus();
    return;
  }
  state.name=name;
  save();
  $("#nameModal")?.classList.add("hidden");
  sync();
  toast(`¡Bienvenido, ${name}!`);
}

const firstNameBtn=$("#saveFirstName");
if(firstNameBtn) firstNameBtn.addEventListener("click",startGameWithName);
const firstNameInput=$("#firstName");
if(firstNameInput) firstNameInput.addEventListener("keydown",e=>{
  if(e.key==="Enter"){e.preventDefault();startGameWithName();}
});

$("#claimM1").addEventListener("click",()=>claimMission("m1",200,500));
$("#claimM2").addEventListener("click",()=>claimMission("m2",300,0));
$("#claimM3").addEventListener("click",()=>claimMission("m3",0,750));

function claimMission(id,xp,coins){
  if(state.missions.claimed[id])return;
  const ok={m1:state.missions.correct>=10,m2:state.missions.maxStreak>=10,m3:state.missions.categories.length>=3}[id];
  if(!ok)return;
  state.missions.claimed[id]=true;state.xp+=xp;state.coins+=coins;save();sync();
  toast(`🎉 Misión completada: +${xp?fmt(xp)+" EXP ":""}${coins?"+ "+fmt(coins)+" monedas":""}`);
}

$("#soundBtn").addEventListener("click",()=>{state.sound=!state.sound;$("#soundBtn").textContent=state.sound?"🔊":"🔇";save();toast(state.sound?"Sonido activado":"Sonido desactivado")});

$$(".shop-tabs button").forEach(b=>b.addEventListener("click",()=>{
  $$(".shop-tabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  toast(`Categoría: ${b.textContent}`);
}));

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){$("#profileModal").classList.add("hidden");go("home")}
  if(["1","2","3","4"].includes(e.key)&&!$("#quizView").classList.contains("hidden"))$(`.option[data-index="${Number(e.key)-1}"]`)?.click();
});

setInterval(()=>{
  const wasNoLives=state.lives<=0;
  recoverLives();sync();
  if(wasNoLives && state.lives>0 && !$("#quizView").classList.contains("hidden")) loadQuestion();
  const remain=Math.max(0,state.seasonEndsAt-Date.now());
  const d=Math.floor(remain/86400000),h=Math.floor(remain%86400000/3600000),m=Math.floor(remain%3600000/60000),s=Math.floor(remain%60000/1000);
  $("#seasonCountdown").textContent=`Termina en: ${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
},1000);

(async function init(){
  try{
    ensureDaily();
    await loadQuestions();
    sync();
    const modal=$("#nameModal");
    const input=$("#firstName");
    if(!state.name){
      modal?.classList.remove("hidden");
      setTimeout(()=>input?.focus(),100);
    }else{
      modal?.classList.add("hidden");
    }
  }catch(error){
    console.error("Know World initialization error:",error);
    const modal=$("#nameModal");
    if(!state.name)modal?.classList.remove("hidden");
  }
})();
