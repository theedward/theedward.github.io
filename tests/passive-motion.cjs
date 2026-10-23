// Deterministic unit tests only; does not replace real renderer/browser visual QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
class Vec {constructor(){this.x=0;this.y=0;}set(x,y=x){this.x=x;this.y=y;}copyFrom(p){this.x=p.x;this.y=p.y;}}
class Container {constructor(o={}){Object.assign(this,o);this.children=[];this.position=new Vec();this.scale=new Vec();}addChild(c){c.parent=this;this.children.push(c);return c;}addChildAt(c,i){c.parent=this;this.children.splice(i,0,c);return c;}removeChild(c){this.children.splice(this.children.indexOf(c),1);}getChildIndex(c){return this.children.indexOf(c);}setFromMatrix(m){this.matrix=m;}}
class Graphics extends Container {clear(){return this;}rect(){return this;}fill(){return this;}}
class Matrix {constructor(...args){this.values=args;}}
class MeshPlane extends Container {constructor({texture,verticesX,verticesY}){super();this.texture=texture;let data=[];for(let y=0;y<verticesY;y++)for(let x=0;x<verticesX;x++)data.push(x*texture.width/(verticesX-1),y*texture.height/(verticesY-1));this.base=new Float32Array(data);this.buffer={data:new Float32Array(data),updates:0,update(){this.updates++;}};this.geometry={getAttribute:()=>({buffer:this.buffer})};}}
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'room-assets.js'),'utf8'),ctx);vm.runInContext(fs.readFileSync(path.join(root,'passive-motion.js'),'utf8'),ctx);
const manifest=ctx.window.PLAYROOM_ART,named=new Map(),tracks=new Map(),furniture=new Container();named.set('furniture',furniture);
const sizes={floorplant:[1237,1272],plant:[1536,1024],trailingplant:[1312,1199],ahri:[1536,1024],character:[1024,1536],clouds:[1536,1024],monitors:[1536,1024]};
for(const [id,[width,height]]of Object.entries(sizes)){const s=new Container();s.texture={width,height};furniture.addChild(s);named.set(id,s);}
const canvas={dataset:{}};ctx.window.installPassiveMotion({PIXI:{MeshPlane,Container,Graphics,Matrix},app:{renderer:{name:'webgl'}},manifest,named,tracks,canvas});
function changes(id,t){const m=named.get(id);tracks.get(id)(t);return Array.from({length:m.base.length/2},(_,j)=>({x:m.base[j*2],y:m.base[j*2+1],dx:m.buffer.data[j*2]-m.base[j*2],dy:m.buffer.data[j*2+1]-m.base[j*2+1]}));}
function fixed(id,t,region,label){const points=changes(id,t).filter(region);assert(points.length>0,label+' sampled vertices');assert(points.every(p=>p.dx===0&&p.dy===0),label+' anchored');}
function moved(id,t,region,label){const points=changes(id,t).filter(region);assert(points.some(p=>Math.abs(p.dx)+Math.abs(p.dy)>.01),label+' moving');}
for(const t of [0,1,2.45,7,17.5,24,100]){
 fixed('character',t,p=>p.y>=800,'character torso/legs/feet');
 fixed('floorplant',t,p=>p.y>=810,'floor plant pot');
 fixed('plant',t,p=>p.y>=440,'desk plant pot');
 fixed('trailingplant',t,p=>p.x>=400&&p.x<=800&&p.y>=400&&p.y<=820,'trailing plant pot');
 fixed('ahri',t,p=>p.x<550&&p.y>=650,'cat front paws/contact area');
 fixed('ahri',t,p=>p.y>=800,'cat lower contact plane');
}
moved('floorplant',2,p=>p.y<500,'floor foliage');moved('plant',2,p=>p.y<300,'desk foliage');moved('trailingplant',2,p=>p.x>900&&p.y>750,'trailing vines');
moved('ahri',2.45,p=>p.x>850&&p.x<1200&&p.y>250&&p.y<550,'cat chest');
moved('character',1,p=>p.x>570&&p.x<780&&p.y>450&&p.y<620,'left hand');moved('character',1,p=>p.x>800&&p.y>530&&p.y<700,'right hand');moved('character',17.5,p=>p.x>300&&p.x<500&&p.y<300,'occasional head nod');
tracks.get('clouds')(0);const start={x:named.get('clouds').x,y:named.get('clouds').y};tracks.get('clouds')(25);assert(Math.abs(named.get('clouds').x-start.x)>20);tracks.get('clouds')(100);assert(Math.abs(named.get('clouds').x-start.x)<1e-9&&Math.abs(named.get('clouds').y-start.y)<1e-9,'cloud loop closes');
tracks.get('monitor')(19);assert.equal(canvas.dataset.monitorMode,'1');tracks.get('monitor')(37);assert.equal(canvas.dataset.monitorMode,'0');
const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');const block=appSource.slice(appSource.indexOf('const media = matchMedia('),appSource.indexOf('$("#monitor").addEventListener'));
assert(block.includes('setMotion(media.matches)'));
function motionFixture(initial){let mediaListener,click,dialog=false;const pauses=[],attrs={},classes={};const media={matches:initial,addEventListener(type,fn){assert.equal(type,'change');mediaListener=fn;}};const button={setAttribute(k,v){attrs[k]=v;},addEventListener(type,fn){assert.equal(type,'click');click=fn;}},span={textContent:''};const c={projectDialog:{open:false},collectionDialog:{open:false},matchMedia:()=>media,window:{playroom:{setPaused:x=>pauses.push(x)}},document:{querySelector:()=>dialog,documentElement:{classList:{toggle:(k,v)=>classes[k]=v}}},$:s=>s==='#motion'?button:span};vm.runInNewContext(block,c);return{pauses,attrs,classes,span,change:x=>mediaListener({matches:x}),click:()=>click(),dialog:x=>dialog=x};}
const reduced=motionFixture(true);assert.equal(reduced.pauses.at(-1),true);assert.equal(reduced.span.textContent,'Resume motion');reduced.change(false);assert.equal(reduced.pauses.at(-1),false);reduced.change(true);assert.equal(reduced.pauses.at(-1),true);reduced.click();assert.equal(reduced.pauses.at(-1),false);const count=reduced.pauses.length;reduced.change(true);assert.equal(reduced.pauses.length,count,'manual preference respected');
const modal=motionFixture(false);modal.dialog(true);modal.change(false);assert.equal(modal.pauses.at(-1),true,'dialog retains pause');modal.dialog(false);modal.change(false);assert.equal(modal.pauses.at(-1),false);
console.log('PASS: 7 tracks; anchored character torso/feet, plant pots, cat contact vertices; local hands/head/foliage/chest movement; 100s cloud closure; monitor mode cycles; reduced-motion initialization/change/manual override/dialog pause. WebGL geometry unit tests, not browser or Canvas fallback visual tests.');
