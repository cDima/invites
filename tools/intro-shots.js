const pc=require('puppeteer-core');const [url,pre]=process.argv.slice(2);
(async()=>{const b=await pc.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true});await p.goto(url);await new Promise(r=>setTimeout(r,2000));
const cb=await (await p.$('#card')).boundingBox();await p.mouse.move(cb.x+30,cb.y+cb.height-40);await p.mouse.down();for(let i=0;i<12;i++)await p.mouse.move(cb.x+30+i*8,cb.y+cb.height-40-i*10);await p.mouse.up();
for(let k=1;k<=5;k++){await new Promise(r=>setTimeout(r,1300));await p.screenshot({path:pre+k+'.png'})}await b.close()})();
