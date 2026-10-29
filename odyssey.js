/* NeuroAdapt: The Neural Odyssey. One page: onboarding → baseline → Neuroverse → sessions → Learning Atlas.
   Data stays in this browser (key na1). Every number shown comes from logged trials. */
(function(){
const B=PPBrain,T=PPTasks,sm=B.sm;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const KEY='na1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||null;}catch(e){return null;}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(D));}catch(e){}};
let D=load()||{v:1,profile:null,baseline:null,levels:{},sessions:[],trials:[],retention:[],due:null,followups:[]};
const toast=t=>{const el=$('#toast');el.textContent=t;el.classList.add('on');setTimeout(()=>el.classList.remove('on'),2400);};
const day=(t=Date.now())=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const device=()=>innerWidth<700?'phone':'desktop';

/* ---------- views, crossfaded ---------- */
let view='';
function show(id){const go=()=>{$$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+id));view=id;$('#dots').classList.toggle('hide',id!=='onb');scrollTo(0,0);
    if(id==='home')renderHome();if(id==='atlas')renderAtlas();if(id==='settings')renderSettings();};
  /* resolves once the new screen is actually showing, so nothing draws into a hidden canvas */
  if(document.startViewTransition&&view&&document.visibilityState==='visible'&&!document.body.classList.contains('calm')){const t=document.startViewTransition(go);[t.ready,t.finished].forEach(p=>p&&p.catch(()=>{}));return (t.updateCallbackDone||Promise.resolve()).catch(()=>{}).then(()=>new Promise(r=>requestAnimationFrame(()=>r())));}
  go();return new Promise(r=>requestAnimationFrame(()=>r()));}
document.addEventListener('click',e=>{const v=e.target.closest('[data-view]');if(v)show(v.dataset.view);});

/* ---------- comfort ---------- */
function applyComfort(){const a=(D.profile&&D.profile.a11y)||{};document.body.classList.toggle('calm',!!a.motion);document.body.classList.toggle('contrast',!!a.contrast);document.body.classList.toggle('large',!!a.large);}

/* =====================================================================
   ONBOARDING: the landing story, told by doing it
   ===================================================================== */
const PATHS={sports:{label:'Sports',brain:'sport',hint:'e.g. my jump shot'},arts:{label:'Visual arts',brain:'art',hint:'e.g. a portrait series'},music:{label:'Music',brain:'music',hint:'e.g. a piece I’m learning'},
  academics:{label:'Academics',brain:'science',hint:'e.g. corporate finance'},languages:{label:'Languages',brain:'languages',hint:'e.g. Japanese'}};
const GOALS={perception:{label:'Seeing fine detail',at:[590,250]},attention:{label:'Tracking and focus',at:[175,215]},memory:{label:'Holding and updating',at:[420,330]},
  flexibility:{label:'Switching rules',at:[285,150]},retention:{label:'Remembering over time',at:[470,118]}};
/* what each pathway leans on, and why: shown as a recommendation, never as a judgement of ability */
const REC={sports:[['attention','games ask you to track several players at once'],['perception','reading motion early buys time']],
  arts:[['perception','art lives in small differences of shape and shade'],['memory','you hold a composition in mind while you change it']],
  music:[['memory','phrases are ordered patterns you hold and update'],['perception','rhythm is spacing you notice']],
  academics:[['memory','reasoning means holding and updating facts'],['flexibility','problems change rules mid-way']],
  languages:[['memory','vocabulary and grammar are held and updated'],['retention','words have to last beyond today']]};
const P={name:'',paths:[],matters:'',goals:[],exp:'',mins:10,a11y:{motion:matchMedia('(prefers-reduced-motion: reduce)').matches,contrast:false,large:false}};

/* the brain, which changes the same five ways the landing story did */
const cv=$('#cv'),draw=B.renderer(cv);let lay={fit:1,ox:0,oy:0};
const motifs=[],paths=[],sparks=[];let fill={from:0,to:0,t0:0},neuron=null,step=0;
const D_=ms=>P.a11y.motion?1:ms;
function frame(now){if(view==='onb'){
    for(let i=motifs.length-1;i>=0;i--){const m=motifs[i];m.k=m.dying?1-sm((now-m.dying)/D_(450)):sm((now-m.born)/D_(650));if(m.dying&&m.k<=0)motifs.splice(i,1);}
    for(let i=paths.length-1;i>=0;i--){const p=paths[i];p.frac=p.dying?1-sm((now-p.dying)/D_(500)):sm((now-p.born)/D_(900));if(p.dying&&p.frac<=0)paths.splice(i,1);}
    for(const s of sparks){const t=(now-s.born)/1000;s.a=t<.15?t/.15:.85+.15*Math.sin(t*3+s.x);s.r=4+3*Math.exp(-t*3);}
    if(neuron){const v=(now-neuron.t0)/1000;neuron.p.w=3+4*sm(v-1)+5*sm(v-2.2);neuron.p.frac=sm(v/1.2);}
    const f=fill.from+(fill.to-fill.from)*sm((now-fill.t0)/D_(1800));
    const r=draw({motifs,paths:neuron?[...paths.map(p=>({...p,alpha:.35})),neuron.p]:paths,sparks:neuron?[]:sparks,fill:f});if(r)lay=r;placeTags();}
  requestAnimationFrame(frame);}
requestAnimationFrame(frame);
const toBrain=(x,y)=>{const b=cv.getBoundingClientRect();return [(x-b.left-lay.ox)/lay.fit,(y-b.top-lay.oy)/lay.fit];};
const toScreen=([x,y])=>{const b=cv.getBoundingClientRect();return [b.left+lay.ox+x*lay.fit,b.top+lay.oy+y*lay.fit];};
function flyTo(el,to,done){if(P.a11y.motion||!el.animate){done();return;}const a=el.getBoundingClientRect(),s=[a.left+12,a.top+a.height/2],e=toScreen(to);const d=document.createElement('div');d.className='fly';document.body.appendChild(d);
  d.animate([{transform:`translate(${s[0]}px,${s[1]}px)`},{transform:`translate(${(s[0]+e[0])/2}px,${Math.min(s[1],e[1])-80}px)`,offset:.5},{transform:`translate(${e[0]}px,${e[1]}px) scale(.6)`}],{duration:620,easing:'cubic-bezier(.4,0,.2,1)'}).onfinish=()=>{d.remove();done();};}

function goStep(n){step=n;$$('.step').forEach(s=>s.classList.toggle('on',+s.dataset.s===n));$$('#dots i').forEach((d,i)=>{d.classList.toggle('on',i===n);d.classList.toggle('done',i<n);});
  $('#stage').classList.toggle('tap',n===0);if(n===2)recommend();if(n===4)reveal();
  const f=$$('.step')[n].querySelector('h1,h2');if(f&&n){f.setAttribute('tabindex','-1');f.focus({preventScroll:true});}}
document.addEventListener('click',e=>{if(e.target.closest('[data-next]')&&!e.target.closest('[data-next]').disabled)goStep(step+1);});
addEventListener('keydown',e=>{if(view!=='onb'||e.key!=='Enter')return;const b=$$('.step')[step].querySelector('.go:not([disabled]):not([hidden])');if(b&&getComputedStyle(b.parentElement).display!=='none'){e.preventDefault();b.click();}});

/* 0 · tap: a signal, then two connected */
const LINES=['Brain cells send signals.','Two signals, connected.','Fire together, wire together.'];
function fire(pt){sparks.push({x:pt[0],y:pt[1],r:6,a:0,born:performance.now()});
  if(sparks.length>1){const a=sparks.at(-2),b=sparks.at(-1),m=[(a.x+b.x)/2+(b.y-a.y)*.2,(a.y+b.y)/2-(b.x-a.x)*.2];paths.push({key:'w',pts:B.route([[a.x,a.y],m,[b.x,b.y]],16),born:performance.now(),w:3+sparks.length,frac:0});}
  $('#s0-say').textContent=LINES[Math.min(2,sparks.length-1)];if($('#s0-more').hidden){$('#s0-more').hidden=false;setTimeout(()=>$('#name').focus({preventScroll:true}),400);}}
cv.addEventListener('click',e=>{if(step!==0)return;const p=toBrain(e.clientX,e.clientY);if(B.inside(p[0],p[1]))fire(p);});
const kbPts=[[300,250],[460,200],[420,360]];$('#fire-kb').addEventListener('click',()=>fire(kbPts[sparks.length%3]));
$('#name').addEventListener('input',e=>P.name=e.target.value.trim());

/* 1 · interests grow their drawings and wire back to your first signal */
let seed=7;
Object.entries(PATHS).forEach(([k,I])=>{const b=opt(I.label);$('#interests').appendChild(b);
  b.addEventListener('click',()=>{const on=!P.paths.includes(k);if(on&&P.paths.length>=3){toast('Three at most. Tap one to swap.');return;}const now=performance.now(),BI=B.INTERESTS[I.brain];
    if(on){P.paths.push(k);flyTo(b,BI.at,()=>{B.scatter(motifs.filter(m=>!m.dying),BI.at,BI.kinds,11,seed+=13,100).forEach((m,i)=>{m.owner=k;m.born=performance.now()+i*55;motifs.push(m);});
        const from=sparks[0]?[sparks[0].x,sparks[0].y]:B.CENTRE;paths.push({key:'i:'+k,pts:B.route([from,[(from[0]+BI.at[0])/2,(from[1]+BI.at[1])/2-30],BI.at],16),born:performance.now(),w:4,frac:0});});}
    else{P.paths=P.paths.filter(x=>x!==k);motifs.forEach(m=>{if(m.owner===k&&!m.dying)m.dying=now;});paths.forEach(p=>{if(p.key==='i:'+k&&!p.dying)p.dying=now;});}
    b.setAttribute('aria-pressed',on);$('#s1-go').disabled=!P.paths.length;
    const has=!!P.paths.length;$('#matters-q').hidden=$('#matters').hidden=!has;if(has)$('#matters').placeholder=PATHS[P.paths[0]].hint;});});
$('#matters').addEventListener('input',e=>P.matters=e.target.value.trim());
function opt(label,sub){const b=document.createElement('button');b.type='button';b.className='opt';b.setAttribute('aria-pressed','false');b.innerHTML=label+(sub?`<small>${sub}</small>`:'');return b;}

/* 2 · goals: recommended from what you love, each wired as a pathway; experience shapes context only */
const goalBtn={};
Object.entries(GOALS).forEach(([k,G])=>{const b=opt(G.label);b.dataset.g=k;b.innerHTML=G.label+'<span class="why" hidden></span>';$('#goals').appendChild(b);goalBtn[k]=b;
  b.addEventListener('click',()=>setGoal(k,!P.goals.includes(k)));});
function setGoal(k,on){const now=performance.now();if(on){if(P.goals.length>=3){toast('Three at most.');return;}P.goals.push(k);paths.push({key:'g:'+k,pts:B.goalRoute?routeTo(GOALS[k].at):[],born:now,w:6,frac:0});}
  else{P.goals=P.goals.filter(x=>x!==k);paths.forEach(p=>{if(p.key==='g:'+k&&!p.dying)p.dying=now;});}
  goalBtn[k].setAttribute('aria-pressed',on);$('#s2-go').disabled=!(P.goals.length&&P.exp);}
function routeTo(a){const c=B.CENTRE,m=[(c[0]+a[0])/2+(a[1]-c[1])*.25,(c[1]+a[1])/2-(a[0]-c[0])*.25];return B.route([c,m,a],18);}
let recFor='';
function recommend(){const key=P.paths.join();if(recFor===key)return;recFor=key;const score={},why={};
  P.paths.forEach(p=>REC[p].forEach(([g,r],n)=>{score[g]=(score[g]||0)+(n?1:2);if(!why[g])why[g]=[PATHS[p].label,r];}));
  const top=Object.keys(score).sort((a,b)=>score[b]-score[a]).slice(0,2);
  P.goals.slice().forEach(g=>setGoal(g,false));
  Object.keys(GOALS).forEach(g=>{const w=goalBtn[g].querySelector('.why');w.hidden=!top.includes(g);w.innerHTML=why[g]&&top.includes(g)?`<b>For ${why[g][0]} ·</b> ${why[g][1][0].toUpperCase()+why[g][1].slice(1)}.`:'';});
  /* recommended first */
  top.slice().reverse().forEach(g=>$('#goals').prepend(goalBtn[g]));
  top.forEach((g,i)=>setTimeout(()=>setGoal(g,true),P.a11y.motion?0:400+i*420));}
[['new','New to it'],['some','Some experience'],['lots','Experienced']].forEach(([k,l])=>{const b=opt(l);$('#exp').appendChild(b);
  b.addEventListener('click',()=>{P.exp=k;$$('#exp .opt').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#s2-go').disabled=!P.goals.length;});});

/* 3 · rhythm and comfort */
function minsOpts(el,onPick){[5,10,15].forEach(m=>{const b=opt(m+' min');b.setAttribute('aria-pressed',P.mins===m);el.appendChild(b);b.addEventListener('click',()=>{onPick(m);[...el.children].forEach(x=>x.setAttribute('aria-pressed',x===b));});});}
function comfortOpts(el,a,onChange){[['motion','Reduced motion'],['contrast','High contrast'],['large','Larger text']].forEach(([k,l])=>{const b=opt(l);b.setAttribute('aria-pressed',!!a[k]);el.appendChild(b);
  b.addEventListener('click',()=>{a[k]=!a[k];b.setAttribute('aria-pressed',a[k]);onChange();});});}
minsOpts($('#mins'),m=>P.mins=m);comfortOpts($('#comfort'),P.a11y,()=>{D.profile=D.profile||{};D.profile.a11y=P.a11y;applyComfort();});
$('#to-baseline').addEventListener('click',()=>runBaseline(false));

/* 4 · the reveal: navy fills, one bright neuron, and your real starting point */
function reveal(){fill={from:0,to:1,t0:performance.now()};
  if(!motifs.some(m=>m.owner==='fill'))B.scatter(motifs.filter(m=>!m.dying),[360,290],['leaf','sprig','petal','flower','tulip','heart','bolt','dots','squig','spark','star','frond','gear'],140,401,300).forEach((m,i)=>{m.s=Math.min(m.s,15);m.owner='fill';m.born=performance.now()+300+i*12;motifs.push(m);});
  neuron={t0:performance.now()+D_(1600),p:{pts:B.route([[165,215],[260,280],[380,330],[480,380],[586,420]],16),frac:0,w:3}};
  const b=D.baseline;$('#s4-h').textContent=(P.name?P.name+', here’s':'Here’s')+' your starting point.';
  $('#start').innerHTML=`<p><b>Seeing fine detail</b> · starting level ${b.perception.start+1}<br><small>early estimate from ${b.perception.n} trials</small></p>
    <p><b>Tracking and focus</b> · ${b.attention.hits} of ${b.attention.total} tracked<br><small>early estimate from ${b.attention.n} rounds</small></p>
    <p><b>Holding in order</b> · ${b.memory.span} in a row<br><small>kept untrained, so it can show change honestly</small></p>`;}
$('#enter').addEventListener('click',()=>show('home'));
function placeTags(){const tags=$('#tags');if(!tags.children.length)Object.entries(GOALS).forEach(([k,G])=>{const t=document.createElement('div');t.className='tag';t.dataset.g=k;t.textContent=G.label;tags.appendChild(t);});
  const b=cv.getBoundingClientRect(),s=$('#stage').getBoundingClientRect();[...tags.children].forEach(t=>{const on=P.goals.includes(t.dataset.g)&&step>=2;t.classList.toggle('on',on);if(on){const a=GOALS[t.dataset.g].at;t.style.left=(b.left-s.left+lay.ox+a[0]*lay.fit)+'px';t.style.top=(b.top-s.top+lay.oy+a[1]*lay.fit)+'px';}});}

/* =====================================================================
   THE TASK STAGE: shared by baseline and sessions
   ===================================================================== */
const tcv=$('#tcv');let paused=false,ending=false,resumeFn=null;
const say=t=>{$('#tsay').textContent=t;};
function progress(n,i){$('#tprog').innerHTML=Array.from({length:n},(_,k)=>`<i class="${k<=i?'on':''}"></i>`).join('');}
function overlay(html){const o=$('#ov');o.innerHTML=html;o.classList.toggle('on',!!html);}
$('#pause').addEventListener('click',()=>{paused=true;$('#pause').disabled=true;});
async function checkPause(){if(!paused)return;overlay(`<h3>Paused</h3><p class="muted" style="margin:8px 0 0">Nothing is lost.</p><button class="go" type="button" id="resume">Resume</button><button class="quiet" type="button" id="endnow" style="margin-top:16px">End session</button>`);
  await new Promise(res=>{$('#resume').onclick=()=>res();$('#endnow').onclick=()=>{ending=true;res();};});paused=false;$('#pause').disabled=false;overlay('');}
const seedOf=()=>Math.floor(Math.random()*2**31);
function logTrial(r,extra){D.trials.push({...r,...extra,ts:Date.now(),device:device()});}
async function rest(sec){overlay(`<div class="breathe"></div><h3 style="margin-top:20px">Rest</h3><p class="muted" style="margin:6px 0 0">A few slow breaths.</p><button class="quiet" type="button" id="skiprest" style="margin-top:16px">Continue</button>`);
  await Promise.race([wait(sec*1000),new Promise(r=>$('#skiprest').onclick=r)]);overlay('');}

/* ---------- baseline: three standard tasks, the same for every pathway so progress stays comparable ---------- */
async function runBaseline(followup){await show('task');ending=false;$('#pause').hidden=true;const sid='b'+Date.now(),out={at:Date.now()};
  /* 1 · perception: standard orientation, 2-down/1-up staircase */
  progress(3,0);$('#tname').textContent='1 of 3 · Seeing fine detail';say('Remember the angle.');await wait(1200);
  let lv=0,run=0;const lvls=[];let correct=0;
  for(let i=0;i<12;i++){const r=await T.perceptionTrial(tcv,{type:'orientation',level:lv,seed:seedOf(),say:i<2?say:null});if(i>=2)say('');logTrial(r,{session:sid,kind:'baseline'});lvls.push(lv);if(r.correct){correct++;if(++run>=2){run=0;lv=Math.min(T.PERCEPTION_LEVELS-1,lv+1);}}else{run=0;lv=Math.max(0,lv-1);}}
  const tail=lvls.slice(-6).sort((a,b)=>a-b);out.perception={start:Math.max(0,tail[3]-1),acc:correct/12,n:12};
  /* 2 · attention: four rounds of standard tracking */
  progress(3,1);$('#tname').textContent='2 of 3 · Tracking and focus';say('');await wait(700);
  let hits=0,total=0;const base=T.attentionLadder('standard')[0];
  for(const k of [2,3,3,4]){const r=await T.attentionTrial(tcv,{path:'standard',level:0,seed:seedOf(),say,override:{...base,targets:k,objects:8,speed:.22,duration:4}});logTrial(r,{session:sid,kind:'baseline'});hits+=r.hits;total+=k;}
  const acc=hits/total;out.attention={hits,total,n:4,acc,start:acc>=.85?2:acc>=.7?1:0};
  /* 3 · memory: ordered recall, kept as an untrained measure */
  progress(3,2);$('#tname').textContent='3 of 3 · Holding in order';say('');await wait(700);
  let len=3,span=2,fails=0,tries=0;while(len<=8){const r=await T.memoryTrial(tcv,{len,seed:seedOf(),say});logTrial(r,{session:sid,kind:'baseline'});tries++;
    if(r.correct){span=Math.max(span,len);len++;fails=0;tries=0;}else if(++fails>=2)break;else if(tries>=2){len++;tries=0;fails=0;}}
  out.memory={span,n:D.trials.filter(t=>t.session===sid&&t.task==='memory').length};
  /* optional: how it felt */
  $('#tname').textContent='';say('How did that feel?');
  overlay(`<div class="opts" style="justify-content:center">${['Easy','About right','Hard'].map(x=>`<button class="opt" type="button" data-e="${x}">${x}</button>`).join('')}</div><button class="quiet" type="button" data-e="" style="margin-top:14px">Skip</button>`);
  out.effort=await new Promise(res=>$$('#ov [data-e]').forEach(b=>b.onclick=()=>res(b.dataset.e||null)));overlay('');$('#pause').hidden=false;
  if(followup){D.followups.push(out);save();toast('Baseline retaken. See the Atlas.');show('atlas');return;}
  D.baseline=out;D.levels={perception:out.perception.start,attention:out.attention.start};
  D.profile={name:P.name,paths:P.paths,matters:P.matters,goals:P.goals,exp:P.exp,mins:P.mins,a11y:P.a11y,at:Date.now()};save();
  show('onb');goStep(4);}

/* =====================================================================
   HOME: the Neuroverse
   ===================================================================== */
const REGIONS=[['perception','Perception',[590,250],true],['attention','Attention',[175,215],true],['memory','Memory',[420,330],false],['flexibility','Adaptation',[285,150],false],['retention','Observatory',[470,118],false]];
const NAMES={perception:'Perception Labyrinth',attention:'Attention Nexus'};
function homeMotifs(){const ms=[];let s=11;(D.profile.paths||[]).forEach(p=>{const I=B.INTERESTS[PATHS[p].brain];ms.push(...B.scatter(ms,I.at,I.kinds,12,s+=17,110));});
  ms.push(...B.scatter(ms,[360,290],['leaf','sprig','petal','flower','tulip','heart','bolt','dots','squig','spark','star','frond','gear'],140,401,300).map(m=>({...m,s:Math.min(m.s,15)})));return ms.map(m=>({...m,k:1}));}
let vdraw=null,vmotifs=null;
function renderHome(){const p=D.profile,h=new Date().getHours();$('#hello').textContent=(h<12?'Good morning':h<18?'Good afternoon':'Good evening')+(p.name?', '+p.name:'')+'.';
  const c=coach();$('#coach').innerHTML=c+'<span class="coach-note">Your coach uses your stored results. It’s rule-based for now.</span>';
  const plan=sessionPlan();$('#plan').textContent=`${p.mins} min · `+plan.map(s=>s.label).join(' · ');
  if(!vdraw)vdraw=B.renderer($('#vcv'));if(!vmotifs)vmotifs=homeMotifs();
  /* each region's pathway grows with the level you've reached there */
  const pw=k=>3+((D.levels[k]||0)/11)*10;
  const st={motifs:vmotifs,fill:1,paths:REGIONS.filter(r=>r[3]).map(([k,,at])=>({pts:routeTo(at),frac:1,w:pw(k)}))};
  const lay2=vdraw(st)||{fit:1,ox:0,oy:0};$('#verse').querySelectorAll('.region').forEach(x=>x.remove());
  REGIONS.forEach(([k,label,at,open])=>{const b=document.createElement('button');b.type='button';b.className='region'+(open?'':' locked');b.style.left=(lay2.ox+at[0]*lay2.fit)+'px';b.style.top=(lay2.oy+at[1]*lay2.fit)+'px';
    b.innerHTML=`<i></i><span>${label}</span><small>${open?'level '+((D.levels[k]||0)+1):'opens soon'}</small>`;if(open)b.addEventListener('click',()=>runSession(k));else b.setAttribute('aria-disabled','true');$('#verse').appendChild(b);});}
addEventListener('resize',()=>{if(view==='home'){vdraw=null;renderHome();}});

/* ---------- the session plan: targeted, complementary, then a retention check if one is due ---------- */
function targeted(){const g=D.profile.goals||[];return g.includes('attention')&&!g.includes('perception')?'attention':g.indexOf('attention')>=0&&g.indexOf('attention')<g.indexOf('perception')?'attention':'perception';}
function sessionPlan(only){const total=D.profile.mins*60;if(only)return [{task:only,kind:'targeted',sec:total*.85,label:NAMES[only]}];
  const t=targeted(),c=t==='perception'?'attention':'perception',due=retentionDue();
  const plan=[{task:t,kind:'targeted',sec:total*(due?.42:.55),label:NAMES[t]},{task:c,kind:'complementary',sec:total*.33,label:NAMES[c]}];
  if(due)plan.push({task:due.task,kind:'retention',sec:total*.15,label:'retention check',level:due.level});return plan;}
function retentionDue(){return D.due&&D.due.date<=day()&&D.due.date!==D.due.made?D.due:null;}

/* ---------- running a session ---------- */
async function runSession(only){await show('task');ending=false;paused=false;const sid='s'+Date.now(),plan=sessionPlan(only),path=D.profile.paths[0]||'standard';
  const S={id:sid,start:Date.now(),blocks:[],plan:plan.map(p=>p.kind+':'+p.task),retention:null,levelsBefore:{...D.levels}};
  for(let si=0;si<plan.length&&!ending;si++){const seg=plan[si];progress(plan.length,si);
    $('#tname').textContent=seg.kind==='retention'?'Retention check · '+NAMES[seg.task]:NAMES[seg.task];
    const eng=new T.Engine(seg.task==='perception'?T.PERCEPTION_LEVELS:T.ATTENTION_LEVELS,seg.kind==='retention'?seg.level:D.levels[seg.task]||0);
    let used=0,first=true;
    while(used<seg.sec&&!ending){if(!first)await rest(4);first=false;const t0=performance.now();const level=eng.level;
      const n=seg.task==='perception'?8:3,res=[];
      for(let i=0;i<n&&!ending;i++){await checkPause();if(ending)break;
        const r=seg.task==='perception'?await T.perceptionTrial(tcv,{type:T.PATH_STIM[path]||'orientation',level,seed:seedOf(),say}):await T.attentionTrial(tcv,{path,level,seed:seedOf(),say,reduced:D.profile.a11y.motion});
        logTrial(r,{session:sid,kind:seg.kind});res.push(r);}
      if(!res.length)break;
      const acc=seg.task==='perception'?res.filter(r=>r.correct).length/res.length:res.reduce((a,r)=>a+r.score,0)/res.length;
      const block={task:seg.task,kind:seg.kind,level,acc,n:res.length};S.blocks.push(block);used+=(performance.now()-t0)/1000;
      if(seg.kind==='retention'){S.retention={task:seg.task,level,acc,was:D.due.acc,gapDays:Math.round((Date.now()-D.due.at)/864e5)};D.retention.push(S.retention);D.due=null;break;}
      const ch=eng.endBlock(acc);D.levels[seg.task]=eng.level;save();
      if(ch){say(ch>0?'Two strong blocks. Stepping up one notch.':'Easing off one notch. Steady wins.');await wait(1600);}}}
  S.end=Date.now();D.sessions.push(S);
  /* schedule tomorrow's retention check on what you trained most */
  const tb=S.blocks.filter(b=>b.kind==='targeted');if(tb.length){const lb=tb[tb.length-1];D.due={task:lb.task,level:lb.level,acc:lb.acc,at:Date.now(),made:day(),date:day(Date.now()+864e5)};}
  save();summary(S);}

/* ---------- summary ---------- */
function summary(S){const by={};S.blocks.forEach(b=>{(by[b.task]=by[b.task]||[]).push(b);});
  $('#sum').innerHTML=Object.entries(by).map(([k,bs])=>{const tr=bs.filter(b=>b.kind!=='retention');const acc=Math.round(bs.reduce((a,b)=>a+b.acc*b.n,0)/bs.reduce((a,b)=>a+b.n,0)*100);
    const from=(S.levelsBefore[k]||0)+1,to=(D.levels[k]||0)+1;return `<div class="sec" style="margin-top:28px"><h3>${NAMES[k]}</h3><div class="row"><div class="stat"><b>${acc}%</b><span>accuracy</span></div><div class="stat"><b>${from===to?to:from+' → '+to}</b><span>level</span></div><div class="stat"><b>${bs.length}</b><span>blocks</span></div></div></div>`;}).join('')
    +(S.retention?`<div class="sec" style="margin-top:28px"><h3>Retention check</h3><p>${NAMES[S.retention.task]}, level ${S.retention.level+1}: ${Math.round(S.retention.acc*100)}% after ${S.retention.gapDays||1} day${S.retention.gapDays>1?'s':''} (you ended at ${Math.round(S.retention.was*100)}%).</p></div>`:'')
    +(D.due?`<p class="muted" style="margin-top:28px">Tomorrow starts with a short retention check. Sleep is part of the practice.</p>`:'');
  $('#sum-coach').textContent=coach(true);show('sum');}

/* =====================================================================
   THE COACH: deterministic, precise, and never claims anything about neurons
   ===================================================================== */
function blocksOf(task){return D.sessions.flatMap(s=>s.blocks.filter(b=>b.task===task&&b.kind!=='retention').map(b=>({...b,at:s.start})));}
function nextStep(task){const L=D.levels[task]||0;if(task==='perception'){const T_=PPTasks;return L+1<T_.PERCEPTION_LEVELS?['smaller differences','smaller differences','shorter glimpses','smaller differences','more clutter','smaller differences','shorter glimpses','smaller differences','more clutter','smaller differences','smaller differences'][L]||'a harder setting':null;}
  const lad=PPTasks.attentionLadder(D.profile.paths[0]||'standard');if(L+1>=lad.length)return null;const a=lad[L],b=lad[L+1];
  return b.targets>a.targets?'one more target':b.objects>a.objects?'more distractors':b.speed>a.speed?'faster movement':b.duration>a.duration?'longer tracking':'closer objects';}
function coach(after){const t=targeted(),due=retentionDue(),bs=blocksOf(t),name=NAMES[t];
  if(!D.sessions.length)return `Your first session starts in the ${name}, at the level your baseline suggested. Two strong blocks in a row raise the challenge; nothing changes on a single answer.`;
  if(due&&!after)return `Yesterday you finished the ${NAMES[due.task]} at level ${due.level+1} with ${Math.round(due.acc*100)}%. Today ends with a short check at that same level, to see what held overnight.`;
  const last=D.retention.at(-1);if(after&&last&&D.sessions.at(-1).retention){const d=Math.round((last.acc-last.was)*100);return d>=0?`You held level ${last.level+1} after a day away, ${d?d+' points higher than':'matching'} where you finished. That’s retention we measured, not assumed.`:`After a day away you scored ${-d} points below where you finished. That’s common; the next sessions revisit it.`;}
  const sess=[...new Set(bs.map(b=>b.at))].slice(-3);
  if(sess.length>=3){const acc=sess.map(s=>{const x=bs.filter(b=>b.at===s);return x.reduce((a,b)=>a+b.acc,0)/x.length;});
    if(acc[2]>acc[0]+.04){const n=nextStep(t);return `Your accuracy in the ${name} improved across your last three sessions. ${n?`Next we’ll try ${n}, to see whether it holds under more demand.`:'You’re at the top level; we’ll keep revisiting it.'}`;}}
  const lb=bs.at(-1);if(lb&&lb.acc<.65)return `Your last block in the ${name} was tough, so the next one stays at level ${(D.levels[t]||0)+1}. Consistency comes before difficulty.`;
  const n=nextStep(t);return `You’re at level ${(D.levels[t]||0)+1} in the ${name}. ${n?`Two blocks at 85% or more brings ${n}.`:'That’s the top level for now.'}`;}

/* =====================================================================
   LEARNING ATLAS: every line from your own records
   ===================================================================== */
function spark(vals,max,base){if(!vals.length)return '<p class="muted">No blocks yet.</p>';const W=600,H=100,n=vals.length,x=i=>n<2?W/2:i/(n-1)*W,y=v=>H-6-(v/max)*(H-12);
  const d=vals.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(v).toFixed(1)).join(' ');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${base!=null?`<line x1="0" x2="${W}" y1="${y(base)}" y2="${y(base)}" stroke="#c9c9c4" stroke-dasharray="4 6"/>`:''}<path d="${d}" fill="none" stroke="#e4572e" stroke-width="2.5" vector-effect="non-scaling-stroke"/>${vals.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="#e4572e"/>`).join('')}</svg>`;}
function taskSec(task,label,base){const bs=blocksOf(task),levels=bs.map(b=>b.level+1),acc=bs.length?Math.round(bs.slice(-3).reduce((a,b)=>a+b.acc,0)/Math.min(3,bs.length)*100):null;
  return `<div class="sec"><h3>${label}</h3><div class="row"><div class="stat"><b>${(D.levels[task]||0)+1}</b><span>level now</span></div><div class="stat"><b>${base+1}</b><span>baseline start</span></div><div class="stat"><b>${acc==null?'–':acc+'%'}</b><span>recent accuracy</span></div><div class="stat"><b>${bs.length}</b><span>blocks</span></div></div>
    ${spark(levels,12,base+1)}<p class="muted">Difficulty level per block. The dashed line is where your baseline put you.</p></div>`;}
function renderAtlas(){if(!D.baseline){$('#atlas').innerHTML='';return;}const b=D.baseline;
  const days=[...Array(14)].map((_,i)=>day(Date.now()-(13-i)*864e5)),played=new Set(D.sessions.map(s=>day(s.start)));
  const fu=D.followups.at(-1);
  $('#atlas').innerHTML=taskSec('perception','Perceptual discrimination',b.perception.start)+taskSec('attention','Attention tracking',b.attention.start)
    +`<div class="sec"><h3>Delayed retention</h3>${D.retention.length?D.retention.slice(-5).reverse().map(r=>`<p>${NAMES[r.task]} · level ${r.level+1} · ${Math.round(r.acc*100)}% after ${r.gapDays||1} day${(r.gapDays||1)>1?'s':''} <span class="muted">(was ${Math.round(r.was*100)}%)</span></p>`).join(''):'<p class="muted">Your first check comes the day after your first session.</p>'}</div>`
    +`<div class="sec"><h3>Consistency</h3><div class="days">${days.map(d=>`<i class="${played.has(d)?'on':''}" title="${d}"></i>`).join('')}</div><p class="muted">Last 14 days · ${D.sessions.length} session${D.sessions.length===1?'':'s'} in all</p></div>`
    +`<div class="sec"><h3>Untrained measure</h3><div class="row"><div class="stat"><b>${b.memory.span}</b><span>in-order span at baseline</span></div>${fu?`<div class="stat"><b>${fu.memory.span}</b><span>at your retest</span></div>`:''}</div><p class="muted">We never train this task, so a change here is a fairer test than a change in what you practise. ${fu?'':'Retake the baseline after a couple of weeks to compare.'} Differences on untrained tasks are exploratory, not proven benefits.</p></div>`;}
$('#how-btn').addEventListener('click',()=>{const h=$('#how');h.hidden=!h.hidden;if(!h.innerHTML)h.innerHTML=`
  <p><span class="dot"></span>Practice at the edge of what you can do improves the trained task. That’s what the level line shows.<span class="src"><a href="https://doi.org/10.1038/s41467-019-12552-4" target="_blank" rel="noopener">Wilson et al., 2019</a></span></p>
  <p><span class="dot"></span>Brains change with skill learning: adults who learned to juggle showed grey-matter changes. This app doesn’t measure that; it measures your performance.<span class="src"><a href="https://doi.org/10.1038/427311a" target="_blank" rel="noopener">Draganski et al., 2004</a></span></p>
  <p><span class="dot"></span>Spaced sessions and sleep help learning last, which is why we check retention a day later.<span class="src"><a href="https://doi.org/10.1037/0033-2909.132.3.354" target="_blank" rel="noopener">Cepeda et al., 2006</a> · <a href="https://doi.org/10.1016/S0896-6273(02)00746-8" target="_blank" rel="noopener">Walker et al., 2002</a></span></p>
  <p><span class="dot"></span>Gains on trained tasks don’t reliably spread to everyday life. We keep untrained measures to check honestly.<span class="src"><a href="https://doi.org/10.1177/1529100616661983" target="_blank" rel="noopener">Simons et al., 2016</a></span></p>`;});
/* copy rather than download: works on phones and inside hosted viewers */
$('#export').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(JSON.stringify(D,null,2));toast('Your data is copied as JSON.');}catch(e){toast('Couldn’t copy here.');}});
/* confirm on the page itself, with a second tap */
function twoTap(btn,label,act){btn.addEventListener('click',()=>{if(btn.dataset.armed){act();return;}btn.dataset.armed=1;const t=btn.textContent;btn.textContent=label;setTimeout(()=>{delete btn.dataset.armed;btn.textContent=t;},4000);});}
twoTap($('#wipe'),'Tap again to delete everything',()=>{try{localStorage.removeItem(KEY);}catch(e){}location.reload();});
$('#retest').addEventListener('click',()=>runBaseline(true));

/* ---------- settings ---------- */
function renderSettings(){const p=D.profile;$('#set-mins').innerHTML='';$('#set-comfort').innerHTML='';const old=P.mins;P.mins=p.mins;minsOpts($('#set-mins'),m=>{p.mins=m;save();});P.mins=old;
  comfortOpts($('#set-comfort'),p.a11y,()=>{save();applyComfort();});}
twoTap($('#restart'),'Tap again to start over',()=>{try{localStorage.removeItem(KEY);}catch(e){}location.reload();});
$('#session').addEventListener('click',()=>runSession());

/* ---------- start: returning players land in their Neuroverse ---------- */
if(D.profile&&D.baseline){applyComfort();show('home');}else{show('onb');goStep(0);}
})();
