/* The landing-page brain, shared by onboarding and the games.
   Same contour, motifs, palette and pathways as index.html, packaged so a page can
   grow motifs in, wire pathways and fill it navy step by step. */
(function(){
const W=720,H=560;
const NAVY='#131E4A',NAVY2='#1B2A5C',EDGE='#0B1233';
const C={red:'#E8472E',orange:'#F28C28',yellow:'#F5C63C',green:'#4CAF6E',green2:'#2F8F5B',blue:'#2E86DE',sky:'#7ED0E0',purple:'#8E5BD6',pink:'#E8508A',cream:'#F7EEDD'};
const CL=Object.values(C);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
function rng(seed){let s=seed;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};}
const scratch=document.createElement('canvas').getContext('2d');
function smooth(pts){const p=new Path2D();const n=pts.length;p.moveTo(pts[0][0],pts[0][1]);for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];p.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}p.closePath();return p;}
const base=[[92,300],[98,232],[124,166],[170,116],[232,82],[302,62],[382,56],[458,66],[528,92],[584,138],[622,198],[636,266],[626,336],[590,396],[532,436],[474,456],[446,470],[440,522],[400,526],[388,470],[350,462],[282,450],[212,426],[152,386],[110,340]];
const brain=smooth(base);
{for(let i=0;i<16;i++){const a=base[i],b=base[i+1];for(let k=0;k<2;k++){const t=(k+.5)/2;const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;const r=19+((i*7+k*3)%5)*2.6;brain.moveTo(x+r,y);brain.arc(x,y,r,0,Math.PI*2);}}
  for(const [x,y,r] of [[130,372,17],[180,412,16],[250,442,15],[320,457,14],[560,420,14],[610,364,15]]){brain.moveTo(x+r,y);brain.arc(x,y,r,0,Math.PI*2);}}
const inside=(x,y)=>scratch.isPointInPath(brain,x,y);

function drawMotif(g,m){g.save();g.translate(m.x,m.y);g.rotate(m.rot||0);const s=m.s,c=m.c||C.red,c2=m.c2||C.yellow;g.lineJoin='round';g.lineCap='round';
  switch(m.kind){
    case 'leaf':g.fillStyle=c;g.beginPath();g.moveTo(0,-s);g.quadraticCurveTo(s*.9,-s*.3,0,s);g.quadraticCurveTo(-s*.9,-s*.3,0,-s);g.fill();g.strokeStyle=NAVY;g.globalAlpha*=.55;g.lineWidth=Math.max(1,s*.07);g.beginPath();g.moveTo(0,-s*.75);g.lineTo(0,s*.75);g.stroke();break;
    case 'sprig':{g.strokeStyle=c;g.lineWidth=Math.max(1.2,s*.09);g.beginPath();g.moveTo(0,s);g.quadraticCurveTo(s*.2,0,0,-s);g.stroke();g.fillStyle=c;for(let i=0;i<6;i++){const y=s*.8-i*s*.3;const d=i%2?1:-1;g.beginPath();g.ellipse(d*s*.22,y,s*.24,s*.1,d*.5,0,7);g.fill();}break;}
    case 'frond':{g.fillStyle=c;for(let i=0;i<7;i++){const y=s*.9-i*s*.3;g.beginPath();g.ellipse(0,y,s*.5-i*s*.05,s*.11,0,0,7);g.fill();}break;}
    case 'flower':g.fillStyle=c;for(let i=0;i<6;i++){g.save();g.rotate(i*Math.PI/3);g.beginPath();g.ellipse(0,-s*.6,s*.32,s*.55,0,0,7);g.fill();g.restore();}g.fillStyle=c2===c?C.yellow:c2;g.beginPath();g.arc(0,0,s*.3,0,7);g.fill();break;
    case 'petal':g.fillStyle=c;for(let i=0;i<5;i++){g.save();g.rotate(i*Math.PI*2/5);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(s*.55,-s*.6,0,-s);g.quadraticCurveTo(-s*.55,-s*.6,0,0);g.fill();g.restore();}g.fillStyle=c2;g.beginPath();g.arc(0,0,s*.2,0,7);g.fill();break;
    case 'tulip':{g.fillStyle=c;g.beginPath();g.moveTo(-s*.5,s*.2);g.quadraticCurveTo(-s*.55,-s*.6,-s*.2,-s*.9);g.lineTo(0,-s*.55);g.lineTo(s*.2,-s*.9);g.quadraticCurveTo(s*.55,-s*.6,s*.5,s*.2);g.quadraticCurveTo(0,s*.5,-s*.5,s*.2);g.fill();g.strokeStyle=C.green;g.lineWidth=Math.max(1.5,s*.1);g.beginPath();g.moveTo(0,s*.3);g.lineTo(0,s);g.stroke();break;}
    case 'gear':g.fillStyle=c;g.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,rr=(i%2?s:s*.78);g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.fill();g.fillStyle=NAVY;g.beginPath();g.arc(0,0,s*.32,0,7);g.fill();break;
    case 'bolt':g.fillStyle=c;g.beginPath();g.moveTo(-s*.1,-s);g.lineTo(s*.45,-s*.15);g.lineTo(s*.05,-s*.1);g.lineTo(s*.2,s);g.lineTo(-s*.45,s*.1);g.lineTo(-s*.02,s*.05);g.closePath();g.fill();break;
    case 'spark':g.strokeStyle=c;g.lineWidth=Math.max(1.2,s*.16);for(let i=0;i<8;i++){g.save();g.rotate(i*Math.PI/4);g.beginPath();g.moveTo(0,s*.35);g.lineTo(0,s*(i%2?.7:1));g.stroke();g.restore();}g.fillStyle=c2;g.beginPath();g.arc(0,0,s*.22,0,7);g.fill();break;
    case 'heart':g.fillStyle=c;g.beginPath();g.moveTo(0,s*.8);g.bezierCurveTo(-s*1.1,s*.1,-s*.7,-s*.9,0,-s*.35);g.bezierCurveTo(s*.7,-s*.9,s*1.1,s*.1,0,s*.8);g.fill();break;
    case 'dots':g.fillStyle=c;for(let i=0;i<5;i++){g.beginPath();g.arc(Math.cos(i*1.26)*s*.6,Math.sin(i*1.26)*s*.6,s*.2,0,7);g.fill();}break;
    case 'squig':g.strokeStyle=c;g.lineWidth=Math.max(1.5,s*.18);g.beginPath();g.moveTo(-s,0);for(let i=1;i<=6;i++){g.quadraticCurveTo(-s+(i-.5)*s/3,(i%2?-1:1)*s*.5,-s+i*s/3,0);}g.stroke();break;
    case 'bulb':{g.fillStyle=C.yellow;g.beginPath();g.arc(0,-s*.3,s*.62,0,7);g.fill();g.beginPath();g.moveTo(-s*.34,s*.1);g.lineTo(s*.34,s*.1);g.lineTo(s*.28,s*.4);g.lineTo(-s*.28,s*.4);g.closePath();g.fill();g.fillStyle=C.red;g.fillRect(-s*.28,s*.42,s*.56,s*.14);g.fillRect(-s*.22,s*.6,s*.44,s*.12);g.strokeStyle=NAVY;g.lineWidth=Math.max(1.4,s*.07);g.beginPath();g.moveTo(-s*.18,s*.1);g.lineTo(-s*.18,-s*.2);g.quadraticCurveTo(0,-s*.45,s*.18,-s*.2);g.lineTo(s*.18,s*.1);g.stroke();break;}
    case 'rainbow':{const cs=[C.red,C.orange,C.yellow,C.green,C.blue,C.purple];for(let i=0;i<6;i++){g.strokeStyle=cs[i];g.lineWidth=s*.13;g.beginPath();g.arc(0,s*.35,s*(1-i*.13),Math.PI,0);g.stroke();}break;}
    case 'cloud':{g.fillStyle=c;for(const [cx,cy,r] of [[-s*.45,s*.1,s*.32],[0,-s*.1,s*.42],[s*.45,s*.12,s*.3]]){g.beginPath();g.arc(cx,cy,r,0,7);g.fill();}g.fillRect(-s*.6,s*.05,s*1.2,s*.35);break;}
    case 'plane':{g.fillStyle=C.cream;g.beginPath();g.moveTo(s,-s*.9);g.lineTo(-s*.9,s*.1);g.lineTo(-s*.1,s*.25);g.closePath();g.fill();g.fillStyle=C.pink;g.beginPath();g.moveTo(s,-s*.9);g.lineTo(-s*.1,s*.25);g.lineTo(s*.2,s*.9);g.closePath();g.fill();break;}
    case 'bubble':{g.fillStyle=c;g.beginPath();g.ellipse(0,-s*.15,s,s*.72,0,0,7);g.fill();g.beginPath();g.moveTo(-s*.5,s*.4);g.lineTo(-s*.7,s*.95);g.lineTo(-s*.05,s*.5);g.closePath();g.fill();g.fillStyle=C.cream;for(let i=-1;i<=1;i++){g.beginPath();g.arc(i*s*.32,-s*.15,s*.1,0,7);g.fill();}break;}
    case 'key':{g.strokeStyle=c;g.lineWidth=Math.max(2,s*.16);g.beginPath();g.arc(0,-s*.55,s*.4,0,7);g.stroke();g.beginPath();g.moveTo(0,-s*.15);g.lineTo(0,s);g.moveTo(0,s*.55);g.lineTo(s*.35,s*.55);g.moveTo(0,s*.85);g.lineTo(s*.3,s*.85);g.stroke();break;}
    case 'magnifier':{g.strokeStyle=c;g.lineWidth=Math.max(2,s*.16);g.beginPath();g.arc(-s*.2,-s*.2,s*.55,0,7);g.stroke();g.beginPath();g.moveTo(s*.2,s*.2);g.lineTo(s*.75,s*.75);g.stroke();break;}
    case 'puzzle':{g.fillStyle=c;const h=s*.55;g.beginPath();g.moveTo(-h,-h);g.lineTo(-s*.2,-h);g.arc(0,-h,s*.22,Math.PI,0,true);g.lineTo(h,-h);g.lineTo(h,-s*.2);g.arc(h,0,s*.22,-Math.PI/2,Math.PI/2);g.lineTo(h,h);g.lineTo(-h,h);g.lineTo(-h,s*.2);g.arc(-h,0,s*.22,Math.PI/2,-Math.PI/2);g.closePath();g.fill();break;}
    case 'pencil':{g.save();g.rotate(-.7);g.fillStyle=c;g.fillRect(-s,-s*.18,s*1.5,s*.36);g.fillStyle=C.cream;g.beginPath();g.moveTo(s*.5,-s*.18);g.lineTo(s*.9,0);g.lineTo(s*.5,s*.18);g.closePath();g.fill();g.fillStyle=C.pink;g.fillRect(-s*1.15,-s*.18,s*.18,s*.36);g.restore();break;}
    case 'question':{g.strokeStyle=c;g.lineWidth=Math.max(2,s*.2);g.beginPath();g.arc(0,-s*.45,s*.4,Math.PI*1.1,Math.PI*.35);g.quadraticCurveTo(0,s*.05,0,s*.3);g.stroke();g.fillStyle=c;g.beginPath();g.arc(0,s*.75,s*.14,0,7);g.fill();break;}
    case 'scribble':{g.strokeStyle=c;g.lineWidth=Math.max(1.5,s*.09);g.beginPath();for(let i=0;i<=40;i++){const t=i/40;const a=t*Math.PI*7;const r=s*(.25+.6*Math.sin(t*Math.PI));g.lineTo(Math.cos(a)*r+t*s*.3-s*.15,Math.sin(a)*r*.7);}g.stroke();break;}
    case 'arrow':{g.strokeStyle=c;g.lineWidth=Math.max(2,s*.18);g.beginPath();g.moveTo(-s,s*.4);g.quadraticCurveTo(-s*.2,-s*.6,s*.7,-s*.5);g.stroke();g.fillStyle=c;g.beginPath();g.moveTo(s,-s*.55);g.lineTo(s*.45,-s*.85);g.lineTo(s*.55,-s*.15);g.closePath();g.fill();break;}
    case 'star':{g.fillStyle=c;g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?s*.45:s;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.fill();break;}
    case 'egg':{g.fillStyle=c;g.beginPath();g.ellipse(0,0,s*.65,s*.9,.3,0,7);g.fill();break;}
    /* new for interests: a music note and a ball, drawn in the same hand */
    case 'note':{g.fillStyle=c;g.strokeStyle=c;g.lineWidth=Math.max(1.6,s*.14);g.beginPath();g.ellipse(-s*.25,s*.55,s*.34,s*.24,-.4,0,7);g.fill();g.beginPath();g.moveTo(s*.06,s*.5);g.lineTo(s*.06,-s*.85);g.quadraticCurveTo(s*.55,-s*.6,s*.5,-s*.15);g.stroke();break;}
    case 'ball':{g.fillStyle=c;g.beginPath();g.arc(0,0,s*.75,0,7);g.fill();g.strokeStyle=C.cream;g.lineWidth=Math.max(1.2,s*.09);g.beginPath();g.arc(0,0,s*.75,-.6,.6);g.stroke();g.beginPath();g.arc(0,0,s*.75,Math.PI-.6,Math.PI+.6);g.stroke();g.beginPath();g.moveTo(0,-s*.75);g.lineTo(0,s*.75);g.stroke();break;}
  }
  g.restore();}

/* closed contour → gently wavy line drawing, same as the landing page */
function crC(pts,i,t){const n=pts.length;const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];const t2=t*t,t3=t2*t;
  return [.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)];}
const wav=[];{const samp=[];for(let i=0;i<base.length;i++)for(let k=0;k<6;k++)samp.push(crC(base,i,k/6));
  const N=samp.length;for(let i=0;i<N;i++){const q=samp[i],q2=samp[(i+1)%N];const dx=q2[0]-q[0],dy=q2[1]-q[1],len=Math.hypot(dx,dy)||1;const stem=q[1]>452&&q[0]>372&&q[0]<468;const amp=stem?0:9*(.5+.5*Math.sin(i*.9));wav.push([q[0]-dy/len*amp,q[1]+dx/len*amp]);}}
const wavPath=smooth(wav);
const FOLDS=[[[150,330],[240,318],[330,352],[430,420]],[[478,398],[505,384],[540,382],[575,394]],[[484,418],[512,404],[546,404],[578,414]],[[494,438],[520,426],[548,426],[574,434]]];
/* open route → dense points along a smooth curve */
function cr2(R,i,t){const p0=R[Math.max(0,i-1)],p1=R[i],p2=R[Math.min(R.length-1,i+1)],p3=R[Math.min(R.length-1,i+2)];const t2=t*t,t3=t2*t;
  return [.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)];}
function route(R,seg=14){const pts=[];for(let i=0;i<R.length-1;i++)for(let k=0;k<seg;k++)pts.push(cr2(R,i,k/seg));pts.push(R[R.length-1]);return pts;}

/* scatter motifs of the given kinds around an anchor, inside the brain, avoiding ones already placed */
function scatter(placed,anchor,kinds,count,seed,spread=95){const r=rng(seed);const out=[];let tries=0;
  while(out.length<count&&tries<4000){tries++;const s=out.length===0?24+r()*6:9+r()*9;const a=r()*Math.PI*2,d=Math.sqrt(r())*spread*(out.length===0?.15:1);
    const x=anchor[0]+Math.cos(a)*d,y=anchor[1]+Math.sin(a)*d;if(!inside(x,y))continue;
    let ok=true;for(const q of [[s,0],[-s,0],[0,s],[0,-s]])if(!inside(x+q[0]*.8,y+q[1]*.8)){ok=false;break;}if(!ok)continue;
    if(placed.concat(out).some(m=>Math.hypot(m.x-x,m.y-y)<(m.s+s)*.86))continue;
    out.push({kind:kinds[out.length%kinds.length],x,y,s,rot:out.length===0?0:r()*6.28-3.14,c:CL[Math.floor(r()*CL.length)],c2:CL[Math.floor(r()*CL.length)],k:0});}
  return out;}

/* one renderer per canvas. state = {motifs:[{...,k}], fill:0..1, paths:[{pts,frac,w,glow}], sparks:[{x,y,r,a}], outline:0..1} */
function renderer(cv){const g=cv.getContext('2d');const mk=document.createElement('canvas'),mg=mk.getContext('2d');
  const plate=document.createElement('canvas');let plateScale=0;
  function buildPlate(scale){if(plateScale===scale)return;plateScale=scale;plate.width=W*scale;plate.height=H*scale;const pg=plate.getContext('2d');pg.setTransform(scale,0,0,scale,0,0);
    pg.save();pg.fillStyle=EDGE;for(let a=0;a<10;a++){pg.save();pg.translate(Math.cos(a*Math.PI/5)*2.6,Math.sin(a*Math.PI/5)*2.6);pg.fill(brain);pg.restore();}pg.restore();
    pg.fillStyle=NAVY;pg.fill(brain);pg.save();pg.clip(brain);const grd=pg.createRadialGradient(360,260,40,360,260,380);grd.addColorStop(0,NAVY2);grd.addColorStop(1,NAVY);pg.fillStyle=grd;pg.fillRect(0,0,W,H);pg.restore();}
  return function draw(st){const dpr=Math.min(2,devicePixelRatio||1);const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
    if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);const fit=Math.min(w/W,h/H)*.96;const ox=(w-W*fit)/2,oy=(h-H*fit)/2;buildPlate(Math.min(3,dpr*fit*1.15));
    const fill=st.fill||0,motifs=st.motifs||[],paths=st.paths||[];
    /* navy grows out around whatever has been added, then completes */
    mk.width=cv.width;mk.height=cv.height;mg.setTransform(dpr,0,0,dpr,0,0);mg.clearRect(0,0,w,h);mg.save();mg.translate(ox,oy);mg.scale(fit,fit);
    const blob=(x,y,r,k)=>{if(k<=0)return;const gr=mg.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(0,0,0,'+k+')');gr.addColorStop(.55,'rgba(0,0,0,'+k+')');gr.addColorStop(1,'rgba(0,0,0,0)');mg.fillStyle=gr;mg.beginPath();mg.arc(x,y,r,0,7);mg.fill();};
    for(const m of motifs)blob(m.x,m.y,m.s*2.5,sm(m.k));
    for(const p of paths){const n=Math.max(2,Math.round(p.pts.length*clamp(p.frac,0,1)));for(let i=0;i<n;i+=3)blob(p.pts[i][0],p.pts[i][1],26,.9);}
    if(fill>0){mg.fillStyle='rgba(0,0,0,'+fill+')';mg.fillRect(-ox/fit,-oy/fit,w/fit,h/fit);}
    mg.restore();mg.globalCompositeOperation='source-in';mg.drawImage(plate,ox,oy,W*fit,H*fit);mg.globalCompositeOperation='source-over';
    g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(mk,0,0);g.restore();
    g.save();g.translate(ox,oy);g.scale(fit,fit);
    const ol=(st.outline==null?1:st.outline)*(1-fill);
    if(ol>0){g.save();g.globalAlpha=ol;g.strokeStyle='#1b2a5c';g.lineWidth=2.2/Math.max(.6,fit);g.lineJoin='round';g.stroke(wavPath);g.globalAlpha=ol*.55;g.lineWidth=1.6/Math.max(.6,fit);for(const f of FOLDS){g.beginPath();g.moveTo(f[0][0],f[0][1]);g.bezierCurveTo(f[1][0],f[1][1],f[2][0],f[2][1],f[3][0],f[3][1]);g.stroke();}g.restore();}
    g.save();g.clip(brain);for(const m of motifs){const k=sm(m.k);if(k<=0)continue;g.save();g.translate(m.x,m.y);g.scale(k,k);g.translate(-m.x,-m.y);g.globalAlpha=k*(m.alpha==null?1:m.alpha);drawMotif(g,m);g.restore();}g.restore();
    /* pathways: cream on a dark underlay so they read over the art */
    for(const p of paths){const n=Math.max(2,Math.round(p.pts.length*clamp(p.frac,0,1)));if(p.frac<=0)continue;const tr=()=>{g.beginPath();g.moveTo(p.pts[0][0],p.pts[0][1]);for(let i=1;i<n;i++)g.lineTo(p.pts[i][0],p.pts[i][1]);g.stroke();};
      g.save();g.lineCap='round';g.lineJoin='round';g.strokeStyle='rgba(11,18,51,.85)';g.lineWidth=(p.w||5)+7;tr();g.strokeStyle='rgba(255,240,190,'+(p.alpha==null?1:p.alpha)+')';g.lineWidth=p.w||5;tr();
      const e=p.pts[n-1];g.fillStyle='rgba(11,18,51,.85)';g.beginPath();g.arc(e[0],e[1],(p.w||5)+5,0,7);g.fill();g.fillStyle='#FFF7DC';g.beginPath();g.arc(e[0],e[1],(p.w||5)*.9+2,0,7);g.fill();g.restore();}
    for(const s of (st.sparks||[])){if(s.a<=0)continue;g.save();g.globalAlpha=s.a;g.fillStyle='rgba(228,87,46,.25)';g.beginPath();g.arc(s.x,s.y,s.r*2.2,0,7);g.fill();g.fillStyle='#e4572e';g.beginPath();g.arc(s.x,s.y,s.r,0,7);g.fill();g.restore();}
    g.restore();
    return {fit,ox,oy};};}

/* the same small mechanical tick as the landing page, with a pitch so taps can rise */
/* sound is switched off for now; the user will share ideas for it */
let ac=null;const audio={on:false};
function unlock(){if(!audio.on)return;if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}}if(ac.state==='suspended')ac.resume();}
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,unlock,{passive:true}));
function tick(pitch=1,vol=.18){if(!audio.on||!ac||ac.state!=='running')return;const t=ac.currentTime;
  const o=ac.createOscillator(),gn=ac.createGain();o.type='sine';o.frequency.setValueAtTime(1800*pitch,t);o.frequency.exponentialRampToValueAtTime(700*pitch,t+.03);
  gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(vol,t+.003);gn.gain.exponentialRampToValueAtTime(.0001,t+.045);
  const n=ac.createBufferSource(),buf=ac.createBuffer(1,ac.sampleRate*.02,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);n.buffer=buf;
  const ng=ac.createGain();ng.gain.setValueAtTime(.08*vol/.18,t);ng.gain.exponentialRampToValueAtTime(.0001,t+.02);
  o.connect(gn).connect(ac.destination);n.connect(ng).connect(ac.destination);o.start(t);o.stop(t+.05);n.start(t);}
/* a soft two-note chime for "wired" moments */
function chime(){if(!audio.on||!ac||ac.state!=='running')return;const t=ac.currentTime;[[660,0],[990,.09]].forEach(([f,d])=>{const o=ac.createOscillator(),gn=ac.createGain();o.type='sine';o.frequency.value=f;gn.gain.setValueAtTime(.0001,t+d);gn.gain.exponentialRampToValueAtTime(.12,t+d+.01);gn.gain.exponentialRampToValueAtTime(.0001,t+d+.5);o.connect(gn).connect(ac.destination);o.start(t+d);o.stop(t+d+.55);});}

/* interests → which drawings grow, and where in the brain */
const INTERESTS={
  music:{label:'Music',kinds:['note','squig','note','dots','spark'],at:[250,370]},
  sport:{label:'Sport & movement',kinds:['ball','bolt','arrow','heart','spark'],at:[400,140]},
  code:{label:'Code & tech',kinds:['gear','key','puzzle','bolt','dots'],at:[330,300]},
  startups:{label:'Startups & business',kinds:['bulb','arrow','plane','star','gear'],at:[470,230]},
  art:{label:'Art & design',kinds:['rainbow','pencil','scribble','flower','petal'],at:[200,300]},
  writing:{label:'Writing & reading',kinds:['pencil','bubble','question','squig','leaf'],at:[170,210]},
  science:{label:'Science',kinds:['magnifier','spark','egg','dots','bolt'],at:[560,240]},
  languages:{label:'Languages',kinds:['bubble','question','star','squig','dots'],at:[300,190]},
  nature:{label:'Nature & outdoors',kinds:['tulip','leaf','sprig','frond','flower'],at:[520,380]},
  food:{label:'Food & cooking',kinds:['egg','sprig','petal','leaf','heart'],at:[420,400]},
  games:{label:'Games & puzzles',kinds:['puzzle','key','star','question','dots'],at:[390,300]},
  wellbeing:{label:'Wellbeing & mind',kinds:['heart','cloud','sprig','flower','spark'],at:[560,330]},
  other:{label:'Something else',kinds:['spark','star','dots','petal','squig'],at:[300,420]}
};
/* what people want to strengthen → where its pathway lands */
const GOALS={
  focus:{label:'Focus',sub:'Stay with one thing',at:[175,215]},
  memory:{label:'Memory',sub:'Hold more in mind',at:[420,330]},
  speed:{label:'Speed',sub:'Think on your feet',at:[420,115]},
  seeing:{label:'Seeing',sub:'Notice more, faster',at:[590,250]},
  listening:{label:'Listening',sub:'Catch what you hear',at:[250,385]},
  reasoning:{label:'Reasoning',sub:'Work things out',at:[285,150]}
};
const CENTRE=[380,280];
function goalRoute(key){const a=GOALS[key].at;const m=[(CENTRE[0]+a[0])/2+(a[1]-CENTRE[1])*.25,(CENTRE[1]+a[1])/2-(a[0]-CENTRE[0])*.25];return route([CENTRE,m,a],18);}

window.PPBrain={W,H,C,CL,inside,drawMotif,renderer,scatter,route,goalRoute,CENTRE,INTERESTS,GOALS,sm,clamp,rng,tick,chime,audio};
})();
