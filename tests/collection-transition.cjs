// Controlled DOM/WAAPI lifecycle tests; not visual browser evidence.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../collection-transition.js','utf8');
function fixture(){
 const animations=[],listeners={},sprite={alpha:1};let renders=0;
 class Element{
  constructor(){this.style={};this.dataset={};this.children=[];this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x)};this.closeCount=0;}
  setAttribute(k,v){this[k]=v;}append(el){el.parent=this;this.children.push(el);}remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this);this.parent=null;}querySelector(){return this.inside;}close(){this.closeCount++;}
  animate(frames,options){let yes,no;const a={el:this,frames,options,pending:true,finished:new Promise((resolve,reject)=>{yes=resolve;no=reject;}),finish(){if(a.pending){a.pending=false;yes();}},cancel(){if(a.pending){a.pending=false;no(new Error('cancelled'));}}};animations.push(a);return a;}
 }
 const dialog=new Element();dialog.inside=new Element();const context={window:{playroom:{getObject:id=>{assert.equal(id,'collectionbox');return sprite;},render:()=>renders++}},document:{createElement:()=>new Element(),querySelector:()=>({getBoundingClientRect:()=>({left:700,top:500,width:75,height:60})})},innerWidth:1200,innerHeight:800,addEventListener:(name,fn)=>listeners[name]=fn};vm.runInNewContext(source,context);
 return {api:context.window.collectionTransition,dialog,sprite,animations,context,get renders(){return renders;},resize:()=>listeners.resize(),pending:()=>animations.filter(a=>a.pending),finish:()=>animations.filter(a=>a.pending).forEach(a=>a.finish()),flights:()=>dialog.children.filter(el=>el.className==='box-flight')};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const clean=f=>{assert.equal(f.sprite.alpha,1);assert.equal(f.flights().length,0);assert.equal(f.pending().length,0);assert(!f.dialog.classList.contains('box-travelling'));};
async function main(){
 let f=fixture(),opened=f.api.open(f.dialog,false);assert.equal(f.dialog.dataset.boxPhase,'lifting');assert.equal(f.sprite.alpha,0);assert.equal(f.flights().length,1);assert.equal(f.animations[0].frames[0].transform,'translate(285px,223.33333333333331px) scale(0.20270270270270271,0.24324324324324326)');f.finish();await tick();assert.equal(f.dialog.dataset.boxPhase,'opening');assert.equal(f.pending().length,2);f.finish();await opened;assert.equal(f.dialog.dataset.boxPhase,'open');assert.equal(f.flights().length,0);assert.equal(f.sprite.alpha,0);
 let done=0,closed=f.api.close(false,()=>done++);assert.equal(f.dialog.dataset.boxPhase,'closing');f.finish();await tick();assert(f.dialog.classList.contains('box-travelling'));f.finish();await closed;assert.equal(done,1);clean(f);
 // Early Escape while lifting, and while lid/content opening, cannot revive stale promises.
 for(const hinge of [false,true]){f=fixture();opened=f.api.open(f.dialog,false);if(hinge){f.finish();await tick();}done=0;closed=f.api.close(false,()=>done++);await tick();f.finish();await tick();f.finish();await Promise.all([opened,closed]);assert.equal(done,1);clean(f);}
 // Viewport interruption settles opening directly, without leaving floating DOM.
 for(const hinge of [false,true]){f=fixture();opened=f.api.open(f.dialog,false);if(hinge){f.finish();await tick();}f.context.innerWidth=500;f.resize();await opened;assert.equal(f.dialog.dataset.boxPhase,'open');assert.equal(f.flights().length,0);assert.equal(f.pending().length,0);assert.equal(f.sprite.alpha,0);assert(!f.dialog.classList.contains('box-travelling'));f.api.reset();clean(f);}
 // Closing resize invokes native dialog.close once both during collapse and return flight.
 for(const returning of [false,true]){f=fixture();await f.api.open(f.dialog,true);done=0;closed=f.api.close(false,()=>done++);if(returning){f.finish();await tick();}f.resize();await closed;assert.equal(f.dialog.closeCount,1);assert.equal(done,0);clean(f);}
 // Reduced motion is synchronous in effect, with no travel or WAAPI objects.
 f=fixture();await f.api.open(f.dialog,true);assert.equal(f.dialog.dataset.boxPhase,'open');assert.equal(f.animations.length,0);assert.equal(f.sprite.alpha,0);done=0;await f.api.close(true,()=>done++);assert.equal(done,1);clean(f);
 // Reset/newer transitions supersede old opening and closing completions.
 for(const closing of [false,true]){f=fixture();opened=f.api.open(f.dialog,false);let old=opened;if(closing)old=f.api.close(false,()=>{throw new Error('stale close finished');});f.api.reset();clean(f);const newer=f.api.open(f.dialog,true);await Promise.all([opened,old,newer]);assert.equal(f.dialog.dataset.boxPhase,'open');assert.equal(f.sprite.alpha,0);assert.equal(f.flights().length,0);f.api.reset();f.api.reset();clean(f);}
 console.log('PASS: collection normal open/close and origin; early Escape in lift/reveal; resize during lift/reveal/collapse/return; reduced direct path; reset/newer transition stale cleanup. DOM/WAAPI mocks only.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
