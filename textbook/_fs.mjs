import puppeteer from 'puppeteer';
const OUT=process.argv[2];
const pages=['index.html','landing.html','order.html','market.html','market_checkout.html',
  'sample.html','level_test.html','event.html','faq.html','login.html','signup.html',
  'mypage.html','privacy.html','terms.html','refund.html','sitemap.html','intro.html',
  'payment-complete.html','admin.html','subscription.html','exam-match.html'];
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const problems=[];
for(const pg of pages){
  for(const theme of ['light','dark']){
    const p=await b.newPage();
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.evaluateOnNewDocument((t)=>{try{localStorage.setItem('tn-theme',t);}catch(e){}},theme);
    await p.setViewport({width:1440,height:900});
    try{
      await p.goto('http://localhost:8899/'+pg,{waitUntil:'networkidle2',timeout:35000});
      await new Promise(r=>setTimeout(r,1600));
      const bg=await p.evaluate(()=>getComputedStyle(document.body).backgroundColor);
      const m=bg.match(/\d+/g); const lum=m?(+m[0]+ +m[1]+ +m[2])/3:0;
      if(errs.length) problems.push(`${pg}/${theme}: JSERR ${errs[0].slice(0,40)}`);
      if(theme==='light'&&lum<128) problems.push(`${pg}/light: 배경어두움`);
      if(theme==='dark'&&lum>128) problems.push(`${pg}/dark: 회귀!밝음`);
      if(theme==='light'){
        const bad=await p.evaluate(()=>{
          function lum(c){const m=c.match(/\d+/g);if(!m)return 1;return (0.299*m[0]+0.587*m[1]+0.114*m[2])/255;}
          let h=[];
          for(const el of document.querySelectorAll('h1,h2,h3,p,span,a,li,label')){
            const t=(el.textContent||'').trim(); if(!t||t.length<2||el.children.length>2)continue;
            const r=el.getBoundingClientRect(); if(r.width<10||r.height<6||r.top>900||r.bottom<0)continue;
            const st=getComputedStyle(el); const cl=lum(st.color);
            let be=el,bgc='rgba(0,0,0,0)'; while(be){const c=getComputedStyle(be).backgroundColor;if(c&&!c.includes('rgba(0, 0, 0, 0)')&&c!=='transparent'){bgc=c;break;}be=be.parentElement;}
            if(lum(bgc)>0.8&&cl>0.68&&st.opacity!=='0')h.push(t.slice(0,14));
          }
          return [...new Set(h)].slice(0,4);
        });
        if(bad.length) problems.push(`${pg}/light: 저대비[${bad.join('|')}]`);
      }
    }catch(e){ problems.push(`${pg}/${theme}: FAIL`); }
    await p.close();
  }
  process.stdout.write('.');
}
console.log('\n=== 최종 ('+problems.length+') ===\n'+(problems.length?problems.join('\n'):'✅ 전 페이지 통과'));
await b.close();
