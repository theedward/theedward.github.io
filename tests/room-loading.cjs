// Deterministic delayed/rejected asset loading; no real browser/GPU claim.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
class Vec{constructor(){this.x=0;this.y=0;}set(x,y=x){this.x=x;this.y=y;}copyFrom(v){this.x=v.x;this.y=v.y;}}
class Container{constructor(o={}){Object.assign(this,o);this.children=[];this.position=new Vec();this.scale=new Vec();this.alpha=1;}addChild(...cs){for(const c of cs){c.parent=this;this.children.push(c);}return cs[0];}addChildAt(c,i){c.parent=this;this.children.splice(i,0,c);return c;}removeChild(c){this.children.splice(this.children.indexOf(c),1);}getChildIndex(c){return this.children.indexOf(c);}setFromMatrix(m){this.matrix=m;}}
class Graphics extends Container{poly(points){(this.polygons??=[]).push(points);return this;}fill(){return this;}rect(){return this;}clear(){return this;}}
class Sprite extends Container{constructor(o){super();this.texture=o.texture||o;}}
class Texture{constructor(o){Object.assign(this,o);}}
class MeshPlane extends Container{constructor({texture,verticesX,verticesY}){super();this.texture=texture;const data=[];for(let y=0;y<verticesY;y++)for(let x=0;x<verticesX;x++)data.push(x*texture.width/(verticesX-1),y*texture.height/(verticesY-1));this.geometry={getAttribute:()=>({buffer:{data:new Float32Array(data),update(){}}})};}}
class Matrix{constructor(...v){this.values=v;}}
class Rectangle{constructor(x,y,width,height){Object.assign(this,{x,y,width,height});}}
async function fixture(failedPath=null,delay=false,webpUnavailable=false){
 let release;const gate=new Promise(r=>release=r),requests=[],errors=[];
 const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,{dataset:{},style:{},disabled:false,classList:{remove(){}},setAttribute(k,v){this[k]=v;}});return elements.get(id);};
 class Application{constructor(){this.stage=new Container();this.renderer={name:'webgl'};this.ticker={add:fn=>this.tick=fn};}async init(){}start(){this.started=true;}stop(){this.started=false;}render(){}}
 const c={window:{},console:{error:e=>errors.push(e)},URLSearchParams,location:{search:''},matchMedia:()=>({matches:false}),document:{hidden:false,addEventListener(){},getElementById:el,querySelector:el},IntersectionObserver:class{observe(){}}};
 c.window.PIXI={Application,Container,Sprite,Texture,Rectangle,Graphics,Matrix,MeshPlane,Text:Container,extensions:{add(){}},Assets:{async load(src){requests.push(src);if(delay)await gate;if((failedPath && src.replace(/\.webp$/,'.png')===failedPath)||(webpUnavailable && src.endsWith('.webp')))throw Error('simulated missing asset');return{width:1536,height:1024,source:{resource:{}}};}}};
 vm.createContext(c);for(const file of ['room-assets.js','seated-leg.js','passive-motion.js','ambient-events.js','room.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
 await Promise.resolve();await Promise.resolve();
 return{c,el,requests,errors,release,api:c.window.playroom};
}
(async()=>{
 const f=await fixture(null,true);assert.equal(f.api.state.assetsReady,false);
 for(const id of ['monitor','cat','lamp-egg','ball-egg'])assert.equal(f.el(id).disabled,true);
 assert.equal(f.api.petCat(),false);assert.equal(f.api.dipLamp(),false);assert.equal(f.api.bounceBall(),false);
 assert(!f.requests.some(x=>/nintendo3ds|rogally/.test(x)),'unused retained assets not loaded');
 f.release();await f.api.ready;assert.equal(f.api.state.error,null);assert.equal(f.api.state.assetsReady,true);
 // Preserve the far-shoe stem; the whole corrected leg stays behind arm/desk.
 const art=f.c.window.PLAYROOM_ART,front=f.api.getObject('chair-foreground'),foreground=f.api.getObject('foreground');
 assert(front.mask,'chair foreground is clipped, never a whole-chair overlay');
 assert.equal(front.texture,f.api.getObject('chair-base').texture,'reuse original chair texture');
 assert.equal(JSON.stringify(front.mask.polygons),JSON.stringify(art.chairForeground));
 assert.equal(art.chairForeground.length,1,'only the approved hinge/stem overlay remains');
 assert(art.chairForeground[0].every((n,i)=>i%2||n<900),'stem mask stays independent of the right armrest');
 assert.equal(front.mask.position.x,art.objects.chair.x);assert.equal(front.mask.position.y,art.objects.chair.y);
 assert.equal(front.mask.scale.x,art.objects.chair.scale);assert.equal(front.mask.scale.y,art.objects.chair.scale);
 const index=id=>foreground.getChildIndex(f.api.getObject(id));
 assert(index('character')<index('rightleg'));assert(index('rightleg')<index('chair-back'));
 assert(index('chair-back')<index('chair-arm'));assert(index('chair-arm')<index('desk-foreground'));
 assert(index('desk-foreground')<index('chair-foreground'));assert(index('chair-foreground')<index('scarf'));
 assert.equal(f.api.getObject('rightleg-front'),undefined,'no distal override can clip the arm tip');
 const leg=f.api.getObject('rightleg');
 assert(leg.geometry,'corrected leg is a static mesh in WebGL');
 assert.equal(JSON.stringify(leg.mask.polygons),JSON.stringify([f.c.window.SEATED_LEG.outline(art.rightLegBounds,art.rightLegBend)]));
 assert.equal(JSON.stringify(f.api.getObject('desk-foreground').mask.polygons),JSON.stringify([art.deskForeground]));
 assert.equal(f.api.getObject('desk-foreground').texture,f.api.getObject('desk').texture,'restore original desk pixels, not new art');
 assert.equal(JSON.stringify(leg.mask.matrix.values),JSON.stringify(art.objects.rightleg.matrix));
 assert.equal(JSON.stringify(f.api.getObject('character').mask.polygons),JSON.stringify([art.characterKeep]),'positive original-leg cutout survives animated Mesh replacement');
 const legPose=JSON.stringify(leg.matrix.values);
 const chairPose=[front.position.x,front.position.y,front.scale.x,front.scale.y];
 f.api.petCat();f.api.dipLamp();f.api.bounceBall();
 for(let i=0;i<3600;i++)f.api.application.tick({deltaMS:33});
 assert.deepEqual([front.position.x,front.position.y,front.scale.x,front.scale.y],chairPose,'chair mask remains anchored through idle/nod and ambient/reaction cycles');
 assert.equal(JSON.stringify(leg.matrix.values),legPose,'corrected leg remains seated through the idle cycle');
 for(const id of ['monitor','cat','lamp-egg','ball-egg'])assert.equal(f.el(id).disabled,false);
 assert(f.requests.every(src=>src.endsWith('.webp')),'happy path loads only WebP');
 const fallback=await fixture(null,false,true);await fallback.api.ready;assert.equal(fallback.api.state.error,null);assert.equal(fallback.api.state.failedAssets.length,0);assert(fallback.requests.some(x=>x.endsWith('.png')),'unsupported WebP falls back to PNG');
 assert.equal(fallback.api.artSource('assets/room/chair.png'),'assets/room/chair.png');
 const image={};f.api.prepareImage(image,'assets/room/case1.png');assert.equal(image.src,'assets/room/case1.webp');image.onerror();assert.equal(image.src,'assets/room/case1.png');assert.equal(image.onerror,null,'fallback cannot loop');
 for(const src of new Set(f.requests.map(x=>x.replace(/\.webp$/,'.png')))){
  const failed=await fixture(src);await failed.api.ready;
  assert.equal(failed.api.state.error,null,src+' preserves partial scene');assert(failed.api.state.failedAssets.includes(src));
  if(src==='assets/room/chair.png')assert.equal(failed.api.getObject('chair-foreground'),undefined,'missing chair does not create an orphan mask');
  if(src==='assets/room/character-right-leg-v1.png'){
   assert.equal(failed.api.getObject('rightleg'),undefined);assert.equal(failed.api.getObject('chair-arm'),undefined);assert.equal(failed.api.getObject('desk-foreground'),undefined);
   assert.equal(failed.api.getObject('character').mask,undefined,'missing correction preserves the complete original character');
  }
  if(src==='assets/room/character.png')assert.equal(failed.api.getObject('rightleg'),undefined,'missing character must not leave a detached new leg');
  assert.doesNotThrow(()=>{failed.api.petCat();failed.api.dipLamp();failed.api.bounceBall();failed.api.cycleScreen();failed.api.application.tick({deltaMS:33});},src+' leaves safe interaction APIs');
  assert.equal(failed.errors.length,0,src+' no renderer exception');
 }
 console.log('PASS: delayed-load controls, WebP/PNG fallback, missing-asset recovery, chair foreground texture reuse/mask registration/animated depth order/anchoring. Mock-renderer evidence only.');
})().catch(e=>{console.error(e);process.exitCode=1;});
