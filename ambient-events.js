/* Rare ambient events; the ?eventdemo=1 route shortens only event intervals for review. */
window.installAmbientEvents=({PIXI,manifest,named,tracks,textures,canvas})=>{
 const {Sprite,Texture,Rectangle,Graphics,Container,Matrix,Text}=PIXI;
 const demo=new URLSearchParams(location.search).has('eventdemo');let epoch=0,lastTime=0;
 window.playroom.startEventDemo=()=>{epoch=lastTime;};
 let clickedYawn=-Infinity,clickedLamp=-Infinity;
 const api=window.playroom;
 api.triggerYawn=api.petCat=()=>{if(api.state?.paused || canvas.dataset.yawn!=='sleeping' || lastTime-clickedYawn<5)return false;clickedYawn=lastTime;return true;};
 api.dipLamp=()=>{if(api.state?.paused || lastTime-clickedLamp<3)return false;clickedLamp=lastTime;return true;};
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const base=named.get('ahri'),parent=base.parent;
 const sheet=textures.yawnsheet,frames=[0,1,2,3].map(i=>new Texture({source:sheet.source,frame:new Rectangle((i%2)*768,Math.floor(i/2)*512,768,512)}));
 const yawn=new Sprite(frames[0]);yawn.eventMode='none';yawn.scale.set(.2);yawn.visible=false;parent.addChildAt(yawn,parent.getChildIndex(base)+1);
 const right=[761,701,761,701],bottom=[488,488,477,477];
 const place=i=>{yawn.texture=frames[i];yawn.position.set(760.65-right[i]*.2,735-bottom[i]*.2);};
 tracks.set('yawn',t=>{
  lastTime=t;const elapsed=t-epoch,start=demo?3:35,period=demo?36:112,clickPhase=t-clickedYawn,p=clickPhase>=0&&clickPhase<=4.6?clickPhase:(elapsed-start)%period;
  if((elapsed<start&&clickPhase>4.6)||p>4.6){yawn.visible=false;base.alpha=1;canvas.dataset.yawn='sleeping';return;}
  let frame=p<.65?0:p<1.25?1:p<2.8?2:p<3.4?1:3;place(frame);yawn.visible=true;
  const mix=p<.35?smooth(p/.35):p>4.15?1-smooth((p-4.15)/.45):1;yawn.alpha=mix;base.alpha=1-mix;
  canvas.dataset.yawn=['opening','opening','yawning','settling'][frame];
 });
 const city=new Container({label:'city-window-lights'});city.setFromMatrix(new Matrix(...manifest.objects.skyline.matrix));named.get('exterior').addChild(city);
 const windows=[[159,665,24,20],[420,508,17,18],[503,750,20,19],[809,685,22,18],[949,714,23,19],[1376,681,20,20],[1506,600,17,20]];
 const lights=windows.map(([x,y,w,h])=>{const g=new Graphics().rect(x,y,w,h).fill(0x17223f);city.addChild(g);return g;});
 tracks.set('city-lights',t=>{let count=0;lights.forEach((g,i)=>{const period=demo?8+i*1.1:23+i*4.7,p=(t-epoch+i*3.7)%period,hold=period*.42;g.alpha=.94*smooth(p/.8)*(1-smooth((p-hold)/.8));if(g.alpha>.5)count++;});canvas.dataset.darkWindows=String(count);});
 const lamp=named.get('lamp'),lampParent=lamp.parent,shade=new Graphics().poly([395,352,443,337,518,350,602,392,677,448,736,506,719,522,661,511,578,477,486,427,420,384]).fill(0x382735);
 const p=manifest.objects.lamp;shade.position.set(p.x,p.y);shade.scale.set(p.scale);lampParent.addChildAt(shade,lampParent.getChildIndex(lamp)+1);
 tracks.set('lamp-dip',t=>{const e=t-epoch,start=demo?10:48,period=demo?34:97,phase=(e-start)%period;const cp=t-clickedLamp,dip=cp>=0&&cp<2.8?Math.sin(Math.PI*cp/2.8)**2:e>=start&&phase<2.8?Math.sin(Math.PI*phase/2.8)**2:0;shade.alpha=.3*dip;canvas.dataset.lampDip=dip.toFixed(2);});
 tracks.get('yawn')(0);tracks.get('city-lights')(0);tracks.get('lamp-dip')(0);
 if(demo){const label=new Text({text:'EVENT DEMO · shortened intervals',style:{fontFamily:'monospace',fontSize:18,fill:0xd5c5a9}});label.position.set(30,990);named.get('world').addChild(label);}
};
