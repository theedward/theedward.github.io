/* The raster case travels from its exact scene bounds; readable content stays native HTML. */
window.caseTransition = (() => {
  let active;
  const animations = new Set();
  const animate = (el, frames, options) => {
    const a=el.animate(frames,{fill:'both',...options}); animations.add(a);
    return a.finished.catch(()=>{});
  };
  const cancel=()=>{animations.forEach(a=>a.cancel());animations.clear();};
  function restore(){
    if(!active)return;cancel();active.flight?.remove();
    active.dialog.classList.remove('case-travelling');
    active.dialog.dataset.casePhase='closed';
    if(active.sprite){active.sprite.alpha=1;window.playroom.render();}
    active=null;
  }
  function geometry(s){
    const source=s.shelf.getBoundingClientRect();
    const width=Math.min(230,innerWidth*.5),height=width*1.49;
    const x=(innerWidth-width)/2,y=(innerHeight-height)/2;
    Object.assign(s.flight.style,{left:`${x}px`,top:`${y}px`,width:`${width}px`,height:`${height}px`});
    s.home=`translate(${source.left-x}px,${source.top-y}px) scale(${source.width/width},${source.height/height})`;
  }
  function makeFlight(s){
    const flight=document.createElement('div');flight.className='case-flight';flight.setAttribute('aria-hidden','true');
    // Same approved source, same affine projection as the shelf sprite (no substitute art).
    flight.innerHTML='<svg viewBox="0 0 57.8 86.73" preserveAspectRatio="none"><image href="assets/room/case1.png" width="1536" height="1024" transform="matrix(.085 .01004 0 .085 -36.55 -7.7172)" /></svg>';
    if(s.fromCollection){flight.replaceChildren(s.shelf.cloneNode(true));flight.classList.add('collection-flight');}
    s.dialog.append(flight);s.flight=flight;geometry(s);
  }
  async function open(dialog,index,reduced,opener){
    restore();
    const s=active={dialog,index,shelf:opener?.classList.contains("collection-case")?opener.querySelector(".collection-art"):document.querySelector(`.game-case[data-project="${index}"]`),sprite:opener?.classList.contains("collection-case")?null:window.playroom.getObject(`case${index+1}`),fromCollection:opener?.classList.contains("collection-case"),closing:false};
    if(s.sprite){s.sprite.alpha=0;window.playroom.render();}
    if(reduced){dialog.dataset.casePhase='open';return;}
    dialog.classList.add('case-travelling');makeFlight(s);dialog.dataset.casePhase='lifting';
    await animate(s.flight,[{transform:s.home},{transform:'translate(0,-12px) scale(1.035)',offset:.78},{transform:'none'}],{duration:650,easing:'cubic-bezier(.2,.75,.2,1)'});
    if(active!==s||s.closing||s.settled)return;
    dialog.dataset.casePhase='opening';dialog.classList.remove('case-travelling');
    const inside=dialog.querySelector('.case-inside'),article=dialog.querySelector('article');
    await Promise.all([
      animate(s.flight,[{transform:'perspective(1100px) rotateY(0)',opacity:1},{transform:'perspective(1100px) rotateY(-112deg)',opacity:0}],{duration:520,easing:'ease-in-out'}),
      animate(inside,[{transform:'perspective(1100px) rotateY(85deg)',opacity:0},{transform:'none',opacity:1}],{duration:580,easing:'ease-out'}),
      animate(article,[{opacity:0},{opacity:1}],{duration:420,delay:160})
    ]);
    if(active!==s||s.closing||s.settled)return;cancel();s.flight.remove();s.flight=null;dialog.dataset.casePhase='open';
  }
  async function close(dialog,reduced,finish){
    const s=active;if(!s||s.dialog!==dialog||reduced){restore();finish();return;}
    s.closing=true;cancel();s.flight?.remove();makeFlight(s);s.flight.style.opacity='0';
    dialog.dataset.casePhase='folding';
    await Promise.all([
      animate(dialog.querySelector('.case-inside'),[{transform:'none',opacity:1},{transform:'perspective(1100px) rotateY(85deg)',opacity:0}],{duration:280}),
      animate(dialog.querySelector('article'),[{opacity:1},{opacity:0}],{duration:230}),
      animate(s.flight,[{opacity:0,transform:'perspective(1100px) rotateY(-112deg)'},{opacity:1,transform:'none'}],{duration:310})
    ]);
    if(active!==s)return;dialog.classList.add('case-travelling');dialog.dataset.casePhase='returning';geometry(s);
    await animate(s.flight,[{transform:'none'},{transform:s.home}],{duration:530,easing:'cubic-bezier(.6,0,.3,1)'});
    if(active===s){restore();finish();}
  }
  // A changed viewport must never leave a travelling cover detached from its shelf.
  addEventListener('resize',()=>{if(!active)return;const s=active;s.settled=true;cancel();s.flight?.remove();s.flight=null;s.dialog.classList.remove('case-travelling');s.dialog.dataset.casePhase='open';if(s.closing){restore();s.dialog.close();}});
  return {open,close,reset:restore};
})();
