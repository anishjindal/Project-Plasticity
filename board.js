/* The round board: twenty neurons on a navy disc. Shared by onboarding and the daily puzzle.
   A page supplies a .boardwrap holding a .board and an svg.wires; styles live in the page. */
(function(){
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function create(wrap){
  const board=wrap.querySelector('.board'),wires=wrap.querySelector('.wires');const N=20,tiles=[];
  /* six on an inner ring, fourteen outside it, the centre left free */
  for(let i=0;i<N;i++){const b=document.createElement('button');b.type='button';b.className='tile';b.dataset.i=i;b.setAttribute('aria-label','Neuron '+(i+1));
    const inner=i<6,k=inner?i:i-6,n=inner?6:14,r=inner?.2:.385,a=-Math.PI/2+(k+(inner?.5:0))/n*Math.PI*2;
    b.style.left=(50+Math.cos(a)*r*100)+'%';b.style.top=(50+Math.sin(a)*r*100)+'%';board.appendChild(b);tiles.push(b);}
  board.classList.add('locked');
  function clear(){tiles.forEach(t=>{t.className='tile';t.textContent='';});wires.innerHTML='';}
  function centre(i){const r=tiles[i].getBoundingClientRect(),w=wires.getBoundingClientRect();return [r.left-w.left+r.width/2,r.top-w.top+r.height/2];}
  function wire(seq,width){if(seq.length<2){wires.innerHTML='';return;}const pts=seq.map(centre);let d='M'+pts[0].join(',');for(let i=1;i<pts.length;i++)d+=' L'+pts[i].join(',');
    wires.setAttribute('viewBox',`0 0 ${wires.clientWidth} ${wires.clientHeight}`);wires.innerHTML=`<path d="${d}" stroke-width="${width}"/>`;}
  async function flash(seq,letters,ms){board.classList.add('locked');
    for(let k=0;k<seq.length;k++){const t=tiles[seq[k]];t.classList.add('lit');t.textContent=letters[k]||'';await wait(ms);t.classList.remove('lit');t.textContent='';await wait(110);}}
  /* wait for n distinct taps; onTap can paint each one as it lands */
  function collect(n,onTap){return new Promise(res=>{const picks=[],times=[];let last=performance.now();board.classList.remove('locked');
    const h=e=>{const t=e.target.closest('.tile');if(!t)return;const i=+t.dataset.i;if(picks.includes(i))return;const now=performance.now();times.push(now-last);last=now;picks.push(i);
      onTap&&onTap(i,picks.length-1);if(picks.length>1)wire(picks,3);
      if(picks.length===n){board.removeEventListener('click',h);board.classList.add('locked');res({picks,times});}};
    board.addEventListener('click',h);});}
  return {tiles,clear,wire,flash,collect,el:board};}
window.PPBoard={create,wait};
})();
