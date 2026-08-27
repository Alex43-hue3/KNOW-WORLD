const http=require("http"),fs=require("fs"),path=require("path");
const port=process.env.PORT||3000,root=__dirname;
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".jpg":"image/jpeg"};
http.createServer((req,res)=>{
  let u=decodeURIComponent(req.url.split("?")[0]);if(u==="/")u="/index.html";
  const file=path.join(root,u);
  if(!file.startsWith(root)){res.writeHead(403);return res.end("Forbidden")}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});return res.end("404")}
    res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream","Cache-Control":"no-cache"});res.end(data)
  })
}).listen(port,()=>console.log(`Know World: http://localhost:${port}`));
