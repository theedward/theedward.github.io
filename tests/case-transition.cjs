// Deterministic DOM/WAAPI doubles: lifecycle/cleanup evidence, not visual browser QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../case-transition.js','utf8');
function fixture(){
 const all=[],listeners={},sprites=[{alpha:1},{alpha:1},{alpha:1}];let renders=0;
 class Element {
  constructor(name){this.name=name;this.children=[];this.style={};this.dataset={};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x)};this.closeCount=0;}
  setAttribute(k,v){this[k]=v;}
  replaceChildren(...els){this.children.forEach(el=>el.parent=null);this.children=[];els.forEach(el=>this.append(el));}
  cloneNode(){const el=new Element(this.name+'-clone');el.clonedFrom=this;return el;}
  getBoundingClientRect(){return this.rect||{left:100,top:120,width:90,height:134};}
  append(el){el.parent=this;this.children.push(el);}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(el=>el!==this);this.parent=null;}
  querySelector(selector){return selector==='.collection-art'?this.art:selector==='.case-inside'?this.inside:this.article;}
  close(){this.closeCount++;}
  animate(frames,options){let yes,no;const a={el:this,frames,options,pending:true,finished:new Promise((resolve,reject)=>{yes=resolve;no=reject;}),finish(){if(!a.pending)return;a.pending=false;yes();},cancel(){if(!a.pending)return;a.pending=false;no(new Error('cancelled'));}};all.push(a);return a;}
 }
 const shelf={getBoundingClientRect:()=>({left:800,top:200,width:58,height:87})};
 const dialog=new Element('dialog');dialog.inside=new Element('inside');dialog.article=new Element('article');
 const context={window:{playroom:{getObject:id=>sprites[Number(id.slice(-1))-1],render:()=>renders++}},document:{createElement:name=>new Element(name),querySelector:()=>shelf},innerWidth:1200,innerHeight:800,addEventListener:(type,fn)=>listeners[type]=fn};vm.runInNewContext(source,context);
 const opener=new Element('collection-case');opener.classList.add('collection-case');opener.art=new Element('collection-art');
 return {opener,api:context.window.caseTransition,context,dialog,sprites,all,get renders(){return renders;},resize:()=>listeners.resize(),pending:()=>all.filter(a=>a.pending),finish:()=>all.filter(a=>a.pending).forEach(a=>a.finish()),flights:()=>dialog.children.filter(x=>x.className==='case-flight')};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function main(){
 // Complete open and fold/return, exact source rectangle registration, opacity restored.
 let f=fixture(),opened=f.api.open(f.dialog,0,false);assert.equal(f.dialog.dataset.casePhase,'lifting');assert.equal(f.sprites[0].alpha,0);assert.equal(f.flights().length,1);
 assert.match(f.all[0].frames[0].transform,/translate\(315px,-28\.650000000000006px\)/,'lift originates at shelf rectangle');
 f.finish();await tick();assert.equal(f.dialog.dataset.casePhase,'opening');assert.equal(f.pending().length,3);f.finish();await opened;assert.equal(f.dialog.dataset.casePhase,'open');assert.equal(f.flights().length,0);assert.equal(f.sprites[0].alpha,0);
 let done=0,closed=f.api.close(f.dialog,false,()=>done++);assert.equal(f.dialog.dataset.casePhase,'folding');f.finish();await tick();assert.equal(f.dialog.dataset.casePhase,'returning');f.finish();await closed;assert.equal(done,1);assert.equal(f.sprites[0].alpha,1);assert.equal(f.flights().length,0);assert.equal(f.pending().length,0);
 // Escape while lifting cancels stale opening promises and follows only the close path.
 f=fixture();opened=f.api.open(f.dialog,1,false);done=0;closed=f.api.close(f.dialog,false,()=>done++);await tick();assert.equal(f.dialog.dataset.casePhase,'folding');assert.equal(f.flights().length,1);f.finish();await tick();f.finish();await Promise.all([opened,closed]);assert.equal(done,1);assert.equal(f.sprites[1].alpha,1);assert.equal(f.flights().length,0);
 // Resize while lifting settles to readable content, never leaves a detached flying cover.
 f=fixture();opened=f.api.open(f.dialog,2,false);f.context.innerWidth=500;f.resize();await opened;assert.equal(f.dialog.dataset.casePhase,'open');assert(!f.dialog.classList.contains('case-travelling'));assert.equal(f.flights().length,0);assert.equal(f.pending().length,0);assert.equal(f.sprites[2].alpha,0);f.api.reset();assert.equal(f.sprites[2].alpha,1);
 // Resize while closing completes via native dialog.close and cleans up; stale async close stays inert.
 f=fixture();await f.api.open(f.dialog,0,true);done=0;closed=f.api.close(f.dialog,false,()=>done++);f.resize();await closed;assert.equal(f.dialog.closeCount,1);assert.equal(done,0);assert.equal(f.flights().length,0);assert.equal(f.sprites[0].alpha,1);assert.equal(f.pending().length,0);
 // Resize during the actual return flight also closes once without stale callbacks.
 f=fixture();await f.api.open(f.dialog,1,true);done=0;closed=f.api.close(f.dialog,false,()=>done++);f.finish();await tick();assert.equal(f.dialog.dataset.casePhase,'returning');f.resize();await closed;assert.equal(f.dialog.closeCount,1);assert.equal(done,0);assert.equal(f.sprites[1].alpha,1);assert.equal(f.flights().length,0);
 // Close midway through the hinged reveal cancels its three animations safely.
 f=fixture();opened=f.api.open(f.dialog,0,false);f.finish();await tick();assert.equal(f.dialog.dataset.casePhase,'opening');done=0;closed=f.api.close(f.dialog,false,()=>done++);await tick();f.finish();await tick();f.finish();await Promise.all([opened,closed]);assert.equal(done,1);assert.equal(f.sprites[0].alpha,1);assert.equal(f.pending().length,0);assert.equal(f.flights().length,0);
 // Reduced-motion open/close is direct and has no WAAPI animations or flying DOM.
 f=fixture();await f.api.open(f.dialog,0,true);assert.equal(f.dialog.dataset.casePhase,'open');assert.equal(f.all.length,0);assert.equal(f.flights().length,0);done=0;await f.api.close(f.dialog,true,()=>done++);assert.equal(done,1);assert.equal(f.sprites[0].alpha,1);
 // Reset during hinged opening, then a new case, cannot allow stale completion to mutate it.
 f=fixture();opened=f.api.open(f.dialog,0,false);f.finish();await tick();f.api.reset();assert.equal(f.sprites[0].alpha,1);assert.equal(f.pending().length,0);assert.equal(f.flights().length,0);const newer=f.api.open(f.dialog,2,true);await Promise.all([opened,newer]);assert.equal(f.dialog.dataset.casePhase,'open');assert.equal(f.sprites[2].alpha,0);f.api.reset();f.api.reset();assert(f.sprites.every(s=>s.alpha===1));assert.equal(f.pending().length,0);assert.equal(f.flights().length,0);
 // Collection cards originate from their art bounds and never hide a featured scene case.
 f=fixture();opened=f.api.open(f.dialog,0,false,f.opener);assert(f.sprites.every(s=>s.alpha===1));assert.equal(f.renders,0);assert.equal(f.flights()[0].children[0].clonedFrom,f.opener.art);assert(f.flights()[0].classList.contains('collection-flight'));assert.match(f.all[0].frames[0].transform,/translate\(-385px,-108\.65/);f.finish();await tick();f.finish();await opened;done=0;closed=f.api.close(f.dialog,false,()=>done++);assert.equal(f.flights()[0].children[0].clonedFrom,f.opener.art);f.finish();await tick();f.finish();await closed;assert.equal(done,1);assert(f.sprites.every(s=>s.alpha===1));assert.equal(f.renders,0);assert.equal(f.flights().length,0);
 f=fixture();await f.api.open(f.dialog,0,true,f.opener);assert.equal(f.all.length,0);assert(f.sprites.every(s=>s.alpha===1));f.api.reset();assert.equal(f.renders,0);
 console.log('PASS: exact shelf start; complete lift/hinge/fold/return; interrupted lift close; resize during lift/close; reduced direct path; reset and stale completion cleanup. DOM/WAAPI mock evidence only.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
