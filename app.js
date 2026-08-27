const state = {
  xp: Number(localStorage.getItem("kw_xp") || 0),
  coins: Number(localStorage.getItem("kw_coins") || 0),
  lives: Number(localStorage.getItem("kw_lives") || 5),
  streak: Number(localStorage.getItem("kw_streak") || 0),
  answered: Number(localStorage.getItem("kw_answered") || 6),
  questionIndex: Number(localStorage.getItem("kw_q") || 0),
  sound: localStorage.getItem("kw_sound") !== "off",
  questions: [],
  timer: null,
  timeLeft: 12,
  answeredCurrent: false
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function save(){
  localStorage.setItem("kw_xp", state.xp);
  localStorage.setItem("kw_coins", state.coins);
  localStorage.setItem("kw_lives", state.lives);
  localStorage.setItem("kw_streak", state.streak);
  localStorage.setItem("kw_answered", state.answered);
  localStorage.setItem("kw_q", state.questionIndex);
}

function format(n){ return n.toLocaleString("en-US"); }

function sync(){
  ["xp","coins"].forEach(k => {
    const el = $("#"+k); if(el) el.textContent = format(state[k]);
  });
  ["lives"].forEach(k => { const el=$("#"+k); if(el) el.textContent=`${state[k]}/5`; });
  ["quickLives","profileLives"].forEach(k=>{const e=$("#"+k);if(e)e.textContent=`${state.lives}/5`});
  ["quickCoins","profileCoins","shopCoins"].forEach(k=>{const e=$("#"+k);if(e)e.textContent=format(state.coins)});
  ["streak","quickStreak","quizStreak"].forEach(k=>{const e=$("#"+k);if(e)e.textContent=`x${state.streak}`});
  const r = Math.min(100, 45 + (state.answered % 10)*5);
  const m = Math.min(100, (state.answered % 11)*10);
  $("#rewardProgress")?.style.setProperty("width",r+"%");
  $("#missionProgress")?.style.setProperty("width",m+"%");
  $("#missionBigProgress")?.style.setProperty("width",m+"%");
  ["missionText","missionBigText"].forEach(k=>{const e=$("#"+k);if(e)e.textContent=`${Math.min(10,state.answered%11)} / 10`});
  $("#rankingXp") && ($("#rankingXp").textContent = `${format(state.xp)} EXP`);
}

function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>t.classList.remove("show"),2200);
}

function go(view){
  $$(".view").forEach(v=>v.classList.add("hidden"));
  $("#"+view+"View")?.classList.remove("hidden");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.view===view));
  if(view==="quiz") loadQuestion();
}

async function loadQuestions(){
  try{
    const res=await fetch("questions.json");
    if(!res.ok) throw new Error("No se pudo cargar questions.json");
    state.questions=await res.json();
  }catch(e){
    // Fallback para abrir el proyecto sin servidor.
    state.questions=[
      {category:"Ciencia",question:"¿Cuál es el elemento químico más abundante en el universo?",options:["Helio","Hidrógeno","Oxígeno","Carbono"],answer:1,explanation:"El hidrógeno es el elemento más abundante del universo."}
    ];
  }
  loadQuestion();
}

function loadQuestion(){
  if(!state.questions.length) return;
  state.answeredCurrent=false;
  clearInterval(state.timer);
  const q=state.questions[state.questionIndex % state.questions.length];
  $("#questionCategory").textContent=q.category.toUpperCase();
  $("#questionText").textContent=q.question;
  $("#feedback").className="feedback hidden";
  $("#nextBtn").classList.add("hidden");
  const box=$("#options"); box.innerHTML="";
  q.options.forEach((opt,i)=>{
    const b=document.createElement("button");
    b.className="option";
    b.dataset.index=i;
    b.innerHTML=`<span class="letter">${String.fromCharCode(65+i)}</span>${opt}`;
    b.addEventListener("click",()=>answer(i,b,q));
    box.appendChild(b);
  });
  state.timeLeft=12;
  $("#timer").textContent=state.timeLeft;
  state.timer=setInterval(()=>{
    state.timeLeft--;
    $("#timer").textContent=state.timeLeft;
    if(state.timeLeft<=0){
      clearInterval(state.timer);
      if(!state.answeredCurrent) answer(-1,null,q,true);
    }
  },1000);
}

function answer(index,button,q,timeout=false){
  if(state.answeredCurrent) return;
  state.answeredCurrent=true;
  clearInterval(state.timer);
  $$(".option").forEach(b=>b.disabled=true);
  const correct=index===q.answer;
  const correctBtn=$(`.option[data-index="${q.answer}"]`);
  correctBtn?.classList.add("correct");
  if(!correct) button?.classList.add("wrong");

  const f=$("#feedback");
  f.classList.remove("hidden");
  if(correct){
    state.xp+=50; state.coins+=10; state.streak+=1; state.answered+=1;
    f.className="feedback ok";
    f.innerHTML=`✓ ¡CORRECTO! +50 EXP　⭐ +10　🔥 Racha x${state.streak}<br><small>${q.explanation}</small>`;
    if(state.answered%10===0) toast("🎉 ¡Misión diaria completada!");
  }else{
    state.streak=0;
    state.lives=Math.max(0,state.lives-1);
    f.className="feedback no";
    f.innerHTML=`✕ ${timeout?"¡Se acabó el tiempo!":"Respuesta incorrecta"}<br><small>${q.explanation}</small>`;
    if(state.lives===0) toast("❤️ Te quedaste sin vidas.");
  }
  $("#nextBtn").classList.remove("hidden");
  save(); sync();
}

$("#nextBtn")?.addEventListener("click",()=>{
  state.questionIndex=(state.questionIndex+1)%state.questions.length;
  save(); loadQuestion();
});

$$("[data-view]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));

$("#timeHelp")?.addEventListener("click",()=>{
  if(state.coins<100){toast("No tienes suficientes monedas.");return}
  state.coins-=100; state.timeLeft+=5; $("#timer").textContent=state.timeLeft; save(); sync(); toast("⏱ +5 segundos");
});
$("#removeHelp")?.addEventListener("click",()=>{
  if(state.coins<150){toast("No tienes suficientes monedas.");return}
  const q=state.questions[state.questionIndex%state.questions.length];
  if(!q)return;
  state.coins-=150;
  const wrong=$$(".option").filter(b=>Number(b.dataset.index)!==q.answer).slice(0,2);
  wrong.forEach(b=>{b.style.opacity=".25";b.disabled=true;});
  save();sync();toast("🎯 Se eliminaron 2 opciones");
});

$$("[data-buy]").forEach(btn=>btn.addEventListener("click",()=>{
  const price=Number(btn.dataset.price);
  if(state.coins<price){toast("🪙 No tienes suficientes monedas.");return}
  state.coins-=price; save(); sync();
  btn.textContent="✓ ADQUIRIDO"; btn.disabled=true;
  toast(`🎁 ${btn.dataset.name} adquirido`);
}));

$("#soundBtn")?.addEventListener("click",()=>{
  state.sound=!state.sound;
  localStorage.setItem("kw_sound",state.sound?"on":"off");
  $("#soundBtn").textContent=state.sound?"🔊":"🔇";
  toast(state.sound?"Sonido activado":"Sonido desactivado");
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape") go("home");
  if(["1","2","3","4"].includes(e.key) && !$("#quizView").classList.contains("hidden")){
    const b=$(`.option[data-index="${Number(e.key)-1}"]`);
    b?.click();
  }
});

sync();
loadQuestions();
