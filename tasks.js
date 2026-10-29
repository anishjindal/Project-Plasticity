/* NeuroAdapt tasks: stimulus generation, trials, scoring and the shared adaptive engine.
   Everything here is deterministic given a seed, so any trial can be reproduced from its log. */
(function(){
const B=window.PPBrain;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const NAVY='#131E4A',NAVY2='#1B2A5C',EDGE='#0B1233',CREAM='#F7EEDD',ORANGE='#e4572e';
function rng(seed){let a=seed>>>0||1;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const shuffle=(a,r)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

/* ---------- the adaptive engine ----------
   Prototype rules from the brief, kept configurable: two eligible blocks at ≥85% step up one variable,
   70–84% holds, two blocks under 65% step down. Never moves on a single response. */
const RULES={up:.85,hold:.70,down:.65,blocks:2};
function Engine(levels,start){this.max=levels-1;this.level=Math.max(0,Math.min(this.max,start||0));this.blocks=[];}
Engine.prototype.endBlock=function(acc){this.blocks.push({level:this.level,acc});
  const last=this.blocks.slice(-RULES.blocks);const same=last.length===RULES.blocks&&last.every(b=>b.level===this.level);
  if(same&&last.every(b=>b.acc>=RULES.up)&&this.level<this.max){this.level++;return 1;}
  if(same&&last.every(b=>b.acc<RULES.down)&&this.level>0){this.level--;return -1;}
  return 0;};

/* ---------- canvas ---------- */
function fit(cv){const dpr=Math.min(2,devicePixelRatio||1),w=cv.clientWidth||cv.parentElement.clientWidth||320;if(cv.width!==Math.round(w*dpr)){cv.width=cv.height=Math.round(w*dpr);}const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);return {g,w};}
function disc(g,w){g.clearRect(0,0,w,w);const c=w/2,gr=g.createRadialGradient(c,c*.9,8,c,c,c);gr.addColorStop(0,NAVY2);gr.addColorStop(1,NAVY);
  g.fillStyle=EDGE;g.beginPath();g.arc(c,c,c-1,0,7);g.fill();g.fillStyle=gr;g.beginPath();g.arc(c,c,c-4,0,7);g.fill();}
function pointer(cv){return new Promise(res=>{const h=e=>{const b=cv.getBoundingClientRect();cv.removeEventListener('pointerdown',h);res({x:e.clientX-b.left,y:e.clientY-b.top,t:performance.now()});};cv.addEventListener('pointerdown',h);});}

/* ============ PERCEPTION LABYRINTH ============
   A target appears briefly; pick the one of three that matches. The difference shrinks as you master it.
   Each step of the ladder changes exactly one variable: the difference, the exposure, or the clutter. */
const P_DELTA=[1,.75,.55,.55,.4,.4,.28,.28,.2,.2,.13,.09];
const P_EXPO =[800,800,800,550,550,550,550,400,400,400,400,400];
const P_CLUT =[0,0,0,0,0,8,8,8,8,16,16,16];
/* what the pathway changes about the actual judgement, not just the look */
const STIM={
  orientation:{label:'Which matches the angle?',base:0,delta:40,
    draw(g,x,y,r,v){g.save();g.beginPath();g.arc(x,y,r,0,7);g.clip();g.translate(x,y);g.rotate(v*Math.PI/180);g.fillStyle=CREAM;for(let i=-4;i<4;i+=2)g.fillRect(i*r/4,-r,r/4,2*r);g.restore();}},
  contrast:{label:'Which matches the shade?',base:.5,delta:.32,clamp:[.08,1],
    draw(g,x,y,r,v){g.save();g.beginPath();g.arc(x,y,r,0,7);g.clip();g.translate(x,y);g.rotate(Math.PI/4);g.fillStyle=`rgba(247,238,221,${v})`;for(let i=-4;i<4;i+=2)g.fillRect(i*r/4,-r,r/4,2*r);g.restore();}},
  motion:{label:'Which matches the ball’s path?',base:20,delta:40,
    draw(g,x,y,r,v){const a=v*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a);g.save();g.lineCap='round';
      for(let k=0;k<6;k++){g.strokeStyle=`rgba(247,238,221,${.12+k*.12})`;g.lineWidth=r*.06;g.beginPath();g.moveTo(x-dx*r*(.85-k*.13),y-dy*r*(.85-k*.13));g.lineTo(x-dx*r*(.72-k*.13),y-dy*r*(.72-k*.13));g.stroke();}
      g.fillStyle='#F28C28';g.beginPath();g.arc(x+dx*r*.25,y+dy*r*.25,r*.18,0,7);g.fill();g.restore();}},
  rhythm:{label:'Which matches the rhythm?',base:0,delta:.7,
    draw(g,x,y,r,v){const sp=r*.36,xs=[-2,-1,0+v*.6,1,2].map(i=>x+i*sp);g.fillStyle='rgba(247,238,221,.25)';g.fillRect(x-r*.85,y-1,r*1.7,2);
      xs.forEach((px,i)=>{g.fillStyle=i===2?'#F5C63C':CREAM;g.beginPath();g.arc(px,y,r*(i%2?.1:.14),0,7);g.fill();});}},
  dots:{label:'Which has the same amount?',base:18,delta:.5,integer:true,
    draw(g,x,y,r,v,seed){const rr=rng(seed||7),pts=[];let tries=0;while(pts.length<v&&tries<3000){tries++;const a=rr()*7,d=Math.sqrt(rr())*r*.82,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;if(pts.every(p=>Math.hypot(p[0]-px,p[1]-py)>r*.13))pts.push([px,py]);}
      g.fillStyle=CREAM;pts.forEach(p=>{g.beginPath();g.arc(p[0],p[1],r*.05,0,7);g.fill();});}},
  glyph:{label:'Which letter matches?',base:0,delta:40,
    draw(g,x,y,r,v){g.save();g.translate(x,y);g.rotate(v*Math.PI/180);g.fillStyle=CREAM;g.font=`500 ${r*1.1}px Inter, system-ui, sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('R',0,r*.04);g.restore();}}
};
const PATH_STIM={sports:'motion',arts:'contrast',music:'rhythm',academics:'dots',languages:'glyph'};
function perceptionValues(type,level,r){const S=STIM[type],d=S.delta*P_DELTA[level];const v=S.base+(r()-.5)*(type==='orientation'||type==='motion'||type==='glyph'?60:0);
  let opts=[v,v+d,v-d];if(S.integer){const n=Math.round(v),k=Math.max(1,Math.round(n*d));opts=[n,n+k,n-k];}
  if(S.clamp)opts=opts.map(o=>Math.max(S.clamp[0],Math.min(S.clamp[1],o)));return opts;}
async function perceptionTrial(cv,{type,level,seed,say}){const r=rng(seed),S=STIM[type];const [target,...others]=perceptionValues(type,level,r);
  const choices=shuffle([target,...others],r),answer=choices.indexOf(target),dotSeed=Math.floor(r()*1e9);
  const {g,w}=fit(cv),c=w/2,R=w*.2;say&&say(S.label);
  const clutter=()=>{const n=P_CLUT[level];for(let i=0;i<n;i++){g.fillStyle='rgba(247,238,221,.16)';g.beginPath();g.arc(c+(r()-.5)*w*.8,c+(r()-.5)*w*.8,w*.012,0,7);g.fill();}};
  disc(g,w);await wait(350);disc(g,w);clutter();S.draw(g,c,c,R,target,dotSeed);await wait(P_EXPO[level]);
  /* a brief mask so the image can't linger */
  disc(g,w);for(let i=0;i<160;i++){g.fillStyle=`rgba(247,238,221,${r()*.25})`;g.fillRect(c+(r()-.5)*w*.6,c+(r()-.5)*w*.6,3,3);}await wait(250);
  const pos=[.22,.5,.78].map(f=>[w*f,c]),cr=w*.12;
  disc(g,w);clutter();choices.forEach((v,i)=>{g.fillStyle='rgba(11,18,51,.6)';g.beginPath();g.arc(pos[i][0],pos[i][1],cr+4,0,7);g.fill();S.draw(g,pos[i][0],pos[i][1],cr,v,dotSeed+(i===answer?0:i+1));});
  const t0=performance.now();let pick=-1,at=0;
  const key=new Promise(res=>{const h=e=>{const k={'1':0,'2':1,'3':2,ArrowLeft:0,ArrowDown:1,ArrowRight:2}[e.key];if(k!=null){removeEventListener('keydown',h);res({i:k,t:performance.now()});}};addEventListener('keydown',h);cv._keyh=h;});
  while(pick<0){const p=await Promise.race([pointer(cv),key]);if(p.i!=null){pick=p.i;at=p.t;break;}const i=pos.findIndex(q=>Math.hypot(q[0]-p.x,q[1]-p.y)<cr*1.3);if(i>=0){pick=i;at=p.t;}}
  removeEventListener('keydown',cv._keyh);
  const ok=pick===answer;g.lineWidth=4;g.strokeStyle=ORANGE;g.beginPath();g.arc(pos[answer][0],pos[answer][1],cr+9,0,7);g.stroke();
  if(!ok){g.strokeStyle='rgba(247,238,221,.6)';g.setLineDash([5,6]);g.beginPath();g.arc(pos[pick][0],pos[pick][1],cr+9,0,7);g.stroke();g.setLineDash([]);}
  say&&say(ok?'Yes.':'That one.');await wait(ok?450:900);
  return {task:'perception',type,level,seed,delta:STIM[type].delta*P_DELTA[level],exposure:P_EXPO[level],clutter:P_CLUT[level],answer,pick,correct:ok,rt:Math.round(at-t0)};}

/* ============ ATTENTION NEXUS ============
   Some objects light up, then everything moves. Find the ones you were tracking.
   The pathway decides which demand grows first; every step changes one variable. */
const A_VARS={targets:[2,3,4,5],objects:[6,8,10,12],speed:[.18,.22,.27,.33,.4],duration:[3,4.5,6,7.5],crowd:[.075,.09,.105]};
const A_ORDER={sports:['speed','targets','objects','duration','crowd'],arts:['crowd','objects','targets','speed','duration'],music:['duration','targets','speed','objects','crowd'],
  academics:['targets','objects','speed','duration','crowd'],languages:['objects','crowd','targets','speed','duration'],standard:['targets','speed','objects','duration','crowd']};
const A_KIND={sports:'ball',arts:'petal',music:'note',academics:'star',languages:'bubble',standard:'dots'};
function attentionLadder(path){const order=A_ORDER[path]||A_ORDER.standard,idx={targets:0,objects:0,speed:0,duration:0,crowd:0},out=[];
  const snap=()=>({targets:A_VARS.targets[idx.targets],objects:A_VARS.objects[idx.objects],speed:A_VARS.speed[idx.speed],duration:A_VARS.duration[idx.duration],crowd:A_VARS.crowd[idx.crowd]});
  out.push(snap());let k=0,guard=0;while(out.length<12&&guard++<60){const v=order[k%order.length];k++;if(idx[v]<A_VARS[v].length-1){idx[v]++;const s=snap();if(s.targets<s.objects-1)out.push(s);else idx[v]--;}}return out;}
async function attentionTrial(cv,{path,level,seed,say,reduced,override}){const r=rng(seed),L=override||attentionLadder(path)[level];const {g,w}=fit(cv),c=w/2,R=w*.46,or=R*L.crowd;
  const kind=A_KIND[path]||'dots';const objs=[];let tries=0;
  while(objs.length<L.objects&&tries<5000){tries++;const a=r()*7,d=Math.sqrt(r())*R*.78,x=c+Math.cos(a)*d,y=c+Math.sin(a)*d;if(objs.every(o=>Math.hypot(o.x-x,o.y-y)>or*2.6)){const h=r()*7;objs.push({x,y,vx:Math.cos(h)*L.speed*R,vy:Math.sin(h)*L.speed*R,rot:r()*6});}}
  const targets=shuffle([...objs.keys()],r).slice(0,L.targets);
  const draw=(hl,picks,reveal)=>{disc(g,w);objs.forEach((o,i)=>{const isT=targets.includes(i);
    if(hl&&isT){g.fillStyle='rgba(228,87,46,.35)';g.beginPath();g.arc(o.x,o.y,or*1.9,0,7);g.fill();}
    if(reveal&&isT){g.strokeStyle=ORANGE;g.lineWidth=3;g.beginPath();g.arc(o.x,o.y,or*1.7,0,7);g.stroke();}
    if(picks&&picks.includes(i)){g.fillStyle=reveal&&!isT?'rgba(247,238,221,.25)':'rgba(228,87,46,.85)';g.beginPath();g.arc(o.x,o.y,or*1.45,0,7);g.fill();}
    B.drawMotif(g,{kind,x:o.x,y:o.y,s:or,rot:kind==='ball'?o.rot:0,c:hl&&isT?ORANGE:CREAM,c2:hl&&isT?ORANGE:CREAM});});};
  say&&say(`Watch the ${L.targets} lit ones.`);
  const cue=1800,t1=performance.now();await new Promise(res=>{const f=t=>{draw(Math.floor((t-t1)/300)%2===0||t-t1>1200,null,false);t-t1<cue?requestAnimationFrame(f):res();};requestAnimationFrame(f);});
  draw(false,null,false);await wait(350);say&&say('Keep your eyes on them.');
  /* move: straight lines, bouncing off the rim, with a small seeded change of heading each second */
  await new Promise(res=>{let last=performance.now(),el=0,nextTurn=1;const f=t=>{const dt=Math.min(.05,(t-last)/1000);last=t;el+=dt;
    if(el>nextTurn){nextTurn+=1;objs.forEach(o=>{const a=Math.atan2(o.vy,o.vx)+(r()-.5)*.9,s=Math.hypot(o.vx,o.vy);o.vx=Math.cos(a)*s;o.vy=Math.sin(a)*s;});}
    objs.forEach(o=>{o.x+=o.vx*dt;o.y+=o.vy*dt;o.rot+=dt*2;const dx=o.x-c,dy=o.y-c,d=Math.hypot(dx,dy);
      if(d+or>R*.94){const nx=dx/d,ny=dy/d,dot=o.vx*nx+o.vy*ny;if(dot>0){o.vx-=2*dot*nx;o.vy-=2*dot*ny;}o.x=c+nx*(R*.94-or);o.y=c+ny*(R*.94-or);}});
    draw(false,null,false);el<L.duration?requestAnimationFrame(f):res();};requestAnimationFrame(f);});
  say&&say(`Tap the ${L.targets} you tracked.`);const picks=[],times=[];const t0=performance.now();
  while(picks.length<L.targets){const p=await pointer(cv);let best=-1,bd=1e9;objs.forEach((o,i)=>{const d=Math.hypot(o.x-p.x,o.y-p.y);if(d<bd&&!picks.includes(i)){bd=d;best=i;}});
    if(best>=0&&bd<or*2.2){picks.push(best);times.push(Math.round(p.t-t0));draw(false,picks,false);}}
  const hits=picks.filter(i=>targets.includes(i)).length;draw(false,picks,true);say&&say(hits===L.targets?'All of them.':`${hits} of ${L.targets}.`);await wait(hits===L.targets?600:1100);
  return {task:'attention',path,level,seed,params:L,targets,picks,hits,score:hits/L.targets,correct:hits===L.targets,rt:times};}

/* ============ MEMORY (baseline only for now): ordered recall on nine neurons ============ */
const M_POS=[[.5,.2],[.25,.32],[.75,.3],[.38,.5],[.62,.48],[.2,.62],[.8,.64],[.42,.78],[.64,.8]];
async function memoryTrial(cv,{len,seed,say}){const r=rng(seed),{g,w}=fit(cv),rr=w*.065;const seq=shuffle([...M_POS.keys()],r).slice(0,len);
  const draw=(lit,picks)=>{disc(g,w);M_POS.forEach(([fx,fy],i)=>{g.fillStyle=lit===i?'#FFF7DC':picks&&picks.includes(i)?'rgba(255,240,190,.55)':'rgba(247,238,221,.12)';g.beginPath();g.arc(fx*w,fy*w,rr,0,7);g.fill();});};
  say&&say('Watch the order.');draw(-1);await wait(500);for(const i of seq){draw(i);await wait(600);draw(-1);await wait(180);}
  say&&say('Tap them in the same order.');const picks=[],t0=performance.now();
  while(picks.length<len){const p=await pointer(cv);const i=M_POS.findIndex(([fx,fy])=>Math.hypot(fx*w-p.x,fy*w-p.y)<rr*1.5);if(i>=0&&!picks.includes(i)){picks.push(i);draw(-1,picks);}}
  const ok=picks.every((p,k)=>p===seq[k]);say&&say(ok?'Exactly.':'Not quite.');await wait(ok?450:800);
  return {task:'memory',len,seed,seq,picks,correct:ok,rt:Math.round(performance.now()-t0)};}

window.PPTasks={RULES,Engine,STIM,PATH_STIM,P_DELTA,perceptionTrial,attentionLadder,attentionTrial,memoryTrial,rng,PERCEPTION_LEVELS:P_DELTA.length,ATTENTION_LEVELS:12};
})();
