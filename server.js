const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const port=process.env.PORT||3000,root=__dirname,dbFile=path.join(root,'accounts.json');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
let db={users:{}};try{if(fs.existsSync(dbFile))db=JSON.parse(fs.readFileSync(dbFile,'utf8'));}catch{db={users:{}}}db.users=db.users||{};
const sessions=new Map(),online=new Map();
function saveDb(){fs.writeFileSync(dbFile,JSON.stringify(db,null,2));}
function hash(v){return crypto.createHash('sha256').update(String(v)).digest('hex');}
function token(){return crypto.randomBytes(24).toString('hex');}
function body(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>1e6)req.destroy()});req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}});req.on('error',reject)})}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(data));}
function auth(req){const t=req.headers.authorization?.replace(/^Bearer\s+/,'');return t&&sessions.get(t)?{token:t,username:sessions.get(t)}:null;}
function cleanupOnline(){const now=Date.now();for(const [k,v] of online)if(now-v.at>45000)online.delete(k);}
function validateUsername(u){return /^[A-Za-z0-9_ .-]{2,24}$/.test(u||'')}
async function api(req,res,u){
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});return res.end()}
  if(u==='/api/register'&&req.method==='POST'){
    const b=await body(req),username=String(b.username||'').trim(),email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');
    if(!validateUsername(username)||password.length<6||!/^\S+@\S+\.\S+$/.test(email))return json(res,400,{error:'Nombre, correo o contraseña no válidos.'});
    const key=username.toLowerCase();if(db.users[key])return json(res,409,{error:'Ese usuario ya existe.'});
    const code=String(Math.floor(100000+Math.random()*900000));db.users[key]={username,email,password:hash(password),verified:false,codeHash:hash(code),codeExpires:Date.now()+15*60*1000,state:null,updatedAt:Date.now()};saveDb();
    return json(res,201,{ok:true,verificationRequired:true,devCode:process.env.NODE_ENV==='production'?undefined:code,message:'Cuenta creada. Verifica tu correo.'});
  }
  if(u==='/api/verify'&&req.method==='POST'){
    const b=await body(req),key=String(b.username||'').trim().toLowerCase(),code=String(b.code||'');const a=db.users[key];if(!a)return json(res,404,{error:'Usuario no encontrado.'});if(a.codeExpires<Date.now()||a.codeHash!==hash(code))return json(res,400,{error:'Código incorrecto o vencido.'});a.verified=true;a.codeHash='';saveDb();return json(res,200,{ok:true});
  }
  if(u==='/api/login'&&req.method==='POST'){
    const b=await body(req),key=String(b.username||'').trim().toLowerCase(),a=db.users[key];if(!a||a.password!==hash(String(b.password||'')))return json(res,401,{error:'Usuario o contraseña incorrectos.'});if(!a.verified)return json(res,403,{error:'Cuenta no verificada.',verificationRequired:true});const t=token();sessions.set(t,key);return json(res,200,{ok:true,token:t,state:a.state||null});
  }
  if(u==='/api/sync'&&req.method==='POST'){
    const me=auth(req);if(!me)return json(res,401,{error:'Sesión no válida.'});const b=await body(req),a=db.users[me.username];if(b.state)a.state=b.state;a.updatedAt=Date.now();saveDb();return json(res,200,{ok:true});
  }
  if(u==='/api/ranking'&&req.method==='GET'){
    const rows=Object.values(db.users).filter(x=>x.verified).map(x=>({name:x.username,xp:Number(x.state?.xp||0),updatedAt:x.updatedAt||0})).sort((a,b)=>b.xp-a.xp||a.name.localeCompare(b.name)).slice(0,100);return json(res,200,{rows});
  }
  if(u==='/api/online'&&(req.method==='POST'||req.method==='GET')){
    cleanupOnline();if(req.method==='POST'){const b=await body(req);online.set(String(b.id||'anon-'+Math.random()),{at:Date.now()})}return json(res,200,{count:online.size});
  }
  if(u==='/api/reset/request'&&req.method==='POST'){
    const b=await body(req),email=String(b.email||'').trim().toLowerCase(),a=Object.values(db.users).find(x=>x.email===email);if(!a)return json(res,200,{ok:true,message:'Si el correo existe, se generó un código.'});const code=String(Math.floor(100000+Math.random()*900000));a.resetHash=hash(code);a.resetExpires=Date.now()+15*60*1000;saveDb();return json(res,200,{ok:true,devCode:process.env.NODE_ENV==='production'?undefined:code,message:'Código generado. Configura SMTP para enviarlo por correo en producción.'});
  }
  if(u==='/api/change-username'&&req.method==='POST'){
    const b=await body(req),email=String(b.email||'').trim().toLowerCase(),code=String(b.code||''),newUsername=String(b.newUsername||'').trim();
    const a=Object.values(db.users).find(x=>x.email===email);if(!a||a.resetExpires<Date.now()||a.resetHash!==hash(code))return json(res,400,{error:'Código incorrecto o vencido.'});
    if(!validateUsername(newUsername))return json(res,400,{error:'El nuevo usuario no es válido.'});const nk=newUsername.toLowerCase();if(db.users[nk])return json(res,409,{error:'Ese usuario ya existe.'});
    const oldKey=Object.keys(db.users).find(k=>db.users[k]===a);db.users[nk]={...a,username:newUsername,resetHash:'',resetExpires:0};delete db.users[oldKey];saveDb();return json(res,200,{ok:true,message:'Usuario cambiado. Inicia sesión con el nuevo nombre.'});
  }
  if(u==='/api/reset/confirm'&&req.method==='POST'){
    const b=await body(req),email=String(b.email||'').trim().toLowerCase(),code=String(b.code||''),a=Object.values(db.users).find(x=>x.email===email);if(!a||a.resetExpires<Date.now()||a.resetHash!==hash(code))return json(res,400,{error:'Código incorrecto o vencido.'});if(String(b.newPassword||'').length<6)return json(res,400,{error:'La contraseña debe tener 6 caracteres o más.'});a.password=hash(b.newPassword);a.resetHash='';saveDb();return json(res,200,{ok:true});
  }
  return json(res,404,{error:'Ruta no encontrada.'});
}
http.createServer(async(req,res)=>{try{let u=decodeURIComponent(req.url.split('?')[0]);if(u.startsWith('/api/'))return api(req,res,u);if(u==='/')u='/index.html';const file=path.join(root,u);if(!file.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('404')}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data)})}catch(e){console.error(e);json(res,500,{error:'Error interno'})}}).listen(port,()=>console.log(`Know World: http://localhost:${port}`));
