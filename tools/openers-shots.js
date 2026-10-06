// Screenshot every opener at several scroll positions. usage: node openers-shots.js <url> <outdir>
const pc=require('puppeteer-core');const [url,out]=process.argv.slice(2);
(async()=>{const b=await pc.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
await p.goto(url,{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,1500));
const names=await p.evaluate(()=>[...document.querySelectorAll('[data-opener]')].map(s=>s.dataset.opener));
for(const [i,n] of names.entries())for(const f of [.15,.45,.75,.98]){
  await p.evaluate((i,f)=>{const s=document.querySelectorAll('[data-opener]')[i];scrollTo(0,s.offsetTop+f*(s.offsetHeight-innerHeight))},i,f);
  await new Promise(r=>setTimeout(r,f===.15?900:500));await p.screenshot({path:`${out}/${n}-${Math.round(f*100)}.png`})}
console.log(errs.join('\n')||'no errors');await b.close()})();
