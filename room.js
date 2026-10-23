/* PixiJS 8 renderer. Native HTML owns navigation, focus, dialogs and audio. */
(() => {
  'use strict';
  const manifest = window.PLAYROOM_ART;
  const state = {screen:0, console:0, paused:matchMedia('(prefers-reduced-motion: reduce)').matches, catUntil:0, notesUntil:0, assetsReady:false, failedAssets:[], renderer:'pixijs', error:null};
  let app, time=0, offscreen=false;
  const eggButtons = ['monitor','cat','lamp-egg','ball-egg'];
  function setEggReady(id, ready) { const button=document.getElementById(id); if(button) {button.disabled=!ready;button.setAttribute('aria-disabled',String(!ready));} }
  eggButtons.forEach(id=>setEggReady(id,false));
  const resolvedAssets = new Map();
  const preferredAsset = src=>src.replace(/\.png$/,'.webp');
  const named = new Map();
  const animationTracks = new Map();
  const api = window.playroom = {
    state,
    setPaused(value) { state.paused=!!value; syncTicker(); render(); },
    cycleScreen() { state.screen=(state.screen+1)%3; return state.screen; },
    petCat() { return false; },
    dipLamp() { return false; },
    bounceBall() { return false; },
    hum() { state.notesUntil=time+3; },
    getTime:()=>time,
    // Passive tracks are locally bounded; HTML retains all interactions.
    addAnimation(id, update) { animationTracks.set(id,update); syncTicker(); },
    removeAnimation(id) { animationTracks.delete(id); syncTicker(); },
    getObject:id=>named.get(id),
    render:()=>render(),
    artSource:src=>resolvedAssets.get(src)||preferredAsset(src),
    prepareImage(image, src) {
      image.onerror=()=>{image.onerror=null;image.src=src;};
      image.src=api.artSource(src);
      return image;
    },
    ready:null,
  };
  function render(){if(app?.renderer) app.render();}
  function syncTicker(){
    if(!app?.ticker)return;
    document.getElementById("room").dataset.motionPaused=String(state.paused || document.hidden || offscreen);
    if(state.paused || document.hidden || offscreen || !animationTracks.size) app.stop(); else app.start();
  }
  document.addEventListener('visibilitychange',()=>{const c=document.getElementById('room');c.dataset[document.hidden?'lastHiddenTime':'lastVisibleTime']=time.toFixed(2);syncTicker();});
  api.ready=(async()=>{
    const {Application,Assets,Container,Sprite,Graphics,Matrix}=window.PIXI;
    const canvas=document.getElementById('room');
    window.PIXI.extensions.add(window.PIXI.MeshPipe,window.PIXI.GlMeshAdaptor);
    app=new Application();
    await app.init({canvas,width:manifest.width,height:manifest.height,resolution:1,autoDensity:false,backgroundAlpha:0,antialias:false,preference:'webgl',autoStart:false,preserveDrawingBuffer:true,hello:false});
    // Only Containers receive children; Sprite/Graphics remain leaves in Pixi v8.
    const world=new Container({label:'world'});
    const exterior=new Container({label:'exterior'});
    const architecture=new Container({label:'architecture'});
    const furniture=new Container({label:'furniture'});
    const foreground=new Container({label:'foreground'});
    app.stage.addChild(world);
    world.addChild(exterior,architecture,furniture,foreground);
    named.set('world',world);named.set('exterior',exterior);
    named.set('architecture',architecture);named.set('furniture',furniture);named.set('foreground',foreground);
    const textures={};
    await Promise.all(Object.entries(manifest.assets).map(async([id,src])=>{
      const preferred=preferredAsset(src);
      try {textures[id]=await Assets.load(preferred);resolvedAssets.set(src,preferred);}
      catch(webpError){
        try {textures[id]=await Assets.load(src);resolvedAssets.set(src,src);}
        catch(pngError){state.failedAssets.push(src);}
      }
    }));
    function sprite(id,group,label=id){
      if(!textures[id])return null;
      const s=new Sprite({texture:textures[id],label});
      const pose=manifest.objects[id];
      if(pose.matrix) s.setFromMatrix(new Matrix(...pose.matrix));
      else {s.position.set(pose.x,pose.y);s.scale.set(pose.scale);}
      s.eventMode='none';group.addChild(s);named.set(label,s);return s;
    }
    function paneMask(){const mask=new Graphics();manifest.windowPanes.forEach(points=>mask.poly(points).fill(0xffffff));return mask;}
    const outsideMask=paneMask();world.addChild(outsideMask);exterior.mask=outsideMask;
    manifest.layers.exterior.forEach(id=>sprite(id,exterior));
    manifest.layers.architecture.forEach(id=>sprite(id,architecture));
    manifest.layers.furniture.forEach(id=>sprite(id,furniture,id==='chair'?'chair-base':id));
    sprite('character',foreground);
    const chairBack=sprite('chair',foreground,'chair-back');
    if(chairBack){
      const pose=manifest.objects.chair;
      const mask=new Graphics().poly(manifest.chairBack).fill(0xffffff);
      mask.position.set(pose.x,pose.y);mask.scale.set(pose.scale);
      foreground.addChild(mask);chairBack.mask=mask;
    }
    const scarf=sprite('scarf',foreground);
    if(scarf){
      const pose=manifest.objects.chair;
      const mask=new Graphics().poly(manifest.chairBack).fill(0xffffff);
      mask.position.set(pose.x,pose.y);mask.scale.set(pose.scale);foreground.addChild(mask);scarf.mask=mask;
    }
    sprite('ahri',foreground);
    sprite('football',foreground);
    sprite('floorplant',foreground);
    sprite('collectionbox',foreground);
    window.installPassiveMotion({PIXI:window.PIXI,app,manifest,named,tracks:animationTracks,canvas});
    const ambientReady=!!(named.get('ahri') && named.get('lamp') && named.get('skyline') && textures.yawnsheet);
    if(ambientReady) window.installAmbientEvents({PIXI:window.PIXI,manifest,named,tracks:animationTracks,textures,canvas});
    // One locally bounded kick. The approved ball returns exactly to its floor contact.
    const football=named.get('football'),ballHome=manifest.objects.football;
    let kickedAt=-Infinity;
    api.bounceBall=()=>{
      if(!football || state.paused || time-kickedAt<1.3)return false;
      kickedAt=time;return true;
    };
    if(football) animationTracks.set('football-click',t=>{
      const p=t-kickedAt,active=p>=0&&p<1.2;
      const lift=active?12*Math.sin(Math.PI*p/1.2):0;
      football.y=ballHome.y-lift;
      canvas.dataset.ballBounce=lift.toFixed(2);
    });
    app.ticker.maxFPS=30;
    new IntersectionObserver(entries=>{offscreen=!entries[0].isIntersecting;canvas.dataset.offscreen=String(offscreen);syncTicker();},{threshold:.01}).observe(canvas);
    app.ticker.add(ticker=>{
      if(state.paused||document.hidden||offscreen)return;
      const dt=Math.min(ticker.deltaMS,100)/1000;time+=dt;
      animationTracks.forEach(update=>update(time,dt));
      canvas.dataset.motionTime=time.toFixed(2);
    });
    // One source of truth for accessible case targets, including affine alignment.
    ['case1','case2','case3'].forEach((id,index)=>{
      const pose=manifest.objects[id], m=pose.matrix || [pose.scale,0,0,pose.scale,pose.x,pose.y];
      const corners=[[430,40],[1110,40],[1110,980],[430,980]].map(([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);
      const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
      const button=document.querySelector(`.game-case[data-project="${index}"]`);
      Object.assign(button.style,{left:100*Math.min(...xs)/manifest.width+'%',top:100*Math.min(...ys)/manifest.height+'%',width:100*(Math.max(...xs)-Math.min(...xs))/manifest.width+'%',height:100*(Math.max(...ys)-Math.min(...ys))/manifest.height+'%'});
    });
    api.application=app;
    state.assetsReady=true;
    setEggReady('monitor',!!named.get('monitors'));
    setEggReady('cat',ambientReady);
    setEggReady('lamp-egg',ambientReady);
    setEggReady('ball-egg',!!football);
    canvas.dataset.assetsReady='true';
    canvas.dataset.renderer=app.renderer.name;
    document.getElementById('scene').classList.remove('is-loading');
    document.querySelector('.scene-status').textContent=state.failedAssets.length?'Some approved artwork did not load. The HTML project list remains available.':'';
    syncTicker();render();
    return api;
  })().catch(error=>{
    state.error=String(error);
    eggButtons.forEach(id=>setEggReady(id,false));
    document.getElementById('scene').classList.remove('is-loading');
    document.querySelector('.scene-status').textContent='This browser could not start the room renderer. The project list below still works.';
    console.error('Playroom renderer initialization failed:',error);
    return api;
  });
})();
