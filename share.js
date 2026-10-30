/* Sharing your brain. The text is a small brain packed with colourful drawings from your interests,
   with today's pathway sparkling across it; the picture is a bold story card of your brain.
   Fewer tries light a longer pathway. */
(function(){
/* one line per try, in the board's own colours: orange = right spot, yellow = wrong spot, pale = not in it */
const MARK={exact:'🟠',near:'🟡',off:'⚪'};
function rng(seed){let s=seed%2147483647||7;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};}
const grid=rows=>(rows||[]).map(r=>r.map(c=>MARK[c]).join('')).join('\n');
function text({num,tries,solved,first,rows,title,echo,customText}){
  if(customText)return customText;
  if(first){const [a,b]=rows||[[],[]],n=x=>x.filter(c=>c==='exact').length;return `🧠 My first pathway on Plasticity\n${n(a)}/${a.length} → ${n(b)}/${b.length}\n\n${grid(rows)}`;}
  return `🧠 ${title||'Plasticity'} #${num} · ${solved?tries:'X'}/6\n\n${grid(rows)}${solved?'\n✨ wired':''}${echo?'\n🔁 recalled yesterday’s word':''}`;}

/* ---------- the picture: a story-sized card, loud colour, your brain in the middle ---------- */
async function image({num,tries,solved,first,motifs,rows,title,big,label}){const B=window.PPBrain;
  try{await document.fonts.load('500 120px Inter');}catch(e){}
  const W=1080,H=1920,out=document.createElement('canvas');out.width=W;out.height=H;const g=out.getContext('2d');
  /* sunset gradient from the motif palette */
  const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#8E5BD6');bg.addColorStop(.5,'#E8508A');bg.addColorStop(1,'#F28C28');g.fillStyle=bg;g.fillRect(0,0,W,H);
  const glow=g.createRadialGradient(W/2,H*.5,60,W/2,H*.5,W*.75);glow.addColorStop(0,'rgba(255,247,220,.55)');glow.addColorStop(1,'rgba(255,247,220,0)');g.fillStyle=glow;g.fillRect(0,0,W,H);
  /* confetti: the same hand-drawn motifs, scattered around the card */
  const r=rng((num||7)*31+5),kinds=['star','spark','heart','flower','note','bolt','leaf','dots','squig','petal'];const C=Object.values(B.C);
  for(let i=0;i<46;i++){const x=r()*W,y=r()*H;if(Math.hypot(x-W/2,y-830)<470)continue;
    /* keep the words and your tries clear */
    if(Math.abs(x-W/2)<400&&(y<470||y>1200))continue;B.drawMotif(g,{kind:kinds[i%kinds.length],x,y,s:18+r()*26,rot:r()*6.28,c:i%3?'#FFF7DC':C[Math.floor(r()*C.length)],c2:'#F5C63C'});}
  /* your brain, drawn by the app's own renderer */
  const host=document.createElement('canvas');host.style.cssText='position:fixed;left:-10000px;top:0;width:1080px;height:840px';document.body.appendChild(host);
  const k=first?.7:solved?Math.max(.2,(7-tries)/6):.08;
  B.renderer(host)({motifs:(motifs||[]).map(m=>({...m,k:1})),fill:1,paths:[{pts:B.route([[165,215],[260,280],[380,330],[480,380],[586,420]],16),frac:Math.max(.25,k),w:4+14*k}]});
  g.save();g.shadowColor='rgba(11,18,51,.45)';g.shadowBlur=60;g.shadowOffsetY=24;g.drawImage(host,90,470,900,700);g.restore();host.remove();
  /* your tries, one row each: white = right spot, yellow = wrong spot, faint = not in it */
  (rows||[]).forEach((row,ri)=>row.forEach((c,ci)=>{const x=W/2+(ci-(row.length-1)/2)*84,y=1250+ri*72;g.beginPath();g.arc(x,y,26,0,7);
    g.fillStyle=c==='exact'?'#fff':c==='near'?'#F5C63C':'rgba(255,255,255,.3)';g.fill();}));
  /* type: big, white, few words */
  g.fillStyle='#fff';g.textAlign='center';
  g.font='500 46px Inter, system-ui, sans-serif';if(g.letterSpacing!==undefined)g.letterSpacing='10px';g.fillText(first?'PLASTICITY':`${(title||'Plasticity').toUpperCase()} #${num}`,W/2,220);if(g.letterSpacing!==undefined)g.letterSpacing='0px';
  const fr=first&&rows?rows.map(r=>r.filter(c=>c==='exact').length):null;
  g.font='500 150px Inter, system-ui, sans-serif';g.fillText(big||(first?(fr?`${fr[0]} → ${fr[1]}`:'day one'):solved?`${tries}/6`:'X/6'),W/2,400);
  g.font='500 76px Inter, system-ui, sans-serif';g.fillText(label||(first?'first pathway ✨':solved?'wired ✨':'still wiring'),W/2,1250+(rows?rows.length:0)*72+90);
  g.fillStyle='rgba(255,255,255,.85)';g.font='400 40px Inter, system-ui, sans-serif';g.fillText('my brain, today',W/2,1250+(rows?rows.length:0)*72+160);
  return await new Promise(res=>out.toBlob(res,'image/png'));}

function save(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}
async function copyText(t){try{await navigator.clipboard.writeText(t);return true;}catch(e){return false;}}
async function copyImage(blob){try{await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);return true;}catch(e){return false;}}
const phone=()=>!!(navigator.canShare&&navigator.canShare({files:[new File([''],'x.png',{type:'image/png'})]}));

const mobile=/iPhone|iPad|Android/i.test(navigator.userAgent);
/* one app at a time, each the way that app actually accepts a share */
async function to(where,info,toast){const t=text(info),enc=encodeURIComponent(t);
  if(where==='copy'){toast(await copyText(t)?'Copied':'Couldn’t copy');return;}
  if(where==='x'){open('https://x.com/intent/post?text='+enc,'_blank','noopener');return;}
  if(where==='whatsapp'){
    /* the phone app takes the text directly; the Mac app breaks emoji from links, so paste there */
    if(mobile){location.href='whatsapp://send?text='+enc;return;}
    toast(await copyText(t)?'Copied. Paste it in WhatsApp.':'Couldn’t copy');setTimeout(()=>{location.href='whatsapp://send';},700);return;}
  if(where==='imessage'){if(mobile){location.href='sms:&body='+enc;return;}
    toast(await copyText(t)?'Copied. Paste it in Messages.':'Couldn’t copy');setTimeout(()=>{location.href='sms:';},700);return;}
  /* Instagram and Substack need the picture */
  const blob=await image(info),file=new File([blob],'my-brain.png',{type:'image/png'});
  if(phone()){try{await navigator.share(where==='instagram'?{files:[file]}:{files:[file],text:t});}catch(e){}return;}
  if(where==='instagram'){save(blob,'my-brain.png');toast('Picture saved. Post it to your story.');return;}
  if(where==='substack'){await copyText(t);save(blob,'my-brain.png');toast('Copied and picture saved. Paste into a new Note.');setTimeout(()=>open('https://substack.com/notes','_blank','noopener'),900);return;}}

/* ---------- the share sheet: one Share button opens this ---------- */
const APPS=[['whatsapp','WhatsApp','#25D366'],['imessage','iMessage','#34C759'],['x','X','#111318'],['instagram','Instagram','linear-gradient(45deg,#F28C28,#E8508A 50%,#8E5BD6)'],['substack','Substack','#FF6719']];
const GLYPH={whatsapp:'<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M9 8.5c.3 2.6 2.4 5.2 5.5 6.5l1.2-1.4-1.8-1-.8.8a5.5 5.5 0 0 1-2.4-2.4l.8-.8-1-1.8z" fill="#fff"/>',
  imessage:'<path d="M12 4.5c-4.7 0-8.5 3-8.5 6.8 0 2.2 1.3 4.1 3.3 5.3L6 20l3.6-2.1c.8.2 1.6.3 2.4.3 4.7 0 8.5-3 8.5-6.9S16.7 4.5 12 4.5z" fill="#fff"/>',
  x:'<path d="M5 4.5h3.6l10.4 15H15.4zM18.6 4.5 5.4 19.5" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round"/>',
  instagram:'<rect x="4.5" y="4.5" width="15" height="15" rx="4.5" fill="none" stroke="#fff" stroke-width="1.9"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="#fff" stroke-width="1.9"/><circle cx="16.6" cy="7.4" r="1.1" fill="#fff"/>',
  substack:'<path d="M6 5.5h12M6 9h12M6 12.5h12V20l-6-3.4L6 20z" stroke="#fff" stroke-width="1.9" fill="none" stroke-linejoin="round"/>'};
let sheetEl=null;
function sheet(info){
  if(!sheetEl){const st=document.createElement('style');st.textContent=`
.ppsheet{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:0 16px 40px;background:rgba(255,255,255,.985);backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:opacity .3s}
.ppsheet.on{opacity:1;pointer-events:auto}
.ppsheet pre{margin:0 0 28px;font:clamp(18px,3vw,24px)/1.3 system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif;text-align:left;white-space:pre}
.ppsheet .apps{display:flex;gap:clamp(8px,2.6vw,28px);flex-wrap:wrap;justify-content:center}
.ppsheet .app{display:flex;flex-direction:column;align-items:center;gap:8px;background:none;border:0;padding:0;height:auto;min-height:0;width:auto;max-width:none;margin:0;cursor:pointer;font:500 13px Inter,system-ui,sans-serif;color:#111318;transform:translateY(12px);opacity:0;transition:transform .35s cubic-bezier(.4,0,.2,1),opacity .35s}
.ppsheet.on .app{transform:none;opacity:1}
.ppsheet .app i{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:transform .15s}
.ppsheet .app:hover i{transform:scale(1.08)}
.ppsheet .app svg{width:28px;height:28px}
.ppsheet .low{display:flex;gap:28px;margin-top:28px;font-size:14px}
.ppsheet .low button{background:none;border:0;padding:0 0 2px;cursor:pointer;color:#5a5e68;border-bottom:1px solid #e6e6e3;font:inherit}
.pptoast{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:60;font:14px Inter,system-ui,sans-serif;color:#5a5e68;opacity:0;transition:opacity .3s}.pptoast.on{opacity:1}`;document.head.appendChild(st);
    sheetEl=document.createElement('div');sheetEl.className='ppsheet';sheetEl.setAttribute('role','dialog');sheetEl.setAttribute('aria-label','Share');
    sheetEl.innerHTML='<pre></pre><div class="apps">'+APPS.map(([k,n,c],i)=>`<button class="app" type="button" data-k="${k}" style="transition-delay:${i*40}ms"><i style="background:${c}"><svg viewBox="0 0 24 24" aria-hidden="true">${GLYPH[k]}</svg></i>${n}</button>`).join('')+'</div><div class="low"><button type="button" data-k="copy">Copy text</button><button type="button" data-k="close">Close</button></div>';
    document.body.appendChild(sheetEl);
    const tst=document.createElement('div');tst.className='pptoast';tst.setAttribute('aria-live','polite');document.body.appendChild(tst);
    sheetEl.toast=m=>{tst.textContent=m;tst.classList.add('on');setTimeout(()=>tst.classList.remove('on'),2600);};
    sheetEl.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b){if(e.target===sheetEl)close();return;}const k=b.dataset.k;if(k==='close'){close();return;}to(k,sheetEl.info,sheetEl.toast);});
    addEventListener('keydown',e=>{if(e.key==='Escape')close();});}
  const close=()=>sheetEl.classList.remove('on');
  sheetEl.info=info;sheetEl.querySelector('pre').textContent=text(info);requestAnimationFrame(()=>sheetEl.classList.add('on'));sheetEl.querySelector('.app').focus({preventScroll:true});}
window.PPShare={text,grid,image,to,sheet};
})();
