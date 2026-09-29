const pc=require("puppeteer-core");const url=process.argv[2],pre=process.argv[3],sel=process.argv[4];
(async()=>{
const b=await pc.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND|404/.test(m.text()))errs.push('CONSOLE '+m.text())});
await p.goto(url);await new Promise(r=>setTimeout(r,3000));
if(sel==="hold"){await new Promise(r=>setTimeout(r,2500));const cb=await (await p.$("#crypt")).boundingBox();for(let i=0;i<120;i++){await p.mouse.move(cb.x+10+(i*37)%(cb.width-20),cb.y+10+((i*7)%(cb.height-20)));}}else{await p.mouse.click(150,400);for(let i=0;i<50;i++){await p.mouse.move(110+i*3,300+Math.sin(i/5)*90);}}
await p.screenshot({path:pre+'1.png'});

if(sel==='hold'){const bb=await (await p.$('#startBtn')).boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await new Promise(r=>setTimeout(r,1600));await p.mouse.up();}
else await p.click(sel);
await new Promise(r=>setTimeout(r,900));await p.screenshot({path:pre+'2.png'});await new Promise(r=>setTimeout(r,3800));await p.screenshot({path:pre+'3.png'});
const ids=process.argv[5].split(',');let k=4;
for(const s of ids){const [id,off]=s.split(':');await p.evaluate((id,off)=>{const e=document.querySelector(id);scrollTo(0,e.getBoundingClientRect().top+scrollY+(+off||0)*innerHeight)},id,off);await new Promise(r=>setTimeout(r,1300));await p.screenshot({path:pre+(k++)+'.png'})}
console.log(errs.join('\n')||'no errors');await b.close();})();
