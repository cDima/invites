const pc=require('puppeteer-core');const url=process.argv[2],pre=process.argv[3];
(async()=>{const b=await pc.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/404|ERR_FILE/.test(m.text()))errs.push('CONSOLE '+m.text())});
await p.goto(url);await new Promise(r=>setTimeout(r,2500));const cb=await (await p.$('#card')).boundingBox();
await p.mouse.move(cb.x+30,cb.y+cb.height-40);await p.mouse.down();for(let i=0;i<40;i++)await p.mouse.move(cb.x+30+i*(cb.width-60)/40,cb.y+cb.height-40-i*(cb.height-80)/40);await p.mouse.up();
await new Promise(r=>setTimeout(r,1500));await p.screenshot({path:pre+'1.png'});await new Promise(r=>setTimeout(r,4000));await p.screenshot({path:pre+'2.png'});
await p.mouse.click(cb.x+cb.width/2,cb.y+cb.height/2);await new Promise(r=>setTimeout(r,2600));await p.screenshot({path:pre+'3.png'});
await p.click('#openBtn');await new Promise(r=>setTimeout(r,2500));await p.screenshot({path:pre+'4.png'});
let k=5;for(const s of process.argv[4].split(',')){const [id,off]=s.split(':');await p.evaluate((id,off)=>{const e=document.querySelector(id);scrollTo(0,e.getBoundingClientRect().top+scrollY+(+off||0)*innerHeight)},id,off);await new Promise(r=>setTimeout(r,1300));await p.screenshot({path:pre+(k++)+'.png'})}
// tear stub + open bottle
await p.evaluate(()=>document.querySelector('#ticket').scrollIntoView({block:'center'}));await new Promise(r=>setTimeout(r,800));const sb=await (await p.$('#stub')).boundingBox();await p.mouse.move(sb.x+sb.width/2,sb.y+20);await p.mouse.down();for(let i=0;i<20;i++)await p.mouse.move(sb.x+sb.width/2,sb.y+20+i*8);await p.mouse.up();await new Promise(r=>setTimeout(r,900));await p.screenshot({path:pre+(k++)+'.png'});
await p.evaluate(()=>document.querySelector('#sea').scrollIntoView({block:'center'}));await new Promise(r=>setTimeout(r,600));await p.click('#sea');await new Promise(r=>setTimeout(r,1400));await p.screenshot({path:pre+(k++)+'.png'});
console.log(errs.join('\n')||'no errors');await b.close()})();
